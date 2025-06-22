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
    const usdaApiKey = Deno.env.get('USDA_API_KEY')
    if (!usdaApiKey) {
      console.error('USDA API key not found in environment variables')
      throw new Error('USDA API key not configured in Edge Function environment')
    }

    const url = new URL(req.url)
    const path = url.pathname

    if (path.includes('/search')) {
      // Handle food search
      const searchParams: USDASearchRequest = await req.json()
      
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

      const response = await fetch(usdaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usdaRequestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('USDA API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
        throw new Error(`USDA API error: ${response.status} - ${response.statusText}.`)
      }

      const data = await response.json()
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else if (path.includes('/food/')) {
      // Handle food details
      const fdcId = path.split('/food/')[1]
      
      if (!fdcId || isNaN(Number(fdcId))) {
        throw new Error('Invalid food ID provided')
      }

      // Build USDA API URL with API key as query parameter
      const usdaUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${usdaApiKey}`

      const response = await fetch(usdaUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('USDA API Food Details Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          fdcId: fdcId
        })
        throw new Error(`USDA API error: ${response.status} - ${response.statusText}.`)
      }

      const data = await response.json()
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else {
      return new Response(JSON.stringify({ 
        error: 'Not found',
        path: path,
        availablePaths: ['/search', '/food/{id}']
      }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Error in USDA proxy:', {
      message: error.message,
      stack: error.stack,
    })
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})