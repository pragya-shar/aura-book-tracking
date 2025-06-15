
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

const SharedLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-[#1a1a1a] to-[#000000] text-stone-300 relative">
      {/* Film grain effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-5 pointer-events-none z-0"></div>
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-black/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] z-0"></div>

      <div className="z-10 flex w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-amber-500/20 bg-transparent px-4 sm:h-auto sm:border-0 sm:px-6">
            <SidebarTrigger className="text-stone-300 hover:text-amber-400"/>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SharedLayout;
