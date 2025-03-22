
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, Package, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
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

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Room Booking", path: "/rooms", icon: <Calendar className="w-4 h-4 mr-2" /> },
    { name: "Office Supplies", path: "/supplies", icon: <Package className="w-4 h-4 mr-2" /> },
  ];

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
          to="/" 
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
        
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
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
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
