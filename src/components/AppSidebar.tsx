
import { Home, Library, PlusSquare, BarChart, BookOpen, LogOut } from "lucide-react";
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
  { title: "Home", href: "/", icon: Home },
  { title: "My Library", href: "/library", icon: Library },
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
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-2xl font-bold text-center group-data-[collapsible=icon]:hidden font-cinzel tracking-wider">Aura</h2>
        <h2 className="text-2xl font-bold text-center group-data-[collapsible=icon]:block hidden font-cinzel">A</h2>
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
      <SidebarSeparator />
      <SidebarFooter className="p-4 flex flex-col gap-2">
        <SidebarMenuButton asChild tooltip="Add New Book" className="w-full justify-center">
            <Link to="/add-book">
                <PlusSquare />
                <span className="group-data-[collapsible=icon]:hidden ml-2">Add New Book</span>
            </Link>
        </SidebarMenuButton>
        {user && (
          <SidebarMenuButton onClick={handleLogout} tooltip="Logout" className="w-full justify-center">
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
          </SidebarMenuButton>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
