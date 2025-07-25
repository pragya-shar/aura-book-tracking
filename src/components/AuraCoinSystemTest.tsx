import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { AuraCoinRewardService } from '@/services/auraCoinRewardService'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export const AuraCoinSystemTest: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const testSystem = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to test the system",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const results = await AuraCoinRewardService.testAuraCoinSystem(user.id)
      setTestResults(results)
      
      if (results.success) {
        toast({
          title: "✅ System Test Successful",
          description: `Found ${results.books_count} books, ${results.pending_rewards_count} pending rewards`,
        })
      } else {
        toast({
          title: "❌ System Test Failed",
          description: results.error || "Unknown error",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "❌ Test Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const testPendingRewards = async () => {
    if (!user) return

    setLoading(true)
    try {
      const pending = await AuraCoinRewardService.getUserPendingRewards(user.id)
      const completed = await AuraCoinRewardService.getUserCompletedRewards(user.id)
      
      toast({
        title: "📊 Reward Summary",
        description: `Pending: ${pending.total_amount} AURA, Completed: ${completed.total_amount} AURA`,
      })
    } catch (error) {
      console.error('Reward test error:', error)
      toast({
        title: "❌ Reward Test Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // NEW: Test Book Completion Detection Function
  const testBookCompletionDetection = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to test book completion detection",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Step 0: Ensure user profile exists and has wallet address
      let { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError || !userProfile) {
        // Create user profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            wallet_address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB' // Test wallet address
          })
          .select()
          .single()

        if (createError) {
          throw new Error(`Failed to create user profile: ${createError.message}`)
        }
        userProfile = newProfile
      }

      // Step 1: Create a test book
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({
          user_id: user.id,
          title: 'Test Book for Completion Detection',
          author: 'Test Author',
          page_count: 100,
          isbn: 'TEST1234567890',
          status: 'reading'
        })
        .select()
        .single()

      if (bookError) {
        throw new Error(`Failed to create test book: ${bookError.message}`)
      }

      // Step 2: Create a reading log that's NOT completed (50/100 pages)
      const { data: readingLog1, error: log1Error } = await supabase
        .from('reading_logs')
        .insert({
          user_id: user.id,
          book_id: book.id,
          current_page: 50,
          status: 'in_progress'
        })
        .select()
        .single()

      if (log1Error) {
        throw new Error(`Failed to create incomplete reading log: ${log1Error.message}`)
      }

      // Step 3: Test the function with incomplete book
      const incompleteResult = await AuraCoinRewardService.detectBookCompletion(readingLog1.id)
      
      // Step 4: Create a reading log that IS completed (100/100 pages)
      const { data: readingLog2, error: log2Error } = await supabase
        .from('reading_logs')
        .insert({
          user_id: user.id,
          book_id: book.id,
          current_page: 100,
          status: 'in_progress'
        })
        .select()
        .single()

      if (log2Error) {
        throw new Error(`Failed to create completed reading log: ${log2Error.message}`)
      }

      // Step 5: Test the function with completed book
      const completedResult = await AuraCoinRewardService.detectBookCompletion(readingLog2.id)

      // Step 6: Test again to ensure no duplicate reward
      const duplicateResult = await AuraCoinRewardService.detectBookCompletion(readingLog2.id)

      const testSummary = {
        user_profile: userProfile,
        book_created: book,
        incomplete_test: incompleteResult,
        completed_test: completedResult,
        duplicate_test: duplicateResult,
        success: true
      }

      setTestResults(testSummary)
      
      toast({
        title: "✅ Book Completion Detection Test Successful",
        description: `Incomplete: ${incompleteResult.reward_created ? '❌' : '✅'}, Completed: ${completedResult.reward_created ? '✅' : '❌'}, Duplicate: ${duplicateResult.reward_created ? '❌' : '✅'}`,
      })

    } catch (error) {
      console.error('Book completion detection test error:', error)
      toast({
        title: "❌ Book Completion Detection Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔧 AuraCoin System Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-stone-400">Please log in to test the AuraCoin system.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 AuraCoin System Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testSystem} 
            disabled={loading}
            variant="outline"
          >
            🧪 Test System
          </Button>
          
          <Button 
            onClick={testPendingRewards} 
            disabled={loading}
            variant="outline"
          >
            📊 Test Rewards
          </Button>

          <Button 
            onClick={testBookCompletionDetection} 
            disabled={loading}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            📚 Test Book Completion Detection
          </Button>
        </div>

        {testResults && (
          <div className="mt-4 p-4 bg-stone-50 rounded-lg">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 