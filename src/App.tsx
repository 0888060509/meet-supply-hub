
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RoomBooking from "./pages/RoomBooking";
import Supplies from "./pages/Supplies";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16"> {/* Add pt-16 for navbar spacing */}
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/rooms" 
                  element={
                    <ProtectedRoute>
                      <RoomBooking />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/supplies" 
                  element={
                    <ProtectedRoute>
                      <Supplies />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin routes */}
                <Route 
                  path="/admin/rooms" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <div className="container py-8">
                        <h1 className="text-3xl font-bold">Admin: Room Management</h1>
                        <p className="text-muted-foreground">This page is coming soon</p>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/bookings" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <div className="container py-8">
                        <h1 className="text-3xl font-bold">Admin: All Bookings</h1>
                        <p className="text-muted-foreground">This page is coming soon</p>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
