
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronRight, AlertCircle, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { bookings, rooms, getUserBookings, getUserRequests, requests, supplies } from "@/lib/data";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuickBookingForm } from "@/components/QuickBookingForm";
import { QuickRequestForm } from "@/components/QuickRequestForm";

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [urgentAlerts, setUrgentAlerts] = useState([]);

  useEffect(() => {
    if (user) {
      const userBookings = getUserBookings(user.id);
      
      const upcoming = userBookings
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA > dateB) return 1;
          if (dateA < dateB) return -1;
          
          return a.startTime.localeCompare(b.startTime);
        })
        .slice(0, 3);
      
      setUpcomingBookings(upcoming);
      
      const userRequests = getUserRequests(user.id);
      const pending = userRequests.filter(req => req.status === "pending");
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings Section - Retained and Modified */}
        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map(booking => {
                  const room = rooms.find(r => r.id === booking.roomId);
                  return (
                    <div key={booking.id} className="flex items-start p-3 rounded-md hover:bg-muted transition-colors hover-scale">
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
          <CardFooter className="flex flex-col sm:flex-row gap-2 w-full">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto transition-transform hover:scale-105">
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
            
            <Button variant="outline" className="w-full sm:w-auto group" asChild>
              <Link to="/rooms?tab=bookings">
                View All Bookings
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Supply Requests Section - Retained and Modified */}
        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle>Supply Requests</CardTitle>
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
          <CardFooter className="flex flex-col sm:flex-row gap-2 w-full">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto transition-transform hover:scale-105">
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
            
            <Button variant="outline" className="w-full sm:w-auto group" asChild>
              <Link to="/supplies?tab=requests">
                View My Requests
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
