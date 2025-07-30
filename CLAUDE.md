# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

### TypeScript Configuration
The project uses a non-strict TypeScript configuration with:
- `noImplicitAny`: false
- `strictNullChecks`: false
- `noUnusedParameters`: false
- `noUnusedLocals`: false

## High-Level Architecture

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React Context (AuthContext, FreighterContext)
- **Data Fetching**: TanStack Query
- **Database**: Supabase
- **Blockchain**: Stellar (AuraCoin rewards system)
- **Wallet Integration**: Freighter API

### Architecture Overview

#### Core Application Structure
The app follows a feature-based organization with clear separation of concerns:

1. **Pages** (`src/pages/`): Main application routes
   - `Index.tsx`: Landing page
   - `Library.tsx`: User's book collection
   - `AddBook.tsx`: Book search and addition
   - `ReadingProgress.tsx`: Reading tracking
   - `Wallet.tsx`: Stellar wallet and AuraCoin management
   - `Statistics.tsx`: Reading statistics
   - `Auth.tsx`: Authentication flow

2. **Services** (`src/services/`): Business logic and external integrations
   - `walletService.ts`: Stellar wallet operations
   - `auraCoinRewardService.ts`: AuraCoin reward calculations
   - `adminRewardMintingService.ts`: Admin reward processing
   - `edgeFunctionService.ts`: Supabase edge function calls

3. **Contexts** (`src/contexts/`): Global state management
   - `AuthContext`: User authentication state
   - `FreighterContext`: Stellar wallet connection state

4. **Database Schema** (Supabase):
   - `users`: Auth users
   - `user_profiles`: Extended user data with wallet addresses
   - `books`: Book metadata
   - `reading_logs`: Reading progress tracking
   - `pending_rewards`: AuraCoin rewards awaiting processing

#### Key Features

1. **Book Tracking System**
   - Users can search for books via Google Books API
   - Track reading progress (current page/total pages)
   - Automatic book completion detection at 100%

2. **AuraCoin Reward System**
   - Automated reward creation on book completion (1 AURA per page)
   - Database triggers handle completion detection
   - Pending rewards queue for admin processing
   - Integration with Stellar blockchain for token minting

3. **Wallet Integration**
   - Freighter wallet connection for Stellar operations
   - Wallet linking to user profiles
   - Real-time balance display
   - Transaction history tracking

#### Security Considerations
- Row Level Security (RLS) enabled on all Supabase tables
- Private keys and sensitive data never exposed client-side
- Stellar contract IDs hardcoded (not in environment variables)
- Admin-only functions protected by authentication

#### Build Optimization
The project uses Vite's code splitting with manual chunks:
- `vendor`: React core libraries
- `stellar`: Stellar SDK
- `ui`: UI component libraries
- `query`: Data fetching libraries

## Important Implementation Details

### AuraCoin Integration
- Contract is deployed on Stellar testnet
- Uses custom Soroban smart contract
- Rewards are created as "pending" and require admin processing
- Real-time updates via Supabase subscriptions

### Database Triggers
- AFTER triggers used to avoid foreign key issues
- Proper duplicate prevention implemented
- Trigger loops avoided by careful state management

### Mobile Responsiveness
- Bottom navigation for mobile devices
- Responsive grid layouts
- Touch-optimized interactions