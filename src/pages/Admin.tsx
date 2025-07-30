import { Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFreighter } from '@/contexts/FreighterContext';
import { AURACOIN_CONFIG } from '@/utils/auraCoinUtils';
import { AdminRewardsDashboard } from '@/components/AdminRewardsDashboard';
import { AdminTokenManager } from '@/components/admin/AdminTokenManager';
import { AdminDatabaseTools } from '@/components/admin/AdminDatabaseTools';
import { AdminTestingTools } from '@/components/admin/AdminTestingTools';

const ADMIN_EMAIL = 'sharmapragya997@gmail.com';

const AdminPage = () => {
  const { user } = useAuth();
  const { walletAddress } = useFreighter();

  // Check admin access - must have both correct wallet and email
  const isAdmin = 
    walletAddress === AURACOIN_CONFIG.OWNER_ADDRESS && 
    user?.email === ADMIN_EMAIL;

  if (!isAdmin) {
    return <Navigate to="/wallet" replace />;
  }

  return (
    <div className="px-2 sm:px-0">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-pixel tracking-widest text-amber-400 flex items-center gap-3">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
          Admin Dashboard
        </h1>
        <p className="text-stone-400 font-playfair italic mt-1 text-xs sm:text-sm md:text-base">
          Manage rewards, tokens, and system administration.
        </p>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-amber-200 mb-2">System Overview</h3>
          <div className="text-sm text-stone-400">
            <div>Contract Owner: {walletAddress}</div>
            <div>Admin Email: {user?.email}</div>
          </div>
        </div>
      </div>

      {/* Admin Components */}
      <div className="space-y-6">
        {/* Admin Rewards Dashboard */}
        <AdminRewardsDashboard />
        
        {/* Token Management */}
        <AdminTokenManager />

        {/* Database Tools */}
        <AdminDatabaseTools />

        {/* Testing Tools */}
        <AdminTestingTools />
      </div>
    </div>
  );
};

export default AdminPage;