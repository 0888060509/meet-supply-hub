
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
  Package2,
  ShoppingCart,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Supplies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestItems, setRequestItems] = useState<{ supplyId: string; quantity: number }[]>([]);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"requestDate" | "status">("requestDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [requestDetailsOpen, setRequestDetailsOpen] = useState<{[key: string]: boolean}>({});
  const [highlightedRequestId, setHighlightedRequestId] = useState<string | null>(null);
  
  const categories = Array.from(new Set(supplies.map(supply => supply.category)));
  
  // Filter supplies based on search and category
  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? supply.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });
  
  const handleRequestItem = (supplyId: string, quantity: number) => {
    // Check if item already exists in cart
    const existingItemIndex = requestItems.findIndex(item => item.supplyId === supplyId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedItems = [...requestItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setRequestItems(updatedItems);
    } else {
      // Add new item if it doesn't exist
      setRequestItems([...requestItems, { supplyId, quantity }]);
    }
    
    // Show success toast
    const supply = supplies.find(s => s.id === supplyId);
    toast.success(`Added ${quantity} ${supply?.name}(s) to your request`, {
      description: `${requestItems.length + 1} item(s) in your request cart`
    });
  };
  
  const handleSubmitRequest = (items: { supplyId: string; quantity: number }[], notes?: string) => {
    // Highlight the new request in the list
    const newRequestId = `request${requests.length + 1}`;
    setHighlightedRequestId(newRequestId);
    
    toast.success("Supply request submitted successfully!", {
      description: "You can track your request status in My Requests tab"
    });
    setRequestDialogOpen(false);
    setRequestItems([]);
    
    // Switch to My Requests tab
    const tabsTrigger = document.querySelector('button[value="my-requests"]') as HTMLButtonElement;
    if (tabsTrigger) {
      tabsTrigger.click();
    }
    
    // Auto-expand the new request details
    setRequestDetailsOpen(prev => ({...prev, [newRequestId]: true}));
    
    // Clear the highlight after 5 seconds
    setTimeout(() => {
      setHighlightedRequestId(null);
    }, 5000);
  };
  
  // Mock user requests for My Requests tab
  const userRequests = requests.filter(request => request.userId === "user1");
  
  // Sort the requests
  const sortedRequests = [...userRequests].sort((a, b) => {
    if (sortField === "requestDate") {
      const dateA = new Date(a.requestDate).getTime();
      const dateB = new Date(b.requestDate).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      // Sort by status: pending, approved, ready, rejected
      const statusOrder = { pending: 1, approved: 2, ready: 3, rejected: 4 };
      const statusA = statusOrder[a.status as keyof typeof statusOrder];
      const statusB = statusOrder[b.status as keyof typeof statusOrder];
      return sortDirection === "asc" ? statusA - statusB : statusB - statusA;
    }
  });
  
  const toggleRequestDetails = (requestId: string) => {
    setRequestDetailsOpen(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };
  
  const toggleSort = (field: "requestDate" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
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
  
  const getStatusDetails = (status: Request["status"]) => {
    switch (status) {
      case "pending":
        return "Your request is being reviewed by the office manager.";
      case "approved":
        return "Your request has been approved and is being prepared.";
      case "ready":
        return "Your items are ready for pickup at the reception desk.";
      case "rejected":
        return "Your request couldn't be fulfilled at this time.";
      default:
        return "";
    }
  };
  
  const getStatusBadge = (status: Request["status"]) => {
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 ${
          status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
          status === "ready" ? "bg-blue-50 text-blue-700 border-blue-200" :
          status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
          "bg-amber-50 text-amber-700 border-amber-200"
        }`}
      >
        {getStatusIcon(status)}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  // Fix for the document.querySelector error
  const handleSwitchToAllSupplies = () => {
    const tabsTrigger = document.querySelector('button[value="all-supplies"]') as HTMLButtonElement;
    if (tabsTrigger) {
      tabsTrigger.click();
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
        
        <div className="space-x-2 flex items-center">
          {requestItems.length > 0 && (
            <Button 
              onClick={() => setRequestDialogOpen(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Request
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full">
                {requestItems.length}
              </Badge>
            </Button>
          )}
          
          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
          </Dialog>
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
          
          {/* Request Cart Summary (if items exist) */}
          {requestItems.length > 0 && (
            <Alert className="bg-primary/10 border-primary/20">
              <AlertDescription className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>
                    <strong>{requestItems.length}</strong> {requestItems.length === 1 ? 'item' : 'items'} in your request cart
                  </span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setRequestDialogOpen(true)}
                >
                  View Request
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
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
              <Button onClick={handleSwitchToAllSupplies}>
                Browse Supplies
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sort Controls */}
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toggleSort("requestDate")}
                >
                  <Calendar className="h-4 w-4" />
                  Date
                  {sortField === "requestDate" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                  {sortField !== "requestDate" && <ArrowUpDown className="h-3 w-3" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toggleSort("status")}
                >
                  <Info className="h-4 w-4" />
                  Status
                  {sortField === "status" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                  {sortField !== "status" && <ArrowUpDown className="h-3 w-3" />}
                </Button>
              </div>
              
              {/* Requests List */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead width="15%">Request ID</TableHead>
                      <TableHead width="15%">Date</TableHead>
                      <TableHead width="15%">Status</TableHead>
                      <TableHead width="55%">Summary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRequests.map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow 
                          className={`${
                            highlightedRequestId === request.id ? "bg-primary/5" : ""
                          } hover:cursor-pointer`}
                          onClick={() => toggleRequestDetails(request.id)}
                        >
                          <TableCell className="font-medium">
                            #{request.id.slice(-5)}
                          </TableCell>
                          <TableCell>{request.requestDate}</TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-between items-center">
                              <span>
                                {request.items.length} {request.items.length === 1 ? 'item' : 'items'} requested
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  toggleRequestDetails(request.id);
                                }}
                              >
                                {requestDetailsOpen[request.id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {requestDetailsOpen[request.id] && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-muted/30 p-0">
                              <div className="px-4 py-3 space-y-4">
                                {/* Status Details */}
                                <div className="flex items-start gap-2 text-sm bg-accent/20 p-3 rounded-md">
                                  {getStatusIcon(request.status)}
                                  <div>
                                    <p className="font-medium">Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}</p>
                                    <p className="text-muted-foreground">{getStatusDetails(request.status)}</p>
                                    {request.status === "ready" && (
                                      <p className="text-blue-600 font-medium mt-1">Ready for pickup at Reception</p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Request Timeline */}
                                <div className="border-l-2 border-muted pl-4 py-2 space-y-3">
                                  <div className="relative">
                                    <div className="absolute -left-[1.15rem] mt-1 w-2 h-2 rounded-full bg-primary"></div>
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">Requested on:</span> {request.requestDate}
                                    </p>
                                  </div>
                                  
                                  {request.status !== "pending" && (
                                    <div className="relative">
                                      <div className="absolute -left-[1.15rem] mt-1 w-2 h-2 rounded-full bg-green-500"></div>
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Approved on:</span> {new Date(new Date(request.requestDate).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {request.status === "ready" && (
                                    <div className="relative">
                                      <div className="absolute -left-[1.15rem] mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Ready for pickup since:</span> {new Date(new Date(request.requestDate).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Requested Items */}
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Requested Items:</h4>
                                  <div className="grid gap-2">
                                    {request.items.map((item, index) => {
                                      const supply = supplies.find(s => s.id === item.supplyId);
                                      return (
                                        <div key={index} className="flex items-center justify-between bg-background rounded-md p-2 text-sm">
                                          <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-accent/20 rounded overflow-hidden">
                                              {supply?.image && (
                                                <img 
                                                  src={supply.image} 
                                                  alt={supply?.name} 
                                                  className="h-full w-full object-cover"
                                                />
                                              )}
                                            </div>
                                            <span>{supply?.name}</span>
                                          </div>
                                          <Badge variant="outline" className="bg-background">
                                            Qty: {item.quantity}
                                          </Badge>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {requestItems.length > 0 ? "Your Supply Request" : "New Supply Request"}
            </DialogTitle>
          </DialogHeader>
          <RequestForm 
            onSubmit={handleSubmitRequest} 
            initialItems={requestItems}
            onUpdateItems={setRequestItems}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Supplies;
