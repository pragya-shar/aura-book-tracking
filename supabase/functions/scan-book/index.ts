
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()
    const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY')

    if (!apiKey) {
      throw new Error('Google Vision API key is not set in Supabase secrets.')
    }
    
    if (!image) {
      throw new Error('No image data provided.')
    }

    const requestBody = {
      requests: [
        {
          image: {
            content: image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
            },
          ],
        },
      ],
    }

    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!visionResponse.ok) {
      const errorBody = await visionResponse.text()
      console.error(`Google Vision API error: ${visionResponse.status} ${visionResponse.statusText}`, errorBody)
      throw new Error(`Google Vision API request failed: ${visionResponse.statusText}`)
    }

    const visionData = await visionResponse.json()
    const text = visionData.responses[0]?.fullTextAnnotation?.text

    let bookData = null;
    if (text) {
      const booksResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(text)}&maxResults=1&key=${apiKey}`);
      if (booksResponse.ok) {
          const booksResult = await booksResponse.json();
          if (booksResult.items && booksResult.items.length > 0) {
              bookData = booksResult.items[0];
          }
      } else {
          console.error(`Google Books API error: ${booksResponse.status} ${booksResponse.statusText}`, await booksResponse.text());
          // Don't throw an error, just log it. The function can still return the detected text.
      }
    }

    return new Response(JSON.stringify({ text, book: bookData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in scan-book function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
