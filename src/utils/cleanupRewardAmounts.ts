/**
 * Cleanup Utility for Reward Amounts
 * 
 * This utility fixes incorrect reward amounts in the database that were 
 * created before the decimal conversion was properly implemented.
 */

import { supabase } from '../integrations/supabase/client';

export interface RewardCleanupResult {
  success: boolean;
  message: string;
  updated_rewards: number;
  total_aura_before: number;
  total_aura_after: number;
  error?: string;
}

/**
 * Clean up incorrect reward amounts in pending_rewards table
 * Converts inflated amounts back to proper "1 AURA per page" values
 */
export const cleanupRewardAmounts = async (): Promise<RewardCleanupResult> => {
  try {
    console.log('🧹 Starting reward amounts cleanup...');

    // Get all rewards that might have incorrect amounts
    const { data: rewards, error: fetchError } = await supabase
      .from('pending_rewards')
      .select('id, reward_amount, book_pages, book_title, status, transaction_hash')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch rewards: ${fetchError.message}`);
    }

    if (!rewards || rewards.length === 0) {
      return {
        success: true,
        message: 'No rewards found to clean up',
        updated_rewards: 0,
        total_aura_before: 0,
        total_aura_after: 0
      };
    }

    console.log(`📊 Found ${rewards.length} rewards to analyze`);

    let updatedCount = 0;
    let totalAuraBefore = 0;
    let totalAuraAfter = 0;
    const updates: Array<{ id: string; old_amount: number; new_amount: number; book_title: string }> = [];

    for (const reward of rewards) {
      const currentAmount = reward.reward_amount;
      const bookPages = reward.book_pages;
      
      // Calculate what the amount should be (1 AURA per page)
      const correctAmount = bookPages || 1;
      
      totalAuraBefore += currentAmount;

      // Only update if the amount is incorrect
      if (currentAmount !== correctAmount) {
        updates.push({
          id: reward.id,
          old_amount: currentAmount,
          new_amount: correctAmount,
          book_title: reward.book_title
        });
        
        totalAuraAfter += correctAmount;
        updatedCount++;
      } else {
        totalAuraAfter += currentAmount;
      }
    }

    if (updates.length === 0) {
      return {
        success: true,
        message: 'All reward amounts are already correct (1 AURA per page)',
        updated_rewards: 0,
        total_aura_before: totalAuraBefore,
        total_aura_after: totalAuraAfter
      };
    }

    console.log(`🔧 Need to update ${updates.length} rewards:`);
    updates.forEach(update => {
      console.log(`  - "${update.book_title}": ${update.old_amount} → ${update.new_amount} AURA`);
    });

    // Update rewards in batches
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('pending_rewards')
          .update({ reward_amount: update.new_amount })
          .eq('id', update.id);

        if (updateError) {
          console.error(`Failed to update reward ${update.id}:`, updateError);
          throw new Error(`Failed to update reward: ${updateError.message}`);
        }
      }
      
      console.log(`✅ Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}`);
    }

    const message = `Successfully cleaned up ${updatedCount} reward amounts. Total AURA reduced from ${totalAuraBefore} to ${totalAuraAfter} (proper 1 AURA per page calculation).`;
    
    console.log(`🎉 ${message}`);

    return {
      success: true,
      message,
      updated_rewards: updatedCount,
      total_aura_before: totalAuraBefore,
      total_aura_after: totalAuraAfter
    };

  } catch (error) {
    console.error('❌ Error during reward cleanup:', error);
    return {
      success: false,
      message: 'Failed to clean up reward amounts',
      updated_rewards: 0,
      total_aura_before: 0,
      total_aura_after: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Preview what the cleanup would do without making changes
 */
export const previewRewardCleanup = async (): Promise<{
  total_rewards: number;
  needs_cleanup: number;
  current_total: number;
  corrected_total: number;
  details: Array<{ book_title: string; current: number; correct: number }>;
}> => {
  try {
    const { data: rewards, error } = await supabase
      .from('pending_rewards')
      .select('reward_amount, book_pages, book_title')
      .order('created_at', { ascending: false });

    if (error || !rewards) {
      throw new Error('Failed to fetch rewards for preview');
    }

    const details: Array<{ book_title: string; current: number; correct: number }> = [];
    let needsCleanup = 0;
    let currentTotal = 0;
    let correctedTotal = 0;

    for (const reward of rewards) {
      const current = reward.reward_amount;
      const correct = reward.book_pages || 1;
      
      currentTotal += current;
      correctedTotal += correct;

      if (current !== correct) {
        needsCleanup++;
        details.push({
          book_title: reward.book_title,
          current,
          correct
        });
      }
    }

    return {
      total_rewards: rewards.length,
      needs_cleanup: needsCleanup,
      current_total: currentTotal,
      corrected_total: correctedTotal,
      details
    };

  } catch (error) {
    console.error('Error previewing cleanup:', error);
    throw error;
  }
};

export default {
  cleanupRewardAmounts,
  previewRewardCleanup
};