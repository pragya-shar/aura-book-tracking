// @ts-nocheck - This file runs in Deno runtime, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Hello from process-rewards function!")

interface ProcessRewardsRequest {
  user_id?: string // Optional: process specific user's rewards
  reward_ids?: string[] // Optional: process specific reward IDs
  max_rewards?: number // Optional: limit number of rewards to process
  dry_run?: boolean // Optional: preview what would be processed
}

interface ProcessRewardsResponse {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { 
      user_id, 
      reward_ids, 
      max_rewards = 50, 
      dry_run = false 
    }: ProcessRewardsRequest = await req.json()

    console.log(`🔄 Processing rewards - user: ${user_id || 'all'}, max: ${max_rewards}, dry_run: ${dry_run}`)

    // Build query for pending rewards
    let query = supabaseClient
      .from('pending_rewards')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(max_rewards)

    // Filter by user if specified
    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    // Filter by specific reward IDs if specified
    if (reward_ids && reward_ids.length > 0) {
      query = query.in('id', reward_ids)
    }

    const { data: pendingRewards, error: queryError } = await query

    if (queryError) {
      throw new Error(`Failed to fetch pending rewards: ${queryError.message}`)
    }

    if (!pendingRewards || pendingRewards.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No pending rewards found to process',
          processed_count: 0,
          total_amount: 0,
          rewards_processed: []
        } as ProcessRewardsResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📋 Found ${pendingRewards.length} pending rewards to process`)

    // Calculate total AURA amount (remember: 1 AURA per page)
    const totalAmount = pendingRewards.reduce((sum, reward) => sum + reward.reward_amount, 0)

    console.log(`💰 Total amount to process: ${totalAmount} AURA (1 AURA per page rule)`)

    // If dry run, just return what would be processed
    if (dry_run) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Dry run: Would process ${pendingRewards.length} rewards totaling ${totalAmount} AURA`,
          processed_count: pendingRewards.length,
          total_amount: totalAmount,
          rewards_processed: pendingRewards.map(reward => ({
            id: reward.id,
            user_id: reward.user_id,
            book_title: reward.book_title,
            reward_amount: reward.reward_amount,
            wallet_address: reward.wallet_address,
            status: reward.status
          })),
          dry_run: true
        } as ProcessRewardsResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process rewards (mark as processing, then completed)
    const processedRewards = []
    
    for (const reward of pendingRewards) {
      try {
        console.log(`⚙️ Processing reward ${reward.id}: ${reward.reward_amount} AURA for "${reward.book_title}"`)

        // Mark as processing
        await supabaseClient
          .from('pending_rewards')
          .update({ 
            status: 'processing',
            processed_at: new Date().toISOString()
          })
          .eq('id', reward.id)

        // Here you would integrate with actual AuraCoin minting
        // For now, we'll simulate successful processing
        
        // Simulate AuraCoin minting delay
        await new Promise(resolve => setTimeout(resolve, 100))

        // Mark as completed with mock transaction hash
        const mockTxHash = `tx_${reward.id.slice(0, 8)}_${Date.now()}`
        
        await supabaseClient
          .from('pending_rewards')
          .update({ 
            status: 'completed',
            transaction_hash: mockTxHash,
            processed_at: new Date().toISOString()
          })
          .eq('id', reward.id)

        processedRewards.push({
          id: reward.id,
          user_id: reward.user_id,
          book_title: reward.book_title,
          reward_amount: reward.reward_amount,
          wallet_address: reward.wallet_address,
          status: 'completed'
        })

        console.log(`✅ Completed reward ${reward.id}: ${reward.reward_amount} AURA`)

      } catch (error) {
        console.error(`❌ Failed to process reward ${reward.id}:`, error)
        
        // Mark as failed
        await supabaseClient
          .from('pending_rewards')
          .update({ 
            status: 'failed',
            processed_at: new Date().toISOString()
          })
          .eq('id', reward.id)
      }
    }

    const successCount = processedRewards.length
    const processedAmount = processedRewards.reduce((sum, reward) => sum + reward.reward_amount, 0)

    console.log(`🎉 Successfully processed ${successCount}/${pendingRewards.length} rewards (${processedAmount} AURA)`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${successCount} rewards totaling ${processedAmount} AURA`,
        processed_count: successCount,
        total_amount: processedAmount,
        rewards_processed: processedRewards
      } as ProcessRewardsResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-rewards:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        processed_count: 0,
        total_amount: 0,
        rewards_processed: [],
        error: error.message
      } as ProcessRewardsResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 