
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supplies } from "@/lib/data";

export function QuickRequestForm() {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([
    { supplyId: "", quantity: 1 }
  ]);

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { supplyId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (selectedItems.length > 1) {
      const newItems = [...selectedItems];
      newItems.splice(index, 1);
      setSelectedItems(newItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...selectedItems];
    newItems[index][field] = value;
    setSelectedItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = selectedItems.every(item => item.supplyId && item.quantity > 0);
    
    if (!isValid) {
      toast({
        title: "Invalid request",
        description: "Please select items and quantities",
        variant: "destructive",
      });
      return;
    }
    
    // Here we would call an API to save the request
    // For now we'll just show a success toast
    const itemNames = selectedItems.map(item => {
      const supply = supplies.find(s => s.id === item.supplyId);
      return `${item.quantity}x ${supply?.name}`;
    });
    
    toast({
      title: "Request submitted successfully",
      description: `You requested: ${itemNames.join(", ")}`,
    });
    
    // Close the dialog (this will be handled by the DialogClose component)
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-4">
          {selectedItems.map((item, index) => (
            <div key={index} className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor={`item-${index}`} className="mb-2 block">
                  Item {index + 1}
                </Label>
                <Select 
                  value={item.supplyId} 
                  onValueChange={(value) => handleItemChange(index, "supplyId", value)}
                >
                  <SelectTrigger id={`item-${index}`}>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplies.map((supply) => (
                      <SelectItem key={supply.id} value={supply.id}>
                        {supply.name} ({supply.inStock} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-20">
                <Label htmlFor={`quantity-${index}`} className="mb-2 block">
                  Qty
                </Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value, 10) || 1)}
                />
              </div>
              
              {selectedItems.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="mb-0" 
                  onClick={() => handleRemoveItem(index)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleAddItem}
        >
          + Add Another Item
        </Button>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="submit" onClick={handleSubmit}>Submit Request</Button>
        </DialogClose>
      </DialogFooter>
    </form>
  );
}
