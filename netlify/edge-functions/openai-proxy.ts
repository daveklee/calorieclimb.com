import type { Context } from "https://edge.netlify.com/";

interface OpenAIRequest {
  currentFood: string;
  currentCalories: number;
  previousFood?: string;
  previousCalories?: number;
  isHealthy: boolean;
  type: 'feedback' | 'gameOver';
  totalCalories?: number;
  foodsEaten?: string[];
  reason?: string;
}

// In-memory cache for AI responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for AI responses
const MAX_CACHE_SIZE = 50;

// Rate limiting per IP for AI calls (more restrictive)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 AI requests per minute per IP

function getCacheKey(data: OpenAIRequest): string {
  // Create a cache key based on food combination and type
  if (data.type === 'feedback') {
    return `feedback:${data.currentFood}:${data.currentCalories}:${data.isHealthy}`;
  } else {
    return `gameOver:${data.totalCalories}:${data.foodsEaten?.length || 0}`;
  }
}

function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ AI Cache hit for:', key);
    return cached.data;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
}

function setCache(key: string, data: any): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log('💾 Cached AI response for:', key);
}

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

// Fallback responses to avoid API calls when possible
const fallbackResponses = {
  healthy: [
    "Great choice! That's a nutritious food that gives your body lots of good energy and vitamins!",
    "Excellent pick! Your body will thank you for choosing such a healthy option!",
    "Wonderful! That food is packed with nutrients that help you grow strong and healthy!"
  ],
  unhealthy: [
    "That's okay as a treat! Remember, it's good to balance fun foods with healthy ones too!",
    "Tasty choice! Just remember to eat plenty of fruits and vegetables along with treats like this!",
    "Yummy! It's fine to enjoy treats sometimes, but don't forget about nutritious foods too!"
  ],
  gameOver: [
    "Good try! You learned a lot about different foods and their calories. Ready to play again?",
    "Nice game! You discovered many interesting foods. Want to try again with different choices?",
    "Well done exploring different foods! Each game teaches us more about nutrition. Play again?"
  ]
};

function getFallbackResponse(data: OpenAIRequest): string {
  if (data.type === 'feedback') {
    const responses = data.isHealthy ? fallbackResponses.healthy : fallbackResponses.unhealthy;
    return responses[Math.floor(Math.random() * responses.length)];
  } else {
    const responses = fallbackResponses.gameOver;
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export default async (request: Request, context: Context) => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  }

  try {
    // Rate limiting for AI calls
    const clientIP = context.ip || 'unknown';
    if (!checkRateLimit(clientIP)) {
      console.log('🚫 AI Rate limit exceeded for IP:', clientIP);
      
      // Return fallback response instead of error
      const requestData: OpenAIRequest = await request.json();
      const fallbackMessage = getFallbackResponse(requestData);
      
      return new Response(JSON.stringify({ 
        message: fallbackMessage,
        source: 'fallback'
      }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'X-Rate-Limited': 'true'
        },
      });
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      // Return fallback response if no API key
      const requestData: OpenAIRequest = await request.json();
      const fallbackMessage = getFallbackResponse(requestData);
      
      return new Response(JSON.stringify({ 
        message: fallbackMessage,
        source: 'fallback'
      }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const requestData: OpenAIRequest = await request.json();
    
    // Check cache first
    const cacheKey = getCacheKey(requestData);
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      return new Response(JSON.stringify({ 
        message: cachedResult,
        source: 'cache'
      }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'X-Cache': 'HIT'
        },
      });
    }
    
    let prompt: string;
    
    if (requestData.type === 'feedback') {
      prompt = buildFeedbackPrompt(requestData);
    } else {
      prompt = buildGameOverPrompt(requestData);
    }

    console.log('🤖 Making OpenAI request for:', requestData.type);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a fun, educational nutrition assistant for kids. Always be encouraging, use simple language appropriate for children ages 6-12, and make learning about food fun and engaging. Keep responses to 2-3 sentences maximum. Focus on positive aspects of food choices and gentle education about nutrition.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      })
    });

    if (!response.ok) {
      console.error('❌ OpenAI API Error:', response.status);
      // Return fallback response on API error
      const fallbackMessage = getFallbackResponse(requestData);
      return new Response(JSON.stringify({ 
        message: fallbackMessage,
        source: 'fallback'
      }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content || getFallbackResponse(requestData);
    
    // Cache the successful result
    setCache(cacheKey, message);
    
    console.log('✅ OpenAI Success for:', requestData.type);
    
    return new Response(JSON.stringify({ 
      message,
      source: 'ai'
    }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'X-Cache': 'MISS'
      },
    });
  } catch (error) {
    console.error('❌ OpenAI Edge Function Error:', error);
    
    // Always return a fallback response instead of an error
    try {
      const requestData: OpenAIRequest = await request.json();
      const fallbackMessage = getFallbackResponse(requestData);
      
      return new Response(JSON.stringify({ 
        message: fallbackMessage,
        source: 'fallback'
      }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    } catch {
      return new Response(JSON.stringify({ 
        message: "Great choice! Keep exploring different foods and learning about nutrition!",
        source: 'fallback'
      }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }
  }
};

function buildFeedbackPrompt(data: OpenAIRequest): string {
  let prompt = `A kid just chose to eat "${data.currentFood}" which has ${data.currentCalories} calories. `;
  
  if (data.previousFood && data.previousCalories !== null) {
    prompt += `Before this, they ate "${data.previousFood}" which had ${data.previousCalories} calories. `;
    
    if (data.currentCalories > data.previousCalories) {
      prompt += `The new food has more calories, so the game continues! `;
    }
  }

  if (data.isHealthy) {
    prompt += `This is a healthy choice! `;
  } else {
    prompt += `This isn't the healthiest option, but it's okay sometimes! `;
  }

  prompt += `Give a fun, encouraging response about this food choice that teaches kids about nutrition. Keep it simple, positive, and age-appropriate for children ages 6-12. Use encouraging language and focus on the educational aspect.`;

  return prompt;
}

function buildGameOverPrompt(data: OpenAIRequest): string {
  const prompt = `A kid's nutrition game just ended. ${data.reason} They ate ${data.totalCalories} total calories from these foods: ${data.foodsEaten?.join(', ')}. Give a fun, educational message about what happened and encourage them to try again with different food choices. Keep it positive, kid-friendly, and educational. Focus on learning rather than failure. 2-3 sentences maximum.`;
  return prompt;
}

export const config = {
  path: "/api/openai"
};

