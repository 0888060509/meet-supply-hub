
import { useState, useEffect } from "react";
import { supplies } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Trash2, MinusCircle, PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RequestFormProps {
  onSubmit: (items: { supplyId: string; quantity: number }[], notes?: string) => void;
  initialItems?: { supplyId: string; quantity: number }[];
  onUpdateItems?: (items: { supplyId: string; quantity: number }[]) => void;
}

const RequestForm = ({ 
  onSubmit, 
  initialItems = [], 
  onUpdateItems 
}: RequestFormProps) => {
  const [items, setItems] = useState<{ supplyId: string; quantity: number }[]>(initialItems);
  const [notes, setNotes] = useState("");

  // Update local items whenever initialItems changes
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const supply = supplies.find(s => s.id === items[index].supplyId);
    if (supply && newQuantity > supply.inStock) return;
    
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    setItems(updatedItems);
    
    // Notify parent component of changes if callback exists
    if (onUpdateItems) {
      onUpdateItems(updatedItems);
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    
    // Notify parent component of changes if callback exists
    if (onUpdateItems) {
      onUpdateItems(updatedItems);
    }
  };

  const handleSubmit = () => {
    onSubmit(items, notes);
  };

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            Your request is empty. Add items from the supplies page.
          </p>
        </div>
      ) : (
        <ScrollArea className={cn("pr-4", items.length > 3 ? "max-h-[300px]" : "")}>
          <div className="space-y-4">
            {items.map((item, index) => {
              const supply = supplies.find(s => s.id === item.supplyId);
              return (
                <div key={index} className="flex items-center justify-between border p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-accent/20 rounded overflow-hidden">
                      {supply?.image && (
                        <img 
                          src={supply.image} 
                          alt={supply?.name} 
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{supply?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {supply?.category} · {supply?.inStock} available
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        min={1}
                        max={supply?.inStock || 999}
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) {
                            handleQuantityChange(index, value);
                          }
                        }}
                        className="w-16 h-8 text-center mx-1"
                      />
                      
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                        disabled={item.quantity >= (supply?.inStock || 999)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveItem(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
      
      <Separator />
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional information or special requirements"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-20"
          />
        </div>
        
        <Button
          type="button"
          onClick={handleSubmit}
          className="w-full"
          disabled={items.length === 0}
        >
          Submit Request
        </Button>
      </div>
    </div>
  );
};

export default RequestForm;
