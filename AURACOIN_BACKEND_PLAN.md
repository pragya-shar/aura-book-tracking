# 🪙 AuraCoin Backend Integration Plan

## 📋 Overview
The goal is to automatically trigger AuraCoin rewards when users complete books (reach 100% reading progress), with rewards calculated as **1 AURA coin per page**. The owner (you) will mint the tokens, and users will see pending rewards until they're processed.

---

## 🎯 DETAILED EXECUTION PLAN

### 🚨 CRITICAL: Pre-Implementation Checklist
Before starting any phase, ensure:
- [x] Database backup completed (migration applied successfully)
- [x] Current code committed to git
- [x] Supabase project accessible
- [x] AuraCoin contract deployed and tested
- [x] Environment variables configured
- [x] Test data available

---

## 📋 PHASE CHECKLISTS

### ✅ Phase 1: Database Schema Updates
**Estimated Time: 2-3 hours**
**Risk Level: Medium**
**Dependencies: None**

#### Phase 1 Checklist:
- [x] **Step 1.1**: Backup Current Database *(Owner: Assistant)*
- [x] **Step 1.2**: Create Migration File (`20250721000000_aura_coin_rewards_v2.sql`) *(Owner: Assistant)*
- [x] **Step 1.3**: Test Migration Locally *(Owner: Assistant)*
- [x] **Step 1.4**: Deploy to Production *(Owner: Assistant)*
- [x] **Step 1.5**: Verification *(Owner: Assistant)*
- [x] **Step 1.6**: Fix Issues (Stack Overflow, Data Conflicts) *(Owner: Assistant)*
- [x] **Step 1.7**: Final Database Integrity Check *(Owner: Assistant)*
- [x] **Step 1.8**: Build Check *(Owner: Assistant)* - `npm run build` successful

---

### 🔧 Phase 2: Backend Functions
**Estimated Time: 4-5 hours**
**Risk Level: High**
**Dependencies: Phase 1 complete**

#### Phase 2 Checklist:
- [ ] **Step 2.1**: Create Book Completion Detection Function *(Owner: Assistant)*
- [ ] **Step 2.2**: Create Reward Processing Function *(Owner: Assistant)*
- [ ] **Step 2.3**: Create Test Function *(Owner: Assistant)*
- [ ] **Step 2.4**: Deploy All Functions *(Owner: Assistant)*
- [ ] **Step 2.5**: Test Function Connectivity *(Owner: Assistant)*
- [ ] **Step 2.6**: Test Function Logic *(Owner: User)* 
  - *Testing Steps: 1) Go to http://localhost:8080/wallet 2) Click "Test System" button 3) Verify no errors 4) Check console logs*
- [ ] **Step 2.7**: Create Frontend Service Layer *(Owner: Assistant)*
- [ ] **Step 2.8**: Test Complete Backend Flow *(Owner: User)*
  - *Testing Steps: 1) Add a book with page count 2) Log progress to 100% 3) Check if pending reward appears*
- [ ] **Step 2.9**: Performance Testing *(Owner: Assistant)*
- [ ] **Step 2.10**: Error Handling Verification *(Owner: User)*
  - *Testing Steps: 1) Try completing book without wallet 2) Try with invalid data 3) Verify error messages*
- [ ] **Step 2.11**: Build Check *(Owner: Assistant)* - `npm run build` successful

---

### 🎮 Phase 3: Frontend Integration
**Estimated Time: 6-8 hours**
**Risk Level: Medium**
**Dependencies: Phase 2 complete**

#### Phase 3 Checklist:
- [ ] **Step 3.1**: Update Type Definitions *(Owner: Assistant)*
- [ ] **Step 3.2**: Create PendingRewards Component *(Owner: Assistant)*
- [ ] **Step 3.3**: Update LogProgressDialog *(Owner: Assistant)*
- [ ] **Step 3.4**: Update Wallet Page *(Owner: Assistant)*
- [ ] **Step 3.5**: Test Frontend Integration *(Owner: User)*
  - *Testing Steps: 1) Navigate to all pages 2) Verify components load 3) Check for console errors*
- [ ] **Step 3.6**: Test Book Completion Flow *(Owner: User)*
  - *Testing Steps: 1) Complete a book 2) Verify completion modal appears 3) Check reward breakdown is correct*
- [ ] **Step 3.7**: Test Reward Display *(Owner: User)*
  - *Testing Steps: 1) Go to wallet page 2) Verify pending rewards show 3) Check reward amounts*
- [ ] **Step 3.8**: Mobile Responsiveness Check *(Owner: User)*
  - *Testing Steps: 1) Open on mobile/resize browser 2) Test all components 3) Verify touch interactions*
- [ ] **Step 3.9**: Error State Handling *(Owner: User)*
  - *Testing Steps: 1) Disconnect internet 2) Try actions 3) Verify error messages appear*
- [ ] **Step 3.10**: User Experience Testing *(Owner: User)*
  - *Testing Steps: 1) Complete full user flow 2) Rate ease of use 3) Report any confusion*
- [ ] **Step 3.11**: Build Check *(Owner: Assistant)* - `npm run build` successful

---

### ⚡ Phase 4: Real-time Updates
**Estimated Time: 2-3 hours**
**Risk Level: Low**
**Dependencies: Phase 3 complete**

#### Phase 4 Checklist:
- [ ] **Step 4.1**: Create Database Trigger *(Owner: Assistant)*
- [ ] **Step 4.2**: Test Real-time Updates *(Owner: User)*
  - *Testing Steps: 1) Open wallet in 2 browser tabs 2) Complete book in tab 1 3) Verify reward appears in tab 2 instantly*
- [ ] **Step 4.3**: Test Concurrent Users *(Owner: User)*
  - *Testing Steps: 1) Have multiple users complete books simultaneously 2) Verify all rewards process correctly*
- [ ] **Step 4.4**: Performance Optimization *(Owner: Assistant)*
- [ ] **Step 4.5**: Error Recovery Testing *(Owner: User)*
  - *Testing Steps: 1) Complete book while disconnected 2) Reconnect 3) Verify reward appears*
- [ ] **Step 4.6**: Real-time Latency Verification *(Owner: User)*
  - *Testing Steps: 1) Time delay between completion and reward appearance 2) Should be < 2 seconds*
- [ ] **Step 4.7**: Build Check *(Owner: Assistant)* - `npm run build` successful

---

### 🔐 Phase 5: Admin Interface
**Estimated Time: 4-5 hours**
**Risk Level: Medium**
**Dependencies: Phase 4 complete**

#### Phase 5 Checklist:
- [ ] **Step 5.1**: Create Admin Dashboard *(Owner: Assistant)*
- [ ] **Step 5.2**: Add Admin Route *(Owner: Assistant)*
- [ ] **Step 5.3**: Test Admin Interface *(Owner: User)*
  - *Testing Steps: 1) Navigate to /admin/rewards 2) Verify pending rewards list 3) Test select/deselect*
- [ ] **Step 5.4**: Test Batch Processing *(Owner: User)*
  - *Testing Steps: 1) Select multiple rewards 2) Click process 3) Verify all update to completed*
- [ ] **Step 5.5**: Test Error Handling *(Owner: User)*
  - *Testing Steps: 1) Try processing invalid rewards 2) Verify error messages 3) Check failed states*
- [ ] **Step 5.6**: Security Verification *(Owner: User)*
  - *Testing Steps: 1) Access admin as regular user 2) Should be blocked 3) Only admin should access*
- [ ] **Step 5.7**: Admin User Experience Testing *(Owner: User)*
  - *Testing Steps: 1) Complete admin workflow 2) Rate ease of use 3) Report any issues*
- [ ] **Step 5.8**: Build Check *(Owner: Assistant)* - `npm run build` successful

---

### 📊 Phase 6: Testing & Optimization
**Estimated Time: 3-4 hours**
**Risk Level: Low**
**Dependencies: All phases complete**

#### Phase 6 Checklist:
- [ ] **Step 6.1**: End-to-End Testing *(Owner: User)*
  - *Testing Steps: 1) Complete full user journey 2) Add book → Log progress → Complete → Get reward → Admin process*
- [ ] **Step 6.2**: Performance Testing *(Owner: Assistant)*
- [ ] **Step 6.3**: Error Handling Testing *(Owner: User)*
  - *Testing Steps: 1) Test all error scenarios 2) Network failures 3) Invalid inputs 4) Verify graceful handling*
- [ ] **Step 6.4**: Load Testing *(Owner: Assistant)*
- [ ] **Step 6.5**: Security Testing *(Owner: User)*
  - *Testing Steps: 1) Test unauthorized access 2) SQL injection attempts 3) Verify data protection*
- [ ] **Step 6.6**: Mobile Testing *(Owner: User)*
  - *Testing Steps: 1) Test on mobile devices 2) Portrait/landscape 3) Touch interactions 4) Responsive design*
- [ ] **Step 6.7**: Cross-browser Testing *(Owner: User)*
  - *Testing Steps: 1) Test Chrome, Firefox, Safari 2) Verify consistent behavior 3) Check compatibility*
- [ ] **Step 6.8**: Documentation Update *(Owner: Assistant)*
- [ ] **Step 6.9**: Final Deployment *(Owner: Assistant)*
- [ ] **Step 6.10**: Production Monitoring Setup *(Owner: Assistant)*
- [ ] **Step 6.11**: Final Build Check *(Owner: Assistant)* - `npm run build` successful

---

## 📊 Phase 1: Database Schema Updates
**Estimated Time: 2-3 hours**
**Risk Level: Medium**
**Dependencies: None**

### Step 1.1: Backup Current Database
```bash
# Create database backup
pg_dump your_database > backup_before_aura_integration.sql
```

### Step 1.2: Create Migration File
**File:** `supabase/migrations/20250721000000_aura_coin_rewards_v2.sql`

```sql
-- Migration: AuraCoin Rewards v2 (Simplified)
-- Date: 2025-07-21
-- Description: Simplified reward system with 1 AURA per page

-- Step 1: Add missing columns to reading_logs table
ALTER TABLE public.reading_logs 
ADD COLUMN IF NOT EXISTS reward_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'rewarded'));

-- Step 2: Create pending_rewards table
CREATE TABLE IF NOT EXISTS public.pending_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  book_title TEXT NOT NULL,
  book_pages INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_rewards_user_id ON public.pending_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_rewards_status ON public.pending_rewards(status);
CREATE INDEX IF NOT EXISTS idx_pending_rewards_created_at ON public.pending_rewards(created_at);

-- Step 4: Set up Row Level Security (RLS)
ALTER TABLE public.pending_rewards ENABLE ROW LEVEL SECURITY;

-- Users can only see their own pending rewards
CREATE POLICY "Users can view own pending rewards" ON public.pending_rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can insert (via triggers)
CREATE POLICY "Authenticated users can insert pending rewards" ON public.pending_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only system/admin can update (for processing)
CREATE POLICY "System can update pending rewards" ON public.pending_rewards
  FOR UPDATE USING (true);
```

### Step 1.3: Test Migration Locally
```bash
# Test migration in development
supabase db reset
supabase db push
```

### Step 1.4: Deploy to Production
```bash
# Deploy migration to production
supabase db push --db-url your_production_url
```

### Step 1.5: Verification
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('pending_rewards');

-- Verify columns added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'reading_logs' AND column_name IN ('reward_amount', 'status');
```

---

## 🔧 Phase 2: Backend Functions
**Estimated Time: 4-5 hours**
**Risk Level: High**
**Dependencies: Phase 1 complete**

### Step 2.1: Create Book Completion Detection Function
**File:** `supabase/functions/detect-book-completion/index.ts`

```typescript
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

    const { reading_log_id } = await req.json()

    // Get reading log details
    const { data: readingLog, error: logError } = await supabase
      .from('reading_logs')
      .select(`
        *,
        books!inner(page_count, title),
        user_profiles!inner(wallet_address)
      `)
      .eq('id', reading_log_id)
      .single()

    if (logError) throw logError

    // Check if book is completed
    if (readingLog.current_page >= readingLog.books.page_count) {
      // Create pending reward
      const { error: rewardError } = await supabase
        .from('pending_rewards')
        .insert({
          user_id: readingLog.user_id,
          book_id: readingLog.book_id,
          wallet_address: readingLog.user_profiles.wallet_address,
          reward_amount: readingLog.books.page_count, // 1 AURA per page
          book_title: readingLog.books.title,
          book_pages: readingLog.books.page_count,
          completed_at: readingLog.created_at
        })

      if (rewardError) throw rewardError

      return new Response(
        JSON.stringify({ 
          success: true, 
          reward_created: true,
          reward_amount: readingLog.books.page_count 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, reward_created: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Step 2.2: Create Reward Processing Function
**File:** `supabase/functions/process-rewards/index.ts`

```typescript
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role for admin operations
    )

    const { reward_ids } = await req.json()

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
          results.push({ id: rewardId, status: 'error', message: 'Reward not found or already processed' })
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

        // Update reward as completed
        await supabase
          .from('pending_rewards')
          .update({ 
            status: 'completed',
            processed_at: new Date().toISOString(),
            transaction_hash: transactionHash
          })
          .eq('id', rewardId)

        results.push({ 
          id: rewardId, 
          status: 'success', 
          transaction_hash: transactionHash 
        })

      } catch (error) {
        // Mark as failed
        await supabase
          .from('pending_rewards')
          .update({ status: 'failed' })
          .eq('id', rewardId)

        results.push({ id: rewardId, status: 'error', message: error.message })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Step 2.3: Deploy Functions
```bash
# Deploy functions to Supabase
supabase functions deploy detect-book-completion
supabase functions deploy process-rewards
```

### Step 2.4: Test Functions
```bash
# Test book completion detection
curl -X POST https://your-project.supabase.co/functions/v1/detect-book-completion \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"reading_log_id": "test-id"}'

# Test reward processing
curl -X POST https://your-project.supabase.co/functions/v1/process-rewards \
  -H "Authorization: Bearer your-service-role-key" \
  -H "Content-Type: application/json" \
  -d '{"reward_ids": ["test-reward-id"]}'
```

---

## 🎮 Phase 3: Frontend Integration
**Estimated Time: 6-8 hours**
**Risk Level: Medium**
**Dependencies: Phase 2 complete**

### Step 3.1: Update Type Definitions
**File:** `src/integrations/supabase/types.ts`

```typescript
// Add new types for pending rewards
export interface PendingReward {
  id: string
  user_id: string
  book_id: string
  wallet_address: string
  reward_amount: number
  book_title: string
  book_pages: number
  completed_at: string
  created_at: string
  processed_at?: string
  transaction_hash?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// Update existing types
export interface ReadingLog {
  id: string
  user_id: string
  book_id: string
  current_page: number
  created_at: string
  reward_amount: number
  status: 'in_progress' | 'completed' | 'rewarded'
}
```

### Step 3.2: Create PendingRewards Component
**File:** `src/components/PendingRewards.tsx`

```typescript
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { supabase } from '../integrations/supabase/client'
import { PendingReward } from '../integrations/supabase/types'

interface PendingRewardsProps {
  userId: string
}

export const PendingRewards: React.FC<PendingRewardsProps> = ({ userId }) => {
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingRewards()
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('pending_rewards_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pending_rewards' },
        () => {
          fetchPendingRewards()
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [userId])

  const fetchPendingRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_rewards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPendingRewards(data || [])
    } catch (error) {
      console.error('Error fetching pending rewards:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500 text-black">⏳ Pending</Badge>
      case 'processing':
        return <Badge className="bg-blue-500 text-white">⚡ Processing</Badge>
      case 'completed':
        return <Badge className="bg-green-500 text-black">✅ Completed</Badge>
      case 'failed':
        return <Badge className="bg-red-500 text-white">❌ Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return <div>Loading pending rewards...</div>
  }

  if (pendingRewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>⏳ Pending Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-stone-400">No pending rewards at the moment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>⏳ Pending Rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingRewards.map(reward => (
            <div key={reward.id} className="flex justify-between items-center p-3 bg-amber-50/10 rounded-lg">
              <div>
                <p className="font-medium">{reward.book_title}</p>
                <p className="text-sm text-stone-400">
                  {reward.book_pages} pages • {new Date(reward.completed_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-400">
                  {reward.reward_amount} AURA
                </p>
                {getStatusBadge(reward.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Step 3.3: Update LogProgressDialog
**File:** `src/components/LogProgressDialog.tsx`

```typescript
// Add to existing imports
import { supabase } from '../integrations/supabase/client'
import { useToast } from '../hooks/use-toast'

// Add to component state
const [showRewardBreakdown, setShowRewardBreakdown] = useState(false)
const { toast } = useToast()

// Add completion detection function
const handleCompletion = async (currentPage: number) => {
  if (currentPage >= book.page_count) {
    // Book completed!
    const rewardAmount = book.page_count // 1 AURA per page
    
    // Show completion celebration
    toast({
      title: "🎉 Book Completed!",
      description: `Congratulations! You've earned ${rewardAmount} AURA coins!`,
      duration: 5000,
    })

    // Show reward breakdown modal
    setShowRewardBreakdown(true)

    // Trigger backend function to create pending reward
    try {
      const { error } = await supabase.functions.invoke('detect-book-completion', {
        body: { reading_log_id: readingLogId }
      })

      if (error) {
        console.error('Error creating pending reward:', error)
        toast({
          title: "⚠️ Reward Error",
          description: "There was an issue creating your reward. Please contact support.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error calling completion function:', error)
    }
  }
}

// Add reward breakdown modal to JSX
{showRewardBreakdown && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-black/90 border border-amber-500/30 rounded-lg p-6 max-w-md">
      <h3 className="text-xl font-bold text-amber-400 mb-4">
        🎉 Book Completion Reward!
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Book:</span>
          <span className="font-medium">{book.title}</span>
        </div>
        <div className="flex justify-between">
          <span>Pages:</span>
          <span>{book.page_count} pages</span>
        </div>
        <div className="flex justify-between">
          <span>Reward Rate:</span>
          <span>1 AURA per page</span>
        </div>
        <div className="border-t border-amber-500/30 pt-3">
          <div className="flex justify-between text-lg font-bold text-amber-400">
            <span>Total Reward:</span>
            <span>{book.page_count} AURA</span>
          </div>
        </div>
        <p className="text-sm text-stone-400 mt-3">
          Your reward will be processed by the owner and added to your wallet soon!
        </p>
        <button
          onClick={() => setShowRewardBreakdown(false)}
          className="w-full bg-amber-500 text-black py-2 rounded-lg font-medium"
        >
          Got it!
        </button>
      </div>
    </div>
  </div>
)}
```

### Step 3.4: Update Wallet Page
**File:** `src/pages/Wallet.tsx`

```typescript
// Add to imports
import { PendingRewards } from '../components/PendingRewards'
import { useAuth } from '../contexts/AuthContext'

// Add to component
const { user } = useAuth()

// Add PendingRewards component to JSX
{user && <PendingRewards userId={user.id} />}
```

### Step 3.5: Test Frontend Integration
```bash
# Start development server
npm run dev

# Test book completion flow:
# 1. Add a book with known page count
# 2. Log progress to 100%
# 3. Verify completion modal appears
# 4. Check pending rewards appear in wallet
```

---

## ⚡ Phase 4: Real-time Updates
**Estimated Time: 2-3 hours**
**Risk Level: Low**
**Dependencies: Phase 3 complete**

### Step 4.1: Create Database Trigger
**File:** `supabase/migrations/20250721000001_book_completion_trigger.sql`

```sql
-- Create function to handle book completion
CREATE OR REPLACE FUNCTION handle_book_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if book is now completed
  IF NEW.current_page >= (SELECT page_count FROM books WHERE id = NEW.book_id) THEN
    -- Update reading log status
    UPDATE reading_logs 
    SET status = 'completed', reward_amount = (SELECT page_count FROM books WHERE id = NEW.book_id)
    WHERE id = NEW.id;
    
    -- Create pending reward (1 AURA per page)
    INSERT INTO pending_rewards (user_id, book_id, wallet_address, reward_amount, book_title, book_pages, completed_at)
    SELECT 
      NEW.user_id,
      NEW.book_id,
      up.wallet_address,
      b.page_count, -- 1 AURA per page
      b.title,
      b.page_count,
      NEW.created_at
    FROM books b
    JOIN user_profiles up ON up.user_id = NEW.user_id
    WHERE b.id = NEW.book_id
    AND NOT EXISTS (
      SELECT 1 FROM pending_rewards pr 
      WHERE pr.book_id = NEW.book_id AND pr.user_id = NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS book_completion_trigger ON reading_logs;
CREATE TRIGGER book_completion_trigger
  AFTER INSERT OR UPDATE ON reading_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_book_completion();
```

### Step 4.2: Test Real-time Updates
```bash
# Deploy trigger
supabase db push

# Test real-time functionality:
# 1. Open wallet page in browser
# 2. Complete a book in another tab
# 3. Verify pending reward appears immediately
```

---

## 🔐 Phase 5: Admin Interface
**Estimated Time: 4-5 hours**
**Risk Level: Medium**
**Dependencies: Phase 4 complete**

### Step 5.1: Create Admin Dashboard
**File:** `src/pages/AdminRewards.tsx`

```typescript
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { supabase } from '../integrations/supabase/client'
import { PendingReward } from '../integrations/supabase/types'

export const AdminRewards: React.FC = () => {
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([])
  const [processing, setProcessing] = useState(false)
  const [selectedRewards, setSelectedRewards] = useState<string[]>([])

  useEffect(() => {
    fetchPendingRewards()
  }, [])

  const fetchPendingRewards = async () => {
    const { data, error } = await supabase
      .from('pending_rewards')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching pending rewards:', error)
      return
    }

    setPendingRewards(data || [])
  }

  const processSelectedRewards = async () => {
    if (selectedRewards.length === 0) return

    setProcessing(true)
    try {
      const { error } = await supabase.functions.invoke('process-rewards', {
        body: { reward_ids: selectedRewards }
      })

      if (error) throw error

      // Refresh the list
      await fetchPendingRewards()
      setSelectedRewards([])
      
      alert(`Successfully processed ${selectedRewards.length} rewards!`)
    } catch (error) {
      console.error('Error processing rewards:', error)
      alert('Error processing rewards. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const toggleRewardSelection = (rewardId: string) => {
    setSelectedRewards(prev => 
      prev.includes(rewardId) 
        ? prev.filter(id => id !== rewardId)
        : [...prev, rewardId]
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎯 Admin Reward Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p>Pending Rewards: {pendingRewards.length}</p>
            <Button 
              onClick={processSelectedRewards}
              disabled={selectedRewards.length === 0 || processing}
            >
              {processing ? 'Processing...' : `Process ${selectedRewards.length} Selected`}
            </Button>
          </div>

          <div className="space-y-3">
            {pendingRewards.map(reward => (
              <div key={reward.id} className="flex items-center space-x-3 p-3 bg-amber-50/10 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedRewards.includes(reward.id)}
                  onChange={() => toggleRewardSelection(reward.id)}
                />
                <div className="flex-1">
                  <p className="font-medium">{reward.book_title}</p>
                  <p className="text-sm text-stone-400">
                    {reward.wallet_address} • {reward.book_pages} pages • {new Date(reward.completed_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-400">
                    {reward.reward_amount} AURA
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 5.2: Add Admin Route
**File:** `src/App.tsx`

```typescript
// Add admin route
<Route path="/admin/rewards" element={<AdminRewards />} />
```

### Step 5.3: Test Admin Interface
```bash
# Test admin functionality:
# 1. Complete a book as regular user
# 2. Login as admin
# 3. Navigate to /admin/rewards
# 4. Select and process rewards
# 5. Verify status updates
```

---

## 📊 Phase 6: Testing & Optimization
**Estimated Time: 3-4 hours**
**Risk Level: Low**
**Dependencies: All phases complete**

### Step 6.1: End-to-End Testing
```bash
# Test complete flow:
# 1. User adds book (300 pages)
# 2. User logs progress to 100%
# 3. Verify completion modal appears
# 4. Verify pending reward created
# 5. Admin processes reward
# 6. Verify reward status updates
# 7. Verify user sees completed reward
```

### Step 6.2: Performance Testing
```bash
# Test with multiple concurrent completions
# Test with large batch processing
# Monitor database performance
# Check real-time update latency
```

### Step 6.3: Error Handling
```bash
# Test error scenarios:
# 1. Network failures during completion
# 2. Invalid wallet addresses
# 3. Database connection issues
# 4. Function deployment failures
```

---

## 🚨 ERROR PREVENTION CHECKLIST

### Before Each Phase:
- [ ] Database backup completed
- [ ] Code committed to git
- [ ] Environment variables verified
- [ ] Dependencies installed
- [ ] Test data prepared

### During Implementation:
- [ ] Test each step before proceeding
- [ ] Verify database changes
- [ ] Check function deployments
- [ ] Test frontend components
- [ ] Monitor error logs

### After Each Phase:
- [ ] Run integration tests
- [ ] Verify data integrity
- [ ] Check performance impact
- [ ] Update documentation
- [ ] Commit working state

---

## 🔧 TROUBLESHOOTING GUIDE

### Common Issues:

**1. Database Migration Fails**
```bash
# Check current database state
supabase db diff

# Reset if needed
supabase db reset
```

**2. Function Deployment Fails**
```bash
# Check function logs
supabase functions logs detect-book-completion

# Verify environment variables
supabase secrets list
```

**3. Real-time Updates Not Working**
```bash
# Check subscription setup
# Verify RLS policies
# Test with simple subscription first
```

**4. Frontend Errors**
```bash
# Check browser console
# Verify API calls
# Check authentication state
```

---

## 📈 SUCCESS METRICS

### Technical Metrics:
- [ ] Database migrations complete without errors
- [ ] Functions deploy successfully
- [ ] Real-time updates work < 1 second
- [ ] No memory leaks in frontend
- [ ] Error rate < 1%

### User Experience Metrics:
- [ ] Completion modal appears immediately
- [ ] Pending rewards visible within 2 seconds
- [ ] Admin processing completes within 30 seconds
- [ ] Mobile responsiveness maintained
- [ ] No broken UI states

### Business Metrics:
- [ ] 100% of book completions create pending rewards
- [ ] 95%+ reward processing success rate
- [ ] User engagement increases
- [ ] No data loss during processing

---

*Last Updated: July 21, 2025*
*Status: Planning Phase* 