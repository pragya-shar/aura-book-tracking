
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="mb-8">
        <h1 className="text-6xl font-bold tracking-wider flex items-baseline justify-center">
          <span className="font-melody text-8xl">A</span>
          <span className="font-pixel ml-1">URA</span>
        </h1>
        <p className="text-muted-foreground mt-2">Welcome to your personal book tracker.</p>
      </div>
      <Button asChild size="lg">
        <Link to="/auth">Get Started</Link>
      </Button>
    </div>
  );
};

export default Index;
