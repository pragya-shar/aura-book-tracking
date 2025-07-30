/**
 * Fix Pending Rewards Utility
 * 
 * Manually update rewards that were successfully minted on blockchain
 * but failed to update in the database due to network issues.
 */

import { supabase } from '../integrations/supabase/client';

export interface FixRewardResult {
  success: boolean;
  message: string;
  fixed_rewards: number;
  error?: string;
}

/**
 * Manually mark rewards as completed with transaction hash
 */
export const fixRewardWithTransactionHash = async (
  rewardId: string, 
  transactionHash: string
): Promise<FixRewardResult> => {
  try {
    console.log(`🔧 Manually fixing reward ${rewardId} with transaction ${transactionHash}`);

    // Update the reward with transaction hash and completed status
    const { error } = await supabase
      .from('pending_rewards')
      .update({
        transaction_hash: transactionHash,
        processed_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', rewardId);

    if (error) {
      throw new Error(`Failed to update reward: ${error.message}`);
    }

    return {
      success: true,
      message: `Successfully marked reward ${rewardId} as completed with transaction ${transactionHash}`,
      fixed_rewards: 1
    };

  } catch (error) {
    console.error('❌ Error fixing reward:', error);
    return {
      success: false,
      message: 'Failed to fix reward',
      fixed_rewards: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Find rewards that might need manual fixing
 * (rewards that are still pending but might have been minted)
 */
export const findRewardsNeedingFix = async (): Promise<{
  pending_rewards: Array<{
    id: string;
    book_title: string;
    reward_amount: number;
    wallet_address: string;
    created_at: string;
    status: string;
  }>;
  total_pending: number;
}> => {
  try {
    const { data: rewards, error } = await supabase
      .from('pending_rewards')
      .select('id, book_title, reward_amount, wallet_address, created_at, status')
      .eq('status', 'pending')
      .is('transaction_hash', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pending rewards: ${error.message}`);
    }

    return {
      pending_rewards: rewards || [],
      total_pending: rewards?.length || 0
    };

  } catch (error) {
    console.error('Error finding rewards needing fix:', error);
    throw error;
  }
};

/**
 * Quick fix for the most recent reward (usually the one that just failed)
 */
export const quickFixLatestReward = async (transactionHash: string): Promise<FixRewardResult> => {
  try {
    // Get the most recent pending reward
    const { data: reward, error: fetchError } = await supabase
      .from('pending_rewards')
      .select('id, book_title')
      .eq('status', 'pending')
      .is('transaction_hash', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !reward) {
      throw new Error('No recent pending reward found to fix');
    }

    console.log(`🔧 Quick-fixing latest reward: "${reward.book_title}" (${reward.id})`);

    return await fixRewardWithTransactionHash(reward.id, transactionHash);

  } catch (error) {
    console.error('❌ Error in quick fix:', error);
    return {
      success: false,
      message: 'Quick fix failed',
      fixed_rewards: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export default {
  fixRewardWithTransactionHash,
  findRewardsNeedingFix,
  quickFixLatestReward
};