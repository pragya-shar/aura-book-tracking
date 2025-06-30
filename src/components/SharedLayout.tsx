
import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

const SharedLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-[#1a1a1a] to-[#000000] text-stone-300 relative">
      {/* Softer vignette effect */}
      <div className="absolute inset-0 bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)] z-0"></div>

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
