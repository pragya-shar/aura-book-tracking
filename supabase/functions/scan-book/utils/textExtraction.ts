
// Function to extract ISBN from detected text
export function extractISBN(text: string): string[] {
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
export function extractBookInfo(text: string): { title: string; author: string; cleanedText: string; isbns: string[] } {
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
