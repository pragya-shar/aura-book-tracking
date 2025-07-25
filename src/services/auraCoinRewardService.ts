/**
 * AuraCoin Reward Service
 * 
 * This service handles rewarding users with AuraCoin tokens
 * when they complete reading books.
 */

import { supabase } from '@/integrations/supabase/client'

export interface AuraCoinRewardResponse {
  success: boolean
  reward_created?: boolean
  reward_amount?: number
  reward_id?: string
  message?: string
  error?: string
}

export interface ProcessRewardsResponse {
  success: boolean
  results: Array<{
    id: string
    status: 'success' | 'error'
    message?: string
    transaction_hash?: string
    reward_amount?: number
    wallet_address?: string
  }>
  summary: {
    total_processed: number
    successful: number
    failed: number
    total_amount: number
  }
}

export interface TestAuraCoinResponse {
  success: boolean
  user_profile?: any
  books_count?: number
  books?: any[]
  reading_logs_count?: number
  reading_logs?: any[]
  pending_rewards_count?: number
  pending_rewards?: any[]
  pending_summary?: any
  completed_summary?: any
  system_status?: {
    database_connected: boolean
    functions_available: boolean
    wallet_configured: boolean
  }
  error?: string
}

export class AuraCoinRewardService {
  /**
   * Detect book completion and create pending reward
   */
  static async detectBookCompletion(readingLogId: string): Promise<AuraCoinRewardResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('detect-book-completion', {
        body: { reading_log_id: readingLogId }
      })

      if (error) {
        console.error('Error calling detect-book-completion:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return data as AuraCoinRewardResponse
    } catch (error) {
      console.error('Error in detectBookCompletion:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Process pending rewards (admin function)
   */
  static async processRewards(rewardIds: string[]): Promise<ProcessRewardsResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('process-rewards', {
        body: { reward_ids: rewardIds }
      })

      if (error) {
        console.error('Error calling process-rewards:', error)
        return {
          success: false,
          results: [],
          summary: {
            total_processed: 0,
            successful: 0,
            failed: 1,
            total_amount: 0
          }
        }
      }

      return data as ProcessRewardsResponse
    } catch (error) {
      console.error('Error in processRewards:', error)
      return {
        success: false,
        results: [],
        summary: {
          total_processed: 0,
          successful: 0,
          failed: 1,
          total_amount: 0
        }
      }
    }
  }

  /**
   * Test AuraCoin system status
   */
  static async testAuraCoinSystem(userId: string): Promise<TestAuraCoinResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('test-aura-coin', {
        body: { user_id: userId }
      })

      if (error) {
        console.error('Error calling test-aura-coin:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return data as TestAuraCoinResponse
    } catch (error) {
      console.error('Error in testAuraCoinSystem:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get user's pending rewards using database function
   */
  static async getUserPendingRewards(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_pending_rewards', {
        user_uuid: userId
      })

      if (error) {
        console.error('Error getting pending rewards:', error)
        return { total_pending: 0, total_amount: 0 }
      }

      return data?.[0] || { total_pending: 0, total_amount: 0 }
    } catch (error) {
      console.error('Error in getUserPendingRewards:', error)
      return { total_pending: 0, total_amount: 0 }
    }
  }

  /**
   * Get user's completed rewards using database function
   */
  static async getUserCompletedRewards(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_completed_rewards', {
        user_uuid: userId
      })

      if (error) {
        console.error('Error getting completed rewards:', error)
        return { total_completed: 0, total_amount: 0 }
      }

      return data?.[0] || { total_completed: 0, total_amount: 0 }
    } catch (error) {
      console.error('Error in getUserCompletedRewards:', error)
      return { total_completed: 0, total_amount: 0 }
    }
  }

  /**
   * Mark a reward as processed (admin function)
   */
  static async markRewardProcessed(rewardId: string, transactionHash?: string) {
    try {
      const { data, error } = await supabase.rpc('mark_reward_processed', {
        reward_id: rewardId,
        transaction_hash: transactionHash
      })

      if (error) {
        console.error('Error marking reward as processed:', error)
        return false
      }

      return data
    } catch (error) {
      console.error('Error in markRewardProcessed:', error)
      return false
    }
  }
} 