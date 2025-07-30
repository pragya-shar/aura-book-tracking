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
        {/* Premium glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-purple-500/10 backdrop-blur-xl border border-purple-400/30 rounded-lg shadow-2xl shadow-purple-500/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 rounded-lg" />
        
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-lg opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-500" />
        
        <div className="relative">
          <CardHeader className="pb-4">
            <CardTitle className="text-white/90 font-pixel tracking-wider flex items-center gap-3 text-lg">
              <div className="relative">
                <Wallet className="w-6 h-6 text-purple-400 drop-shadow-lg" />
                <div className="absolute inset-0 bg-purple-400/30 blur-md rounded-full" />
              </div>
              Wallet Connection
            </CardTitle>
            <CardDescription className="text-stone-300/80 font-playfair">
              Connect your Freighter wallet to unlock AuraCoin rewards
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 pt-2">
            {/* Premium connection button with mobile optimization */}
            <Button 
              onClick={connectWallet} 
              disabled={loading}
              className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 hover:from-purple-500 hover:via-purple-600 hover:to-purple-500 active:from-purple-700 active:via-purple-800 active:to-purple-700 border-0 shadow-xl shadow-purple-500/30 hover:shadow-purple-400/40 hover:scale-[1.02] active:scale-[1.005] transform transition-all duration-300 relative overflow-hidden group/btn touch-manipulation"
              aria-label="Connect your Freighter wallet to enable AURA rewards"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              
              <div className="relative flex items-center justify-center gap-3">
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
            
            {/* Benefits preview with mobile optimization */}
            <div className="bg-purple-500/5 border border-purple-400/20 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="text-sm font-medium text-purple-200 mb-3">What you'll unlock:</div>
              <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-stone-300/80">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">Earn AuraCoin tokens for reading books</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">Track your reading rewards on Stellar blockchain</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">Secure wallet integration with Freighter</span>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 border border-red-400/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3 text-red-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
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
      {/* Premium glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 via-purple-500/10 to-blue-500/8 backdrop-blur-xl border border-green-400/30 rounded-lg shadow-2xl shadow-green-500/15" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 rounded-lg" />
      
      {/* Success glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-purple-500 to-blue-500 rounded-lg opacity-10 blur-sm group-hover:opacity-20 transition-opacity duration-500" />
      
      <div className="relative">
        <CardHeader className="pb-4">
          <CardTitle className="text-white/90 font-pixel tracking-wider flex items-center gap-3 text-lg">
            <div className="relative">
              <Wallet className="w-6 h-6 text-green-400 drop-shadow-lg" />
              <div className="absolute inset-0 bg-green-400/30 blur-md rounded-full" />
            </div>
            Wallet Connected
            <Badge className="ml-auto bg-gradient-to-r from-green-700/40 to-blue-700/40 border-green-500/50 text-green-200 hover:bg-green-600/40 transition-colors duration-300">
              {network}
            </Badge>
          </CardTitle>
          <CardDescription className="text-stone-300/80 font-playfair">
            Your wallet is securely connected and ready for AuraCoin rewards
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-2">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            {isWalletLinked ? (
              <Badge variant="outline" className="text-green-400 border-green-400">
                <Link className="w-3 h-3 mr-1" />
                Linked
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                Not Linked
              </Badge>
            )}
          </div>
        </div>

          {/* Enhanced Wallet Linking Section - Show only if connected but not linked */}
          {!isWalletLinked && user && (
            <div className="relative p-5 bg-gradient-to-br from-amber-500/10 via-yellow-500/8 to-orange-500/10 border border-amber-400/30 rounded-xl backdrop-blur-sm space-y-4">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 rounded-xl blur-sm opacity-50" />
              
              <div className="relative">
                <div className="flex items-center gap-3 text-amber-300 mb-4">
                  <div className="relative">
                    <AlertCircle className="w-5 h-5 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-amber-400/30 blur-md rounded-full" />
                  </div>
                  <div>
                    <div className="font-medium">Link Wallet to Earn Rewards</div>
                    <div className="text-xs text-amber-400/70">Connect your wallet to start earning AuraCoin tokens</div>
                  </div>
                </div>
                
                <Button
                  onClick={handleLinkCurrentWallet}
                  disabled={linkingLoading}
                  className="w-full h-11 sm:h-12 text-base sm:text-lg bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 active:from-amber-700 active:via-yellow-700 active:to-amber-700 border-0 shadow-xl shadow-amber-500/25 hover:shadow-amber-400/35 hover:scale-[1.02] active:scale-[1.005] transform transition-all duration-300 relative overflow-hidden group/btn touch-manipulation"
                  aria-label="Link your current Freighter wallet to earn AURA rewards"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  
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

                {/* Premium divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gradient-to-r from-amber-900/80 to-yellow-900/80 px-3 py-1 rounded-full text-amber-300/80 font-medium backdrop-blur-sm border border-amber-400/20">
                      or link manually
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Enter wallet address..."
                    value={manualWalletAddress}
                    onChange={(e) => setManualWalletAddress(e.target.value)}
                    className="flex-1 bg-black/40 backdrop-blur-sm border-amber-400/30 text-stone-200 placeholder:text-stone-400/60 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 h-10 sm:h-11 text-sm sm:text-base"
                    aria-label="Enter Stellar wallet address manually"
                  />
                  <Button
                    onClick={handleManualWalletLink}
                    disabled={linkingLoading || !manualWalletAddress.trim()}
                    variant="outline"
                    className="border-amber-400/40 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/60 hover:scale-105 active:scale-100 transition-all duration-200 px-4 h-10 sm:h-11 sm:px-6 touch-manipulation"
                    aria-label="Link manually entered wallet address"
                  >
                    Link
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Wallet Address */}
          <div className="space-y-3">
            <Label className="text-sm text-stone-300/90 font-medium">Wallet Address</Label>
            <div className="relative group/address">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-purple-500/10 border border-purple-400/30 rounded-xl backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300">
                <code className="text-sm text-purple-200 flex-1 font-mono tracking-wide select-all">
                  {walletAddress?.slice(0, 16)}...{walletAddress?.slice(-12)}
                </code>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(walletAddress || '')}
                    className="text-stone-300/80 hover:text-white hover:bg-purple-500/20 h-8 w-8 rounded-lg group/copy transition-all duration-200"
                  >
                    <Copy className="w-4 h-4 group-hover/copy:scale-110 transition-transform duration-200" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openExplorer}
                    className="text-stone-300/80 hover:text-white hover:bg-blue-500/20 h-8 w-8 rounded-lg group/explorer transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4 group-hover/explorer:scale-110 transition-transform duration-200" />
                  </Button>
                </div>
              </div>
              
              {/* Address type indicator */}
              <div className="absolute -top-1 -right-1">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg">
                  Stellar
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Network Details */}
          {networkDetails && (
            <div className="space-y-3">
              <Label className="text-sm text-stone-300/90 font-medium">Network Details</Label>
              <div className="p-4 bg-gradient-to-r from-blue-500/8 via-indigo-500/5 to-blue-500/8 border border-blue-400/30 rounded-xl backdrop-blur-sm">
                <div className="space-y-2 text-sm text-stone-300/90">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400/80">Network:</span>
                    <span className="text-blue-200 font-medium">{networkDetails.network}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400/80">Passphrase:</span>
                    <code className="text-blue-200 text-xs font-mono bg-blue-900/20 px-2 py-1 rounded">
                      {networkDetails.networkPassphrase?.slice(0, 25)}...
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Error Display */}
          {error && (
            <div className="relative p-4 bg-gradient-to-r from-red-500/15 via-red-500/10 to-orange-500/15 border border-red-400/40 rounded-xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-500/10 to-red-500/20 rounded-xl blur-sm opacity-50" />
              <div className="relative flex items-center gap-3 text-red-300">
                <div className="relative">
                  <XCircle className="w-5 h-5 drop-shadow-lg" />
                  <div className="absolute inset-0 bg-red-400/30 blur-md rounded-full" />
                </div>
                <div>
                  <div className="font-medium text-red-200">Connection Error</div>
                  <div className="text-sm text-red-300/80">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Actions with Mobile Optimization */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={testConnection}
              variant="outline"
              size="sm"
              className="flex-1 h-11 sm:h-10 border-purple-400/40 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/60 hover:scale-[1.02] active:scale-100 transition-all duration-200 font-medium touch-manipulation text-sm sm:text-base"
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
              className="h-11 sm:h-10 px-6 border-red-400/40 text-red-300 hover:bg-red-500/20 hover:border-red-400/60 hover:scale-[1.02] active:scale-100 transition-all duration-200 font-medium touch-manipulation text-sm sm:text-base"
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