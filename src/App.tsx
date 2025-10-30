import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Learn from "./pages/Learn";
import ArenaPage from "./pages/ArenaPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotFound from "./pages/NotFound";
import { ScribbleHome } from "./components/scribble/ScribbleHome";
import { ScribbleRoom } from "./components/scribble/ScribbleRoom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/arena" element={<ArenaPage />} />
          <Route path="/battle" element={<ScribbleHome />} />
          <Route path="/battle/room/:roomCode" element={<ScribbleRoom />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
