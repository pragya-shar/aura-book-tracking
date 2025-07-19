import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFreighter } from '@/contexts/FreighterContext';
import { WalletService } from '@/services/walletService';

export interface WalletUserInfo {
  userId: string | null;
  email: string | null;
  walletAddress: string | null;
  isLinked: boolean;
  isWalletAuthenticated: boolean;
}

export const useWalletUser = () => {
  const { user } = useAuth();
  const { walletAddress, isWalletLinked } = useFreighter();
  const [walletUserInfo, setWalletUserInfo] = useState<WalletUserInfo>({
    userId: null,
    email: null,
    walletAddress: null,
    isLinked: false,
    isWalletAuthenticated: false,
  });

  useEffect(() => {
    const determineUserInfo = async () => {
      // If user is logged in via email, use their info
      if (user) {
        setWalletUserInfo({
          userId: user.id,
          email: user.email,
          walletAddress: walletAddress,
          isLinked: isWalletLinked,
          isWalletAuthenticated: false,
        });
        return;
      }

      // If no email user but wallet is connected, check if it's linked
      if (walletAddress && !user) {
        try {
          const { data: profile } = await WalletService.getUserByWalletAddress(walletAddress);
          
          if (profile && profile.user_id) {
            setWalletUserInfo({
              userId: profile.user_id,
              email: null, // We don't have the email without admin access
              walletAddress: walletAddress,
              isLinked: true,
              isWalletAuthenticated: true,
            });
          } else {
            setWalletUserInfo({
              userId: null,
              email: null,
              walletAddress: walletAddress,
              isLinked: false,
              isWalletAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('Error checking wallet user:', error);
          setWalletUserInfo({
            userId: null,
            email: null,
            walletAddress: walletAddress,
            isLinked: false,
            isWalletAuthenticated: false,
          });
        }
      } else {
        // No user and no wallet
        setWalletUserInfo({
          userId: null,
          email: null,
          walletAddress: null,
          isLinked: false,
          isWalletAuthenticated: false,
        });
      }
    };

    determineUserInfo();
  }, [user, walletAddress, isWalletLinked]);

  return walletUserInfo;
}; 