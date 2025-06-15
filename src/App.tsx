
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "./components/ui/sidebar";
import SharedLayout from "./components/SharedLayout";
import Library from "./pages/Library";
import AddBook from "./pages/AddBook";
import ReadingProgress from "./pages/ReadingProgress";
import Statistics from "./pages/Statistics";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <SidebarProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route element={<ProtectedRoute><SharedLayout /></ProtectedRoute>}>
                  <Route index element={<Index />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/add-book" element={<AddBook />} />
                  <Route path="/progress" element={<ReadingProgress />} />
                  <Route path="/statistics" element={<Statistics />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
