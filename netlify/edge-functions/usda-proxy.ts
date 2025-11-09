import type { Context } from "https://edge.netlify.com/";

interface USDASearchRequest {
  query: string;
  pageSize?: number;
  pageNumber?: number;
  dataType?: string[];
  sortBy?: string;
  sortOrder?: string;
}

// In-memory cache for Edge Function (resets on cold starts)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Limit cache size

function getCacheKey(path: string, params?: any): string {
  if (params) {
    return `${path}:${JSON.stringify(params)}`;
  }
  return path;
}

function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ Cache hit for:', key);
    return cached.data;
  }
  if (cached) {
    cache.delete(key); // Remove expired cache
  }
  return null;
}

function setCache(key: string, data: any): void {
  // Implement LRU-style cache eviction
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log('💾 Cached result for:', key);
}

// Rate limiting per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export default async (request: Request, context: Context) => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      }
    });
  }

  try {
    // Rate limiting
    const clientIP = context.ip || 'unknown';
    if (!checkRateLimit(clientIP)) {
      console.log('🚫 Rate limit exceeded for IP:', clientIP);
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again in a minute.',
        retryAfter: 60
      }), {
        status: 429,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Retry-After': '60'
        },
      });
    }

    const usdaApiKey = Deno.env.get('USDA_API_KEY');
    
    if (!usdaApiKey) {
      console.error('❌ USDA API key not found in environment variables');
      throw new Error('USDA API key not configured');
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path.includes('/search')) {
      // Handle food search with caching
      let searchParams: USDASearchRequest;
      try {
        searchParams = await request.json();
        
        // Validate and sanitize input
        if (!searchParams.query || searchParams.query.length < 2) {
          throw new Error('Query must be at least 2 characters long');
        }
        
        // Limit query length to prevent abuse
        if (searchParams.query.length > 100) {
          searchParams.query = searchParams.query.substring(0, 100);
        }
        
        // Normalize query for better caching
        searchParams.query = searchParams.query.toLowerCase().trim();
        
      } catch (parseError) {
        console.error('❌ Failed to parse request JSON:', parseError);
        throw new Error('Invalid request format');
      }

      // Check cache first
      const cacheKey = getCacheKey('search', {
        query: searchParams.query,
        pageSize: searchParams.pageSize || 25,
        pageNumber: searchParams.pageNumber || 1,
        dataType: searchParams.dataType || ['Foundation', 'Survey (FNDDS)']
      });
      
      const cachedResult = getFromCache(cacheKey);
      if (cachedResult) {
        return new Response(JSON.stringify(cachedResult), {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'X-Cache': 'HIT'
          },
        });
      }

      // Build USDA API URL with API key as query parameter
      const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}`;
      
      // Prepare request body with optimized defaults
      const usdaRequestBody = {
        query: searchParams.query,
        pageSize: Math.min(searchParams.pageSize || 25, 50), // Limit page size
        pageNumber: searchParams.pageNumber || 1,
        dataType: searchParams.dataType || ['Foundation', 'Survey (FNDDS)'],
        sortBy: searchParams.sortBy || 'dataType.keyword',
        sortOrder: searchParams.sortOrder || 'asc'
      };

      console.log('🔍 Making USDA API search request for:', searchParams.query);

      const response = await fetch(usdaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usdaRequestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ USDA API Error:', response.status, errorText);
        throw new Error(`USDA API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the successful result
      setCache(cacheKey, data);
      
      console.log('✅ USDA API Success:', {
        query: searchParams.query,
        totalHits: data.totalHits,
        foodsReturned: data.foods?.length || 0
      });
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'X-Cache': 'MISS'
        },
      });

    } else if (path.includes('/food/')) {
      // Handle food details with caching
      const fdcId = path.split('/food/')[1];
      
      if (!fdcId || isNaN(Number(fdcId))) {
        throw new Error('Invalid food ID provided');
      }

      // Check cache first
      const cacheKey = getCacheKey('food', fdcId);
      const cachedResult = getFromCache(cacheKey);
      if (cachedResult) {
        return new Response(JSON.stringify(cachedResult), {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'X-Cache': 'HIT'
          },
        });
      }

      // Build USDA API URL with API key as query parameter
      const usdaUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${usdaApiKey}`;
      
      console.log('🔍 Making USDA API details request for food ID:', fdcId);

      const response = await fetch(usdaUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ USDA API Food Details Error:', response.status, errorText);
        throw new Error(`USDA API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the successful result (food details change rarely)
      setCache(cacheKey, data);
      
      console.log('✅ USDA API Food Details Success for ID:', fdcId);
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'X-Cache': 'MISS'
        },
      });

    } else {
      return new Response(JSON.stringify({ 
        error: 'Not found',
        path: path,
        availablePaths: ['/api/usda/search', '/api/usda/food/{id}']
      }), { 
        status: 404, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('❌ Netlify Edge Function Error:', error.message);

    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config = {
  path: "/api/usda/*"
};