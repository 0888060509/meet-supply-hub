import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, PlusCircle, Pencil, Trash2, ArrowUpDown, ImageIcon, Link, ExternalLink } from "lucide-react";
import SettingsSidebar from "@/components/SettingsSidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supplies, Supply } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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

const StationeryManagement = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
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

  const initialItems: StationeryItem[] = supplies.map(item => ({
    ...item
  }));
  const [stationeryItems, setStationeryItems] = useState<StationeryItem[]>(initialItems);

  const handleBack = () => {
    navigate(-1);
  };

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

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({
      key,
      direction
    });
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = stationeryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase()) || item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase());
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
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (sortConfig.key === 'name') {
          return sortConfig.direction === 'ascending' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortConfig.key === 'inStock') {
          return sortConfig.direction === 'ascending' ? a.inStock - b.inStock : b.inStock - a.inStock;
        }
        return 0;
      });
    }
    return result;
  }, [stationeryItems, searchTerm, categoryFilter, stockFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const firstPage = 1;
      const lastPage = totalPages;
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(null);
        pages.push(lastPage);
      } else if (currentPage >= totalPages - 2) {
        pages.push(firstPage);
        pages.push(null);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(firstPage);
        pages.push(null);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(null);
        pages.push(lastPage);
      }
    }
    return pages;
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
    const {
      name,
      value
    } = e.target;
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
    toast({
      title: "Success!",
      description: `${newItem.name} has been added to inventory.`
    });
  };

  const handleEditSubmit = () => {
    if (!currentItem || !validateForm()) return;
    const updatedItems = stationeryItems.map(item => item.id === currentItem.id ? {
      ...item,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      inStock: formData.inStock,
      image: formData.image,
      link: formData.link.trim() || undefined
    } : item);
    setStationeryItems(updatedItems);
    setEditDialogOpen(false);
    toast({
      title: "Success!",
      description: `${formData.name} has been updated.`
    });
  };

  const handleDeleteSubmit = () => {
    if (!currentItem) return;
    const updatedItems = stationeryItems.filter(item => item.id !== currentItem.id);
    setStationeryItems(updatedItems);
    setDeleteDialogOpen(false);
    toast({
      title: "Item Deleted",
      description: `${currentItem.name} has been removed from inventory.`
    });
  };

  return <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Stationery Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your organization's stationery inventory
              </p>
            </div>
          </div>
          
          <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search stationery items..." className="pl-8" value={searchTerm} onChange={handleSearch} />
              </div>
              
              <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              
              <Select value={stockFilter} onValueChange={handleStockFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Stock Level" />
                </SelectTrigger>
                <SelectContent>
                  {stockLevels.map(level => <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleAddItem} className="w-full sm:w-auto shrink-0">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="rounded-md border overflow-hidden animate-fade-in">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead width="30%" className="cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      Item
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead width="15%">Category</TableHead>
                  <TableHead width="15%" className="text-center cursor-pointer" onClick={() => handleSort('inStock')}>
                    <div className="flex items-center justify-center">
                      Stock Level
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead width="20%">Link Reference</TableHead>
                  <TableHead width="20%" className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length > 0 ? paginatedItems.map(item => <TableRow key={item.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-accent/20 overflow-hidden flex items-center justify-center">
                            {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
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
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${item.inStock === 0 ? "bg-red-100 text-red-700" : item.inStock <= 5 ? "bg-amber-100 text-amber-700" : item.inStock <= 20 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {item.inStock === 0 ? "Out of stock" : `${item.inStock} ${item.inStock === 1 ? "item" : "items"}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline">
                            <span className="truncate max-w-[150px] inline-block align-middle">
                              {item.link.replace(/^https?:\/\//i, '')}
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 ml-1 inline-block align-middle" />
                          </a> : <span className="text-muted-foreground italic">No link available</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>) : <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No stationery items found.
                    </TableCell>
                  </TableRow>}
              </TableBody>
            </Table>
          </div>
          
          {filteredAndSortedItems.length > 0 && <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, i) => page === null ? <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem> : <PaginationItem key={`page-${page}`}>
                        <PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page as number)}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>)}
                  
                  <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>}
          
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
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddSubmit}>
                  Add Item
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
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleEditSubmit}>
                  Update Item
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
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSubmit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>;
};

export default StationeryManagement;
