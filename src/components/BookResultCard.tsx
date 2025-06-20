
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, Eye, Layers } from 'lucide-react';

interface BookResultCardProps {
  book: any;
  analysisData?: any;
  onSave: () => void;
  onScanAnother: () => void;
  isSaving: boolean;
}

const BookResultCard = ({ book, analysisData, onSave, onScanAnother, isSaving }: BookResultCardProps) => {
  const imageUrl = book.volumeInfo.imageLinks?.extraLarge || 
                   book.volumeInfo.imageLinks?.large || 
                   book.volumeInfo.imageLinks?.medium || 
                   book.volumeInfo.imageLinks?.thumbnail || 
                   book.volumeInfo.imageLinks?.smallThumbnail;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 90) return 'High confidence match';
    if (confidence >= 70) return 'Good match';
    return 'Possible match';
  };

  return (
    <>
      <Card className="mt-2 bg-black/30 border border-amber-500/30 text-stone-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="font-playfair text-amber-400">{book.volumeInfo.title}</CardTitle>
              <CardDescription className="text-stone-400">{book.volumeInfo.authors?.join(', ')}</CardDescription>
              
              {/* Confidence indicator */}
              {analysisData?.confidence && (
                <div className={`mt-2 text-sm font-medium ${getConfidenceColor(analysisData.confidence)}`}>
                  {getConfidenceText(analysisData.confidence)} ({analysisData.confidence}%)
                </div>
              )}

              {/* Enhanced analysis info */}
              {analysisData && (
                <div className="mt-2 text-xs text-stone-500 space-y-1">
                  {analysisData.extractedISBNs?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                        ISBN Match: {analysisData.extractedISBNs.join(', ')}
                      </span>
                    </div>
                  )}
                  {analysisData.logos > 0 && (
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400">Publisher logos detected: {analysisData.logos}</span>
                    </div>
                  )}
                  {analysisData.objects > 0 && (
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400">Book objects detected: {analysisData.objects}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {book.volumeInfo.averageRating && (
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm">{book.volumeInfo.averageRating}</span>
                {book.volumeInfo.ratingsCount && (
                  <span className="text-xs text-stone-500">({book.volumeInfo.ratingsCount})</span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          {imageUrl && (
            <div className="relative">
              <img 
                src={imageUrl} 
                alt="Book cover" 
                className="w-32 h-auto rounded-md object-cover border border-amber-500/20" 
              />
              {analysisData?.extractedISBNs?.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-stone-400 line-clamp-6 mb-2">{book.volumeInfo.description || 'No description available'}</p>
            <div className="text-xs text-stone-500 space-y-1">
              {book.volumeInfo.publishedDate && (
                <p>Published: {book.volumeInfo.publishedDate}</p>
              )}
              {book.volumeInfo.publisher && (
                <p>Publisher: {book.volumeInfo.publisher}</p>
              )}
              {book.volumeInfo.pageCount && (
                <p>Pages: {book.volumeInfo.pageCount}</p>
              )}
              {book.volumeInfo.categories && book.volumeInfo.categories.length > 0 && (
                <p>Categories: {book.volumeInfo.categories.slice(0, 3).join(', ')}</p>
              )}
              {book.volumeInfo.industryIdentifiers && (
                <p>ISBNs: {book.volumeInfo.industryIdentifiers.map((id: any) => id.identifier).join(', ')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={onSave} 
          disabled={isSaving} 
          className="border-amber-500 text-amber-500 bg-transparent hover:bg-amber-500 hover:text-black transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]" 
          variant="outline"
        >
          {isSaving ? 'Saving...' : 'Save to Library'}
        </Button>
        <Button 
          onClick={onScanAnother} 
          variant="outline" 
          className="text-stone-300 border-stone-500 hover:bg-stone-700/50 hover:text-white"
        >
          Scan Another
        </Button>
      </div>
    </>
  );
};

export default BookResultCard;
