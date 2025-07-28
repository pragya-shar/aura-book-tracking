// @ts-nocheck - This file runs in Deno runtime, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Hello from detect-book-completion function!")

interface BookCompletionRequest {
  user_id: string
  book_id: string
  current_page: number
  force_check?: boolean
}

interface BookCompletionResponse {
  success: boolean
  message: string
  reward_created?: boolean
  reward_amount?: number
  pending_reward_id?: string
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
    const { user_id, book_id, current_page, force_check = false }: BookCompletionRequest = await req.json()

    console.log(`📚 Checking book completion for user ${user_id}, book ${book_id}, page ${current_page}`)

    // Validate input
    if (!user_id || !book_id || typeof current_page !== 'number') {
      throw new Error('Missing required fields: user_id, book_id, current_page')
    }

    // Get book details
    const { data: book, error: bookError } = await supabaseClient
      .from('books')
      .select('id, title, page_count, user_id')
      .eq('id', book_id)
      .eq('user_id', user_id)
      .single()

    if (bookError || !book) {
      throw new Error(`Book not found or not owned by user: ${bookError?.message}`)
    }

    console.log(`📖 Book "${book.title}" has ${book.page_count} pages, user at page ${current_page}`)

    // Check if book is completed (1 AURA per page rule)
    const isCompleted = current_page >= book.page_count
    
    if (!isCompleted && !force_check) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Book not yet completed. ${current_page}/${book.page_count} pages read.`,
          reward_created: false
        } as BookCompletionResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if reward already exists
    const { data: existingReward } = await supabaseClient
      .from('pending_rewards')
      .select('id, status, reward_amount')
      .eq('user_id', user_id)
      .eq('book_id', book_id)
      .single()

    if (existingReward && !force_check) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Reward already exists (${existingReward.status}): ${existingReward.reward_amount} AURA`,
          reward_created: false,
          reward_amount: existingReward.reward_amount,
          pending_reward_id: existingReward.id
        } as BookCompletionResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's wallet address
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('wallet_address')
      .eq('user_id', user_id)
      .single()

    if (!userProfile?.wallet_address) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'User has no wallet linked. Cannot create reward.',
          reward_created: false,
          error: 'NO_WALLET'
        } as BookCompletionResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate reward amount (1 AURA per page)
    const rewardAmount = book.page_count

    console.log(`💰 Creating reward: ${rewardAmount} AURA (1 per page) for wallet ${userProfile.wallet_address}`)

    // Create or update reading log
    const { data: readingLog, error: logError } = await supabaseClient
      .from('reading_logs')
      .upsert({
        user_id,
        book_id,
        current_page,
        reward_amount: rewardAmount,
        reward_created: true,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,book_id'
      })
      .select()
      .single()

    if (logError) {
      console.error('Error creating reading log:', logError)
      throw new Error(`Failed to create reading log: ${logError.message}`)
    }

    // Create pending reward (1 AURA per page)
    const { data: pendingReward, error: rewardError } = await supabaseClient
      .from('pending_rewards')
      .upsert({
        user_id,
        book_id,
        reading_log_id: readingLog.id,
        wallet_address: userProfile.wallet_address,
        reward_amount: rewardAmount,
        book_title: book.title,
        book_pages: book.page_count,
        completed_at: new Date().toISOString(),
        status: 'pending'
      }, {
        onConflict: 'user_id,book_id'
      })
      .select()
      .single()

    if (rewardError) {
      console.error('Error creating pending reward:', rewardError)
      throw new Error(`Failed to create pending reward: ${rewardError.message}`)
    }

    console.log(`✅ Successfully created ${rewardAmount} AURA reward for completing "${book.title}"`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Book completion reward created: ${rewardAmount} AURA (1 per page)`,
        reward_created: true,
        reward_amount: rewardAmount,
        pending_reward_id: pendingReward.id
      } as BookCompletionResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in detect-book-completion:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      } as BookCompletionResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 