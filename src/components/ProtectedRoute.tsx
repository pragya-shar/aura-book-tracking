
import { useAuth } from '@/contexts/AuthContext';
import { useFreighter } from '@/contexts/FreighterContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const { isWalletConnected, walletAddress } = useFreighter();

  if (loading) {
    return null; // The AuthProvider will show a loader
  }

  // Allow access if user is authenticated via Supabase OR wallet is connected
  if (!user && !(isWalletConnected && walletAddress)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
