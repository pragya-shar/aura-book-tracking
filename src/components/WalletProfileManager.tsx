import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useFreighter } from '@/contexts/FreighterContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  user_id: string
  wallet_address: string | null
  wallet_network: string
  created_at: string
  updated_at: string
}

export const WalletProfileManager: React.FC = () => {
  const { user } = useAuth()
  const { isConnected, address, connectWallet } = useFreighter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [manualWalletAddress, setManualWalletAddress] = useState('')

  // Load user profile
  const loadProfile = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error in loadProfile:', error)
    }
  }

  // Create user profile
  const createProfile = async (walletAddress?: string) => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          wallet_address: walletAddress || null,
          wallet_network: 'TESTNET'
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      setProfile(data)
      toast({
        title: "✅ Profile Created",
        description: "User profile created successfully",
      })
    } catch (error) {
      console.error('Error creating profile:', error)
      toast({
        title: "❌ Profile Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Link wallet to existing profile
  const linkWallet = async (walletAddress: string) => {
    if (!user || !profile) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          wallet_address: walletAddress,
          wallet_network: 'TESTNET',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      setProfile(data)
      toast({
        title: "✅ Wallet Linked",
        description: `Wallet ${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)} linked successfully`,
      })
    } catch (error) {
      console.error('Error linking wallet:', error)
      toast({
        title: "❌ Wallet Linking Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle connect and link wallet
  const handleConnectAndLinkWallet = async () => {
    try {
      await connectWallet()
      // Wait a moment for wallet connection
      setTimeout(async () => {
        if (address) {
          if (profile) {
            await linkWallet(address)
          } else {
            await createProfile(address)
          }
        }
      }, 1000)
    } catch (error) {
      toast({
        title: "❌ Wallet Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    }
  }

  // Handle manual wallet address linking
  const handleManualWalletLink = async () => {
    if (!manualWalletAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address",
        variant: "destructive"
      })
      return
    }

    if (profile) {
      await linkWallet(manualWalletAddress.trim())
    } else {
      await createProfile(manualWalletAddress.trim())
    }
    setManualWalletAddress('')
  }

  useEffect(() => {
    loadProfile()
  }, [user])

  useEffect(() => {
    // Auto-link if wallet is already connected
    if (isConnected && address && profile && !profile.wallet_address) {
      linkWallet(address)
    }
  }, [isConnected, address, profile])

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔗 Wallet Profile Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-stone-400">Please log in to manage your wallet profile.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔗 Wallet Profile Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Status */}
        <div className="space-y-2">
          <h4 className="font-medium">Profile Status:</h4>
          <div className="flex gap-2">
            <Badge variant={profile ? "default" : "destructive"}>
              {profile ? "✅ Profile Exists" : "❌ No Profile"}
            </Badge>
            <Badge variant={profile?.wallet_address ? "default" : "destructive"}>
              {profile?.wallet_address ? "✅ Wallet Linked" : "❌ No Wallet"}
            </Badge>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "✅ Wallet Connected" : "⚪ Wallet Disconnected"}
            </Badge>
          </div>
        </div>

        {/* Profile Info */}
        {profile && (
          <div className="space-y-2">
            <h4 className="font-medium">Current Profile:</h4>
            <div className="bg-stone-50 p-3 rounded text-sm">
              <p><strong>User ID:</strong> {profile.user_id}</p>
              <p><strong>Wallet:</strong> {profile.wallet_address || 'Not linked'}</p>
              <p><strong>Network:</strong> {profile.wallet_network}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!profile && (
            <Button 
              onClick={() => createProfile()} 
              disabled={loading}
              className="w-full"
            >
              Create Profile
            </Button>
          )}

          {profile && !profile.wallet_address && (
            <>
              <Button 
                onClick={handleConnectAndLinkWallet} 
                disabled={loading}
                className="w-full"
              >
                {isConnected ? 'Link Connected Wallet' : 'Connect & Link Wallet'}
              </Button>

              <div className="flex gap-2">
                <Input
                  placeholder="Or enter wallet address manually..."
                  value={manualWalletAddress}
                  onChange={(e) => setManualWalletAddress(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleManualWalletLink}
                  disabled={loading || !manualWalletAddress.trim()}
                  variant="outline"
                >
                  Link
                </Button>
              </div>
            </>
          )}

          {profile?.wallet_address && (
            <div className="text-center text-green-600 font-medium">
              ✅ Wallet successfully linked! You can now earn AuraCoin rewards.
            </div>
          )}
        </div>

        {/* Connected Wallet Info */}
        {isConnected && address && (
          <div className="space-y-2">
            <h4 className="font-medium">Connected Wallet:</h4>
            <div className="bg-blue-50 p-3 rounded text-sm">
              <p><strong>Address:</strong> {address}</p>
              <p><strong>Status:</strong> Connected</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 