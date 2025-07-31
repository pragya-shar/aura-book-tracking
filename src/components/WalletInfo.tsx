import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useFreighter } from '@/contexts/FreighterContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Link,
  Loader2
} from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  wallet_address: string | null;
  wallet_network: string;
  created_at: string;
  updated_at: string;
}

export const WalletInfo = () => {
  const { user } = useAuth();
  const { 
    isWalletConnected, 
    isWalletAllowed, 
    walletAddress, 
    network, 
    networkDetails,
    isWalletLinked,
    connectWallet, 
    disconnectWallet,
    loading,
    error
  } = useFreighter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [manualWalletAddress, setManualWalletAddress] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const openExplorer = () => {
    if (walletAddress) {
      const explorerUrl = network === 'TESTNET' 
        ? `https://stellar.expert/explorer/testnet/account/${walletAddress}`
        : `https://stellar.expert/explorer/testnet/account/${walletAddress}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing wallet connection...');
      console.log('Connected:', isWalletConnected);
      console.log('Allowed:', isWalletAllowed);
      console.log('Address:', walletAddress);
      console.log('Network:', network);
      console.log('Network Details:', networkDetails);
      
      toast({
        title: "Connection Test",
        description: "Check console for detailed connection information",
      });
    } catch (err) {
      console.error('Connection test error:', err);
      toast({
        title: "Test Failed",
        description: "Error testing connection",
        variant: "destructive",
      });
    }
  };

  // Load user profile
  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in loadProfile:', error);
    }
  };

  // Create user profile
  const createProfile = async (walletAddr?: string) => {
    if (!user) return;

    setLinkingLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          wallet_address: walletAddr || null,
          wallet_network: 'TESTNET'
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setProfile(data);
      toast({
        title: "✅ Profile Created",
        description: "User profile created successfully",
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "❌ Profile Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLinkingLoading(false);
    }
  };

  // Link wallet to existing profile
  const linkWallet = async (walletAddr: string) => {
    if (!user || !profile) return;

    setLinkingLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          wallet_address: walletAddr,
          wallet_network: 'TESTNET',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setProfile(data);
      toast({
        title: "✅ Wallet Linked",
        description: `Wallet ${walletAddr.slice(0, 8)}...${walletAddr.slice(-4)} linked successfully`,
      });
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast({
        title: "❌ Wallet Linking Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLinkingLoading(false);
    }
  };

  // Handle link current wallet
  const handleLinkCurrentWallet = async () => {
    if (!walletAddress) return;
    
    if (profile) {
      await linkWallet(walletAddress);
    } else {
      await createProfile(walletAddress);
    }
  };

  // Handle manual wallet address linking
  const handleManualWalletLink = async () => {
    if (!manualWalletAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address",
        variant: "destructive"
      });
      return;
    }

    if (profile) {
      await linkWallet(manualWalletAddress.trim());
    } else {
      await createProfile(manualWalletAddress.trim());
    }
    setManualWalletAddress('');
  };

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [user]);

  // Auto-link if wallet is already connected and profile exists but not linked
  useEffect(() => {
    if (isWalletConnected && walletAddress && profile && !profile.wallet_address) {
      // Don't auto-link, let user choose when to link
    }
  }, [isWalletConnected, walletAddress, profile]);

  if (!isWalletConnected) {
    return (
      <Card className="relative group">
        {/* Minimal dark background - refined */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm border border-stone-600/10 rounded-lg" />
        
        <div className="relative">
          <CardHeader className="pb-4">
            <CardTitle className="text-amber-400 font-pixel tracking-[0.12em] flex items-center gap-3 text-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
              <Wallet className="w-6 h-6 text-amber-400" />
              Wallet Connection
            </CardTitle>
            <CardDescription className="text-stone-300 font-playfair tracking-wide">
              Connect your Freighter wallet to unlock AuraCoin rewards
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 pt-2">
            {/* Connect wallet button - minimal style */}
            <Button 
              onClick={connectWallet} 
              disabled={loading}
              className="w-full h-12 sm:h-14 text-base sm:text-lg bg-black/60 hover:bg-black/70 text-amber-400 border border-stone-600/20 hover:border-stone-500/30 hover:scale-[1.002] transform transition-all duration-300 ease-out tracking-wide"
              aria-label="Connect your Freighter wallet to enable AURA rewards"
            >
              
              <div className="flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span className="font-medium">Connect Wallet</span>
                  </>
                )}
              </div>
            </Button>
            
            {/* Benefits preview */}
            <div className="bg-black/20 border border-stone-600/15 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="text-sm font-medium text-stone-300 mb-3 tracking-wide">What you'll unlock:</div>
              <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-stone-400">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">Earn AuraCoin tokens for reading books</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">Track your reading rewards on Stellar blockchain</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">Secure wallet integration with Freighter</span>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-black/20 border border-red-600/15 rounded-lg">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium tracking-wide">{error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative group">
      {/* Minimal dark background - refined */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm border border-stone-600/8 rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/3 via-transparent to-amber-800/2 rounded-lg" />
      
      <div className="relative">
        <CardHeader className="pb-4">
          <CardTitle className="text-amber-400 font-pixel tracking-[0.12em] flex items-center gap-3 text-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
            <Wallet className="w-6 h-6 text-amber-400" />
            Wallet Connected
            <Badge className="ml-auto bg-black/40 border-stone-600/20 text-stone-300 hover:border-stone-500/30 transition-all duration-300 ease-out">
              {network}
            </Badge>
          </CardTitle>
          <CardDescription className="text-stone-300 font-playfair tracking-wide">
            Your wallet is securely connected and ready for AuraCoin rewards
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-2">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-black/20 border border-stone-600/15 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 tracking-wide">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            {isWalletLinked ? (
              <Badge variant="outline" className="text-amber-400 border-amber-400/40 hover:bg-black/20 transition-all duration-300 ease-out">
                <Link className="w-3 h-3 mr-1" />
                Linked
              </Badge>
            ) : (
              <Badge variant="outline" className="text-stone-400 border-stone-500/40">
                Not Linked
              </Badge>
            )}
          </div>
        </div>

          {/* Enhanced Wallet Linking Section - Show only if connected but not linked */}
          {!isWalletLinked && user && (
            <div className="relative p-5 bg-black/20 border border-stone-600/15 rounded-xl space-y-4">
              
              <div className="relative">
                <div className="flex items-center gap-3 text-amber-400 mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <div className="font-medium tracking-wide">Link Wallet to Earn Rewards</div>
                    <div className="text-xs text-stone-400 tracking-wide">Connect your wallet to start earning AuraCoin tokens</div>
                  </div>
                </div>
                
                <Button
                  onClick={handleLinkCurrentWallet}
                  disabled={linkingLoading}
                  className="w-full h-11 sm:h-12 text-base sm:text-lg bg-black/60 hover:bg-black/70 text-amber-400 border border-stone-600/20 hover:border-amber-400/30 hover:scale-[1.002] active:scale-[1.001] transform transition-all duration-300 ease-out touch-manipulation tracking-wide"
                  aria-label="Link your current Freighter wallet to earn AURA rewards"
                >
                  
                  <div className="relative flex items-center justify-center gap-2">
                    {linkingLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-medium">Linking...</span>
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4" />
                        <span className="font-medium">Link This Wallet</span>
                      </>
                    )}
                  </div>
                </Button>

                {/* Minimal divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-stone-600/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black/60 px-3 py-1 rounded-full text-stone-400 font-medium backdrop-blur-sm border border-stone-600/20 tracking-wider">
                      or link manually
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Enter wallet address..."
                    value={manualWalletAddress}
                    onChange={(e) => setManualWalletAddress(e.target.value)}
                    className="flex-1 bg-black/40 backdrop-blur-sm border-stone-600/20 text-stone-200 placeholder:text-stone-400/60 focus:ring-1 focus:ring-amber-400/30 focus:border-amber-400/30 h-10 sm:h-11 text-sm sm:text-base tracking-wide"
                    aria-label="Enter Stellar wallet address manually"
                  />
                  <Button
                    onClick={handleManualWalletLink}
                    disabled={linkingLoading || !manualWalletAddress.trim()}
                    variant="outline"
                    className="border-stone-600/30 text-amber-400 hover:bg-black/20 hover:border-amber-400/40 hover:scale-[1.002] active:scale-[1.001] transition-all duration-300 ease-out px-4 h-10 sm:h-11 sm:px-6 touch-manipulation tracking-wide"
                    aria-label="Link manually entered wallet address"
                  >
                    Link
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Address */}
          <div className="space-y-3">
            <Label className="text-sm text-stone-300 font-medium tracking-wide">Wallet Address</Label>
            <div className="relative">
              <div className="flex items-center gap-3 p-4 bg-black/20 border border-stone-600/15 rounded-xl hover:border-stone-500/25 transition-all duration-300 ease-out">
                <code className="text-sm text-amber-400 flex-1 font-mono tracking-wider select-all">
                  {walletAddress?.slice(0, 16)}...{walletAddress?.slice(-12)}
                </code>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(walletAddress || '')}
                    className="text-stone-400 hover:text-amber-400 hover:bg-black/20 h-8 w-8 rounded-lg transition-all duration-300 ease-out hover:scale-[1.002]"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openExplorer}
                    className="text-stone-400 hover:text-stone-300 hover:bg-black/20 h-8 w-8 rounded-lg transition-all duration-300 ease-out hover:scale-[1.002]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Address type indicator */}
              <div className="absolute -top-1 -right-1">
                <div className="bg-black/80 text-stone-300 text-xs px-2 py-0.5 rounded-full font-medium border border-stone-600/20 tracking-wider">
                  Stellar
                </div>
              </div>
            </div>
          </div>

          {/* Network Details */}
          {networkDetails && (
            <div className="space-y-3">
              <Label className="text-sm text-stone-300 font-medium tracking-wide">Network Details</Label>
              <div className="p-4 bg-black/20 border border-stone-600/15 rounded-xl">
                <div className="space-y-2 text-sm text-stone-300">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Network:</span>
                    <span className="text-amber-400 font-medium tracking-wide">{networkDetails.network}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Passphrase:</span>
                    <code className="text-amber-400 text-xs font-mono bg-black/20 px-2 py-1 rounded border border-stone-600/15 tracking-wider">
                      {networkDetails.networkPassphrase?.slice(0, 25)}...
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-black/20 border border-red-600/15 rounded-xl">
              <div className="flex items-center gap-3 text-red-400">
                <XCircle className="w-5 h-5" />
                <div>
                  <div className="font-medium text-red-400 tracking-wide">Connection Error</div>
                  <div className="text-sm text-red-400/80 tracking-wide">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={testConnection}
              variant="outline"
              size="sm"
              className="flex-1 h-11 sm:h-10 border-stone-600/20 text-stone-300 hover:bg-black/20 hover:border-amber-400/30 hover:text-amber-400 hover:scale-[1.001] transition-all duration-300 ease-out font-medium text-sm sm:text-base tracking-wide"
              aria-label="Test wallet connection status"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Test Connection</span>
              <span className="sm:hidden">Test</span>
            </Button>
            <Button
              onClick={disconnectWallet}
              variant="outline"
              size="sm"
              className="h-11 sm:h-10 px-6 border-stone-600/20 text-stone-400 hover:bg-black/20 hover:border-red-500/30 hover:text-red-400 hover:scale-[1.001] transition-all duration-300 ease-out font-medium text-sm sm:text-base tracking-wide"
              aria-label="Disconnect wallet from application"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

// Helper component for labels
const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
); 