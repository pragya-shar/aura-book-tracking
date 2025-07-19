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
    <Card className="bg-black/60 backdrop-blur-md border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-200 flex items-center gap-2">
          <User className="w-5 h-5" />
          User Information
        </CardTitle>
        <CardDescription className="text-stone-300">
          Current authentication and wallet status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {/* Email Authentication */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">Email Auth:</span>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                    <User className="w-3 h-3 mr-1" />
                    Logged In
                  </Badge>
                  <span className="text-sm text-stone-300">{user.email}</span>
                </>
              ) : (
                <Badge className="bg-red-500/20 text-red-200 border-red-500/30">
                  Not Logged In
                </Badge>
              )}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">Wallet:</span>
            <div className="flex items-center gap-2">
              {walletAddress ? (
                <>
                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                    <Wallet className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                  <span className="text-sm text-stone-300 font-mono">
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                  </span>
                </>
              ) : (
                <Badge className="bg-red-500/20 text-red-200 border-red-500/30">
                  Not Connected
                </Badge>
              )}
            </div>
          </div>

          {/* Wallet Linking */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">Wallet Link:</span>
            <div className="flex items-center gap-2">
              {isWalletLinked ? (
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                  <Link className="w-3 h-3 mr-1" />
                  Linked
                </Badge>
              ) : (
                <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
                  <Unlink className="w-3 h-3 mr-1" />
                  Not Linked
                </Badge>
              )}
            </div>
          </div>

          {/* Active User ID */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">Active User ID:</span>
            <span className="text-sm text-stone-300 font-mono">
              {walletUser.userId || 'None'}
            </span>
          </div>

          {/* Authentication Method */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">Auth Method:</span>
            <div className="flex items-center gap-2">
              {walletUser.isWalletAuthenticated ? (
                <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                  Wallet
                </Badge>
              ) : user ? (
                <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                  Email
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-200 border-red-500/30">
                  None
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-stone-800/50 rounded-md">
          <p className="text-sm text-stone-300">
            <strong>Summary:</strong> You are currently accessing data for user ID{' '}
            <code className="bg-stone-700 px-1 rounded">{walletUser.userId || 'None'}</code>
            {walletUser.isWalletAuthenticated && (
              <span className="text-purple-300"> via wallet authentication</span>
            )}
            {user && !walletUser.isWalletAuthenticated && (
              <span className="text-green-300"> via email authentication</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 