
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Package, Users, Settings, FileText } from "lucide-react";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  
  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name}! Manage your workspace from here.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Room Booking Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Room Booking
            </CardTitle>
            <CardDescription>
              Find and book meeting rooms for your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse available rooms, check their amenities, and book the perfect space for your meetings.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/rooms">Book a Room</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* My Bookings Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> My Bookings
            </CardTitle>
            <CardDescription>
              View and manage your upcoming room bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Check your scheduled meetings, make changes, or cancel bookings when needed.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/rooms?tab=my-bookings">View My Bookings</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Office Supplies Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Office Supplies
            </CardTitle>
            <CardDescription>
              Request office supplies for your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse the inventory, request supplies, and track your orders all in one place.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/supplies">Request Supplies</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <>
            <Card className="hover:shadow-md transition-shadow border-primary/20">
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
            
            <Card className="hover:shadow-md transition-shadow border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> All Bookings
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
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
