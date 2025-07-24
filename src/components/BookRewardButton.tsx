import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFreighter } from '@/contexts/FreighterContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuraCoinRewardService } from '@/services/auraCoinRewardService';
import { toast } from '@/hooks/use-toast';
import { 
  Coins, 
  BookOpen, 
  CheckCircle, 
  Loader2, 
  Gift,
  AlertCircle
} from 'lucide-react';

interface BookRewardButtonProps {
  bookId: string;
  title: string;
  pages?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  onRewardClaimed?: () => void;
}

export const BookRewardButton: React.FC<BookRewardButtonProps> = ({
  bookId,
  title,
  pages = 100,
  difficulty = 'medium',
  onRewardClaimed
}) => {
  const { user } = useAuth();
  const { isWalletConnected, walletAddress, signTransactionWithWallet } = useFreighter();
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const calculateReward = () => {
    const baseReward = Math.max(10, Math.floor(pages / 10));
    const difficultyMultiplier = {
      easy: 0.8,
      medium: 1.0,
      hard: 1.5
    };
    
    return Math.floor(baseReward * difficultyMultiplier[difficulty]);
  };

  const handleClaimReward = async () => {
    if (!user || !isWalletConnected || !walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to claim rewards",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const rewardAmount = calculateReward();
      
      const completionData = {
        bookId,
        title,
        pages,
        difficulty,
        completedAt: new Date(),
        userId: user.id,
        walletAddress
      };

      const result = await AuraCoinRewardService.rewardSingleBook(
        completionData,
        async (xdr) => signTransactionWithWallet(xdr, 'testnet')
      );

      if (result.success) {
        setClaimed(true);
        toast({
          title: "🎉 Reward Claimed!",
          description: result.message,
        });
        onRewardClaimed?.();
      } else {
        toast({
          title: "Claim Failed",
          description: result.error || "Failed to claim reward",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Claim Failed",
        description: error instanceof Error ? error.message : "Failed to claim reward",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const rewardAmount = calculateReward();

  if (!user) {
    return null;
  }

  return (
    <Card className="bg-black/60 backdrop-blur-md border-purple-500/30 text-stone-300 shadow-xl shadow-purple-500/10">
      <CardHeader>
        <CardTitle className="text-purple-200 font-pixel tracking-wider flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Book Completion Reward
        </CardTitle>
        <CardDescription className="text-stone-400">
          Claim your AuraCoin reward for completing this book
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Book Info */}
        <div className="p-3 bg-stone-800/50 rounded-lg border border-stone-700">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="font-medium text-purple-300">{title}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-stone-400">
            <span>{pages} pages</span>
            <Badge variant="outline" className="text-xs">
              {difficulty}
            </Badge>
          </div>
        </div>

        {/* Reward Amount */}
        <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="text-2xl font-bold text-purple-300 flex items-center justify-center gap-2">
            <Coins className="w-6 h-6" />
            {rewardAmount} AURA
          </div>
          <div className="text-sm text-stone-500 mt-1">
            Completion Reward
          </div>
        </div>

        {/* Wallet Status */}
        {!isWalletConnected ? (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Connect your wallet to claim rewards</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Wallet connected: {walletAddress?.slice(0, 8)}...</span>
            </div>
          </div>
        )}

        {/* Claim Button */}
        <Button
          onClick={handleClaimReward}
          disabled={loading || claimed || !isWalletConnected}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-stone-600"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Claiming Reward...
            </>
          ) : claimed ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Reward Claimed!
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Claim {rewardAmount} AURA
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-stone-500 text-center">
          Rewards are calculated based on book length and difficulty level
        </div>
      </CardContent>
    </Card>
  );
}; 