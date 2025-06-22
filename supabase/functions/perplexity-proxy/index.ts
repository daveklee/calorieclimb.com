import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PerplexityRequest {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured')
    }

    const requestData: PerplexityRequest = await req.json()
    
    let prompt: string
    
    if (requestData.type === 'feedback') {
      prompt = buildFeedbackPrompt(requestData)
    } else {
      prompt = buildGameOverPrompt(requestData)
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a fun, educational nutrition assistant for kids. Always be encouraging, use simple language, and make learning about food fun and engaging. Keep responses to 2-3 sentences maximum.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    const message = data.choices[0]?.message?.content || 'Great choice! Keep exploring different foods!'
    
    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function buildFeedbackPrompt(data: PerplexityRequest): string {
  let prompt = `A kid just chose to eat "${data.currentFood}" which has ${data.currentCalories} calories. `
  
  if (data.previousFood && data.previousCalories !== null) {
    prompt += `Before this, they ate "${data.previousFood}" which had ${data.previousCalories} calories. `
    
    if (data.currentCalories > data.previousCalories) {
      prompt += `The new food has more calories, so the game continues! `
    }
  }

  if (data.isHealthy) {
    prompt += `This is a healthy choice! `
  } else {
    prompt += `This isn't the healthiest option, but it's okay sometimes! `
  }

  prompt += `Give a fun, encouraging response about this food choice that teaches kids about nutrition. Keep it simple and positive!`

  return prompt
}

function buildGameOverPrompt(data: PerplexityRequest): string {
  const prompt = `A kid's nutrition game just ended. ${data.reason} They ate ${data.totalCalories} total calories from these foods: ${data.foodsEaten?.join(', ')}. Give a fun, educational message about what happened and encourage them to try again with healthier choices. Keep it positive and kid-friendly, 2-3 sentences max.`
  return prompt
}