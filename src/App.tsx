
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { FreighterProvider } from "./contexts/FreighterContext";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SharedLayout = lazy(() => import("./components/SharedLayout"));
const Library = lazy(() => import("./pages/Library"));
const AddBook = lazy(() => import("./pages/AddBook"));
const ReadingProgress = lazy(() => import("./pages/ReadingProgress"));
const Statistics = lazy(() => import("./pages/Statistics"));
const Wallet = lazy(() => import("./pages/Wallet"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const Auth = lazy(() => import("./pages/Auth"));
const AuraCoinTest = lazy(() => import("./components/AuraCoinTest").then(module => ({ default: module.AuraCoinTest })));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#000000]">
    <div className="text-amber-400 text-xl">Loading...</div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster />
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
          <FreighterProvider>
              <SidebarProvider>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<Index />} />
                                    <Route element={<ProtectedRoute><SharedLayout /></ProtectedRoute>}>
                    <Route path="/library" element={<Library />} />
                    <Route path="/add-book" element={<AddBook />} />
                    <Route path="/progress" element={<ReadingProgress />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/test-mint" element={<AuraCoinTest />} />
                  </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </SidebarProvider>
            </FreighterProvider>
            </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
