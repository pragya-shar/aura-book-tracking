
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { analyzeImageWithVision } from './utils/visionApi.ts';
import { extractBookInfo } from './utils/textExtraction.ts';
import { scoreBookResult } from './utils/bookScoring.ts';

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

    console.log("Sending request to Google Vision API with enhanced features...");
    const visionData = await analyzeImageWithVision(apiKey, image);
    console.log(`Google Vision API responded successfully`);

    const visionResponse = visionData.responses[0];
    const text = visionResponse?.fullTextAnnotation?.text;
    const logos = visionResponse?.logoAnnotations || [];
    const imageProperties = visionResponse?.imagePropertiesAnnotation;
    const objects = visionResponse?.localizedObjectAnnotations || [];
    
    console.log(text ? `Detected text: ${text.substring(0, 100)}...` : "No text detected.");
    console.log(`Found ${logos.length} logos, ${objects.length} objects`);

    const analysisData = {
      logos: logos.length,
      objects: objects.length,
      extractedISBNs: [],
      dominantColors: imageProperties?.dominantColors?.colors?.slice(0, 3) || [],
      confidence: 0
    };

    let bookData = null;
    let extractedInfo = { title: '', author: '', cleanedText: '', isbns: [] };
    
    if (text) {
      // Extract book information from detected text
      extractedInfo = extractBookInfo(text);
      analysisData.extractedISBNs = extractedInfo.isbns;
      console.log(`Extracted info - Title: "${extractedInfo.title}", Author: "${extractedInfo.author}", ISBNs: [${extractedInfo.isbns.join(', ')}]`);
      
      // Priority 1: Search by ISBN if detected
      if (extractedInfo.isbns.length > 0) {
        for (const isbn of extractedInfo.isbns) {
          console.log(`Searching by ISBN: ${isbn}`);
          const isbnResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`
          );
          
          if (isbnResponse.ok) {
            const isbnResult = await isbnResponse.json();
            if (isbnResult.items && isbnResult.items.length > 0) {
              bookData = isbnResult.items[0]; // ISBN should be unique
              analysisData.confidence = 95; // High confidence for ISBN matches
              console.log(`Found exact match by ISBN: "${bookData.volumeInfo.title}"`);
              break;
            }
          }
        }
      }
      
      // Priority 2: Enhanced text-based search if no ISBN match
      if (!bookData) {
        // Create a more targeted search query
        let searchQuery = text;
        if (extractedInfo.title) {
          searchQuery = extractedInfo.title;
          if (extractedInfo.author) {
            searchQuery += ` ${extractedInfo.author}`;
          }
        }
        
        console.log(`Using text search query: "${searchQuery}"`);
        console.log("Sending request to Google Books API for multiple results...");
        const booksResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            searchQuery
          )}&maxResults=20&key=${apiKey}`
        );
        console.log(`Google Books API responded with status: ${booksResponse.status}`);

        if (booksResponse.ok) {
          const booksResult = await booksResponse.json();
          if (booksResult.items && booksResult.items.length > 0) {
            console.log(`Found ${booksResult.items.length} potential matches, scoring them...`);
            
            // Score all results and find the best match
            const scoredResults = booksResult.items.map(book => ({
              book,
              score: scoreBookResult(book, text, extractedInfo, analysisData)
            }));
            
            // Sort by score (highest first)
            scoredResults.sort((a, b) => b.score - a.score);
            
            // Take the highest scoring result
            bookData = scoredResults[0].book;
            analysisData.confidence = Math.min(90, Math.max(60, scoredResults[0].score));
            console.log(`Best match: "${bookData.volumeInfo.title}" with score: ${scoredResults[0].score.toFixed(2)}`);
            
            // Log all scores for debugging
            scoredResults.slice(0, 5).forEach((result, index) => {
              console.log(`${index + 1}. "${result.book.volumeInfo.title}" - Score: ${result.score.toFixed(2)}`);
            });
            
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
    }

    console.log("Function completed successfully. Sending response.");
    return new Response(JSON.stringify({ 
      text, 
      book: bookData,
      analysisData
    }), {
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
