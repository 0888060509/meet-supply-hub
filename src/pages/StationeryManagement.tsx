
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Pen, 
  Trash2, 
  Plus, 
  Search, 
  Clipboard,
  ArrowUpDown
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Mock data for stationery items
const mockStationeryItems = [
  { id: "1", name: "Ballpoint Pens", description: "Blue ink ballpoint pens", stockQuantity: 45 },
  { id: "2", name: "Notebooks", description: "A5 spiral notebooks, lined", stockQuantity: 32 },
  { id: "3", name: "Sticky Notes", description: "3x3 yellow sticky notes, pack of 100", stockQuantity: 18 },
  { id: "4", name: "Highlighters", description: "Assorted colors, pack of 5", stockQuantity: 7 },
  { id: "5", name: "Staplers", description: "Desktop staplers, black", stockQuantity: 12 },
  { id: "6", name: "Paper Clips", description: "Small metal paper clips, box of 100", stockQuantity: 50 },
  { id: "7", name: "Folders", description: "Letter size manila folders", stockQuantity: 25 },
  { id: "8", name: "Whiteboard Markers", description: "Dry erase markers, black", stockQuantity: 3 },
];

interface StationeryItem {
  id: string;
  name: string;
  description: string;
  stockQuantity: number;
}

const StationeryManagement = () => {
  const { isAdmin } = useAuth();
  const [stationeryItems, setStationeryItems] = useState<StationeryItem[]>(mockStationeryItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "stockQuantity">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Modal state management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<StationeryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stockQuantity: 0,
  });
  
  // Filter and sort items
  const filteredItems = stationeryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (stockFilter === "all") return matchesSearch;
    if (stockFilter === "inStock") return matchesSearch && item.stockQuantity > 0;
    if (stockFilter === "lowStock") return matchesSearch && item.stockQuantity <= 10 && item.stockQuantity > 0;
    if (stockFilter === "outOfStock") return matchesSearch && item.stockQuantity === 0;
    
    return matchesSearch;
  });
  
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === "asc" 
        ? a.stockQuantity - b.stockQuantity 
        : b.stockQuantity - a.stockQuantity;
    }
  });
  
  // Toggle sort direction when clicking on column headers
  const toggleSort = (field: "name" | "stockQuantity") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Handle adding a new item
  const handleAddItem = () => {
    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    
    if (formData.stockQuantity < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }
    
    const newItem: StationeryItem = {
      id: String(stationeryItems.length + 1),
      name: formData.name,
      description: formData.description,
      stockQuantity: formData.stockQuantity,
    };
    
    setStationeryItems([...stationeryItems, newItem]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success("Item added successfully");
  };
  
  // Handle editing an item
  const handleEditItem = () => {
    if (!currentItem) return;
    
    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    
    if (formData.stockQuantity < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }
    
    const updatedItems = stationeryItems.map(item => 
      item.id === currentItem.id ? { ...item, ...formData } : item
    );
    
    setStationeryItems(updatedItems);
    setIsEditModalOpen(false);
    resetForm();
    toast.success("Item updated successfully");
  };
  
  // Handle deleting an item
  const handleDeleteItem = () => {
    if (!currentItem) return;
    
    const updatedItems = stationeryItems.filter(item => item.id !== currentItem.id);
    setStationeryItems(updatedItems);
    setIsDeleteDialogOpen(false);
    toast.success("Item deleted successfully");
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      stockQuantity: 0,
    });
    setCurrentItem(null);
  };
  
  // Open edit modal with current item data
  const openEditModal = (item: StationeryItem) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      stockQuantity: item.stockQuantity,
    });
    setIsEditModalOpen(true);
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (item: StationeryItem) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Clipboard className="mr-2 h-6 w-6 text-primary" />
            Stationery Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your office stationery inventory
          </p>
        </div>
        
        <Button onClick={() => {
          resetForm();
          setIsAddModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or description..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select 
          value={stockFilter} 
          onValueChange={setStockFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="inStock">In Stock</SelectItem>
            <SelectItem value="lowStock">Low Stock (≤10)</SelectItem>
            <SelectItem value="outOfStock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {sortedItems.length > 0 ? (
        <div className="rounded-md border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer w-[30%]" 
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Item Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[40%]">Description</TableHead>
                <TableHead 
                  className="cursor-pointer w-[15%]" 
                  onClick={() => toggleSort("stockQuantity")}
                >
                  <div className="flex items-center">
                    Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[15%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="mr-2">{item.stockQuantity}</span>
                      {item.stockQuantity === 0 ? (
                        <Badge variant="destructive">Out of stock</Badge>
                      ) : item.stockQuantity <= 10 ? (
                        <Badge variant="warning" className="bg-amber-500">Low stock</Badge>
                      ) : null}
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.stockQuantity === 0 
                            ? 'bg-red-500' 
                            : item.stockQuantity <= 10 
                              ? 'bg-amber-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(item.stockQuantity * 2, 100)}%` }}
                      ></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(item)}
                      className="mr-1"
                    >
                      <Pen className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(item)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No stationery items found. Click "Add Item" to create one.</p>
        </div>
      )}
      
      {/* Add Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Stationery Item</DialogTitle>
            <DialogDescription>
              Enter the details of the new stationery item below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="e.g., Ballpoint Pens"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., Blue ink ballpoint pens"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="stockQuantity">Stock Quantity <span className="text-red-500">*</span></Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Item Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stationery Item</DialogTitle>
            <DialogDescription>
              Update the details of the stationery item.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Item Name <span className="text-red-500">*</span></Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-stockQuantity">Stock Quantity <span className="text-red-500">*</span></Label>
              <Input
                id="edit-stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StationeryManagement;
