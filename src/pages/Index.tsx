
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Package, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 md:pt-24 pb-16 md:pb-32 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom_right,#fcfcfc,#f3f4f6)]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
            Simplify Your Workspace
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book meeting rooms and request office supplies with ease. Everything you need in one elegant platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/rooms">
                <Calendar className="h-5 w-5" />
                Book a Room
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/supplies">
                <Package className="h-5 w-5" />
                Request Supplies
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
            Everything you need, beautifully simple
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Calendar className="h-10 w-10" />}
              title="Meeting Room Booking"
              description="Find and book the perfect room for your meetings. See availability in real-time and manage all your bookings in one place."
            />
            
            <FeatureCard 
              icon={<Package className="h-10 w-10" />}
              title="Office Supply Requests"
              description="Browse available supplies and request what you need. Track your requests from submission to pickup."
            />
            
            <FeatureCard 
              icon={<Clock className="h-10 w-10" />}
              title="Real-Time Updates"
              description="All changes happen instantly. Meeting room availability and supply inventory are always up to date."
            />
          </div>
        </div>
      </section>
      
      {/* Room Showcase */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4">
            Perfectly equipped meeting spaces
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Our rooms are designed for productivity and collaboration, with all the equipment you need for successful meetings.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <RoomPreview 
              image="https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=2070&auto=format&fit=crop"
              name="Conference Room A"
              capacity={12}
            />
            
            <RoomPreview 
              image="https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=2070&auto=format&fit=crop"
              name="Meeting Room B"
              capacity={6}
            />
            
            <RoomPreview 
              image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop"
              name="Brainstorm Room"
              capacity={8}
            />
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link to="/rooms">See All Rooms</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Card className="glass-card border-0 hover-lift">
      <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
        <div className="bg-accent/30 p-3 rounded-full mb-4 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const RoomPreview = ({ 
  image, 
  name, 
  capacity 
}: { 
  image: string;
  name: string;
  capacity: number;
}) => {
  return (
    <div className="group relative overflow-hidden rounded-lg h-64 hover-lift">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
        <h3 className="text-xl font-medium">{name}</h3>
        <div className="flex items-center text-sm">
          <Users className="h-4 w-4 mr-1" />
          <span>{capacity} people</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
