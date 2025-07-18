# Freighter Stellar Wallet Integration

This document describes the integration of the Freighter Stellar wallet into the Aura Book Tracking application.

## Overview

The app now supports two authentication methods:
1. **Traditional Authentication**: Email/password via Supabase
2. **Wallet Authentication**: Freighter Stellar wallet connection

Users can access the app using either method, providing flexibility and enabling blockchain-based features.

## Features

### 🔐 Dual Authentication
- Connect with Freighter wallet as an alternative to email/password
- Seamless switching between authentication methods
- Persistent wallet connection state

### 💳 Wallet Management
- **WalletInfo Component**: Display wallet status, address, and network information
- **FreighterWalletButton**: Connect/disconnect wallet with visual feedback
- **Wallet Demo**: Interactive features to test wallet functionality

### ⚡ Blockchain Features
- **Message Signing**: Sign arbitrary messages to prove wallet ownership
- **Payment Transactions**: Send XLM payments to other Stellar addresses
- **Transaction History**: View and track transaction hashes
- **Network Support**: Testnet and Public network support

## Installation

The integration uses the following packages:
```bash
npm install @stellar/freighter-api @stellar/stellar-sdk
```

## Components

### FreighterContext (`src/contexts/FreighterContext.tsx`)
Main context provider that manages wallet state and provides wallet functionality:

```typescript
interface FreighterContextType {
  isWalletConnected: boolean;
  isWalletAllowed: boolean;
  walletAddress: string | null;
  network: string | null;
  networkDetails: any | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransactionWithWallet: (xdr: string, network?: string) => Promise<string>;
  signMessageWithWallet: (message: string) => Promise<string>;
  loading: boolean;
  error: string | null;
}
```

### FreighterWalletButton (`src/components/auth/FreighterWalletButton.tsx`)
Button component for connecting/disconnecting the wallet with visual feedback.

### WalletInfo (`src/components/WalletInfo.tsx`)
Displays wallet status, address, network information, and provides wallet management actions.

### WalletDemo (`src/components/WalletDemo.tsx`)
Interactive demo component showcasing wallet features:
- Message signing
- Payment transactions
- Transaction history

### Wallet Page (`src/pages/Wallet.tsx`)
Dedicated page for wallet management and blockchain features:
- Clean, focused interface for wallet operations
- Side-by-side layout of wallet info and demo features
- Accessible through main navigation

## Usage

### Basic Wallet Connection

```typescript
import { useFreighter } from '@/contexts/FreighterContext';

const MyComponent = () => {
  const { 
    isWalletConnected, 
    walletAddress, 
    connectWallet, 
    disconnectWallet 
  } = useFreighter();

  const handleConnect = async () => {
    try {
      await connectWallet();
      console.log('Connected to:', walletAddress);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div>
      {isWalletConnected ? (
        <p>Connected: {walletAddress}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
};
```

### Signing Messages

```typescript
import { useFreighter } from '@/contexts/FreighterContext';

const { signMessageWithWallet } = useFreighter();

const handleSignMessage = async (message: string) => {
  try {
    const signedMessage = await signMessageWithWallet(message);
    console.log('Signed message:', signedMessage);
  } catch (error) {
    console.error('Signing failed:', error);
  }
};
```

### Creating and Signing Transactions

```typescript
import { useFreighter } from '@/contexts/FreighterContext';
import { createPaymentTransaction, submitTransaction } from '@/utils/stellarUtils';

const { signTransactionWithWallet, walletAddress, network } = useFreighter();

const handleSendPayment = async (recipient: string, amount: string) => {
  try {
    // Create transaction
    const xdr = await createPaymentTransaction(
      walletAddress!,
      recipient,
      amount,
      undefined,
      network as 'TESTNET' | 'PUBLIC'
    );

    // Sign transaction
    const signedXdr = await signTransactionWithWallet(xdr, network as 'TESTNET' | 'PUBLIC');

    // Submit transaction
    const result = await submitTransaction(signedXdr, network as 'TESTNET' | 'PUBLIC');
    console.log('Transaction hash:', result.hash);
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

## Stellar Utilities (`src/utils/stellarUtils.ts`)

The app includes utility functions for common Stellar operations:

- `createPaymentTransaction()`: Create payment transaction XDR
- `createTrustlineTransaction()`: Create trustline transaction XDR
- `submitTransaction()`: Submit signed transaction to network
- `getAccountBalance()`: Get account balance
- `isValidStellarAddress()`: Validate Stellar address format
- `formatStellarAmount()`: Convert stroops to lumens
- `parseStellarAmount()`: Convert lumens to stroops

## Network Configuration

The app supports both Testnet and Public networks:

```typescript
export const NETWORK_CONFIGS = {
  TESTNET: {
    networkPassphrase: Networks.TESTNET,
    serverUrl: 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org'
  },
  PUBLIC: {
    networkPassphrase: Networks.PUBLIC,
    serverUrl: 'https://horizon.stellar.org',
    sorobanRpcUrl: 'https://soroban.stellar.org'
  }
};
```

## User Experience

### Authentication Flow
1. User visits the app
2. Can choose between email/password or wallet connection
3. If wallet is chosen, Freighter extension prompts for connection
4. Upon successful connection, user is redirected to the library
5. Wallet status is displayed in the sidebar
6. Users can access full wallet features through the dedicated Wallet page

### Wallet Features Access
1. Users can access wallet features through the dedicated Wallet page in the navigation
2. Wallet info shows connection status and account details
3. Demo section allows testing message signing and payments
4. All wallet operations include proper error handling and user feedback

## Error Handling

The integration includes comprehensive error handling:

- **Connection Errors**: Clear messages when Freighter is not installed
- **Permission Errors**: User-friendly messages for denied access
- **Transaction Errors**: Detailed error information for failed transactions
- **Network Errors**: Fallback handling for network issues

## Security Considerations

- All wallet operations require explicit user approval
- Private keys never leave the Freighter extension
- Transaction signing happens securely within the wallet
- Network validation prevents cross-network transaction confusion

## Future Enhancements

Potential future features:
- **Token Management**: Add/remove custom tokens
- **NFT Support**: Display and manage Stellar NFTs
- **DeFi Integration**: Connect to Stellar DeFi protocols
- **Multi-signature Support**: Advanced wallet security features
- **Transaction History**: Persistent transaction tracking
- **Smart Contract Integration**: Soroban smart contract interactions

## Troubleshooting

### Common Issues

1. **Freighter Not Installed**
   - Error: "Freighter wallet is not installed"
   - Solution: Install Freighter from https://www.freighter.app/

2. **Connection Denied**
   - Error: "Access to Freighter wallet was denied"
   - Solution: Check Freighter extension permissions and try again

3. **Network Mismatch**
   - Error: "Network configuration mismatch"
   - Solution: Ensure Freighter is set to the same network as the app

4. **Transaction Failures**
   - Error: Various transaction-related errors
   - Solution: Check account balance, network fees, and transaction parameters

### Debug Mode

Enable debug logging by checking the browser console for detailed error information during wallet operations.

## Support

For issues related to:
- **Freighter Extension**: Visit https://www.freighter.app/
- **Stellar Network**: Check https://stellar.org/
- **App Integration**: Review this documentation and check the codebase 