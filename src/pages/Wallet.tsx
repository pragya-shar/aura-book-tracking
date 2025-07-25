import React from 'react';
import { Wallet } from 'lucide-react';
import { WalletInfo } from '@/components/WalletInfo';
import { WalletDemo } from '@/components/WalletDemo';
import { UserInfo } from '@/components/UserInfo';
import { AuraCoinBalance } from '@/components/AuraCoinBalance';
import { AuraCoinTest } from '@/components/AuraCoinTest';
import { AuraCoinSystemTest } from '@/components/AuraCoinSystemTest'
import { WalletProfileManager } from '@/components/WalletProfileManager';

const WalletPage = () => {
  return (
    <div className="px-2 sm:px-0">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-pixel tracking-widest text-purple-400 flex items-center gap-3">
          <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
          Stellar Wallet
        </h1>
        <p className="text-stone-400 font-playfair italic mt-1 text-xs sm:text-sm md:text-base">
          Manage your Freighter wallet and explore blockchain features.
        </p>
      </div>

      {/* Wallet Profile Manager */}
      <div className="mb-6">
        <WalletProfileManager />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WalletInfo />
        <WalletDemo />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AuraCoinBalance />
        <UserInfo />
      </div>

      {/* AuraCoin Contract Test */}
      <div className="mb-6">
        <AuraCoinTest />
      </div>

      {/* AuraCoin System Test */}
      <div className="mb-6">
        <AuraCoinSystemTest />
      </div>
    </div>
  );
};

export default WalletPage; 