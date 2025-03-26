
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, PlusCircle, Pencil, Trash2 } from "lucide-react";
import SettingsSidebar from "@/components/SettingsSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supplies, Supply } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

// Extend the Supply type with an optional description field
interface StationeryItem extends Supply {
  description?: string;
}

const StationeryManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Map the supplies data to StationeryItem array, adding description if missing
  const initialItems: StationeryItem[] = supplies.map(item => ({
    ...item,
    description: item.name // Use name as description if it's missing
  }));
  
  const [stationeryItems, setStationeryItems] = useState<StationeryItem[]>(initialItems);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredItems = stationeryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddItem = () => {
    toast({
      title: "Feature coming soon",
      description: "Add stationery item functionality will be available soon.",
    });
  };

  const handleEditItem = (id: string) => {
    toast({
      title: "Feature coming soon",
      description: "Edit stationery item functionality will be available soon.",
    });
  };

  const handleDeleteItem = (id: string) => {
    toast({
      title: "Feature coming soon",
      description: "Delete stationery item functionality will be available soon.",
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SettingsSidebar />
      <div className="flex-1 p-6 md:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-4"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Stationery Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your organization's stationery inventory
              </p>
            </div>
          </div>
          
          <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stationery items..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button onClick={handleAddItem} className="w-full md:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="rounded-md border animate-fade-in">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead width="40%">Item</TableHead>
                  <TableHead width="15%">Category</TableHead>
                  <TableHead width="15%" className="text-center">Stock Level</TableHead>
                  <TableHead width="30%" className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-accent/20 overflow-hidden flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-xs text-center text-muted-foreground">No image</div>
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
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            item.inStock <= 5
                              ? "bg-red-100 text-red-700"
                              : item.inStock <= 20
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.inStock} {item.inStock === 1 ? "item" : "items"}
                        </span>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No stationery items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationeryManagement;
