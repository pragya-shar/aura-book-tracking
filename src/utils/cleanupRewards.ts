import { supabase } from '@/integrations/supabase/client';

/**
 * Cleanup function to reset all pending rewards to pending status
 * This removes fake transaction hashes from development/testing
 * Safe operation - only affects database tracking, not smart contract or actual tokens
 */
export async function cleanupPendingRewards() {
  try {
    console.log('🧹 Starting cleanup of pending rewards...');
    
    // First, let's see what we're working with
    const { data: beforeCleanup, error: fetchError } = await supabase
      .from('pending_rewards')
      .select('id, book_title, reward_amount, status, transaction_hash, processed_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching current rewards:', fetchError);
      return { success: false, error: fetchError.message };
    }

    console.log(`📊 Found ${beforeCleanup?.length || 0} total reward entries`);
    
    const rewardsWithFakeHashes = beforeCleanup?.filter(r => r.transaction_hash) || [];
    console.log(`🎯 Found ${rewardsWithFakeHashes.length} entries with transaction hashes to clean`);

    if (rewardsWithFakeHashes.length === 0) {
      console.log('✅ No fake transaction hashes found - database is already clean!');
      return { 
        success: true, 
        message: 'Database is already clean - no cleanup needed',
        totalEntries: beforeCleanup?.length || 0,
        cleanedEntries: 0
      };
    }

    // Show what we're about to clean
    console.log('📋 Entries to be cleaned:');
    rewardsWithFakeHashes.forEach(reward => {
      console.log(`  - ${reward.book_title}: ${reward.reward_amount} AURA (hash: ${reward.transaction_hash?.substring(0, 20)}...)`);
    });

    // Perform the cleanup - reset to pending status
    const { data: cleanupResult, error: cleanupError } = await supabase
      .from('pending_rewards')
      .update({
        transaction_hash: null,
        processed_at: null,
        status: 'pending'
      })
      .not('transaction_hash', 'is', null); // Only update entries that have transaction_hash

    if (cleanupError) {
      console.error('❌ Error during cleanup:', cleanupError);
      return { success: false, error: cleanupError.message };
    }

    // Verify the cleanup
    const { data: afterCleanup, error: verifyError } = await supabase
      .from('pending_rewards')
      .select('id, transaction_hash')
      .not('transaction_hash', 'is', null);

    if (verifyError) {
      console.warn('⚠️ Could not verify cleanup, but operation appeared successful');
    }

    const remainingHashes = afterCleanup?.length || 0;

    console.log('✅ Cleanup completed successfully!');
    console.log(`📊 Results:`);
    console.log(`  - Total entries processed: ${beforeCleanup?.length || 0}`);
    console.log(`  - Entries cleaned: ${rewardsWithFakeHashes.length}`);
    console.log(`  - Remaining transaction hashes: ${remainingHashes}`);

    return {
      success: true,
      message: `Successfully cleaned ${rewardsWithFakeHashes.length} entries`,
      totalEntries: beforeCleanup?.length || 0,
      cleanedEntries: rewardsWithFakeHashes.length,
      remainingHashes: remainingHashes
    };

  } catch (error) {
    console.error('💥 Unexpected error during cleanup:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Quick function to check current status without making changes
 */
export async function checkRewardsStatus() {
  try {
    const { data, error } = await supabase
      .from('pending_rewards')
      .select('status, transaction_hash')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const total = data?.length || 0;
    const withHashes = data?.filter(r => r.transaction_hash).length || 0;
    const pending = data?.filter(r => r.status === 'pending').length || 0;
    const completed = data?.filter(r => r.status === 'completed').length || 0;

    return {
      success: true,
      total,
      withTransactionHashes: withHashes,
      pending,
      completed,
      summary: `${total} total rewards: ${pending} pending, ${completed} completed, ${withHashes} with transaction hashes`
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 