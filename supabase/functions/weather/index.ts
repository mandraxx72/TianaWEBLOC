import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Weather function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('WEATHER_API_KEY')
    console.log('API Key exists:', !!apiKey);
    
    if (!apiKey) {
      console.error('WEATHER_API_KEY not found in environment variables');
      throw new Error('WEATHER_API_KEY não configurada')
    }

    const city = 'Mindelo, Cape Verde'
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=no`
    console.log('Making request to WeatherAPI forecast:', url.replace(apiKey, '***'));
    
    const response = await fetch(url)
    console.log('WeatherAPI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('WeatherAPI error:', response.status, errorText);
      throw new Error(`Erro da API: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('WeatherAPI data received successfully');
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Erro na função weather:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})