/**
 * Test Contract Connection
 * 
 * This script tests the connection to the AuraCoin contract
 * and helps identify working contract IDs on Stellar testnet.
 */

import { 
  Horizon, 
  Networks,
  rpc as StellarRpc,
  xdr
} from '@stellar/stellar-sdk';

// Test different contract IDs
const TEST_CONTRACT_IDS = [
  'CCJ53OFOFCS7XDVBWIJNXUBG7PIAASHBXPGCRJTYFRY3546X6F7Q3V2T', // Your real AURA contract
  'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4', // Test contract
  'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC5', // Another test
];

// Initialize servers
  const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');
  const sorobanServer = new StellarRpc.Server('https://soroban-testnet.stellar.org');

export const testContractIds = async () => {
  console.log('🔍 Testing contract IDs on Stellar testnet...');
  
  for (const contractId of TEST_CONTRACT_IDS) {
    try {
      console.log(`\n📋 Testing contract: ${contractId}`);
      
      // Try to get contract data - using a simple key for testing
      const testKey = xdr.ScVal.scvString('test');
      const contractData = await sorobanServer.getContractData(contractId, testKey);
      console.log(`✅ Contract exists: ${contractId}`);
      console.log(`📊 Contract data:`, contractData);
      
      return contractId; // Return the first working contract
    } catch (error) {
      console.log(`❌ Contract not found: ${contractId}`);
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log('\n❌ No working contracts found');
  return null;
};

export const getNetworkInfo = async () => {
  try {
    console.log('🌐 Getting network information...');
    
    // Test Horizon connection
    const horizonInfo = await horizonServer.loadAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
    console.log('✅ Horizon connection working');
    
    // Test Soroban RPC connection
    const sorobanInfo = await sorobanServer.getLatestLedger();
    console.log('✅ Soroban RPC connection working');
    console.log(`📊 Latest ledger: ${sorobanInfo.sequence}`);
    
    return true;
  } catch (error) {
    console.error('❌ Network connection failed:', error);
    return false;
  }
};

// Run tests
export const runConnectionTests = async () => {
  console.log('🧪 Running connection tests...\n');
  
  // Test network connections
  const networkOk = await getNetworkInfo();
  if (!networkOk) {
    console.log('❌ Network tests failed');
    return;
  }
  
  // Test contract IDs
  const workingContract = await testContractIds();
  if (workingContract) {
    console.log(`\n🎉 Found working contract: ${workingContract}`);
    return workingContract;
  } else {
    console.log('\n⚠️  No working contracts found. You may need to deploy a new contract.');
  }
}; 