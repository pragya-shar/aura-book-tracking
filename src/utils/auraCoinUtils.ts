/**
 * AuraCoin Smart Contract Integration
 * 
 * This implementation provides proper Soroban smart contract integration
 * for the AuraCoin token contract on Stellar using the correct SDK approach.
 * 
 * Features:
 * - Real Soroban contract calls for minting, transferring, and burning tokens
 * - Integration with book reading completion system
 * - Proper error handling and transaction management
 */

import { 
  Horizon, 
  TransactionBuilder, 
  Networks, 
  Operation,
  Asset,
  Contract,
  Address,
  xdr,
  BASE_FEE,
  rpc as StellarRpc
} from '@stellar/stellar-sdk';

// AuraCoin Contract Configuration
export const AURACOIN_CONFIG = {
  CONTRACT_ID: 'CA5UBCFVK2E57D3P3AZSKK2T2N6G7TQNXIQUEZGFX56FPW4B7OFINBUD',
  NETWORK: 'testnet' as const,
  RPC_URL: 'https://soroban-testnet.stellar.org',
  NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015'
};

// Initialize Horizon server for account operations
const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');

// Initialize Soroban RPC server for contract operations
const sorobanServer = new StellarRpc.Server(AURACOIN_CONFIG.RPC_URL);

// Create contract instance
const createContract = (): Contract => {
  return new Contract(AURACOIN_CONFIG.CONTRACT_ID);
};

// Helper function to convert address to XDR
const addressToScVal = (address: string) => {
  return Address.fromString(address).toScVal();
};

// Helper function to convert amount to XDR
const amountToScVal = (amount: string) => {
  return xdr.ScVal.scvI128(new xdr.Int128Parts({ 
    lo: xdr.Int64.fromString(amount), 
    hi: xdr.Int64.fromString('0') 
  }));
};

// Helper function to convert XDR to native value
const scValToNative = (scVal: xdr.ScVal): any => {
  switch (scVal.switch()) {
    case xdr.ScValType.scvString():
      return scVal.str();
    case xdr.ScValType.scvU32():
      return scVal.u32();
    case xdr.ScValType.scvI128():
      const parts = scVal.i128();
      return parts.lo().toString();
    case xdr.ScValType.scvBool():
      return scVal.b();
    default:
      return scVal;
  }
};

// Get token information from contract
export const getTokenInfo = async () => {
  try {
    const contract = createContract();
    
    // For now, return static token info since contract calls require proper setup
    // In a full implementation, you would call the contract via Soroban RPC
    return {
      name: 'Aura Coin',
      symbol: 'AURA',
      decimals: 18,
      totalSupply: '0'
    };
  } catch (error) {
    console.error('Error getting token info:', error);
    return {
      name: 'Aura Coin',
      symbol: 'AURA',
      decimals: 18,
      totalSupply: '0'
    };
  }
};

// Get balance for a specific address
export const getBalance = async (accountAddress: string): Promise<string> => {
  try {
    // For now, return a placeholder balance
    // In a full implementation, you would call the contract via Soroban RPC
    return '0';
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

// Create and submit Soroban transaction for contract calls
const createAndSubmitSorobanTransaction = async (
  sourceAccount: string,
  contract: Contract,
  method: string,
  args: any[],
  signTransaction: (xdr: string) => Promise<string>,
  fee: string = BASE_FEE
) => {
  try {
    console.log(`🔧 Creating Soroban transaction for ${method}...`);
    
    // Get the source account
    const account = await sorobanServer.getAccount(sourceAccount);
    
    // Create transaction builder
    const transaction = new TransactionBuilder(account, {
      fee,
      networkPassphrase: AURACOIN_CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(180)
      .build();

    console.log('📝 Preparing transaction...');
    
    // Prepare the transaction (this simulates and adds Soroban data)
    const preparedTransaction = await sorobanServer.prepareTransaction(transaction);
    
    console.log('✍️ Signing transaction...');
    
    // Sign the transaction
    const signedXdr = await signTransaction(preparedTransaction.toXDR());
    const signedTransaction = TransactionBuilder.fromXDR(
      signedXdr, 
      AURACOIN_CONFIG.NETWORK_PASSPHRASE
    );
    
    console.log('🚀 Submitting transaction...');
    
    // Submit the transaction
    const sendResponse = await sorobanServer.sendTransaction(signedTransaction);
    
    if (sendResponse.status === 'PENDING') {
      console.log('⏳ Transaction submitted, waiting for confirmation...');
      
      // Poll for transaction completion
      let getResponse = await sorobanServer.getTransaction(sendResponse.hash);
      while (getResponse.status === 'NOT_FOUND') {
        console.log('⏳ Waiting for transaction confirmation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        getResponse = await sorobanServer.getTransaction(sendResponse.hash);
      }
      
      if (getResponse.status === 'SUCCESS') {
        console.log('✅ Transaction successful!');
        return getResponse;
      } else {
        throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
      }
    } else {
      throw new Error(`Transaction submission failed: ${sendResponse.errorResult}`);
    }
  } catch (error) {
    console.error('❌ Error in Soroban transaction:', error);
    throw error;
  }
};

// Mint tokens (owner only) - This is the main function for rewarding users
export const mintTokens = async (
  accountAddress: string,
  amount: number,
  signTransaction: (xdr: string) => Promise<string>
): Promise<void> => {
  try {
    console.log(`🎯 Starting mint operation for ${amount} AURA tokens to ${accountAddress}`);
    
    const contract = createContract();
    const recipient = addressToScVal(accountAddress);
    const amountVal = amountToScVal(amount.toString());
    
    // Based on the contract structure, the mint function takes (account, amount)
    // where account is the recipient address
    await createAndSubmitSorobanTransaction(
      accountAddress,
      contract,
      'mint',
      [recipient, amountVal],
      signTransaction
    );
    
    console.log(`✅ Successfully minted ${amount} AURA tokens to ${accountAddress}`);
  } catch (error) {
    console.error('❌ Error minting tokens:', error);
    throw error;
  }
};

// Transfer tokens between addresses
export const transferTokens = async (
  fromAddress: string,
  toAddress: string,
  amount: number,
  signTransaction: (xdr: string) => Promise<string>
): Promise<void> => {
  try {
    console.log(`🔄 Starting transfer of ${amount} AURA tokens from ${fromAddress} to ${toAddress}`);
    
    const contract = createContract();
    const from = addressToScVal(fromAddress);
    const to = addressToScVal(toAddress);
    const amountVal = amountToScVal(amount.toString());
    
    // Create and submit the transfer transaction
    await createAndSubmitSorobanTransaction(
      fromAddress,
      contract,
      'transfer',
      [from, to, amountVal],
      signTransaction
    );
    
    console.log(`✅ Successfully transferred ${amount} AURA tokens from ${fromAddress} to ${toAddress}`);
  } catch (error) {
    console.error('❌ Error transferring tokens:', error);
    throw error;
  }
};

// Burn tokens from an address
export const burnTokens = async (
  fromAddress: string,
  amount: number,
  signTransaction: (xdr: string) => Promise<string>
): Promise<void> => {
  try {
    console.log(`🔥 Starting burn of ${amount} AURA tokens from ${fromAddress}`);
    
    const contract = createContract();
    const from = addressToScVal(fromAddress);
    const amountVal = amountToScVal(amount.toString());
    
    // Create and submit the burn transaction
    await createAndSubmitSorobanTransaction(
      fromAddress,
      contract,
      'burn',
      [from, amountVal],
      signTransaction
    );
    
    console.log(`✅ Successfully burned ${amount} AURA tokens from ${fromAddress}`);
  } catch (error) {
    console.error('❌ Error burning tokens:', error);
    throw error;
  }
};

// Check if contract is paused
export const isPaused = async (): Promise<boolean> => {
  try {
    // For now, return false
    // In a full implementation, you would call the contract's paused function
    return false;
  } catch (error) {
    console.error('Error checking pause status:', error);
    return false;
  }
};

// Get contract explorer URL
export const getContractExplorerUrl = (): string => {
  return `https://stellar.expert/explorer/testnet/contract/${AURACOIN_CONFIG.CONTRACT_ID}`;
};

// Format balance for display
export const formatBalance = (balance: string, decimals: number = 18): string => {
  try {
    const balanceNum = parseFloat(balance);
    const formatted = balanceNum / Math.pow(10, decimals);
    return formatted.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    });
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0.00';
  }
};

// Book reading reward system
export interface BookReward {
  bookId: string;
  title: string;
  pages: number;
  rewardAmount: number;
  completedAt: Date;
}

// Calculate reward based on book completion
export const calculateBookReward = (pages: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): number => {
  const baseReward = Math.max(10, Math.floor(pages / 10)); // Minimum 10 AURA, 1 AURA per 10 pages
  const difficultyMultiplier = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.5
  };
  
  return Math.floor(baseReward * difficultyMultiplier[difficulty]);
};

// Mint tokens for completing a book
export const rewardBookCompletion = async (
  walletAddress: string,
  bookReward: BookReward,
  signTransaction: (xdr: string) => Promise<string>
): Promise<void> => {
  try {
    console.log(`📚 Rewarding book completion: "${bookReward.title}" (${bookReward.pages} pages)`);
    console.log(`💰 Reward amount: ${bookReward.rewardAmount} AURA tokens`);
    
    await mintTokens(walletAddress, bookReward.rewardAmount, signTransaction);
    
    console.log(`🎉 Successfully rewarded ${bookReward.rewardAmount} AURA tokens for completing "${bookReward.title}"`);
  } catch (error) {
    console.error('❌ Error rewarding book completion:', error);
    throw error;
  }
};

// Batch reward for multiple books
export const rewardMultipleBooks = async (
  walletAddress: string,
  bookRewards: BookReward[],
  signTransaction: (xdr: string) => Promise<string>
): Promise<void> => {
  try {
    const totalReward = bookRewards.reduce((sum, book) => sum + book.rewardAmount, 0);
    
    console.log(`📚 Rewarding completion of ${bookRewards.length} books`);
    console.log(`💰 Total reward: ${totalReward} AURA tokens`);
    
    await mintTokens(walletAddress, totalReward, signTransaction);
    
    console.log(`🎉 Successfully rewarded ${totalReward} AURA tokens for completing ${bookRewards.length} books`);
  } catch (error) {
    console.error('❌ Error rewarding multiple books:', error);
    throw error;
  }
}; 