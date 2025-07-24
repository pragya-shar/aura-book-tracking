import { Horizon, TransactionBuilder, Networks, Asset, Operation } from '@stellar/stellar-sdk';

// Network configurations
export const NETWORK_CONFIGS = {
  TESTNET: {
    networkPassphrase: Networks.TESTNET,
    serverUrl: import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: import.meta.env.VITE_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org'
  },
  PUBLIC: {
    networkPassphrase: Networks.PUBLIC,
    serverUrl: 'https://horizon.stellar.org',
    sorobanRpcUrl: 'https://soroban.stellar.org'
  }
};

// Get Stellar server instance
export const getStellarServer = (network: 'TESTNET' | 'PUBLIC' = 'TESTNET') => {
  const config = NETWORK_CONFIGS[network];
  return new Horizon.Server(config.serverUrl);
};

// Create a simple payment transaction
export const createPaymentTransaction = async (
  sourceAccount: string,
  destination: string,
  amount: string,
  asset: Asset = Asset.native(),
  network: 'TESTNET' | 'PUBLIC' = 'TESTNET'
) => {
  const server = getStellarServer(network);
  const config = NETWORK_CONFIGS[network];

  try {
    // Get the source account
    const account = await server.loadAccount(sourceAccount);

    // Create the transaction
    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset,
          amount,
        })
      )
      .setTimeout(30)
      .build();

    return transaction.toXDR();
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw error;
  }
};

// Create a trustline transaction for custom assets
export const createTrustlineTransaction = async (
  sourceAccount: string,
  asset: Asset,
  network: 'TESTNET' | 'PUBLIC' = 'TESTNET'
) => {
  const server = getStellarServer(network);
  const config = NETWORK_CONFIGS[network];

  try {
    // Get the source account
    const account = await server.loadAccount(sourceAccount);

    // Create the transaction
    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        Operation.changeTrust({
          asset,
          limit: '1000000', // Set a reasonable limit
        })
      )
      .setTimeout(30)
      .build();

    return transaction.toXDR();
  } catch (error) {
    console.error('Error creating trustline transaction:', error);
    throw error;
  }
};

// Submit a signed transaction
export const submitTransaction = async (
  signedXdr: string,
  network: 'TESTNET' | 'PUBLIC' = 'TESTNET'
) => {
  const server = getStellarServer(network);

  try {
    const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_CONFIGS[network].networkPassphrase);
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
};

// Get account balance
export const getAccountBalance = async (
  accountId: string,
  network: 'TESTNET' | 'PUBLIC' = 'TESTNET'
) => {
  const server = getStellarServer(network);

  try {
    const account = await server.loadAccount(accountId);
    return account.balances;
  } catch (error) {
    console.error('Error getting account balance:', error);
    throw error;
  }
};

// Validate Stellar address
export const isValidStellarAddress = (address: string): boolean => {
  const stellarAddressRegex = /^[G][A-Z2-7]{55}$/;
  return stellarAddressRegex.test(address);
};

// Format Stellar amount (lumens to XLM)
export const formatStellarAmount = (amount: string): string => {
  const num = parseFloat(amount) / 10000000; // Convert stroops to lumens
  return num.toFixed(7);
};

// Parse Stellar amount (XLM to lumens)
export const parseStellarAmount = (amount: string): string => {
  const num = parseFloat(amount) * 10000000; // Convert lumens to stroops
  return Math.floor(num).toString();
}; 