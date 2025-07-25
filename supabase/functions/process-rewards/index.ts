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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role for admin operations
    )

    const { reward_ids } = await req.json()

    if (!reward_ids || !Array.isArray(reward_ids) || reward_ids.length === 0) {
      throw new Error('reward_ids array is required and must not be empty')
    }

    const results = []

    for (const rewardId of reward_ids) {
      try {
        // Get pending reward
        const { data: reward, error: fetchError } = await supabase
          .from('pending_rewards')
          .select('*')
          .eq('id', rewardId)
          .eq('status', 'pending')
          .single()

        if (fetchError) {
          results.push({ 
            id: rewardId, 
            status: 'error', 
            message: 'Reward not found or already processed' 
          })
          continue
        }

        // Update status to processing
        await supabase
          .from('pending_rewards')
          .update({ status: 'processing' })
          .eq('id', rewardId)

        // TODO: Integrate with AuraCoin contract minting
        // This is where you'll call your AuraCoin contract to mint tokens
        // const transactionHash = await mintAuraCoins(reward.wallet_address, reward.reward_amount)
        
        // For now, simulate successful minting
        const transactionHash = `simulated_tx_${Date.now()}_${rewardId}`

        // Update reward as completed using the database function
        const { data: processResult, error: processError } = await supabase
          .rpc('mark_reward_processed', {
            reward_id: rewardId,
            transaction_hash: transactionHash
          })

        if (processError) {
          // Mark as failed
          await supabase
            .from('pending_rewards')
            .update({ status: 'failed' })
            .eq('id', rewardId)

          results.push({ 
            id: rewardId, 
            status: 'error', 
            message: processError.message 
          })
        } else {
          results.push({ 
            id: rewardId, 
            status: 'success', 
            transaction_hash: transactionHash,
            reward_amount: reward.reward_amount,
            wallet_address: reward.wallet_address
          })
        }

      } catch (error) {
        // Mark as failed
        await supabase
          .from('pending_rewards')
          .update({ status: 'failed' })
          .eq('id', rewardId)

        results.push({ 
          id: rewardId, 
          status: 'error', 
          message: error.message 
        })
      }
    }

    // Calculate summary
    const successful = results.filter(r => r.status === 'success').length
    const failed = results.filter(r => r.status === 'error').length
    const totalAmount = results
      .filter(r => r.status === 'success')
      .reduce((sum, r) => sum + (r.reward_amount || 0), 0)

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        summary: {
          total_processed: reward_ids.length,
          successful,
          failed,
          total_amount: totalAmount
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