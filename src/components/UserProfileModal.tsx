import React from "react";
import { ArrowLeft, Edit, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, RoleId } from "@/lib/api";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onEdit: () => void;
}

export const UserProfileModal = ({
  open,
  onOpenChange,
  user,
  onEdit
}: UserProfileModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        {/* User Info Card */}
        <div className="bg-[#F9FAFB] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-[#667085]">{user.email}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant="default" 
                className="bg-[#101828] text-white flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                {user.roles.map((roleId) => (
                  <span key={roleId}>
                    {roleId === RoleId.Admin ? 'Administrator' : 'Employee'}
                  </span>
                ))}
              </Badge>
              <Badge 
                variant="outline" 
                className={user.status === 'active' 
                  ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
                  : 'bg-[#FEF3F2] text-[#B42318] border-[#FEC6C3]'
                }
              >
                {user.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication Section */}
        <div className="rounded-lg border border-[#EAECF0] p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Two-Factor Authentication</h3>
            <Badge variant="outline" className="bg-[#F9F5FF] text-[#6941C6] border-[#E9D7FE]">
              Coming Soon
            </Badge>
          </div>
          <p className="text-sm text-[#667085] mt-2 italic">
            Google Authenticator integration will be available in future updates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex items-center border-[#D0D5DD] text-[#344054]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User List
          </Button>
          <Button 
            onClick={onEdit} 
            className="flex items-center bg-[#101828] hover:bg-[#000000]"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
