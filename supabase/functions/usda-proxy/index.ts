import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface USDASearchRequest {
  query: string;
  pageSize?: number;
  pageNumber?: number;
  dataType?: string[];
  sortBy?: string;
  sortOrder?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Enhanced debugging for environment variables
    const usdaApiKey = Deno.env.get('USDA_API_KEY')
    
    console.log('=== USDA Proxy Debug Info ===')
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)
    console.log('Environment variables check:', {
      hasUsdaKey: !!usdaApiKey,
      keyLength: usdaApiKey?.length || 0,
      keyPrefix: usdaApiKey ? usdaApiKey.substring(0, 8) + '...' : 'MISSING',
      keyType: typeof usdaApiKey,
      allEnvKeys: Object.keys(Deno.env.toObject()).filter(key => 
        key.includes('USDA') || key.includes('API')
      )
    })

    if (!usdaApiKey) {
      console.error('❌ USDA API key not found in environment variables')
      console.log('Available environment variables:', Object.keys(Deno.env.toObject()))
      throw new Error('USDA API key not configured in Edge Function environment')
    }

    const url = new URL(req.url)
    const path = url.pathname
    console.log('Request path:', path)

    if (path.includes('/search')) {
      // Handle food search
      console.log('Processing search request...')
      
      let searchParams: USDASearchRequest
      try {
        searchParams = await req.json()
        console.log('Search parameters:', {
          query: searchParams.query,
          pageSize: searchParams.pageSize,
          pageNumber: searchParams.pageNumber,
          dataType: searchParams.dataType
        })
      } catch (parseError) {
        console.error('❌ Failed to parse request JSON:', parseError)
        throw new Error('Invalid JSON in request body')
      }

      // Build USDA API URL with API key as query parameter (as per USDA docs)
      const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}`
      
      // Prepare request body WITHOUT the API key (it's in the URL now)
      const usdaRequestBody = {
        query: searchParams.query,
        pageSize: searchParams.pageSize || 25,
        pageNumber: searchParams.pageNumber || 1,
        dataType: searchParams.dataType || ['Foundation', 'Survey (FNDDS)'],
        sortBy: searchParams.sortBy || 'dataType.keyword',
        sortOrder: searchParams.sortOrder || 'asc'
      }

      console.log('Making request to USDA API...')
      console.log('USDA API URL (without key):', 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=[HIDDEN]')
      console.log('Request body:', usdaRequestBody)

      const response = await fetch(usdaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usdaRequestBody)
      })

      console.log('USDA API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ USDA API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Object.fromEntries(response.headers.entries())
        })

        // Try to parse error response
        let errorDetails = errorText
        try {
          const errorJson = JSON.parse(errorText)
          errorDetails = JSON.stringify(errorJson, null, 2)
          console.log('Parsed error JSON:', errorJson)
        } catch {
          console.log('Error response is not JSON:', errorText)
        }

        throw new Error(`USDA API error: ${response.status} - ${response.statusText}. Details: ${errorDetails}`)
      }

      const data = await response.json()
      console.log('✅ USDA API Success:', {
        totalHits: data.totalHits,
        foodsReturned: data.foods?.length || 0
      })
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else if (path.includes('/food/')) {
      // Handle food details
      console.log('Processing food details request...')
      const fdcId = path.split('/food/')[1]
      console.log('Food ID:', fdcId)
      
      if (!fdcId || isNaN(Number(fdcId))) {
        console.error('❌ Invalid food ID:', fdcId)
        throw new Error('Invalid food ID provided')
      }

      // Build USDA API URL with API key as query parameter
      const usdaUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${usdaApiKey}`
      console.log('Making request to USDA API for food details...')
      console.log('USDA API URL (without key):', `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=[HIDDEN]`)

      const response = await fetch(usdaUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('USDA API Food Details Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ USDA API Food Details Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          fdcId: fdcId
        })

        // Try to parse error response
        let errorDetails = errorText
        try {
          const errorJson = JSON.parse(errorText)
          errorDetails = JSON.stringify(errorJson, null, 2)
          console.log('Parsed error JSON:', errorJson)
        } catch {
          console.log('Error response is not JSON:', errorText)
        }

        throw new Error(`USDA API error: ${response.status} - ${response.statusText}. Details: ${errorDetails}`)
      }

      const data = await response.json()
      console.log('✅ USDA API Food Details Success:', {
        fdcId: data.fdcId,
        description: data.description?.substring(0, 50) + '...'
      })
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else {
      console.error('❌ Unknown path:', path)
      return new Response(JSON.stringify({ 
        error: 'Not found',
        path: path,
        availablePaths: ['/search', '/food/{id}']
      }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('❌ Edge Function Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    // Return detailed error information for debugging
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      debug: {
        hasUsdaKey: !!Deno.env.get('USDA_API_KEY'),
        keyLength: Deno.env.get('USDA_API_KEY')?.length || 0,
        requestMethod: req.method,
        requestUrl: req.url
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})