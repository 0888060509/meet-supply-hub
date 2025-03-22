
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, Package, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Only show these nav links if user is authenticated
  const navLinks = isAuthenticated ? [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Room Booking", path: "/rooms", icon: <Calendar className="w-4 h-4 mr-2" /> },
    { name: "Office Supplies", path: "/supplies", icon: <Package className="w-4 h-4 mr-2" /> },
  ] : [
    { name: "Home", path: "/" },
  ];

  // Get initials for avatar
  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 ease-in-expo border-b",
        scrolled 
          ? "backdrop-blur-lg bg-white/90 border-gray-200/70" 
          : "bg-transparent border-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          to={isAuthenticated ? "/dashboard" : "/"} 
          className="flex items-center gap-2 font-semibold text-primary transition-opacity hover:opacity-80"
        >
          <span className="text-lg">WorkspaceHub</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200",
                location.pathname === link.path
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent/50"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>
        
        {/* User Menu - Only show if authenticated */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-accent">
                    <AvatarFallback className="bg-accent/30 text-primary">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.role === "admin" ? "Administrator" : "Employee"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        )}
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {isAuthenticated && (
            <Avatar className="h-8 w-8 border border-accent mr-2">
              <AvatarFallback className="bg-accent/30 text-primary text-xs">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden animate-slide-in">
          <nav className="flex flex-col space-y-1 px-4 py-3 bg-white/90 backdrop-blur-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-3 rounded-md text-sm font-medium flex items-center",
                  location.pathname === link.path
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                )}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            {/* Mobile User Options */}
            {isAuthenticated && (
              <>
                <div className="border-t border-accent/20 my-2 pt-2"></div>
                <div className="px-4 py-1 text-sm text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{user?.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  className="px-4 py-3 h-auto justify-start text-destructive hover:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
            
            {/* Mobile Login Button (if not authenticated) */}
            {!isAuthenticated && (
              <Button asChild className="mt-2 mx-4">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
