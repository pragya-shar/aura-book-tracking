
import { Home, Library, PlusSquare, BarChart, BookOpen } from "lucide-react";
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
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", href: "/", icon: Home },
  { title: "My Library", href: "/library", icon: Library },
  { title: "Reading Progress", href: "/progress", icon: BookOpen },
  { title: "Statistics", href: "/statistics", icon: BarChart },
];

const AppSidebar = () => {
  const location = useLocation();

  const isLinkActive = (href: string) => {
    if (href === '/') {
        return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-semibold text-center group-data-[collapsible=icon]:hidden">Aura</h2>
        <h2 className="text-xl font-semibold text-center group-data-[collapsible=icon]:block hidden">A</h2>
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
      <SidebarFooter className="p-4">
        <SidebarMenuButton asChild tooltip="Add New Book" className="w-full justify-center">
            <Link to="/add-book">
                <PlusSquare />
                <span className="group-data-[collapsible=icon]:hidden ml-2">Add New Book</span>
            </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
