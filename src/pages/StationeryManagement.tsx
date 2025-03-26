import React, { useState, useMemo } from "react";
import { 
  ArrowUpDown, 
  ImageIcon, 
  Link, 
  ExternalLink, 
  Pencil, 
  Trash2,
  PlusCircle,
  Search
} from "lucide-react";
import { supplies, Supply } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import SettingsSidebar from "@/components/SettingsSidebar";
import { 
  AdminLayout,
  AdminTable,
  AdminTablePagination,
  AdminTableColumn
} from "@/components/admin";

interface StationeryItem extends Supply {}

const categories = ["All", "Writing", "Paper", "Tools"];
const stockLevels = [{
  value: "all",
  label: "All Levels"
}, {
  value: "high",
  label: "In Stock (20+)"
}, {
  value: "medium",
  label: "Medium Stock (6-20)"
}, {
  value: "low",
  label: "Low Stock (1-5)"
}, {
  value: "out",
  label: "Out of Stock (0)"
}];

export default function StationeryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  } | null>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<StationeryItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: string;
    inStock: number;
    image: string;
    link: string;
  }>({
    name: "",
    description: "",
    category: "Writing",
    inStock: 0,
    image: "",
    link: ""
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    inStock?: string;
    category?: string;
    link?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const initialItems: StationeryItem[] = supplies.map(item => ({
    ...item
  }));
  const [stationeryItems, setStationeryItems] = useState<StationeryItem[]>(initialItems);

  const columns: AdminTableColumn[] = [
    { 
      key: "name", 
      header: "Item", 
      width: "30%", 
      sortable: true 
    },
    { 
      key: "category", 
      header: "Category", 
      width: "15%",
      hideOnMobile: true
    },
    { 
      key: "inStock", 
      header: "Stock Level", 
      width: "15%", 
      align: "center",
      sortable: true 
    },
    { 
      key: "link", 
      header: "Link Reference", 
      width: "20%",
      hideOnMobile: true
    },
    { 
      key: "actions", 
      header: "Actions", 
      width: "20%", 
      align: "right" 
    },
  ];

  const filteredAndSortedItems = useMemo(() => {
    let result = stationeryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === "high") {
        matchesStock = item.inStock >= 20;
      } else if (stockFilter === "medium") {
        matchesStock = item.inStock >= 6 && item.inStock <= 20;
      } else if (stockFilter === "low") {
        matchesStock = item.inStock >= 1 && item.inStock <= 5;
      } else if (stockFilter === "out") {
        matchesStock = item.inStock === 0;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    });
    
    return result;
  }, [stationeryItems, searchTerm, categoryFilter, stockFilter]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleStockFilter = (value: string) => {
    setStockFilter(value);
    setCurrentPage(1);
  };

  const handleSort = (newSortConfig: { key: string; direction: 'asc' | 'desc' | null }) => {
    setSortConfig(newSortConfig);
  };

  const handleAddItem = () => {
    setFormData({
      name: "",
      description: "",
      category: "Writing",
      inStock: 0,
      image: "",
      link: ""
    });
    setFormErrors({});
    setAddDialogOpen(true);
  };

  const handleEditItem = (id: string) => {
    const itemToEdit = stationeryItems.find(item => item.id === id);
    if (itemToEdit) {
      setCurrentItem(itemToEdit);
      setFormData({
        name: itemToEdit.name,
        description: itemToEdit.description || "",
        category: itemToEdit.category,
        inStock: itemToEdit.inStock,
        image: itemToEdit.image,
        link: itemToEdit.link || ""
      });
      setFormErrors({});
      setEditDialogOpen(true);
    }
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = stationeryItems.find(item => item.id === id);
    if (itemToDelete) {
      setCurrentItem(itemToDelete);
      setDeleteDialogOpen(true);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'inStock' ? parseInt(value) || 0 : value
    }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};
    if (!formData.name.trim()) {
      errors.name = "Item name is required";
    }
    if (formData.inStock < 0) {
      errors.inStock = "Stock quantity cannot be negative";
    }
    if (!formData.category) {
      errors.category = "Category is required";
    }
    if (formData.link.trim() !== "") {
      try {
        new URL(formData.link);
      } catch (e) {
        errors.link = "Please enter a valid URL (e.g., https://example.com)";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const newItem: StationeryItem = {
        id: `supply${stationeryItems.length + 1}`,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        quantity: formData.inStock,
        unitCost: 0.00,
        inStock: formData.inStock,
        image: formData.image || "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=2122&auto=format&fit=crop",
        link: formData.link.trim() || undefined
      };
      
      setStationeryItems(prev => [...prev, newItem]);
      setAddDialogOpen(false);
      setIsLoading(false);
      
      toast.success(`${newItem.name} has been added to inventory.`);
    }, 500);
  };

  const handleEditSubmit = () => {
    if (!currentItem || !validateForm()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedItems = stationeryItems.map(item => 
        item.id === currentItem.id 
          ? {
              ...item,
              name: formData.name,
              description: formData.description,
              category: formData.category,
              inStock: formData.inStock,
              image: formData.image,
              link: formData.link.trim() || undefined
            } 
          : item
      );
      
      setStationeryItems(updatedItems);
      setEditDialogOpen(false);
      setIsLoading(false);
      
      toast.success(`${formData.name} has been updated.`);
    }, 500);
  };

  const handleDeleteSubmit = () => {
    if (!currentItem) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedItems = stationeryItems.filter(item => item.id !== currentItem.id);
      setStationeryItems(updatedItems);
      setDeleteDialogOpen(false);
      setIsLoading(false);
      
      toast.success(`${currentItem.name} has been removed from inventory.`);
    }, 500);
  };

  const renderStationeryRow = (item: StationeryItem, index: number) => (
    <TableRow key={item.id} className="group hover:bg-accent/30 transition-colors">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-accent/20 overflow-hidden flex items-center justify-center">
            {item.image ? (
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-muted-foreground line-clamp-1">
              {item.description || item.name}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>{item.category}</TableCell>
      <TableCell className="text-center">
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
          item.inStock === 0 
            ? "bg-red-100 text-red-700" 
            : item.inStock <= 5 
              ? "bg-amber-100 text-amber-700" 
              : item.inStock <= 20 
                ? "bg-yellow-100 text-yellow-700" 
                : "bg-green-100 text-green-700"
        }`}>
          {item.inStock === 0 
            ? "Out of stock" 
            : `${item.inStock} ${item.inStock === 1 ? "item" : "items"}`
          }
        </span>
      </TableCell>
      <TableCell>
        {item.link ? (
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center text-primary hover:underline"
          >
            <span className="truncate max-w-[150px] inline-block align-middle">
              {item.link.replace(/^https?:\/\//i, '')}
            </span>
            <ExternalLink className="h-3.5 w-3.5 ml-1 inline-block align-middle" />
          </a>
        ) : (
          <span className="text-muted-foreground italic">No link available</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleEditItem(item.id)} 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDeleteItem(item.id)} 
            className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <AdminLayout
      title="Stationery Management"
      description="Manage your organization's stationery inventory"
    >
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search stationery items..." 
              className="pl-8" 
              value={searchTerm} 
              onChange={handleSearch} 
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={stockFilter} onValueChange={handleStockFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Stock Level" />
            </SelectTrigger>
            <SelectContent>
              {stockLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleAddItem} className="w-full sm:w-auto shrink-0">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      
      <AdminTable
        columns={columns}
        data={paginatedItems}
        renderRow={renderStationeryRow}
        emptyStateMessage={
          searchTerm || categoryFilter !== "All" || stockFilter !== "all"
            ? "No stationery items found matching your search criteria."
            : "No stationery items found. Add your first item to get started."
        }
        emptyStateActionLabel="Add Item"
        onEmptyStateAction={handleAddItem}
        isFilterActive={!!searchTerm || categoryFilter !== "All" || stockFilter !== "all"}
        isLoading={isLoading}
        sortable={true}
        initialSort={sortConfig}
        onSort={handleSort}
        clientSideSort={true}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage
        }}
      />
      
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Stationery Item</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new item to inventory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter item name" className={formErrors.name ? "border-red-500" : ""} />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleFormChange} placeholder="Enter item description (optional)" rows={3} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select name="category" value={formData.category} onValueChange={value => {
                  setFormData(prev => ({
                    ...prev,
                    category: value
                  }));
                  if (formErrors.category) {
                    setFormErrors(prev => ({
                      ...prev,
                      category: undefined
                    }));
                  }
                }}>
                  <SelectTrigger id="category" className={formErrors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Paper">Paper</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inStock">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input id="inStock" name="inStock" type="number" min="0" value={formData.inStock} onChange={handleFormChange} className={formErrors.inStock ? "border-red-500" : ""} />
                {formErrors.inStock && <p className="text-red-500 text-xs mt-1">{formErrors.inStock}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link">Link Reference</Label>
              <div className="relative">
                <div className="absolute left-2.5 top-2.5">
                  <Link className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input id="link" name="link" value={formData.link} onChange={handleFormChange} placeholder="https://example.com" className={`pl-8 ${formErrors.link ? "border-red-500" : ""}`} />
              </div>
              {formErrors.link && <p className="text-red-500 text-xs mt-1">{formErrors.link}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input id="image" name="image" value={formData.image} onChange={handleFormChange} placeholder="Enter image URL" />
              {formData.image && <div className="mt-2 h-20 w-20 rounded-md overflow-hidden bg-accent/20">
                  <img src={formData.image} alt="Preview" className="h-full w-full object-cover" onError={e => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=2122&auto=format&fit=crop";
                  }} />
                </div>}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setAddDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Adding...</span>
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                </>
              ) : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stationery Item</DialogTitle>
            <DialogDescription>
              Update the details for this item.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-right">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter item name" className={formErrors.name ? "border-red-500" : ""} />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" name="description" value={formData.description} onChange={handleFormChange} placeholder="Enter item description (optional)" rows={3} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select name="category" value={formData.category} onValueChange={value => {
                  setFormData(prev => ({
                    ...prev,
                    category: value
                  }));
                  if (formErrors.category) {
                    setFormErrors(prev => ({
                      ...prev,
                      category: undefined
                    }));
                  }
                }}>
                  <SelectTrigger id="edit-category" className={formErrors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Paper">Paper</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-inStock">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input id="edit-inStock" name="inStock" type="number" min="0" value={formData.inStock} onChange={handleFormChange} className={formErrors.inStock ? "border-red-500" : ""} />
                {formErrors.inStock && <p className="text-red-500 text-xs mt-1">{formErrors.inStock}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-link">Link Reference</Label>
              <div className="relative">
                <div className="absolute left-2.5 top-2.5">
                  <Link className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input id="edit-link" name="link" value={formData.link} onChange={handleFormChange} placeholder="https://example.com" className={`pl-8 ${formErrors.link ? "border-red-500" : ""}`} />
              </div>
              {formErrors.link && <p className="text-red-500 text-xs mt-1">{formErrors.link}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image URL (optional)</Label>
              <Input id="edit-image" name="image" value={formData.image} onChange={handleFormChange} placeholder="Enter image URL" />
              {formData.image && <div className="mt-2 h-20 w-20 rounded-md overflow-hidden bg-accent/20">
                  <img src={formData.image} alt="Preview" className="h-full w-full object-cover" onError={e => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=2122&auto=format&fit=crop";
                  }} />
                </div>}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleEditSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Updating...</span>
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                </>
              ) : "Update Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {currentItem?.name} from the inventory.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSubmit} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Deleting...</span>
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                </>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
