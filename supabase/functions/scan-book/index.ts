
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("scan-book function invoked.");
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request.");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body...");
    const { image } = await req.json();
    console.log("Request body parsed.");

    if (!image) {
      console.error("No image data provided in the request.");
      throw new Error("No image data provided.");
    }

    const apiKey = Deno.env.get("GOOGLE_VISION_API_KEY");
    if (!apiKey) {
      console.error("GOOGLE_VISION_API_KEY is not set.");
      throw new Error("Google Vision API key is not set in Supabase secrets.");
    }
    console.log("API key retrieved.");

    const requestBody = {
      requests: [
        {
          image: {
            content: image,
          },
          features: [
            {
              type: "TEXT_DETECTION",
            },
          ],
        },
      ],
    };

    console.log("Sending request to Google Vision API...");
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );
    console.log(`Google Vision API responded with status: ${visionResponse.status}`);

    if (!visionResponse.ok) {
      const errorBody = await visionResponse.text();
      console.error(
        `Google Vision API error: ${visionResponse.status} ${visionResponse.statusText}`,
        errorBody
      );
      throw new Error(
        `Google Vision API request failed: ${visionResponse.statusText}`
      );
    }

    const visionData = await visionResponse.json();
    const text = visionData.responses[0]?.fullTextAnnotation?.text;
    console.log(text ? `Detected text: ${text.substring(0, 100)}...` : "No text detected.");

    let bookData = null;
    if (text) {
      console.log("Sending request to Google Books API...");
      const booksResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          text
        )}&maxResults=1&key=${apiKey}`
      );
      console.log(`Google Books API responded with status: ${booksResponse.status}`);

      if (booksResponse.ok) {
        const booksResult = await booksResponse.json();
        if (booksResult.items && booksResult.items.length > 0) {
          bookData = booksResult.items[0];
          console.log(`Found book: ${bookData.volumeInfo.title}`);
        } else {
          console.log("No matching book found on Google Books.");
        }
      } else {
        console.error(
          `Google Books API error: ${booksResponse.status} ${booksResponse.statusText}`,
          await booksResponse.text()
        );
      }
    }

    console.log("Function completed successfully. Sending response.");
    return new Response(JSON.stringify({ text, book: bookData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in scan-book function:", error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
