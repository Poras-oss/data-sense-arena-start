import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Start from "./pages/Start";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Leaderboard from "./pages/Leaderboard";
import SqlJourney from "./pages/SqlJourney";
import NotFound from "./pages/NotFound";
import Badges from "./pages/Badges";
import Profile from "./pages/Profile";
import Challenge from "./pages/Challenge";
import ProfileEdit from "./pages/ProfileEdit";
import { ProfileProvider } from "@/context/ProfileContext";
import {  useUser } from '@clerk/clerk-react';
import { WebSocketProvider } from './util/WebSocketProvider'
import axios from 'axios';

const App = () => {
  // Create a new QueryClient instance within the component function
  // This ensures it has the correct React context
  const [queryClient] = useState(() => new QueryClient());
  const { isLoaded, isSignedIn, user } = useUser()


  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const clerkId = user.id;
      axios.post('https://server.datasenseai.com/user-streak/update-activity', { clerkId })
        .then(response => {
          console.log('Activity updated:', response.data);
        })
        .catch(error => {
          console.error('Error updating activity:', error);
        });
    }
  }, [user, isLoaded, isSignedIn]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ProfileProvider>
          <WebSocketProvider url="https://server.datasenseai.com/"> 
          <BrowserRouter>
            <Routes>
              <Route path="/start" element={<Start />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/challenge" element={<Challenge />} />
              <Route path="/" element={<Navigate to="/start" replace />} />
              <Route path="/community" element={<Community />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/sql-journey" element={<SqlJourney />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-edit" element={<ProfileEdit />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </WebSocketProvider>
        </ProfileProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
