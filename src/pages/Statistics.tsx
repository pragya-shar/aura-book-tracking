
import { BarChart } from 'lucide-react';

const Statistics = () => {
  return (
    <div>
      <h1 className="text-3xl font-pixel tracking-widest text-amber-400">Statistics</h1>
      <p className="text-stone-400 font-playfair italic mt-1">Analyzing the archives of your reading history.</p>
      
      <div className="text-center py-16 border-2 border-dashed border-amber-500/20 rounded-lg mt-6 bg-black/20">
        <BarChart className="mx-auto h-12 w-12 text-stone-500" />
        <h3 className="mt-4 text-lg font-pixel text-amber-400">Data Under Analysis</h3>
        <p className="mt-1 text-sm text-stone-400 font-playfair italic">
            Come back later to see your reading statistics.
        </p>
      </div>
    </div>
  );
};
export default Statistics;
