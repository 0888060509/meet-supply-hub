
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { Settings, Users, Clipboard, Calendar, Package } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user, isAdmin } = useAuth();
  
  useEffect(() => {
    // Show toast if non-admin tries to access this page
    if (!isAdmin) {
      toast.error("You don't have permission to access the Settings page");
    }
  }, [isAdmin]);
  
  // Redirect non-admins to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Admin tools and system configuration
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Room Management Card */}
        <Card className="hover:shadow-md transition-shadow border-primary/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Room Management
            </CardTitle>
            <CardDescription>
              Admin tools for managing meeting rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add new rooms, edit existing ones, and manage room equipment and availability.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="default" className="w-full">
              <Link to="/admin/rooms">Manage Rooms</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* All Bookings Card */}
        <Card className="hover:shadow-md transition-shadow border-primary/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> All Bookings
            </CardTitle>
            <CardDescription>
              Admin view of all meeting room bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View, search, and manage all room bookings across the organization.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="default" className="w-full">
              <Link to="/admin/bookings">View All Bookings</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* User Management Card */}
        <Card className="hover:shadow-md transition-shadow border-primary/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> User Management
            </CardTitle>
            <CardDescription>
              Admin tools for managing user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add, edit, and manage user accounts. Control access and permissions across the platform.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="default" className="w-full">
              <Link to="/admin/users">Manage Users</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Stationery Management Card */}
        <Card className="hover:shadow-md transition-shadow border-primary/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-primary" /> Stationery Management
            </CardTitle>
            <CardDescription>
              Admin tools for managing office stationery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add, edit, and manage stationery items. Keep track of inventory and stock levels.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="default" className="w-full">
              <Link to="/admin/stationery">Manage Stationery</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Inventory Management Card */}
        <Card className="hover:shadow-md transition-shadow border-primary/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Inventory Management
            </CardTitle>
            <CardDescription>
              Admin tools for managing inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage stock levels, approve requests, and track usage patterns.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="default" className="w-full">
              <Link to="/admin/inventory">Manage Inventory</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
