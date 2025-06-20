
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Function to calculate text similarity using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = matrix[len2][len1];
  const maxLength = Math.max(len1, len2);
  return maxLength > 0 ? (maxLength - distance) / maxLength : 1;
}

// Enhanced function to check if strings contain similar words
function calculateWordSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const words2 = str2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matchCount = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.includes(word2) || word2.includes(word1) || calculateSimilarity(word1, word2) > 0.7) {
        matchCount++;
        break;
      }
    }
  }
  
  return matchCount / Math.max(words1.length, words2.length);
}

// Function to extract ISBN from detected text
function extractISBN(text: string): string[] {
  const isbns: string[] = [];
  
  // ISBN-13 pattern (978 or 979 followed by 10 digits)
  const isbn13Pattern = /(?:978|979)[\s\-]?(?:\d[\s\-]?){9}\d/g;
  const isbn13Matches = text.match(isbn13Pattern);
  if (isbn13Matches) {
    isbns.push(...isbn13Matches.map(isbn => isbn.replace(/[\s\-]/g, '')));
  }
  
  // ISBN-10 pattern (10 digits or 9 digits + X)
  const isbn10Pattern = /(?:\d[\s\-]?){9}[\dX]/g;
  const isbn10Matches = text.match(isbn10Pattern);
  if (isbn10Matches) {
    isbns.push(...isbn10Matches.map(isbn => isbn.replace(/[\s\-]/g, '')));
  }
  
  return [...new Set(isbns)]; // Remove duplicates
}

// Function to extract likely title and author from detected text
function extractBookInfo(text: string): { title: string; author: string; cleanedText: string; isbns: string[] } {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract ISBNs first
  const isbns = extractISBN(text);
  
  // Look for common patterns
  const authorPatterns = [/by\s+(.+)/i, /author[:\s]+(.+)/i, /written\s+by\s+(.+)/i];
  const titlePatterns = [/title[:\s]+(.+)/i];
  
  let title = '';
  let author = '';
  
  // Extract author if found
  for (const line of lines) {
    for (const pattern of authorPatterns) {
      const match = line.match(pattern);
      if (match) {
        author = match[1].trim();
        break;
      }
    }
    if (author) break;
  }
  
  // Extract title if found
  for (const line of lines) {
    for (const pattern of titlePatterns) {
      const match = line.match(pattern);
      if (match) {
        title = match[1].trim();
        break;
      }
    }
    if (title) break;
  }
  
  // If no explicit patterns found, assume first few lines might be title
  if (!title && lines.length > 0) {
    title = lines[0];
    if (lines.length > 1 && lines[1].length > 3) {
      title += ' ' + lines[1];
    }
  }
  
  const cleanedText = text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  
  return { title, author, cleanedText, isbns };
}

// Function to get all available cover images for a book
function getAllCoverImages(book: any): string[] {
  const imageLinks = book.volumeInfo?.imageLinks || {};
  const covers: string[] = [];
  
  // Order by quality preference
  const imageTypes = ['extraLarge', 'large', 'medium', 'thumbnail', 'smallThumbnail'];
  
  for (const type of imageTypes) {
    if (imageLinks[type]) {
      covers.push(imageLinks[type]);
    }
  }
  
  return covers;
}

// Function to score cover image quality
function scoreCoverImageQuality(book: any): number {
  const imageLinks = book.volumeInfo?.imageLinks;
  if (!imageLinks) return 0;
  
  if (imageLinks.extraLarge) return 10;
  if (imageLinks.large) return 8;
  if (imageLinks.medium) return 6;
  if (imageLinks.thumbnail) return 4;
  if (imageLinks.smallThumbnail) return 2;
  
  return 0;
}

// Enhanced function to score a book result with visual-first approach
function scoreBookResult(book: any, detectedText: string, extractedInfo: { title: string; author: string; cleanedText: string; isbns: string[] }): number {
  let score = 0;
  const volumeInfo = book.volumeInfo || {};
  
  // ISBN matching gets highest priority (50% if found)
  if (extractedInfo.isbns.length > 0) {
    const bookISBNs = [
      ...(volumeInfo.industryIdentifiers || []).map((id: any) => id.identifier?.replace(/[\s\-]/g, '') || ''),
      volumeInfo.isbn_10?.replace(/[\s\-]/g, '') || '',
      volumeInfo.isbn_13?.replace(/[\s\-]/g, '') || ''
    ].filter(Boolean);
    
    const hasISBNMatch = extractedInfo.isbns.some(detectedISBN => 
      bookISBNs.some(bookISBN => bookISBN === detectedISBN)
    );
    
    if (hasISBNMatch) {
      score += 50;
      console.log(`ISBN match found for "${volumeInfo.title}": +50 points`);
    }
  }
  
  // Text similarity scoring (35% of total score)
  const bookTitle = (volumeInfo.title || '').toLowerCase();
  const bookAuthors = (volumeInfo.authors || []).join(' ').toLowerCase();
  
  // Title matching (25% of total score)
  if (extractedInfo.title) {
    const titleSimilarity = calculateSimilarity(extractedInfo.title.toLowerCase(), bookTitle);
    const titleWordSimilarity = calculateWordSimilarity(extractedInfo.title.toLowerCase(), bookTitle);
    const bestTitleMatch = Math.max(titleSimilarity, titleWordSimilarity);
    score += bestTitleMatch * 25;
    console.log(`Title match for "${bookTitle}": ${bestTitleMatch.toFixed(2)} (char: ${titleSimilarity.toFixed(2)}, word: ${titleWordSimilarity.toFixed(2)})`);
  }
  
  // Author matching (10% of total score)
  if (extractedInfo.author && bookAuthors) {
    const authorSimilarity = calculateSimilarity(extractedInfo.author.toLowerCase(), bookAuthors);
    const authorWordSimilarity = calculateWordSimilarity(extractedInfo.author.toLowerCase(), bookAuthors);
    const bestAuthorMatch = Math.max(authorSimilarity, authorWordSimilarity);
    score += bestAuthorMatch * 10;
    console.log(`Author match for "${bookTitle}": ${bestAuthorMatch.toFixed(2)}`);
  }
  
  // Cover image quality (10% of total score)
  const coverQuality = scoreCoverImageQuality(book);
  score += coverQuality;
  
  // Publication date recency (5% of total score)
  const publishedDate = volumeInfo.publishedDate;
  if (publishedDate) {
    const year = parseInt(publishedDate.substring(0, 4));
    const currentYear = new Date().getFullYear();
    if (year >= 2000) {
      score += Math.min(5, (year - 2000) / (currentYear - 2000) * 5);
    } else if (year >= 1990) {
      score += 3;
    } else if (year >= 1980) {
      score += 1;
    }
  }
  
  console.log(`Book "${bookTitle}" scored: ${score.toFixed(2)} (ISBN: ${extractedInfo.isbns.length > 0 ? 'detected' : 'none'}, title: ${extractedInfo.title ? 'detected' : 'none'}, author: ${extractedInfo.author ? 'detected' : 'none'}, covers: ${getAllCoverImages(book).length})`);
  
  return score;
}

// Enhanced Google Vision API request with multiple feature types
async function analyzeImageWithVision(apiKey: string, imageBase64: string) {
  const requestBody = {
    requests: [
      {
        image: {
          content: imageBase64,
        },
        features: [
          { type: "TEXT_DETECTION" },
          { type: "LOGO_DETECTION" },
          { type: "IMAGE_PROPERTIES" },
          { type: "OBJECT_LOCALIZATION" }
        ],
      },
    ],
  };

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `Google Vision API error: ${response.status} ${response.statusText}`,
      errorBody
    );
    throw new Error(
      `Google Vision API request failed: ${response.statusText}`
    );
  }

  return await response.json();
}

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

    let bookData = null;
    if (text) {
      // Extract book information from detected text
      const extractedInfo = extractBookInfo(text);
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
              score: scoreBookResult(book, text, extractedInfo)
            }));
            
            // Sort by score (highest first)
            scoredResults.sort((a, b) => b.score - a.score);
            
            // Take the highest scoring result
            bookData = scoredResults[0].book;
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
      analysisData: {
        logos: logos.length,
        objects: objects.length,
        extractedISBNs: extractedInfo?.isbns || [],
        dominantColors: imageProperties?.dominantColors?.colors?.slice(0, 3) || []
      }
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
