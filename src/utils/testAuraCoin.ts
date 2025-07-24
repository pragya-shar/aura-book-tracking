/**
 * Test script for AuraCoin contract integration
 * This script tests the basic functionality of the AuraCoin contract
 */

import { 
  Keypair, 
  Networks, 
  BASE_FEE,
  TransactionBuilder
} from '@stellar/stellar-sdk';
import { 
  mintTokens, 
  transferTokens, 
  burnTokens, 
  getTokenInfo,
  AURACOIN_CONFIG 
} from './auraCoinUtils';

// Test configuration
const TEST_CONFIG = {
  // Use a test account - in production, this would be the user's wallet
  TEST_ACCOUNT_SECRET: 'SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4',
  TEST_RECIPIENT: 'GAIRISXKPLOWZBMFRPU5XRGUUX3VMA3ZEWKBM5MSNRU3CHV6P4PYZ74D'
};

// Mock sign transaction function for testing
const mockSignTransaction = async (xdr: string): Promise<string> => {
  console.log('🔐 Mock signing transaction...');
  // In a real implementation, this would use Freighter or another wallet
  const keypair = Keypair.fromSecret(TEST_CONFIG.TEST_ACCOUNT_SECRET);
  const transaction = TransactionBuilder.fromXDR(xdr, AURACOIN_CONFIG.NETWORK_PASSPHRASE);
  transaction.sign(keypair);
  return transaction.toXDR();
};

// Test functions
export const testAuraCoinIntegration = async () => {
  console.log('🧪 Starting AuraCoin integration tests...');
  console.log(`🌐 Network: ${AURACOIN_CONFIG.NETWORK}`);
  console.log(`📋 Contract ID: ${AURACOIN_CONFIG.CONTRACT_ID}`);
  
  try {
    // Test 1: Get token info
    console.log('\n📊 Test 1: Getting token info...');
    const tokenInfo = await getTokenInfo();
    console.log('✅ Token info:', tokenInfo);
    
    // Test 2: Mint tokens
    console.log('\n🪙 Test 2: Minting tokens...');
    const mintAmount = 100;
    await mintTokens(
      TEST_CONFIG.TEST_RECIPIENT,
      mintAmount,
      mockSignTransaction
    );
    console.log(`✅ Successfully minted ${mintAmount} AURA tokens`);
    
    // Test 3: Transfer tokens
    console.log('\n🔄 Test 3: Transferring tokens...');
    const transferAmount = 50;
    await transferTokens(
      TEST_CONFIG.TEST_RECIPIENT,
      TEST_CONFIG.TEST_ACCOUNT_SECRET,
      transferAmount,
      mockSignTransaction
    );
    console.log(`✅ Successfully transferred ${transferAmount} AURA tokens`);
    
    // Test 4: Burn tokens
    console.log('\n🔥 Test 4: Burning tokens...');
    const burnAmount = 25;
    await burnTokens(
      TEST_CONFIG.TEST_RECIPIENT,
      burnAmount,
      mockSignTransaction
    );
    console.log(`✅ Successfully burned ${burnAmount} AURA tokens`);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};

// Export for use in development
export default testAuraCoinIntegration; 