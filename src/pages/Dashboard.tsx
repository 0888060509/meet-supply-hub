
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Bell, Clock, FileText, Users, Settings, ChevronRight, AlertCircle, Plus, UserCog, Pen, Clipboard } from "lucide-react";
import { useState, useEffect } from "react";
import { bookings, rooms, getUserBookings, getUserRequests, requests, supplies } from "@/lib/data";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuickBookingForm } from "@/components/QuickBookingForm";
import { QuickRequestForm } from "@/components/QuickRequestForm";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [urgentAlerts, setUrgentAlerts] = useState([]);

  console.log("Current user:", user);
  console.log("All bookings:", bookings);
  console.log("All requests:", requests);

  useEffect(() => {
    if (user) {
      console.log("Fetching data for user:", user.id);
      
      const userBookings = getUserBookings(user.id);
      console.log("User bookings:", userBookings);
      
      const upcoming = userBookings
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA > dateB) return 1;
          if (dateA < dateB) return -1;
          
          return a.startTime.localeCompare(b.startTime);
        })
        .slice(0, 3);
      
      console.log("Upcoming bookings:", upcoming);
      setUpcomingBookings(upcoming);
      
      const userRequests = getUserRequests(user.id);
      console.log("User requests:", userRequests);
      const pending = userRequests.filter(req => req.status === "pending");
      console.log("Pending requests:", pending);
      setPendingRequests(pending);
      
      const today = new Date();
      const todayStr = format(today, "yyyy-MM-dd");
      
      const upcomingMeetings = userBookings.filter(booking => {
        if (booking.date !== todayStr) return false;
        
        const [bookingHour, bookingMinute] = booking.startTime.split(':').map(Number);
        const bookingTime = new Date(today);
        bookingTime.setHours(bookingHour, bookingMinute);
        
        const diffMinutes = Math.round((bookingTime.getTime() - today.getTime()) / (1000 * 60));
        
        return diffMinutes > 0 && diffMinutes <= 30;
      });
      
      console.log("Urgent meetings:", upcomingMeetings);
      
      if (upcomingMeetings.length > 0) {
        setUrgentAlerts(upcomingMeetings.map(meeting => ({
          id: meeting.id,
          message: `Your meeting "${meeting.title}" starts in less than 30 minutes.`,
          type: "meeting"
        })));
      }
      
      setHasNotifications(pending.length > 0 || upcomingMeetings.length > 0);
    }
  }, [user]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  const dismissAlert = (alertId) => {
    setUrgentAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="container py-8 animate-fade-in">
      {urgentAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {urgentAlerts.map(alert => (
            <Alert key={alert.id} className="border-amber-400 bg-amber-50 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="flex justify-between items-center">
                <span>{alert.message}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
      
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}! Here's your workspace overview.
          </p>
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={toggleNotifications}
          >
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </Button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 z-50 border rounded-md bg-background shadow-lg animate-fade-in">
              <div className="p-3 border-b">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map(request => (
                    <div key={request.id} className="p-2 hover:bg-muted rounded-md">
                      <p className="text-sm">
                        Your request for {request.items.length} item(s) is pending approval.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested on {request.requestDate}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center p-4 text-muted-foreground">No new notifications</p>
                )}
              </div>
              <div className="p-2 border-t text-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/supplies?tab=requests">View all requests</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Upcoming Bookings
              </div>
              <Badge variant="outline" className="font-normal">
                <Clock className="h-3 w-3 mr-1" /> Today & Upcoming
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map(booking => {
                  const room = rooms.find(r => r.id === booking.roomId);
                  return (
                    <div key={booking.id} className="flex items-start p-3 rounded-md hover:bg-muted transition-colors hover-scale">
                      <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center mr-3">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base">{booking.title}</h4>
                        <p className="text-sm text-muted-foreground">{room?.name}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <span>{booking.date}</span>
                          <span className="mx-1">•</span>
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No upcoming bookings</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full group" asChild>
              <Link to="/rooms?tab=bookings">
                View All Bookings
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Supply Requests
              </div>
              <Badge variant="outline" className="font-normal">
                Status Updates
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.map(request => {
                  const itemNames = request.items.map(item => {
                    const supply = supplies.find(s => s.id === item.supplyId);
                    return `${item.quantity}x ${supply?.name || 'Unknown item'}`;
                  });
                  
                  return (
                    <div key={request.id} className="flex items-start p-3 rounded-md hover:bg-muted transition-colors hover-scale">
                      <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center mr-3">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-base">Request #{request.id.substring(request.id.length - 4)}</h4>
                          <Badge className="bg-amber-500">{request.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{itemNames.join(', ')}</p>
                        <p className="text-xs text-muted-foreground mt-1">Submitted on {request.requestDate}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full group" asChild>
              <Link to="/supplies?tab=requests">
                View All Requests
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow hover-scale">
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
          <CardFooter className="flex gap-2 justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" /> Quick Book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Quick Room Booking</DialogTitle>
                  <DialogDescription>
                    Book a room without leaving your dashboard. Fill out the details below.
                  </DialogDescription>
                </DialogHeader>
                <QuickBookingForm />
              </DialogContent>
            </Dialog>
            <Button asChild className="flex-1">
              <Link to="/rooms">All Rooms</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow hover-scale">
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
          <CardFooter className="flex gap-2 justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" /> Quick Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Quick Supply Request</DialogTitle>
                  <DialogDescription>
                    Request office supplies without leaving your dashboard.
                  </DialogDescription>
                </DialogHeader>
                <QuickRequestForm />
              </DialogContent>
            </Dialog>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/supplies">All Supplies</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> My Calendar
            </CardTitle>
            <CardDescription>
              View your personal booking calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              See your day, week, or month at a glance with all your meeting room bookings in one place.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/rooms?tab=calendar">View Calendar</Link>
            </Button>
          </CardFooter>
        </Card>
        
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

            <Card className="hover:shadow-md transition-shadow border-primary/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" /> User Management
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
            
            {/* New Stationery Management Card */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
