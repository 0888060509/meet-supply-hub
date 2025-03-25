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

interface User {
  id: string;
  username: string;
  name: string;
  role: "admin" | "employee";
}

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserProfileModal({ open, onOpenChange, user }: UserProfileModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <p className="text-muted-foreground">{user.name}</p>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to User List
            </Button>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
