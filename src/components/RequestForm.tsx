
import { useState } from "react";
import { Supply, supplies } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Send } from "lucide-react";

interface RequestItem {
  supplyId: string;
  quantity: number;
}

interface RequestFormProps {
  onSubmit: (items: RequestItem[]) => void;
}

const RequestForm = ({ onSubmit }: RequestFormProps) => {
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [items, setItems] = useState<RequestItem[]>([]);
  
  const availableSupplies = supplies.filter(
    supply => supply.inStock > 0 && 
    !items.some(item => item.supplyId === supply.id)
  );
  
  const selectedSupply = supplies.find(supply => supply.id === selectedSupplyId);
  
  const handleAddItem = () => {
    if (!selectedSupplyId || quantity <= 0) {
      toast.error("Please select an item and quantity");
      return;
    }
    
    if (selectedSupply && quantity > selectedSupply.inStock) {
      toast.error(`Only ${selectedSupply.inStock} units available`);
      return;
    }
    
    setItems([...items, { supplyId: selectedSupplyId, quantity }]);
    setSelectedSupplyId("");
    setQuantity(1);
  };
  
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const handleSubmitRequest = () => {
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    
    onSubmit(items);
    setItems([]);
  };
  
  const getSupplyById = (id: string): Supply | undefined => {
    return supplies.find(supply => supply.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-end">
        <div>
          <Label htmlFor="supply">Item</Label>
          <Select 
            value={selectedSupplyId} 
            onValueChange={setSelectedSupplyId}
          >
            <SelectTrigger id="supply">
              <SelectValue placeholder="Select an item" />
            </SelectTrigger>
            <SelectContent>
              {availableSupplies.map((supply) => (
                <SelectItem key={supply.id} value={supply.id}>
                  {supply.name} ({supply.inStock} available)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={selectedSupply?.inStock || 1}
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value > 0) {
                setQuantity(Math.min(value, selectedSupply?.inStock || 1));
              }
            }}
          />
        </div>
        
        <Button 
          onClick={handleAddItem}
          disabled={!selectedSupplyId || quantity <= 0}
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      
      {items.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const supply = getSupplyById(item.supplyId);
                return (
                  <TableRow key={index}>
                    <TableCell>{supply?.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Button 
        className="w-full" 
        onClick={handleSubmitRequest}
        disabled={items.length === 0}
      >
        <Send className="h-4 w-4 mr-2" />
        Submit Request
      </Button>
    </div>
  );
};

export default RequestForm;
