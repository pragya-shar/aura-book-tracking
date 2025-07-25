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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('user_id is required')
    }

    // Test database connectivity and get user info
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (profileError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User profile not found',
          details: profileError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's books
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, page_count, status')
      .eq('user_id', user_id)

    if (booksError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error fetching books',
          details: booksError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's reading logs
    const { data: readingLogs, error: logsError } = await supabase
      .from('reading_logs')
      .select('id, book_id, current_page, status, reward_amount')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (logsError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error fetching reading logs',
          details: logsError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's pending rewards
    const { data: pendingRewards, error: rewardsError } = await supabase
      .from('pending_rewards')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (rewardsError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error fetching pending rewards',
          details: rewardsError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Test the helper functions
    const { data: pendingSummary, error: pendingError } = await supabase
      .rpc('get_user_pending_rewards', { user_uuid: user_id })

    const { data: completedSummary, error: completedError } = await supabase
      .rpc('get_user_completed_rewards', { user_uuid: user_id })

    return new Response(
      JSON.stringify({ 
        success: true,
        user_profile: userProfile,
        books_count: books?.length || 0,
        books: books,
        reading_logs_count: readingLogs?.length || 0,
        reading_logs: readingLogs,
        pending_rewards_count: pendingRewards?.length || 0,
        pending_rewards: pendingRewards,
        pending_summary: pendingSummary,
        completed_summary: completedSummary,
        system_status: {
          database_connected: true,
          functions_available: true,
          wallet_configured: !!userProfile?.wallet_address
        }
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