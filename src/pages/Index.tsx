
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#000000] text-center p-4 text-stone-300 relative overflow-hidden">
      {/* Film grain effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-5 pointer-events-none"></div>
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-black/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="mb-8 z-10">
        <h1 className="text-6xl font-bold tracking-wider flex items-baseline justify-center text-amber-400 [text-shadow:0_0_8px_rgba(251,191,36,0.5),0_0_20px_rgba(251,191,36,0.3)]">
          <span className="font-melody text-8xl">A</span>
          <span className="font-pixel ml-1">URA</span>
        </h1>
        <p className="font-playfair text-stone-400 mt-2 text-lg italic">Track your literary journey through the shadows.</p>
      </div>
      <Button asChild size="lg" variant="outline" className="z-10 border-amber-500 text-amber-500 bg-transparent hover:bg-amber-500 hover:text-black transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]">
        <Link to="/auth">Enter the Archives</Link>
      </Button>
    </div>
  );
};

export default Index;
