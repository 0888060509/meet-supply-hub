
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Form schema with validation
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user"]),
  status: z.enum(["active", "inactive"]),
  changePassword: z.boolean(),
  password: z.string().optional()
    .refine(val => !val || val.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (user: { id: string; username: string; email: string; role: string; status: string }) => void;
  user: { id: string; username: string; email: string; role: string; status: string };
  existingUsers: Array<{ id: string; username: string; email: string }>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onUpdateUser,
  user,
  existingUsers,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email,
      role: user.role as "admin" | "user",
      status: user.status as "active" | "inactive",
      changePassword: false,
      password: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Check if email already exists (for users other than the current one)
    if (existingUsers.some(u => u.id !== user.id && u.email === data.email)) {
      form.setError("email", { 
        type: "manual", 
        message: "Email already in use" 
      });
      return;
    }

    // Submit the data (including password only if it was changed)
    onUpdateUser({
      id: user.id,
      username: user.username,
      email: data.email,
      role: data.role,
      status: data.status,
      // If we needed to handle password updates, we'd include the new password here
    });

    // Reset form
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {/* Username (read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input value={user.username} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Username cannot be changed</p>
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="pointer-events-auto">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="pointer-events-auto">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Change Password Collapsible */}
            <Collapsible 
              open={showPasswordSection} 
              onOpenChange={setShowPasswordSection}
              className="border rounded-md p-2"
            >
              <CollapsibleTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-between">
                  Change Password
                  <span className="text-xs text-muted-foreground">
                    {showPasswordSection ? "Hide" : "Show"}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter new password" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full aspect-square"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Password must be at least 8 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Update User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
