
import { useState } from "react";
import { Supply } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle2, Package } from "lucide-react";

interface SupplyCardProps {
  supply: Supply;
  onRequest: (supplyId: string, quantity: number) => void;
}

const SupplyCard = ({ supply, onRequest }: SupplyCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= supply.inStock) {
      setQuantity(value);
    }
  };

  const handleRequest = () => {
    onRequest(supply.id, quantity);
    setQuantity(1);
  };

  return (
    <Card className="overflow-hidden hover-lift">
      <div className="relative h-40 overflow-hidden bg-accent/20">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-accent animate-pulse flex items-center justify-center">
            <Package className="h-10 w-10 text-muted" />
          </div>
        )}
        <img
          src={supply.image}
          alt={supply.name}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{supply.name}</CardTitle>
          <Badge variant={supply.inStock > 10 ? "outline" : "secondary"} className="ml-2">
            {supply.inStock > 0 ? `${supply.inStock} in stock` : "Out of stock"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">Category: {supply.category}</p>
      </CardContent>
      
      <CardFooter className="p-4 flex justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={supply.inStock === 0}
            >
              Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request {supply.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded overflow-hidden bg-accent/20">
                  <img 
                    src={supply.image} 
                    alt={supply.name} 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="font-medium">{supply.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {supply.inStock} available
                  </p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={supply.inStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleRequest}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Request
            </Button>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default SupplyCard;
