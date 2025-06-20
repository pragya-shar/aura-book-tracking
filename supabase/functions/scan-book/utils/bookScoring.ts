
import { calculateSimilarity, calculateWordSimilarity } from './similarity.ts';

// Function to get all available cover images for a book
export function getAllCoverImages(book: any): string[] {
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
export function scoreCoverImageQuality(book: any): number {
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
export function scoreBookResult(book: any, detectedText: string, extractedInfo: { title: string; author: string; cleanedText: string; isbns: string[] }, analysisData: any): number {
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
  
  // Visual analysis bonus (15% of total score)
  if (analysisData) {
    // Publisher logos detected
    if (analysisData.logos > 0) {
      score += 8;
      console.log(`Publisher logos detected for "${volumeInfo.title}": +8 points`);
    }
    
    // Objects detected (book spine, cover layout)
    if (analysisData.objects > 0) {
      score += 7;
      console.log(`Objects detected for "${volumeInfo.title}": +7 points`);
    }
  }
  
  // Text similarity scoring (25% of total score)
  const bookTitle = (volumeInfo.title || '').toLowerCase();
  const bookAuthors = (volumeInfo.authors || []).join(' ').toLowerCase();
  
  // Title matching (15% of total score)
  if (extractedInfo.title) {
    const titleSimilarity = calculateSimilarity(extractedInfo.title.toLowerCase(), bookTitle);
    const titleWordSimilarity = calculateWordSimilarity(extractedInfo.title.toLowerCase(), bookTitle);
    const bestTitleMatch = Math.max(titleSimilarity, titleWordSimilarity);
    score += bestTitleMatch * 15;
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
  
  console.log(`Book "${bookTitle}" scored: ${score.toFixed(2)} (ISBN: ${extractedInfo.isbns.length > 0 ? 'detected' : 'none'}, title: ${extractedInfo.title ? 'detected' : 'none'}, author: ${extractedInfo.author ? 'detected' : 'none'}, covers: ${getAllCoverImages(book).length})`);
  
  return score;
}
