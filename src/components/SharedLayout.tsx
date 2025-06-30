
import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

const SharedLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-[#1a1a1a] to-[#000000] text-stone-300 relative">
      {/* Reduced film grain effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.45%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-2 pointer-events-none z-0"></div>
      
      {/* Softer vignette effect */}
      <div className="absolute inset-0 bg-black/30 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)] z-0"></div>

      <div className="z-10 flex flex-col flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-amber-500/20 bg-transparent px-4 sm:px-6">
          <h1 className="text-2xl font-bold tracking-wider flex items-baseline">
            <span className="font-melody text-3xl text-amber-400">A</span>
            <span className="font-pixel text-amber-400">ura</span>
          </h1>
        </header>
        <main className="flex-1 p-4 pb-20 sm:p-6 sm:pb-20">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
};

export default SharedLayout;
