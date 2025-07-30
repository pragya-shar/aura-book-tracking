import { Wallet } from 'lucide-react';
import { WalletInfo } from '@/components/WalletInfo';
import { UserInfo } from '@/components/UserInfo';
import { UserAuraCoinBalance } from '@/components/UserAuraCoinBalance';

const WalletPage = () => {
  return (
    <div className="px-2 sm:px-0">
      {/* Enhanced Header with Premium Styling */}
      <div className="mb-8 relative">
        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-amber-500/10 rounded-2xl blur-3xl -z-10" />
        
        <div className="relative bg-gradient-to-br from-black/40 via-black/20 to-transparent backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4 sm:p-6 md:p-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-pixel tracking-widest bg-gradient-to-r from-purple-300 via-blue-300 to-amber-300 bg-clip-text text-transparent flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <Wallet className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-purple-400 drop-shadow-lg" />
              <div className="absolute inset-0 bg-purple-400/30 blur-md rounded-full" />
            </div>
            <span className="leading-tight">Stellar Wallet</span>
          </h1>
          
          <p className="text-stone-300/90 font-playfair italic mt-4 sm:mt-3 text-sm sm:text-base md:text-lg max-w-full sm:max-w-2xl leading-relaxed">
            Connect your Freighter wallet to unlock AuraCoin rewards and manage your reading achievements on the Stellar blockchain.
          </p>
          
          {/* Trust indicator */}
          <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50 flex-shrink-0" />
            <span className="text-green-300/80 font-medium">Secured by Stellar Network</span>
          </div>
        </div>
      </div>

      {/* Enhanced Component Grid with Mobile Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        <div className="transform transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01] active:scale-[1.005] touch-manipulation">
          <WalletInfo />
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01] active:scale-[1.005] touch-manipulation">
          <UserInfo />
        </div>
      </div>

      {/* Enhanced Balance Section with Mobile Optimization */}
      <div className="mb-6 sm:mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-amber-500/5 rounded-2xl blur-2xl -z-10" />
        <div className="transform transition-all duration-300 hover:scale-[1.005] focus-within:scale-[1.005] active:scale-[1.002] touch-manipulation">
          <UserAuraCoinBalance />
        </div>
      </div>
    </div>
  );
};

export default WalletPage; 