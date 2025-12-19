import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoveGate from "./pages/LoveGate";
import Dashboard from "./pages/Dashboard";
import GamesPage from "./pages/GamesPage";
import MessagesPage from "./pages/MessagesPage";
import MemoriesPage from "./pages/MemoriesPage";
import StoryPage from "./pages/StoryPage";
import LettersPage from "./pages/LettersPage";
import SupportPage from "./pages/SupportPage";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import TicTacToePage from "./pages/TicTacToePage";
import FlowerBouquetPage from "./pages/FlowerBouquetPage";
import WishlistPage from "./pages/WishlistPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><LoveGate /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/games" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/memories" element={<ProtectedRoute><MemoriesPage /></ProtectedRoute>} />
            <Route path="/story" element={<ProtectedRoute><StoryPage /></ProtectedRoute>} />
            <Route path="/letters" element={<ProtectedRoute><LettersPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/tictactoe" element={<ProtectedRoute><TicTacToePage /></ProtectedRoute>} />
            <Route path="/bouquet" element={<ProtectedRoute><FlowerBouquetPage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
