import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFreighter } from '@/contexts/FreighterContext';
import { Wallet, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FreighterWalletButtonProps {
  onSuccess?: (address: string) => void;
  className?: string;
}

export const FreighterWalletButton = ({ onSuccess, className }: FreighterWalletButtonProps) => {
  const { 
    isWalletConnected, 
    walletAddress, 
    connectWallet, 
    disconnectWallet, 
    loading, 
    error 
  } = useFreighter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      if (walletAddress) {
        toast({
          title: "Wallet Connected!",
          description: `Connected to address: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`,
        });
        onSuccess?.(walletAddress);
      }
    } catch (err) {
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  if (isWalletConnected && walletAddress) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          className="bg-green-500/10 border-green-500/30 text-green-200 hover:bg-green-500/20 hover:border-green-500/50"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
        </Button>
        <p className="text-xs text-green-300/70 text-center">
          Click to disconnect wallet
        </p>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading || isConnecting}
      className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 ${className}`}
    >
      {loading || isConnecting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4 mr-2" />
      )}
      {loading || isConnecting ? 'Connecting...' : 'Connect Freighter Wallet'}
    </Button>
  );
}; 