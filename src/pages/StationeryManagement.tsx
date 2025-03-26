
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
  ArrowUpDown,
  Link as LinkIcon,
  ExternalLink
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

const mockStationeryItems = [
  { id: "1", name: "Ballpoint Pens", description: "Blue ink ballpoint pens", stockQuantity: 45, linkReference: "https://example.com/pens" },
  { id: "2", name: "Notebooks", description: "A5 spiral notebooks, lined", stockQuantity: 32, linkReference: "https://example.com/notebooks" },
  { id: "3", name: "Sticky Notes", description: "3x3 yellow sticky notes, pack of 100", stockQuantity: 18, linkReference: "" },
  { id: "4", name: "Highlighters", description: "Assorted colors, pack of 5", stockQuantity: 7, linkReference: "https://example.com/highlighters" },
  { id: "5", name: "Staplers", description: "Desktop staplers, black", stockQuantity: 12, linkReference: "" },
  { id: "6", name: "Paper Clips", description: "Small metal paper clips, box of 100", stockQuantity: 50, linkReference: "https://example.com/paperclips" },
  { id: "7", name: "Folders", description: "Letter size manila folders", stockQuantity: 25, linkReference: "https://example.com/folders" },
  { id: "8", name: "Whiteboard Markers", description: "Dry erase markers, black", stockQuantity: 3, linkReference: "" },
];

interface StationeryItem {
  id: string;
  name: string;
  description: string;
  stockQuantity: number;
  linkReference: string;
}

const StationeryManagement = () => {
  const { isAdmin } = useAuth();
  const [stationeryItems, setStationeryItems] = useState<StationeryItem[]>(mockStationeryItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "stockQuantity">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<StationeryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stockQuantity: 0,
    linkReference: "",
  });
  
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
  
  const toggleSort = (field: "name" | "stockQuantity") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const handleAddItem = () => {
    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    
    if (formData.stockQuantity < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }
    
    // Validate URL if provided
    if (formData.linkReference && !isValidUrl(formData.linkReference)) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    
    const newItem: StationeryItem = {
      id: String(stationeryItems.length + 1),
      name: formData.name,
      description: formData.description,
      stockQuantity: formData.stockQuantity,
      linkReference: formData.linkReference,
    };
    
    setStationeryItems([...stationeryItems, newItem]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success("Item added successfully");
  };
  
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
    
    // Validate URL if provided
    if (formData.linkReference && !isValidUrl(formData.linkReference)) {
      toast.error("Please enter a valid URL starting with http:// or https://");
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
  
  const handleDeleteItem = () => {
    if (!currentItem) return;
    
    const updatedItems = stationeryItems.filter(item => item.id !== currentItem.id);
    setStationeryItems(updatedItems);
    setIsDeleteDialogOpen(false);
    toast.success("Item deleted successfully");
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      stockQuantity: 0,
      linkReference: "",
    });
    setCurrentItem(null);
  };
  
  const openEditModal = (item: StationeryItem) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      stockQuantity: item.stockQuantity,
      linkReference: item.linkReference,
    });
    setIsEditModalOpen(true);
  };
  
  const openDeleteDialog = (item: StationeryItem) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };
  
  const openLink = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  const isValidUrl = (url: string) => {
    try {
      const newUrl = new URL(url);
      return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (err) {
      return false;
    }
  };
  
  const truncateUrl = (url: string, maxLength = 25) => {
    if (!url) return '';
    if (url.length <= maxLength) return url;
    
    // Remove protocol for display
    let displayUrl = url.replace(/^https?:\/\//, '');
    
    if (displayUrl.length <= maxLength) return displayUrl;
    return displayUrl.substring(0, maxLength) + '...';
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
                  className="cursor-pointer w-[25%]" 
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Item Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[30%]">Description</TableHead>
                <TableHead 
                  className="cursor-pointer w-[10%]" 
                  onClick={() => toggleSort("stockQuantity")}
                >
                  <div className="flex items-center">
                    Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[20%]">
                  <div className="flex items-center">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Link Reference
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
                    {item.stockQuantity === 0 ? (
                      <Badge variant="destructive">Out of stock</Badge>
                    ) : (
                      item.stockQuantity
                    )}
                  </TableCell>
                  <TableCell>
                    {item.linkReference ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
                        onClick={() => openLink(item.linkReference)}
                      >
                        <span className="mr-1">{truncateUrl(item.linkReference)}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground italic">No link available</span>
                    )}
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
            
            <div className="grid gap-2">
              <Label htmlFor="linkReference">Link Reference</Label>
              <Input
                id="linkReference"
                type="url"
                placeholder="e.g., https://example.com/product"
                value={formData.linkReference}
                onChange={(e) => setFormData({...formData, linkReference: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL starting with http:// or https://
              </p>
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
            
            <div className="grid gap-2">
              <Label htmlFor="edit-linkReference">Link Reference</Label>
              <Input
                id="edit-linkReference"
                type="url"
                placeholder="e.g., https://example.com/product"
                value={formData.linkReference}
                onChange={(e) => setFormData({...formData, linkReference: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL starting with http:// or https://
              </p>
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
