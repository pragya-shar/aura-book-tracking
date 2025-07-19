# Wallet Linking Feature Setup

## Overview

This feature allows users to link their Freighter wallet addresses to their email-based accounts, creating a unified authentication system where users can access both email login and wallet functionality with the same account.

## Database Migration

To enable this feature, you need to apply the database migration that creates the `user_profiles` table:

### Option 1: Local Supabase (if Docker is running)
```bash
# Start Supabase locally
npx supabase start

# Apply the migration
npx supabase db push
```

### Option 2: Remote Supabase
```bash
# Link to your remote Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
npx supabase db push
```

### Option 3: Manual SQL Execution
If you can't use the Supabase CLI, you can manually execute the SQL in your Supabase dashboard:

```sql
-- Create user profiles table to link wallet addresses with user accounts
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE,
  wallet_network TEXT DEFAULT 'PUBLIC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON public.user_profiles FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet_address ON public.user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
```

## Features

### 1. Wallet Linking
- Users can link their Freighter wallet to their email account
- Only one wallet can be linked per account
- A wallet can only be linked to one account at a time

### 2. Authentication Integration
- Email login and wallet connection work together
- Users can access wallet features after email login
- Wallet status is preserved across sessions

### 3. UI Components
- **FreighterWalletButton**: Shows connection status and linking options
- **WalletInfo**: Displays detailed wallet information and account linking status
- **Wallet Page**: Comprehensive wallet management interface

### 4. Security Features
- Row Level Security (RLS) policies ensure users can only access their own data
- Wallet addresses are validated before linking
- Automatic profile creation for new users

## Usage

### For Users:
1. **Login with Email**: Use your email and password to log in
2. **Connect Wallet**: Click "Connect Freighter Wallet" in the auth page or wallet page
3. **Link Account**: Click "Link to Account" to associate your wallet with your email account
4. **Access Features**: Now you can use both email authentication and wallet features

### For Developers:
The feature is implemented through:

- **WalletService**: Handles all wallet linking operations
- **FreighterContext**: Manages wallet state and linking status
- **Updated Components**: Show linking status and provide linking/unlinking options

## API Methods

### WalletService
- `linkWalletToUser(walletAddress, network)`: Link wallet to current user
- `unlinkWalletFromUser()`: Unlink wallet from current user
- `getUserWalletProfile()`: Get current user's wallet profile
- `isWalletLinked(walletAddress)`: Check if wallet is linked to any account
- `getUserByWalletAddress(walletAddress)`: Get user by wallet address

### FreighterContext
- `isWalletLinked`: Boolean indicating if wallet is linked to current user
- `linkWalletToAccount()`: Link current wallet to user account
- `unlinkWalletFromAccount()`: Unlink current wallet from user account

## Error Handling

The system handles various error scenarios:
- Wallet already linked to another account
- User not authenticated
- Network connection issues
- Invalid wallet addresses

All errors are displayed to users via toast notifications with appropriate messages.

## Testing

To test the feature:
1. Create an account with email
2. Connect a Freighter wallet
3. Link the wallet to your account
4. Verify the linking status is displayed correctly
5. Test unlinking and relinking
6. Verify that the same wallet cannot be linked to multiple accounts 