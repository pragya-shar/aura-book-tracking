import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { WalletService } from '@/services/walletService';
import {
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  getNetworkDetails,
  signTransaction,
  signMessage,
  WatchWalletChanges
} from '@stellar/freighter-api';

interface FreighterContextType {
  isWalletConnected: boolean;
  isWalletAllowed: boolean;
  walletAddress: string | null;
  network: string | null;
  networkDetails: any | null;
  isWalletLinked: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  linkWalletToAccount: () => Promise<void>;
  unlinkWalletFromAccount: () => Promise<void>;
  signTransactionWithWallet: (xdr: string, network?: string) => Promise<string>;
  signMessageWithWallet: (message: string) => Promise<string>;
  loading: boolean;
  error: string | null;
}

const FreighterContext = createContext<FreighterContextType | undefined>(undefined);

export const FreighterProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletAllowed, setIsWalletAllowed] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [networkDetails, setNetworkDetails] = useState<any | null>(null);
  const [isWalletLinked, setIsWalletLinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Freighter is available and connected
  const checkWalletConnection = async () => {
    try {
      const connected = await isConnected();
      setIsWalletConnected(connected.isConnected);
      
      if (connected.isConnected) {
        const allowed = await isAllowed();
        setIsWalletAllowed(allowed.isAllowed);
        
        if (allowed.isAllowed) {
          const address = await getAddress();
          if (address.address) {
            setWalletAddress(address.address);
          }
          
          const networkInfo = await getNetwork();
          if (networkInfo.network) {
            setNetwork(networkInfo.network);
          }
          
          const details = await getNetworkDetails();
          if (details) {
            setNetworkDetails(details);
          }
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
      setError('Failed to check wallet connection');
    }
  };

  // Connect to Freighter wallet
  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Freighter is installed
      const connected = await isConnected();
      if (!connected.isConnected) {
        throw new Error('Freighter wallet is not installed. Please install it from https://www.freighter.app/');
      }

      // Request access to the wallet
      const allowed = await setAllowed();
      if (!allowed.isAllowed) {
        throw new Error('Access to Freighter wallet was denied');
      }

      setIsWalletAllowed(true);

      // Get wallet address
      const access = await requestAccess();
      if (access.error) {
        throw new Error(access.error);
      }

      setWalletAddress(access.address);

      // Get network information
      const networkInfo = await getNetwork();
      if (networkInfo.network) {
        setNetwork(networkInfo.network);
      }

      const details = await getNetworkDetails();
      if (details) {
        setNetworkDetails(details);
      }

      setIsWalletConnected(true);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setIsWalletAllowed(false);
    setWalletAddress(null);
    setNetwork(null);
    setNetworkDetails(null);
    setError(null);
  };

  // Sign transaction with wallet
  const signTransactionWithWallet = async (xdr: string, network?: string): Promise<string> => {
    if (!isWalletConnected || !walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await signTransaction(xdr, {
        networkPassphrase: network === 'TESTNET' ? 'Test SDF Network ; September 2015' : undefined,
        address: walletAddress
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return result.signedTxXdr;
    } catch (err) {
      console.error('Error signing transaction:', err);
      throw err;
    }
  };

  // Sign message with wallet
  const signMessageWithWallet = async (message: string): Promise<string> => {
    if (!isWalletConnected || !walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await signMessage(message, {
        address: walletAddress
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return result.signedMessage ? String(result.signedMessage) : '';
    } catch (err) {
      console.error('Error signing message:', err);
      throw err;
    }
  };

  // Link wallet to user account
  const linkWalletToAccount = async () => {
    if (!user) {
      setError('Please log in to link your wallet');
      return;
    }

    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await WalletService.linkWalletToUser(walletAddress, network || 'PUBLIC');
      
      if (result.success) {
        setIsWalletLinked(true);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error linking wallet to account:', err);
      setError('Failed to link wallet to account');
    } finally {
      setLoading(false);
    }
  };

  // Unlink wallet from user account
  const unlinkWalletFromAccount = async () => {
    if (!user) {
      setError('Please log in to unlink your wallet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await WalletService.unlinkWalletFromUser();
      
      if (result.success) {
        setIsWalletLinked(false);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error unlinking wallet from account:', err);
      setError('Failed to unlink wallet from account');
    } finally {
      setLoading(false);
    }
  };

  // Watch for wallet changes
  useEffect(() => {
    if (isWalletConnected) {
      const watcher = new WatchWalletChanges(3000);
      
      watcher.watch((results) => {
        setWalletAddress(results.address);
        setNetwork(results.network);
      });

      return () => {
        watcher.stop();
      };
    }
  }, [isWalletConnected]);

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Check if wallet is linked to user account
  useEffect(() => {
    const checkWalletLinkStatus = async () => {
      if (user && walletAddress) {
        const { data: profile } = await WalletService.getUserWalletProfile();
        setIsWalletLinked(profile?.wallet_address === walletAddress);
      } else {
        setIsWalletLinked(false);
      }
    };

    checkWalletLinkStatus();
  }, [user, walletAddress]);

  const value = {
    isWalletConnected,
    isWalletAllowed,
    walletAddress,
    network,
    networkDetails,
    isWalletLinked,
    connectWallet,
    disconnectWallet,
    linkWalletToAccount,
    unlinkWalletFromAccount,
    signTransactionWithWallet,
    signMessageWithWallet,
    loading,
    error
  };

  return (
    <FreighterContext.Provider value={value}>
      {children}
    </FreighterContext.Provider>
  );
};

export const useFreighter = () => {
  const context = useContext(FreighterContext);
  if (context === undefined) {
    throw new Error('useFreighter must be used within a FreighterProvider');
  }
  return context;
}; 