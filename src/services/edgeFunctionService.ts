import { supabase } from '@/integrations/supabase/client'

// Edge Function service for manual book completion detection and reward processing
// Maintains the 1 AURA per page reward system

export interface BookCompletionRequest {
  user_id: string
  book_id: string
  current_page: number
  force_check?: boolean
}

export interface BookCompletionResponse {
  success: boolean
  message: string
  reward_created?: boolean
  reward_amount?: number
  pending_reward_id?: string
  error?: string
}

export interface ProcessRewardsRequest {
  user_id?: string
  reward_ids?: string[]
  max_rewards?: number
  dry_run?: boolean
}

export interface ProcessRewardsResponse {
  success: boolean
  message: string
  processed_count: number
  total_amount: number
  rewards_processed: Array<{
    id: string
    user_id: string
    book_title: string
    reward_amount: number
    wallet_address: string
    status: string
  }>
  dry_run?: boolean
  error?: string
}

export class EdgeFunctionService {
  
  /**
   * Manually detect book completion and create rewards
   * Uses 1 AURA per page reward system
   */
  static async detectBookCompletion(request: BookCompletionRequest): Promise<BookCompletionResponse> {
    try {
      console.log('🔍 Calling detect-book-completion Edge Function:', request)
      
      const { data, error } = await supabase.functions.invoke('detect-book-completion', {
        body: request
      })
      
      if (error) {
        console.error('Edge Function error:', error)
        throw new Error(error.message || 'Failed to call detect-book-completion function')
      }
      
      console.log('✅ Edge Function response:', data)
      return data as BookCompletionResponse
      
    } catch (error) {
      console.error('Error calling detect-book-completion:', error)
      return {
        success: false,
        message: 'Failed to detect book completion',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Process pending rewards (batch operation)
   * Maintains 1 AURA per page reward amounts
   */
  static async processRewards(request: ProcessRewardsRequest = {}): Promise<ProcessRewardsResponse> {
    try {
      console.log('⚙️ Calling process-rewards Edge Function:', request)
      
      const { data, error } = await supabase.functions.invoke('process-rewards', {
        body: request
      })
      
      if (error) {
        console.error('Edge Function error:', error)
        throw new Error(error.message || 'Failed to call process-rewards function')
      }
      
      console.log('✅ Edge Function response:', data)
      return data as ProcessRewardsResponse
      
    } catch (error) {
      console.error('Error calling process-rewards:', error)
      return {
        success: false,
        message: 'Failed to process rewards',
        processed_count: 0,
        total_amount: 0,
        rewards_processed: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Check what rewards would be processed (dry run)
   */
  static async previewRewardProcessing(request: Omit<ProcessRewardsRequest, 'dry_run'> = {}): Promise<ProcessRewardsResponse> {
    return this.processRewards({ ...request, dry_run: true })
  }
  
  /**
   * Process rewards for a specific user
   */
  static async processUserRewards(user_id: string, max_rewards = 10): Promise<ProcessRewardsResponse> {
    return this.processRewards({ user_id, max_rewards })
  }
  
  /**
   * Process specific reward IDs
   */
  static async processSpecificRewards(reward_ids: string[]): Promise<ProcessRewardsResponse> {
    return this.processRewards({ reward_ids })
  }
}

// Helper functions for UI integration

/**
 * Check if a book is completed and create reward if needed
 * Maintains 1 AURA per page system
 */
export const checkAndCreateBookReward = async (
  user_id: string, 
  book_id: string, 
  current_page: number
): Promise<BookCompletionResponse> => {
  return EdgeFunctionService.detectBookCompletion({
    user_id,
    book_id,
    current_page,
    force_check: false
  })
}

/**
 * Force create a reward for a completed book (admin function)
 */
export const forceCreateBookReward = async (
  user_id: string, 
  book_id: string, 
  current_page: number
): Promise<BookCompletionResponse> => {
  return EdgeFunctionService.detectBookCompletion({
    user_id,
    book_id,
    current_page,
    force_check: true
  })
}

/**
 * Get preview of what rewards would be processed
 */
export const getRewardProcessingPreview = async (user_id?: string): Promise<ProcessRewardsResponse> => {
  return EdgeFunctionService.previewRewardProcessing({ user_id })
} 