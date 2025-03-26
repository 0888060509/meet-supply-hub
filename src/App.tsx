
import React from "react";
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
import RoomDetails from "./pages/RoomDetails";
import Supplies from "./pages/Supplies";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import AdminRoomManagement from "./pages/AdminRoomManagement";
import AdminRoomForm from "./pages/AdminRoomForm";
import AdminAllBookings from "./pages/AdminAllBookings";
import UserManagement from "./pages/UserManagement";
import StationeryManagement from "./pages/StationeryManagement";
import InventoryManagement from "./pages/InventoryManagement";
import SettingsPage from "./pages/Settings";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Make App a function component explicitly for React
const App: React.FC = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
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
                      path="/rooms/:id" 
                      element={
                        <ProtectedRoute>
                          <RoomDetails />
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
                    
                    {/* Redirect Settings to Room Management */}
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <Navigate to="/admin/rooms" replace />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin routes */}
                    <Route 
                      path="/admin/rooms" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminRoomManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/rooms/new" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminRoomForm />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/rooms/edit/:id" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminRoomForm />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/bookings" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminAllBookings />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/users" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <UserManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/stationery" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <StationeryManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/inventory" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <InventoryManagement />
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
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

export default App;
