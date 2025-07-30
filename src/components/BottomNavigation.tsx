
import { Home, BarChart, BookOpen, PlusSquare, LogOut, Wallet, Shield } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFreighter } from "@/contexts/FreighterContext";
import { AURACOIN_CONFIG } from "@/utils/auraCoinUtils";

const ADMIN_EMAIL = 'sharmapragya997@gmail.com';

const navigationItems = [
  { title: "Home", href: "/library", icon: Home },
  { title: "Progress", href: "/progress", icon: BookOpen },
  { title: "Statistics", href: "/statistics", icon: BarChart },
  { title: "Wallet", href: "/wallet", icon: Wallet },
  { title: "Add Book", href: "/add-book", icon: PlusSquare },
];

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWalletConnected, disconnectWallet, walletAddress } = useFreighter();
  
  // Check if current user is admin
  const isAdmin = walletAddress === AURACOIN_CONFIG.OWNER_ADDRESS && user?.email === ADMIN_EMAIL;

  const isLinkActive = (href: string) => {
    if (href === '/library') {
      return location.pathname === '/library' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    if (user) {
      await supabase.auth.signOut();
    }
    if (isWalletConnected) {
      disconnectWallet();
    }
    navigate('/auth');
  };

  // Build navigation items including admin link if user is admin
  const allNavigationItems = [
    ...navigationItems,
    ...(isAdmin ? [{ title: "Admin", href: "/admin", icon: Shield }] : [])
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-amber-500/20">
      <div className="flex items-center justify-around h-16 px-2">
        {allNavigationItems.map((item) => {
          const isActive = isLinkActive(item.href);
          return (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors duration-200",
                isActive
                  ? "text-amber-400"
                  : "text-stone-400 hover:text-amber-300"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 mb-1",
                  isActive && "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                )} 
              />
              <span className="text-xs font-medium truncate max-w-full">
                {item.title}
              </span>
            </Link>
          );
        })}
        {(user || isWalletConnected) && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors duration-200 text-stone-400 hover:text-red-400"
          >
            <LogOut className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium truncate max-w-full">
              Logout
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default BottomNavigation;
