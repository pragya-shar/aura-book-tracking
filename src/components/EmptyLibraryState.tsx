
import { BookOpen, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const EmptyLibraryState = () => {
  return (
    <div className="text-center py-16 border-2 border-dashed border-amber-500/20 rounded-lg mt-6 bg-black/20">
      <BookOpen className="mx-auto h-12 w-12 text-stone-500" />
      <h3 className="mt-4 text-lg font-pixel text-amber-400">Your library is empty</h3>
      <p className="mt-1 text-sm text-stone-400 font-playfair italic">
        Add your first book to get started.
      </p>
      <div className="mt-6">
        <Button asChild className="border-amber-500 text-amber-500 bg-transparent hover:bg-amber-500 hover:text-black transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]" variant="outline">
          <Link to="/add-book">
            <PlusCircle />
            Add New Book
          </Link>
        </Button>
      </div>
    </div>
  );
};
