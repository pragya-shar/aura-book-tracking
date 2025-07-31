import { Wallet } from 'lucide-react';
import { WalletInfo } from '@/components/WalletInfo';
import { UserInfo } from '@/components/UserInfo';
import { UserAuraCoinBalance } from '@/components/UserAuraCoinBalance';

const WalletPage = () => {
  return (
    <div className="px-2 sm:px-0">
      {/* Minimal Header - Index.tsx Style */}
      <div className="mb-8 relative">
        {/* Subtle background accent - refined */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-800/4 via-transparent to-amber-900/3 rounded-2xl -z-10" />
        
        <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl border border-stone-600/10 p-4 sm:p-6 md:p-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-pixel tracking-[0.15em] text-amber-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <Wallet className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-amber-400" />
            </div>
            <span className="leading-tight">Stellar Wallet</span>
          </h1>
          
          <p className="text-stone-300 font-playfair italic mt-4 sm:mt-3 text-sm sm:text-base md:text-lg max-w-full sm:max-w-2xl leading-relaxed tracking-wide">
            Connect your Freighter wallet to unlock AuraCoin rewards and manage your reading achievements on the Stellar blockchain.
          </p>
          
          {/* Trust indicator */}
          <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm">
            <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
            <span className="text-stone-400 font-medium">Secured by Stellar Network</span>
          </div>
        </div>
      </div>

      {/* Component Grid - Minimal Hover Effects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        <div className="transform transition-all duration-300 ease-out hover:scale-[1.002]">
          <WalletInfo />
        </div>
        <div className="transform transition-all duration-300 ease-out hover:scale-[1.002]">
          <UserInfo />
        </div>
      </div>

      {/* Balance Section */}
      <div className="mb-6 sm:mb-8">
        <div className="transform transition-all duration-300 ease-out hover:scale-[1.001]">
          <UserAuraCoinBalance />
        </div>
      </div>
    </div>
  );
};

export default WalletPage; 