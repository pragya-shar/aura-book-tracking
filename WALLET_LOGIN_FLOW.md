# Wallet Login Flow Documentation

## Overview

The application now supports bidirectional login between email accounts and Freighter wallets. This means users can:

1. **Link their wallet to their email account** - After logging in with email, connect wallet to link them
2. **Connect wallet to access linked account data** - Connect a wallet that's already linked to an email account

## How It Works

### 1. Email → Wallet Linking

When a user is logged in with their email account:

1. They click "Connect Freighter Wallet" 
2. The wallet connects and shows "Link to Account" button
3. Clicking "Link to Account" creates a `user_profiles` record linking the wallet address to their user ID
4. The wallet is now linked to their email account

### 2. Wallet → Email Access

When a user connects a wallet that's already linked to an email account:

1. They click "Connect Freighter Wallet"
2. The system checks if the wallet address exists in `user_profiles`
3. If found, it shows a message: "Wallet connected! This wallet is linked to an existing account. Please log in with your email to access your data."
4. The user needs to log in with their email to access their data

## Database Schema

The `user_profiles` table links wallet addresses to user accounts:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE,
  wallet_network TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Components

### FreighterContext
- Manages wallet connection state
- Handles wallet linking/unlinking
- Checks for linked accounts when connecting wallet
- Provides `isWalletLinked`, `isWalletLoginInProgress`, and `error` states

### FreighterWalletButton
- Shows connection status
- Displays linking/unlinking options
- Shows error messages for wallet login scenarios

### WalletInfo
- Detailed wallet information display
- Shows account linking status
- Provides link/unlink functionality

## Services

### WalletService
- `linkWalletToUser()` - Links wallet to current user
- `unlinkWalletFromUser()` - Unlinks wallet from current user
- `getUserByWalletAddress()` - Gets user profile by wallet address
- `canWalletLogin()` - Checks if wallet can be used for login

## User Experience

### Scenario 1: New User
1. User signs up with email
2. Connects wallet
3. Links wallet to account
4. Can now use either method to access their data

### Scenario 2: Existing User with Linked Wallet
1. User connects wallet
2. System detects wallet is linked to existing account
3. Shows message to log in with email
4. User logs in with email to access their data

### Scenario 3: Wrong Account
1. User is logged in with Account A
2. Connects wallet linked to Account B
3. System shows error message
4. User needs to log out and log in with correct account

## Security Considerations

- Wallet addresses are unique in the database
- Users cannot link a wallet that's already linked to another account
- RLS policies ensure users can only access their own profile data
- No automatic login via wallet (requires email authentication)

## Future Enhancements

- Implement true wallet-based authentication
- Add wallet signature verification for enhanced security
- Support multiple wallets per account
- Add wallet recovery mechanisms 