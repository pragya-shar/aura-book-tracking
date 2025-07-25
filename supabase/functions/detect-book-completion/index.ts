// @ts-nocheck - This file runs in Deno runtime, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      // @ts-ignore - Deno runtime
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore - Deno runtime
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { reading_log_id } = await req.json()

    if (!reading_log_id) {
      throw new Error('reading_log_id is required')
    }

    // Get reading log details with book information
    const { data: readingLog, error: logError } = await supabase
      .from('reading_logs')
      .select(`
        *,
        books!inner(page_count, title)
      `)
      .eq('id', reading_log_id)
      .single()

    if (logError) {
      console.error('Error fetching reading log:', logError)
      throw logError
    }

    if (!readingLog) {
      throw new Error('Reading log not found')
    }

    // Get user's wallet address separately
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('wallet_address')
      .eq('user_id', readingLog.user_id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      throw new Error('User profile not found - wallet address required')
    }

    if (!userProfile?.wallet_address) {
      throw new Error('User wallet address not configured')
    }

    // Check if book is completed
    if (readingLog.current_page >= readingLog.books.page_count) {
      // Check if pending reward already exists
      const { data: existingReward, error: checkError } = await supabase
        .from('pending_rewards')
        .select('id')
        .eq('user_id', readingLog.user_id)
        .eq('book_id', readingLog.book_id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing reward:', checkError)
        throw checkError
      }

      if (existingReward) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            reward_created: false,
            message: 'Reward already exists for this book'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

              // Create pending reward
        const { data: newReward, error: rewardError } = await supabase
          .from('pending_rewards')
          .insert({
            user_id: readingLog.user_id,
            book_id: readingLog.book_id,
            wallet_address: userProfile.wallet_address,
            reward_amount: readingLog.books.page_count, // 1 AURA per page
            book_title: readingLog.books.title,
            book_pages: readingLog.books.page_count,
            completed_at: readingLog.created_at,
            status: 'pending'
          })
          .select()
          .single()

      if (rewardError) {
        console.error('Error creating pending reward:', rewardError)
        throw rewardError
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          reward_created: true,
          reward_amount: readingLog.books.page_count,
          reward_id: newReward.id,
          message: `Created pending reward of ${readingLog.books.page_count} AURA for "${readingLog.books.title}"`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reward_created: false,
        message: 'Book not yet completed',
        current_page: readingLog.current_page,
        total_pages: readingLog.books.page_count
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 