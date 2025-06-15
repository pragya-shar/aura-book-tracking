
import { Home, PlusSquare, BarChart, BookOpen, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { title: "Home", href: "/library", icon: Home },
  { title: "Reading Progress", href: "/progress", icon: BookOpen },
  { title: "Statistics", href: "/statistics", icon: BarChart },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const isLinkActive = (href: string) => {
    if (href === '/') {
        return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  }

  return (
    <Sidebar className="bg-black/10 backdrop-blur-sm border-r border-amber-500/10">
      <SidebarHeader className="p-4">
        <h2 className="text-2xl font-bold text-center group-data-[collapsible=icon]:hidden tracking-wider flex items-baseline justify-center">
          <span className="font-melody text-4xl">A</span>
          <span className="font-pixel">ura</span>
        </h2>
        <h2 className="text-4xl font-bold text-center group-data-[collapsible=icon]:block hidden font-melody">A</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isLinkActive(item.href)}
                  tooltip={item.title}
                  className="text-stone-400 hover:bg-amber-500/10 hover:text-amber-400 data-[active=true]:bg-amber-500/10 data-[active=true]:text-amber-400"
                >
                  <Link to={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className="bg-amber-500/20" />
      <SidebarFooter className="p-4 flex flex-col gap-2">
        <SidebarMenuButton asChild tooltip="Add New Book" className="w-full justify-center text-stone-300 hover:bg-amber-500/10 hover:text-amber-400 border border-amber-500/30">
            <Link to="/add-book">
                <PlusSquare />
                <span className="group-data-[collapsible=icon]:hidden ml-2">Add New Book</span>
            </Link>
        </SidebarMenuButton>
        {user && (
          <SidebarMenuButton onClick={handleLogout} tooltip="Logout" className="w-full justify-center text-stone-300 hover:bg-red-500/10 hover:text-red-400 border border-red-500/30">
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
          </SidebarMenuButton>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
