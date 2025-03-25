
import React from "react";
import { ArrowLeft, Edit, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { username: string; email: string; role: string; status: string };
  onEditUser: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onEditUser,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="pt-4 space-y-6">
          {/* User Info Card */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{user.username}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                  {user.role === "admin" ? (
                    <ShieldAlert className="mr-1 h-3 w-3" />
                  ) : (
                    <ShieldCheck className="mr-1 h-3 w-3" />
                  )}
                  {user.role}
                </Badge>
                
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${
                    user.status === "active" ? "bg-green-500" : "bg-red-500"
                  }`} />
                  <span className={`text-sm ${
                    user.status === "active" ? "text-green-600" : "text-red-600"
                  } capitalize`}>{user.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Two-Factor Authentication Placeholder */}
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2 italic">
              Google Authenticator integration will be available in future updates.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to User List
            </Button>
            <Button onClick={onEditUser}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
