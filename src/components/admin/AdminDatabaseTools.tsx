import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cleanupRewardAmounts, previewRewardCleanup } from '@/utils/cleanupRewardAmounts';
import { quickFixLatestReward } from '@/utils/fixPendingRewards';
import { 
  Trash,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Eye,
  Loader2,
  Database
} from 'lucide-react';

export const AdminDatabaseTools = () => {
  // Cleanup states
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupPreview, setCleanupPreview] = useState<any>(null);
  const [showCleanupSection, setShowCleanupSection] = useState(false);
  
  // Quick fix states
  const [isFixing, setIsFixing] = useState(false);
  const [transactionHashToFix, setTransactionHashToFix] = useState('');
  const [showQuickFix, setShowQuickFix] = useState(false);

  // Preview reward cleanup
  const handlePreviewCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const preview = await previewRewardCleanup();
      setCleanupPreview(preview);
      
      if (preview.needs_cleanup > 0) {
        toast({
          title: "Cleanup Preview",
          description: `Found ${preview.needs_cleanup} rewards with incorrect amounts. Total would change from ${preview.current_total} to ${preview.corrected_total} AURA.`,
        });
      } else {
        toast({
          title: "No Cleanup Needed",
          description: "All reward amounts are already correct!",
        });
      }
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to preview cleanup",
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Run reward cleanup
  const handleCleanupRewards = async () => {
    setIsCleaningUp(true);
    try {
      const result = await cleanupRewardAmounts();
      
      if (result.success) {
        toast({
          title: "✅ Cleanup Successful!",
          description: result.message,
          duration: 8000,
        });
        
        // Clear preview
        setCleanupPreview(null);
      } else {
        throw new Error(result.error || 'Cleanup failed');
      }
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: error instanceof Error ? error.message : "Failed to cleanup rewards",
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Quick fix for failed database updates
  const handleQuickFix = async () => {
    if (!transactionHashToFix.trim()) {
      toast({
        title: "Missing Transaction Hash",
        description: "Please enter the transaction hash from the successful minting",
        variant: "destructive",
      });
      return;
    }

    setIsFixing(true);
    try {
      const result = await quickFixLatestReward(transactionHashToFix.trim());
      
      if (result.success) {
        toast({
          title: "✅ Fixed Successfully!",
          description: result.message,
          duration: 8000,
        });
        
        // Clear form
        setTransactionHashToFix('');
        setShowQuickFix(false);
      } else {
        throw new Error(result.error || 'Fix failed');
      }
    } catch (error) {
      toast({
        title: "Fix Failed",
        description: error instanceof Error ? error.message : "Failed to fix reward",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="bg-black/60 backdrop-blur-md border-amber-500/30 text-stone-300 shadow-xl shadow-amber-500/10">
      <CardHeader>
        <CardTitle className="text-amber-200 font-pixel tracking-wider flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Tools
          <Badge variant="secondary" className="ml-auto bg-amber-500/20 text-amber-200">
            Admin Only
          </Badge>
        </CardTitle>
        <CardDescription className="text-amber-400/70">
          Database maintenance and cleanup tools
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Database Cleanup Section */}
        <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-500/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">Reward Amount Cleanup</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCleanupSection(!showCleanupSection)}
              className="text-orange-400 hover:text-orange-300"
            >
              {showCleanupSection ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {showCleanupSection && (
            <div className="space-y-3">
              <p className="text-xs text-orange-200/80">
                Fix incorrect reward amounts from before decimal conversion was implemented.
                This will change inflated values (like 1409 AURA) to correct "1 AURA per page" amounts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handlePreviewCleanup}
                  disabled={isCleaningUp}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                >
                  {isCleaningUp ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  Preview Cleanup
                </Button>
                
                {cleanupPreview && cleanupPreview.needs_cleanup > 0 && (
                  <Button
                    onClick={handleCleanupRewards}
                    disabled={isCleaningUp}
                    size="sm"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {isCleaningUp ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Trash className="w-4 h-4 mr-2" />
                    )}
                    Fix {cleanupPreview.needs_cleanup} Rewards
                  </Button>
                )}
              </div>
              
              {cleanupPreview && (
                <div className="text-xs text-orange-200/70 space-y-1">
                  <div>Total Rewards: {cleanupPreview.total_rewards}</div>
                  <div>Need Cleanup: {cleanupPreview.needs_cleanup}</div>
                  <div>Current Total: {cleanupPreview.current_total} AURA → {cleanupPreview.corrected_total} AURA</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Fix Section */}
        <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-500/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Transaction Quick Fix</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickFix(!showQuickFix)}
              className="text-blue-400 hover:text-blue-300"
            >
              {showQuickFix ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {showQuickFix && (
            <div className="space-y-3">
              <p className="text-xs text-blue-200/80">
                If minting succeeded but database update failed, enter the transaction hash to manually mark the reward as completed.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="tx-hash" className="text-blue-300 text-xs">Transaction Hash</Label>
                <Input
                  id="tx-hash"
                  value={transactionHashToFix}
                  onChange={(e) => setTransactionHashToFix(e.target.value)}
                  placeholder="Enter transaction hash (e.g., 986312e3081c64739...)"
                  className="bg-blue-500/10 border-blue-500/30 text-blue-100 placeholder:text-blue-300/50"
                />
              </div>
              
              <Button
                onClick={handleQuickFix}
                disabled={isFixing || !transactionHashToFix.trim()}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isFixing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {isFixing ? 'Fixing...' : 'Fix Latest Reward'}
              </Button>
              
              <p className="text-xs text-blue-200/60">
                💡 Use this tool when a transaction succeeds on-chain but the database update fails
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-3 bg-stone-800/50 border border-stone-700 rounded-lg">
          <div className="text-xs text-stone-400 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Database tools help maintain data integrity</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Always preview changes before applying them</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-blue-400" />
              <span>These tools directly modify the database</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};