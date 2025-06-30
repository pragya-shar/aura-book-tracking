
import React from 'react';
import { Grid3X3, List, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list' | 'compact';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewModeToggle = ({ viewMode, onViewModeChange }: ViewModeToggleProps) => {
  return (
    <div className="flex rounded-lg border border-amber-500/30 bg-black/20 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={cn(
          'h-8 px-3 text-xs',
          viewMode === 'grid' 
            ? 'bg-amber-500 text-black hover:bg-amber-600' 
            : 'text-stone-400 hover:text-stone-300 hover:bg-black/30'
        )}
      >
        <Grid3X3 className="h-3 w-3 mr-1" />
        Grid
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={cn(
          'h-8 px-3 text-xs',
          viewMode === 'list' 
            ? 'bg-amber-500 text-black hover:bg-amber-600' 
            : 'text-stone-400 hover:text-stone-300 hover:bg-black/30'
        )}
      >
        <List className="h-3 w-3 mr-1" />
        List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('compact')}
        className={cn(
          'h-8 px-3 text-xs',
          viewMode === 'compact' 
            ? 'bg-amber-500 text-black hover:bg-amber-600' 
            : 'text-stone-400 hover:text-stone-300 hover:bg-black/30'
        )}
      >
        <Grid className="h-3 w-3 mr-1" />
        Compact
      </Button>
    </div>
  );
};
