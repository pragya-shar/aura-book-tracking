# 🪙 AuraCoin Backend Integration Plan - OPTIMIZED

## 📋 Overview
**Objective**: Automatically mint AuraCoin rewards when users complete books (reach 100% reading progress), with rewards calculated as **1 AURA coin per page**. The system will create pending rewards immediately, and the owner will process them for actual minting.

**Key Optimizations**:
- Database triggers for automatic detection
- Integration with existing LogProgressDialog
- Real-time pending rewards display
- Streamlined 3-phase implementation

---

## 🚨 CRITICAL: Pre-Implementation Checklist
- [x] Database backup completed (migration applied successfully)
- [x] Current code committed to git
- [x] Supabase project accessible
- [x] User profile & wallet linking system implemented
- [x] Environment variables configured
- [x] Test data available

---

## 📋 3-PHASE IMPLEMENTATION PLAN

### 🚀 **PHASE A: AUTOMATED REWARD SYSTEM**
**Time**: 2-3 hours | **Risk**: Medium | **Dependencies**: User profile linking complete

**Objective**: Create fully automated system that detects book completion and creates pending rewards.

#### Phase A Checklist:
- [x] **Step A.1**: Create Enhanced Database Schema *(Assistant)*
- [x] **Step A.2**: Create Automatic Detection Triggers *(Assistant)*
- [x] **Step A.3**: Deploy Edge Functions for Manual Fallback *(Assistant)*
- [ ] **Step A.4**: Integrate with Existing LogProgressDialog *(Assistant)*
- [ ] **Step A.5**: Test Trigger Automation *(User)*
  - *Test: Add book → Log 100% progress → Verify pending reward appears*
- [ ] **Step A.6**: Test Real-time Updates *(User)*
  - *Test: Open wallet → Complete book in another tab → Verify instant appearance*
- [ ] **Step A.7**: Error Handling Verification *(User)*
  - *Test: Complete without wallet linked → Verify proper error handling*
- [ ] **Step A.8**: Build Check *(Assistant)* - `npm run build` successful

---

### 🎮 **PHASE B: ENHANCED USER EXPERIENCE**
**Time**: 3-4 hours | **Risk**: Low | **Dependencies**: Phase A complete

**Objective**: Create engaging completion experience and comprehensive pending rewards display.

#### Phase B Checklist:
- [ ] **Step B.1**: Create Completion Celebration UI *(Assistant)*
- [ ] **Step B.2**: Enhanced Pending Rewards Component *(Assistant)*
- [ ] **Step B.3**: Update AuraCoinBalance for Better UX *(Assistant)*
- [ ] **Step B.4**: Real-time Wallet Updates *(Assistant)*
- [ ] **Step B.5**: Test Completion Experience *(User)*
  - *Test: Complete book → Verify celebration → Check reward breakdown*
- [ ] **Step B.6**: Test Pending Rewards Display *(User)*
  - *Test: Go to wallet → Verify all rewards show → Check amounts*
- [ ] **Step B.7**: Mobile Responsiveness Check *(User)*
  - *Test: Mobile/resize → Complete book → Verify all UI works*
- [ ] **Step B.8**: Build Check *(Assistant)* - `npm run build` successful

---

### 🔐 **PHASE C: ADMIN REWARD PROCESSING**
**Time**: 2-3 hours | **Risk**: Low | **Dependencies**: Phase B complete

**Objective**: Enable owner to efficiently process pending rewards and integrate with actual AuraCoin minting.

#### Phase C Checklist:
- [ ] **Step C.1**: Create Admin Dashboard *(Assistant)*
- [ ] **Step C.2**: Batch Processing Interface *(Assistant)*
- [ ] **Step C.3**: AuraCoin Contract Integration *(Assistant)*
- [ ] **Step C.4**: Transaction Tracking System *(Assistant)*
- [ ] **Step C.5**: Test Admin Interface *(User)*
  - *Test: Navigate to admin → View pending rewards → Test selection*
- [ ] **Step C.6**: Test Batch Processing *(User)*
  - *Test: Select multiple → Process batch → Verify status updates*
- [ ] **Step C.7**: Test Contract Integration *(User)*
  - *Test: Process rewards → Verify minting → Check blockchain transactions*
- [ ] **Step C.8**: Final End-to-End Test *(User)*
  - *Test: Complete workflow → User completes book → Admin processes → User receives tokens*
- [ ] **Step C.9**: Build Check *(Assistant)* - `npm run build` successful

---

## 🛠️ TECHNICAL IMPLEMENTATION

### Phase A: Database & Triggers

#### Step A.1: Enhanced Database Schema
```sql
-- Add reward tracking to reading_logs
ALTER TABLE public.reading_logs 
ADD COLUMN IF NOT EXISTS reward_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reward_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create pending_rewards table
CREATE TABLE IF NOT EXISTS public.pending_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  reading_log_id UUID REFERENCES public.reading_logs(id) ON DELETE SET NULL,
  wallet_address TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  book_title TEXT NOT NULL,
  book_pages INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  UNIQUE(user_id, book_id)
);

-- Indexes & RLS policies
CREATE INDEX IF NOT EXISTS idx_pending_rewards_user_status ON public.pending_rewards(user_id, status);
ALTER TABLE public.pending_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own pending rewards" ON public.pending_rewards FOR SELECT USING (auth.uid() = user_id);
```

#### Step A.2: Automatic Detection Triggers
```sql
-- Trigger function for automatic reward creation
CREATE OR REPLACE FUNCTION handle_book_completion()
RETURNS TRIGGER AS $$
DECLARE
  book_page_count INTEGER;
  book_title TEXT;
  user_wallet_address TEXT;
BEGIN
  -- Check if book is completed (100% or more)
  IF NEW.current_page >= (SELECT page_count FROM public.books WHERE id = NEW.book_id) 
     AND NOT COALESCE(NEW.reward_created, FALSE) THEN
    
    -- Get book and user details
    SELECT page_count, title INTO book_page_count, book_title FROM public.books WHERE id = NEW.book_id;
    SELECT wallet_address INTO user_wallet_address FROM public.user_profiles WHERE user_id = NEW.user_id;
    
    -- Update reading log
    UPDATE public.reading_logs 
    SET reward_amount = book_page_count, reward_created = TRUE, completed_at = NOW()
    WHERE id = NEW.id;
    
    -- Create pending reward if wallet is linked
    IF user_wallet_address IS NOT NULL THEN
      INSERT INTO public.pending_rewards (user_id, book_id, reading_log_id, wallet_address, reward_amount, book_title, book_pages, completed_at)
      VALUES (NEW.user_id, NEW.book_id, NEW.id, user_wallet_address, book_page_count, book_title, book_page_count, NOW())
      ON CONFLICT (user_id, book_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER auto_book_completion_trigger
  AFTER INSERT OR UPDATE ON public.reading_logs
  FOR EACH ROW EXECUTE FUNCTION handle_book_completion();
```

#### Step A.4: LogProgressDialog Integration
```typescript
// Enhanced completion detection in LogProgressDialog.tsx
const [showCompletionCelebration, setShowCompletionCelebration] = useState(false)
const [completionReward, setCompletionReward] = useState<number>(0)

// In onSubmit function, after updating reading progress:
if (values.currentPage >= book.page_count) {
  setCompletionReward(book.page_count || 0);
  setShowCompletionCelebration(true);
  
  await supabase.from("books")
    .update({ status: 'read', finished_at: new Date().toISOString() })
    .eq("id", book.id);
}

// Add celebration modal JSX (detailed implementation in full plan)
```

### Phase B: User Experience

#### Step B.2: Pending Rewards Component
```typescript
// Real-time pending rewards with celebration
export const PendingRewards: React.FC<{userId: string}> = ({ userId }) => {
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([])
  
  useEffect(() => {
    // Real-time subscription to pending_rewards table
    const subscription = supabase
      .channel('pending_rewards_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_rewards', filter: `user_id=eq.${userId}` }, 
        (payload) => {
          fetchPendingRewards()
          if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
            toast({ title: "🎉 Reward Processed!", description: `${payload.new.reward_amount} AURA sent to wallet!` })
          }
        })
      .subscribe()
    
    return () => subscription.unsubscribe()
  }, [userId])
  
  // Implementation details...
}
```

### Phase C: Admin Processing

#### Step C.1: Admin Dashboard
```typescript
// Batch processing with AuraCoin contract integration
export const AdminRewards: React.FC = () => {
  const processSelectedRewards = async () => {
    for (const rewardId of selectedRewards) {
      const reward = pendingRewards.find(r => r.id === rewardId)
      
      // Update to processing
      await supabase.from('pending_rewards').update({ status: 'processing' }).eq('id', rewardId)
      
      // Mint tokens using AuraCoin contract
      const txHash = await mintTokens(reward.wallet_address, reward.reward_amount, walletAddress, signTransactionWithWallet)
      
      // Update to completed
      await supabase.from('pending_rewards').update({ 
        status: 'completed', processed_at: new Date().toISOString(), transaction_hash: txHash 
      }).eq('id', rewardId)
    }
  }
  
  // Implementation details...
}
```

---

## ✅ APPROVAL REQUIREMENTS
- Each phase must be tested and approved before proceeding
- Build checks must pass at each step
- All user testing steps must be completed
- No "COMPLETED" marking without explicit user approval

---

*Ready to begin Phase A implementation upon your approval.* 