import { supabase } from '@/integrations/supabase/client';
import { mintTokens, AURACOIN_CONFIG } from '@/utils/auraCoinUtils';

export interface MintingProgress {
  total: number;
  completed: number;
  failed: number;
  currentReward?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface MintingResult {
  success: boolean;
  rewardId: string;
  bookTitle: string;
  amount: number;
  walletAddress: string;
  transactionHash?: string;
  error?: string;
}

export interface BulkMintingResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: MintingResult[];
  errors: string[];
}

/**
 * Mint AURA tokens for a single reward
 */
export async function mintRewardTokens(
  rewardId: string,
  walletAddress: string,
  amount: number,
  bookTitle: string,
  signTransaction: (xdr: string, network?: string) => Promise<string>,
  onProgress?: (progress: string) => void
): Promise<MintingResult> {
  try {
    onProgress?.(`Minting ${amount} AURA for "${bookTitle}"...`);
    
    // Call the actual minting function with all required parameters
    const result = await mintTokens(
      walletAddress,                  // recipient address
      amount,                        // amount to mint
      AURACOIN_CONFIG.OWNER_ADDRESS, // owner address (minter)
      signTransaction               // sign function
    );
    
    if (result && result.hash) {
      // Update the database with the transaction hash (with retry logic)
      onProgress?.(`Updating database for "${bookTitle}"...`);
      
      let updateSuccess = false;
      let updateError: any = null;
      
      // Retry database update up to 3 times
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🔄 Database update attempt ${attempt}/3 for reward ${rewardId}`);
          
          const { error } = await supabase
            .from('pending_rewards')
            .update({
              transaction_hash: result.hash,
              processed_at: new Date().toISOString(),
              status: 'completed'
            })
            .eq('id', rewardId);

          if (!error) {
            console.log(`✅ Database updated successfully on attempt ${attempt}`);
            updateSuccess = true;
            break;
          } else {
            updateError = error;
            console.warn(`⚠️ Attempt ${attempt} failed:`, error);
            
            // Wait before retry (exponential backoff)
            if (attempt < 3) {
              const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        } catch (fetchError) {
          updateError = fetchError;
          console.warn(`⚠️ Network error on attempt ${attempt}:`, fetchError);
          
          // Wait before retry for network errors
          if (attempt < 3) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!updateSuccess) {
        console.error('❌ All database update attempts failed:', updateError);
        return {
          success: false,
          rewardId,
          bookTitle,
          amount,
          walletAddress,
          error: `Minting succeeded but database update failed after 3 attempts: ${updateError?.message || 'Network error'}`
        };
      }

      return {
        success: true,
        rewardId,
        bookTitle,
        amount,
        walletAddress,
        transactionHash: result.hash
      };
    } else {
      return {
        success: false,
        rewardId,
        bookTitle,
        amount,
        walletAddress,
        error: 'Minting failed - no transaction hash returned'
      };
    }
  } catch (error) {
    console.error('Error minting reward tokens:', error);
    return {
      success: false,
      rewardId,
      bookTitle,
      amount,
      walletAddress,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Process multiple rewards in bulk with progress tracking
 */
export async function bulkMintRewards(
  rewards: Array<{
    id: string;
    wallet_address: string;
    reward_amount: number;
    book_title: string;
  }>,
  signTransaction: (xdr: string, network?: string) => Promise<string>,
  onProgress?: (progress: MintingProgress) => void
): Promise<BulkMintingResult> {
  const results: MintingResult[] = [];
  const errors: string[] = [];
  let successful = 0;
  let failed = 0;

  const total = rewards.length;
  
  onProgress?.({
    total,
    completed: 0,
    failed: 0,
    status: 'processing',
    currentReward: undefined
  });

  for (let i = 0; i < rewards.length; i++) {
    const reward = rewards[i];
    
    // Update progress
    onProgress?.({
      total,
      completed: successful,
      failed,
      status: 'processing',
      currentReward: reward.book_title
    });

    try {
      const result = await mintRewardTokens(
        reward.id,
        reward.wallet_address,
        reward.reward_amount,
        reward.book_title,
        signTransaction,
        (progressMsg) => {
          onProgress?.({
            total,
            completed: successful,
            failed,
            status: 'processing',
            currentReward: progressMsg
          });
        }
      );

      results.push(result);

      if (result.success) {
        successful++;
        console.log(`✅ Successfully minted ${result.amount} AURA for "${result.bookTitle}"`);
      } else {
        failed++;
        errors.push(`${result.bookTitle}: ${result.error}`);
        console.error(`❌ Failed to mint for "${result.bookTitle}":`, result.error);
      }

      // Add a small delay between operations to avoid overwhelming the network
      if (i < rewards.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      failed++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${reward.book_title}: ${errorMsg}`);
      console.error(`💥 Unexpected error processing "${reward.book_title}":`, error);
      
      results.push({
        success: false,
        rewardId: reward.id,
        bookTitle: reward.book_title,
        amount: reward.reward_amount,
        walletAddress: reward.wallet_address,
        error: errorMsg
      });
    }
  }

  // Final progress update
  const finalStatus: 'completed' | 'failed' = failed === total ? 'failed' : 'completed';
  onProgress?.({
    total,
    completed: successful,
    failed,
    status: finalStatus,
    currentReward: undefined
  });

  return {
    totalProcessed: total,
    successful,
    failed,
    results,
    errors
  };
}

/**
 * Validate that rewards can be processed
 */
export function validateRewardsForMinting(rewards: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (rewards.length === 0) {
    errors.push('No rewards selected for processing');
  }

  for (const reward of rewards) {
    if (!reward.wallet_address) {
      errors.push(`Reward "${reward.book_title}" has no wallet address`);
    }
    
    if (reward.reward_amount <= 0) {
      errors.push(`Reward "${reward.book_title}" has invalid amount: ${reward.reward_amount}`);
    }
    
    if (reward.transaction_hash) {
      errors.push(`Reward "${reward.book_title}" has already been processed`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
} 