
import { useState } from "react";
import { supplies, requests, Supply, Request } from "@/lib/data";
import SupplyCard from "@/components/SupplyCard";
import RequestForm from "@/components/RequestForm";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  Package, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Package2 
} from "lucide-react";

const Supplies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  
  const categories = Array.from(new Set(supplies.map(supply => supply.category)));
  
  // Filter supplies based on search and category
  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? supply.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });
  
  const handleRequestItem = (supplyId: string, quantity: number) => {
    toast.success(`Added ${quantity} item(s) to your request`);
  };
  
  const handleSubmitRequest = (items: { supplyId: string; quantity: number }[]) => {
    toast.success("Supply request submitted successfully!");
    setRequestDialogOpen(false);
  };
  
  // Mock user requests for My Requests tab
  const userRequests = requests.filter(request => request.userId === "user1");
  
  const getStatusIcon = (status: Request["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "ready":
        return <Package2 className="h-4 w-4 text-blue-500" />;
      case "rejected":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Office Supplies</h1>
          <p className="text-muted-foreground mt-1">
            Browse and request stationery and office supplies
          </p>
        </div>
        
        <div className="space-x-2">
          <Button asChild variant="outline">
            <DialogTrigger onClick={() => setRequestDialogOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              New Request
            </DialogTrigger>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all-supplies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all-supplies">All Supplies</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-supplies" className="space-y-6">
          {/* Filters */}
          <div className="bg-accent/30 rounded-lg p-4 flex flex-col sm:flex-row gap-4 border border-accent">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search supplies"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={categoryFilter === null ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Supplies Grid */}
          {filteredSupplies.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No supplies match your criteria</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter(null);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSupplies.map((supply) => (
                <SupplyCard
                  key={supply.id}
                  supply={supply}
                  onRequest={handleRequestItem}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-requests">
          {userRequests.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No requests</h3>
              <p className="text-muted-foreground mt-1 mb-4">You haven't made any supply requests yet</p>
              <Button onClick={() => document.querySelector('button[value="all-supplies"]')?.click()}>
                Browse Supplies
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        #{request.id.slice(-5)}
                      </TableCell>
                      <TableCell>{request.requestDate}</TableCell>
                      <TableCell>
                        {request.items.map((item, index) => {
                          const supply = supplies.find(s => s.id === item.supplyId);
                          return (
                            <div key={index} className="flex items-center gap-1 text-sm">
                              <span>{item.quantity}x</span>
                              <span>{supply?.name}</span>
                            </div>
                          );
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`flex items-center gap-1 ${
                            request.status === "approved" ? "bg-green-50" :
                            request.status === "ready" ? "bg-blue-50" :
                            request.status === "rejected" ? "bg-red-50" :
                            "bg-amber-50"
                          }`}
                        >
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* New Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              New Supply Request
            </DialogTitle>
          </DialogHeader>
          <RequestForm onSubmit={handleSubmitRequest} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Supplies;
