import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useFreighter } from '@/contexts/FreighterContext';
import { useWalletUser } from '@/hooks/useWalletUser';
import { User, Wallet, Link, Unlink } from 'lucide-react';

export const UserInfo = () => {
  const { user } = useAuth();
  const { walletAddress, isWalletLinked } = useFreighter();
  const walletUser = useWalletUser();

  return (
    <Card className="relative group">
      {/* Minimal dark background - refined */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm border border-stone-600/10 rounded-lg" />
      
      <div className="relative">
        <CardHeader className="pb-4">
          <CardTitle className="text-amber-400 font-pixel tracking-[0.12em] flex items-center gap-3 text-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
            <User className="w-6 h-6 text-amber-400" />
            User Information
          </CardTitle>
          <CardDescription className="text-stone-300 font-playfair tracking-wide">
            Your authentication status and user data overview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          {/* Enhanced Status Cards */}
          <div className="space-y-4">
            {/* Email Authentication Card */}
            <div className="p-4 bg-black/20 border border-stone-600/15 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-medium text-stone-300 tracking-wide">Email Authentication</span>
                </div>
                <div className="flex items-center gap-3">
                  {user ? (
                    <>
                      <Badge className="bg-black/40 border-amber-400/30 text-amber-400 px-3 py-1 transition-all duration-300 ease-out">
                        <User className="w-3 h-3 mr-1.5" />
                        Logged In
                      </Badge>
                      <span className="text-xs text-stone-400 font-mono max-w-[120px] truncate tracking-wider">
                        {user.email}
                      </span>
                    </>
                  ) : (
                    <Badge className="bg-black/40 border-red-500/20 text-red-400 px-3 py-1">
                      Not Logged In
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Connection Card */}
            <div className="p-4 bg-black/20 border border-stone-600/15 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-medium text-stone-300 tracking-wide">Wallet Connection</span>
                </div>
                <div className="flex items-center gap-3">
                  {walletAddress ? (
                    <>
                      <Badge className="bg-black/40 border-amber-400/30 text-amber-400 px-3 py-1 transition-all duration-300 ease-out">
                        <Wallet className="w-3 h-3 mr-1.5" />
                        Connected
                      </Badge>
                      <span className="text-xs text-stone-400 font-mono tracking-wider">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
                      </span>
                    </>
                  ) : (
                    <Badge className="bg-black/40 border-red-500/20 text-red-400 px-3 py-1">
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Linking Card */}
            <div className="p-4 bg-black/20 border border-stone-600/15 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isWalletLinked ? (
                    <Link className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Unlink className="w-5 h-5 text-stone-400" />
                  )}
                  <span className="text-sm font-medium text-stone-300 tracking-wide">Wallet Linking</span>
                </div>
                <div className="flex items-center gap-2">
                  {isWalletLinked ? (
                    <Badge className="bg-black/40 border-amber-400/30 text-amber-400 px-3 py-1 transition-all duration-300 ease-out">
                      <Link className="w-3 h-3 mr-1.5" />
                      Linked
                    </Badge>
                  ) : (
                    <Badge className="bg-black/40 border-stone-600/20 text-stone-400 px-3 py-1">
                      <Unlink className="w-3 h-3 mr-1.5" />
                      Not Linked
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Authentication Method Card */}
            <div className="p-4 bg-black/20 border border-stone-600/15 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-stone-400" />
                  <span className="text-sm font-medium text-stone-300 tracking-wide">Active Authentication</span>
                </div>
                <div className="flex items-center gap-3">
                  {walletUser.isWalletAuthenticated ? (
                    <Badge className="bg-black/40 border-amber-400/30 text-amber-400 px-3 py-1 transition-all duration-300 ease-out">
                      <Wallet className="w-3 h-3 mr-1.5" />
                      Wallet
                    </Badge>
                  ) : user ? (
                    <Badge className="bg-black/40 border-amber-400/30 text-amber-400 px-3 py-1 transition-all duration-300 ease-out">
                      <User className="w-3 h-3 mr-1.5" />
                      Email
                    </Badge>
                  ) : (
                    <Badge className="bg-black/40 border-red-500/20 text-red-400 px-3 py-1">
                      None
                    </Badge>
                  )}
                  <span className="text-xs text-stone-400 font-mono tracking-wider">
                    ID: {walletUser.userId?.slice(0, 8) || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-5 bg-black/20 border border-stone-600/15 rounded-xl">
            <div className="text-sm font-medium text-stone-300 mb-2 flex items-center gap-2 tracking-wide">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              Current Session Summary
            </div>
            
            <div className="text-sm text-stone-400 leading-relaxed tracking-wide">
              You are accessing data for user{' '}
              <code className="bg-black/40 border border-stone-600/20 px-2 py-0.5 rounded font-mono text-amber-400 text-xs tracking-wider">
                {walletUser.userId?.slice(0, 12) || 'None'}...
              </code>
              
              {walletUser.isWalletAuthenticated && (
                <span className="inline-block ml-2 px-2 py-0.5 bg-black/40 border border-amber-400/30 rounded-full text-amber-400 text-xs font-medium tracking-wide">
                  via Stellar wallet
                </span>
              )}
              
              {user && !walletUser.isWalletAuthenticated && (
                <span className="inline-block ml-2 px-2 py-0.5 bg-black/40 border border-amber-400/30 rounded-full text-amber-400 text-xs font-medium tracking-wide">
                  via email auth
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}; 