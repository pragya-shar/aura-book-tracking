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
      {/* Premium glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-indigo-500/10 to-cyan-500/8 backdrop-blur-xl border border-blue-400/30 rounded-lg shadow-2xl shadow-blue-500/15" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 rounded-lg" />
      
      {/* Info glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-lg opacity-10 blur-sm group-hover:opacity-20 transition-opacity duration-500" />
      
      <div className="relative">
        <CardHeader className="pb-4">
          <CardTitle className="text-white/90 font-pixel tracking-wider flex items-center gap-3 text-lg">
            <div className="relative">
              <User className="w-6 h-6 text-blue-400 drop-shadow-lg" />
              <div className="absolute inset-0 bg-blue-400/30 blur-md rounded-full" />
            </div>
            User Information
          </CardTitle>
          <CardDescription className="text-stone-300/80 font-playfair">
            Your authentication status and user data overview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          {/* Enhanced Status Cards */}
          <div className="space-y-4">
            {/* Email Authentication Card */}
            <div className="p-4 bg-gradient-to-r from-green-500/5 via-emerald-500/8 to-green-500/5 border border-green-400/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <User className="w-5 h-5 text-green-400 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-green-400/30 blur-md rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-stone-300/90">Email Authentication</span>
                </div>
                <div className="flex items-center gap-3">
                  {user ? (
                    <>
                      <Badge className="bg-gradient-to-r from-green-700/40 to-emerald-700/40 border-green-500/60 text-green-200 px-3 py-1 hover:scale-105 transition-transform duration-200">
                        <User className="w-3 h-3 mr-1.5" />
                        Logged In
                      </Badge>
                      <span className="text-xs text-stone-400 font-mono max-w-[120px] truncate">
                        {user.email}
                      </span>
                    </>
                  ) : (
                    <Badge className="bg-gradient-to-r from-red-700/40 to-orange-700/40 border-red-500/60 text-red-200 px-3 py-1">
                      Not Logged In
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Connection Card */}
            <div className="p-4 bg-gradient-to-r from-purple-500/5 via-violet-500/8 to-purple-500/5 border border-purple-400/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Wallet className="w-5 h-5 text-purple-400 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-purple-400/30 blur-md rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-stone-300/90">Wallet Connection</span>
                </div>
                <div className="flex items-center gap-3">
                  {walletAddress ? (
                    <>
                      <Badge className="bg-gradient-to-r from-purple-700/40 to-violet-700/40 border-purple-500/60 text-purple-200 px-3 py-1 hover:scale-105 transition-transform duration-200">
                        <Wallet className="w-3 h-3 mr-1.5" />
                        Connected
                      </Badge>
                      <span className="text-xs text-stone-400 font-mono">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
                      </span>
                    </>
                  ) : (
                    <Badge className="bg-gradient-to-r from-red-700/40 to-orange-700/40 border-red-500/60 text-red-200 px-3 py-1">
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Linking Card */}
            <div className="p-4 bg-gradient-to-r from-blue-500/5 via-cyan-500/8 to-blue-500/5 border border-blue-400/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {isWalletLinked ? (
                      <Link className="w-5 h-5 text-blue-400 drop-shadow-lg" />
                    ) : (
                      <Unlink className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
                    )}
                    <div className={`absolute inset-0 ${isWalletLinked ? 'bg-blue-400/30' : 'bg-yellow-400/30'} blur-md rounded-full`} />
                  </div>
                  <span className="text-sm font-medium text-stone-300/90">Wallet Linking</span>
                </div>
                <div className="flex items-center gap-2">
                  {isWalletLinked ? (
                    <Badge className="bg-gradient-to-r from-blue-700/40 to-cyan-700/40 border-blue-500/60 text-blue-200 px-3 py-1 hover:scale-105 transition-transform duration-200">
                      <Link className="w-3 h-3 mr-1.5" />
                      Linked
                    </Badge>
                  ) : (
                    <Badge className="bg-gradient-to-r from-yellow-700/40 to-amber-700/40 border-yellow-500/60 text-yellow-200 px-3 py-1 animate-pulse">
                      <Unlink className="w-3 h-3 mr-1.5" />
                      Not Linked
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Authentication Method Card */}
            <div className="p-4 bg-gradient-to-r from-indigo-500/5 via-blue-500/8 to-indigo-500/5 border border-indigo-400/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <User className="w-5 h-5 text-indigo-400 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-indigo-400/30 blur-md rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-stone-300/90">Active Authentication</span>
                </div>
                <div className="flex items-center gap-3">
                  {walletUser.isWalletAuthenticated ? (
                    <Badge className="bg-gradient-to-r from-purple-700/40 to-violet-700/40 border-purple-500/60 text-purple-200 px-3 py-1 hover:scale-105 transition-transform duration-200">
                      <Wallet className="w-3 h-3 mr-1.5" />
                      Wallet
                    </Badge>
                  ) : user ? (
                    <Badge className="bg-gradient-to-r from-green-700/40 to-emerald-700/40 border-green-500/60 text-green-200 px-3 py-1 hover:scale-105 transition-transform duration-200">
                      <User className="w-3 h-3 mr-1.5" />
                      Email
                    </Badge>
                  ) : (
                    <Badge className="bg-gradient-to-r from-red-700/40 to-orange-700/40 border-red-500/60 text-red-200 px-3 py-1">
                      None
                    </Badge>
                  )}
                  <span className="text-xs text-stone-400 font-mono">
                    ID: {walletUser.userId?.slice(0, 8) || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Summary */}
          <div className="relative p-5 bg-gradient-to-br from-slate-700/20 via-stone-800/30 to-slate-700/20 border border-stone-600/30 rounded-xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-stone-600/10 via-slate-500/5 to-stone-600/10 rounded-xl blur-sm opacity-50" />
            
            <div className="relative">
              <div className="text-sm font-medium text-stone-200 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Current Session Summary
              </div>
              
              <div className="text-sm text-stone-300/90 leading-relaxed">
                You are accessing data for user{' '}
                <code className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 px-2 py-0.5 rounded font-mono text-blue-200 text-xs">
                  {walletUser.userId?.slice(0, 12) || 'None'}...
                </code>
                
                {walletUser.isWalletAuthenticated && (
                  <span className="inline-block ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-400/30 rounded-full text-purple-300 text-xs font-medium">
                    via Stellar wallet
                  </span>
                )}
                
                {user && !walletUser.isWalletAuthenticated && (
                  <span className="inline-block ml-2 px-2 py-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-full text-green-300 text-xs font-medium">
                    via email auth
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}; 