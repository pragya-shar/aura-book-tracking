/**
 * AuraCoin Reward Service
 * 
 * This service handles rewarding users with AuraCoin tokens
 * when they complete reading books.
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  rewardBookCompletion, 
  rewardMultipleBooks as mintMultipleBookRewards, 
  calculateBookReward,
  BookReward 
} from '@/utils/auraCoinUtils';

export interface BookCompletionData {
  bookId: string;
  title: string;
  pages: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  completedAt: Date;
  userId: string;
  walletAddress: string;
}

export interface RewardResult {
  success: boolean;
  rewardAmount: number;
  message: string;
  error?: string;
}

export class AuraCoinRewardService {
  /**
   * Reward a user for completing a single book
   */
  static async rewardSingleBook(
    completionData: BookCompletionData,
    ownerAddress: string,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<RewardResult> {
    try {
      // Calculate reward based on book details
      const rewardAmount = calculateBookReward(
        completionData.pages, 
        completionData.difficulty || 'medium'
      );

      // Create book reward object
      const bookReward: BookReward = {
        bookId: completionData.bookId,
        title: completionData.title,
        pages: completionData.pages,
        rewardAmount,
        completedAt: completionData.completedAt
      };

      // Mint tokens for the user
      await rewardBookCompletion(
        completionData.walletAddress,
        bookReward,
        ownerAddress,
        signTransaction
      );

      // Log the reward in the database
      await this.logReward(completionData, rewardAmount);

      return {
        success: true,
        rewardAmount,
        message: `Successfully rewarded ${rewardAmount} AURA tokens for completing "${completionData.title}"`
      };
    } catch (error) {
      console.error('Error rewarding single book:', error);
      return {
        success: false,
        rewardAmount: 0,
        message: 'Failed to reward book completion',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Reward a user for completing multiple books
   */
  static async rewardMultipleBooks(
    completions: BookCompletionData[],
    ownerAddress: string,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<RewardResult> {
    try {
      // Calculate rewards for all books
      const bookRewards: BookReward[] = completions.map(completion => ({
        bookId: completion.bookId,
        title: completion.title,
        pages: completion.pages,
        rewardAmount: calculateBookReward(
          completion.pages, 
          completion.difficulty || 'medium'
        ),
        completedAt: completion.completedAt
      }));

      const totalReward = bookRewards.reduce((sum, book) => sum + book.rewardAmount, 0);

      // Mint tokens for all books
      await mintMultipleBookRewards(
        completions[0].walletAddress, // All completions should have the same wallet
        bookRewards,
        ownerAddress,
        signTransaction
      );

      // Log all rewards in the database
      for (const completion of completions) {
        const rewardAmount = calculateBookReward(
          completion.pages, 
          completion.difficulty || 'medium'
        );
        await this.logReward(completion, rewardAmount);
      }

      return {
        success: true,
        rewardAmount: totalReward,
        message: `Successfully rewarded ${totalReward} AURA tokens for completing ${completions.length} books`
      };
    } catch (error) {
      console.error('Error rewarding multiple books:', error);
      return {
        success: false,
        rewardAmount: 0,
        message: 'Failed to reward book completions',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get pending rewards for a user
   */
  static async getPendingRewards(userId: string): Promise<BookCompletionData[]> {
    try {
      const { data: readingLogs, error } = await supabase
        .from('reading_logs')
        .select(`
          *,
          books (
            id,
            title
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching pending rewards:', error);
        return [];
      }

      // Get user's wallet address
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('wallet_address')
        .eq('user_id', userId)
        .single();

      if (!profile?.wallet_address) {
        console.warn('User has no linked wallet address');
        return [];
      }

      return readingLogs.map(log => ({
        bookId: log.book_id,
        title: log.books.title,
        pages: 100, // Default pages since not in schema
        difficulty: 'medium' as const,
        completedAt: new Date(log.date),
        userId,
        walletAddress: profile.wallet_address
      }));
    } catch (error) {
      console.error('Error getting pending rewards:', error);
      return [];
    }
  }

  /**
   * Log reward in the database (simplified version)
   */
  private static async logReward(
    completionData: BookCompletionData, 
    rewardAmount: number
  ): Promise<void> {
    try {
      // For now, just log to console since we don't have the rewards table
      console.log(`🎉 Reward logged: ${rewardAmount} AURA tokens for "${completionData.title}"`);
      console.log(`📊 User: ${completionData.userId}, Wallet: ${completionData.walletAddress}`);
      
      // In a full implementation, you would insert into a rewards table here
      // For now, we'll just mark the reading log as processed by updating notes
      const { error } = await supabase
        .from('reading_logs')
        .update({ 
          notes: `Rewarded with ${rewardAmount} AURA tokens on ${new Date().toISOString()}` 
        })
        .eq('book_id', completionData.bookId)
        .eq('user_id', completionData.userId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error updating reading log:', error);
      }
    } catch (error) {
      console.error('Error logging reward:', error);
    }
  }

  /**
   * Get user's total rewards (simplified version)
   */
  static async getUserTotalRewards(userId: string): Promise<number> {
    try {
      // For now, return a placeholder since we don't have a rewards table
      // In a full implementation, you would query the rewards table
      return 0;
    } catch (error) {
      console.error('Error getting user total rewards:', error);
      return 0;
    }
  }

  /**
   * Get user's reward history (simplified version)
   */
  static async getUserRewardHistory(userId: string): Promise<any[]> {
    try {
      // For now, return empty array since we don't have a rewards table
      // In a full implementation, you would query the rewards table
      return [];
    } catch (error) {
      console.error('Error getting reward history:', error);
      return [];
    }
  }
} 