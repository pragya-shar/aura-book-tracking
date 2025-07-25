import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface WalletLinkResult {
  success: boolean;
  message: string;
  profile?: any;
}

export class WalletService {
  /**
   * Link a wallet address to the current user's account
   */
  static async linkWalletToUser(
    walletAddress: string, 
    network: string = 'PUBLIC'
  ): Promise<WalletLinkResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          message: 'User not authenticated'
        };
      }

      // Clean the wallet address to remove any suffix like ":1"
      const cleanAddress = walletAddress.split(':')[0];

      // Check if wallet is already linked to another account
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', cleanAddress)
        .single();

      if (existingProfile && existingProfile.user_id !== user.id) {
        return {
          success: false,
          message: 'This wallet is already linked to another account'
        };
      }

      // Update the user's profile with wallet information
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          wallet_address: cleanAddress,
          wallet_network: network,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error linking wallet to user:', updateError);
        return {
          success: false,
          message: 'Failed to link wallet to account'
        };
      }

      return {
        success: true,
        message: 'Wallet successfully linked to account'
      };
    } catch (error) {
      console.error('Error linking wallet to user:', error);
      return {
        success: false,
        message: 'Failed to link wallet to account'
      };
    }
  }

  /**
   * Unlink wallet from the current user's account
   */
  static async unlinkWalletFromUser(): Promise<WalletLinkResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          message: 'User not authenticated'
        };
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          wallet_address: null,
          wallet_network: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        return {
          success: false,
          message: 'Failed to unlink wallet from account'
        };
      }

      return {
        success: true,
        message: 'Wallet successfully unlinked from your account'
      };
    } catch (error) {
      console.error('Error unlinking wallet:', error);
      return {
        success: false,
        message: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get the current user's wallet profile
   */
  static async getUserWalletProfile() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return { data: profile, error };
    } catch (error) {
      console.error('Error getting user wallet profile:', error);
      return { data: null, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Check if a wallet address is already linked to any account
   */
  static async isWalletLinked(walletAddress: string): Promise<boolean> {
    try {
      // Clean the wallet address to remove any suffix like ":1"
      const cleanAddress = walletAddress.split(':')[0];
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('wallet_address', cleanAddress)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking wallet link status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking wallet link status:', error);
      return false;
    }
  }

  /**
   * Get user profile by wallet address
   */
  static async getUserByWalletAddress(walletAddress: string) {
    try {
      // Clean the wallet address to remove any suffix like ":1"
      const cleanAddress = walletAddress.split(':')[0];
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', cleanAddress)
        .single();

      if (error) {
        // Handle specific error cases
        if (error.code === 'PGRST116') {
          // No rows returned - this is expected for unlinked wallets
          return { data: null, error: null };
        }
        
        console.error('Error getting user by wallet address:', error);
        return { data: null, error };
      }

      return { data: profile, error: null };
    } catch (error) {
      console.error('Error getting user by wallet address:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if wallet can be used for login (i.e., is linked to an account)
   */
  static async canWalletLogin(walletAddress: string): Promise<{
    canLogin: boolean;
    message: string;
    profile?: any;
  }> {
    try {
      const { data: profile, error } = await this.getUserByWalletAddress(walletAddress);
      
      if (error || !profile) {
        return {
          canLogin: false,
          message: 'Wallet not linked to any account'
        };
      }

      if (!profile.user_id) {
        return {
          canLogin: false,
          message: 'Wallet profile incomplete'
        };
      }

      return {
        canLogin: true,
        message: 'Wallet is linked to an account',
        profile
      };
    } catch (error) {
      console.error('Error checking wallet login capability:', error);
      return {
        canLogin: false,
        message: 'Error checking wallet status'
      };
    }
  }
} 