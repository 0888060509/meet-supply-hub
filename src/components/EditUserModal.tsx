import React, { useState, useEffect } from "react";
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
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, RoleId } from "@/lib/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate, useSearchParams } from "react-router-dom";

// Form schema with validation
const formSchema = z.object({
  username: z.string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters"),
  name: z.string()
    .min(1, "Name is required"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  role: z.nativeEnum(RoleId, {
    required_error: "Role is required"
  }),
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required"
  }),
  changePassword: z.boolean(),
  password: z.string().optional()
    .refine(val => !val || val.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: User;
  onSubmit: (values: FormValues) => void;
  errors?: Record<string, string[]>;
}

export const EditUserModal = ({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  errors = {}
}: EditUserModalProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: defaultValues.username,
      name: defaultValues.name,
      email: defaultValues.email,
      role: defaultValues.roles.includes(RoleId.Admin) ? RoleId.Admin : RoleId.Employee,
      status: defaultValues.status,
      changePassword: false,
      password: ''
    }
  });

  // Reset form errors when modal closes
  useEffect(() => {
    if (!open) {
      form.clearErrors();
    }
  }, [open, form]);

  // Set server-side errors
  useEffect(() => {
    Object.entries(errors).forEach(([key, messages]) => {
      form.setError(key as keyof FormValues, {
        type: 'server',
        message: messages[0]
      });
    });
  }, [errors, form]);

  // Reset form when modal opens with new defaultValues
  useEffect(() => {
    if (open) {
      form.reset({
        username: defaultValues.username,
        name: defaultValues.name,
        email: defaultValues.email,
        role: defaultValues.roles.includes(RoleId.Admin) ? RoleId.Admin : RoleId.Employee,
        status: defaultValues.status,
        changePassword: false,
        password: ''
      });
      setChangePassword(false);
      setHasChanges(false);
    }
  }, [open, defaultValues, form]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      const formValues = form.getValues();
      const currentRole = defaultValues.roles.includes(RoleId.Admin) ? RoleId.Admin : RoleId.Employee;
      const hasFormChanges = 
        formValues.username !== defaultValues.username ||
        formValues.name !== defaultValues.name ||
        formValues.email !== defaultValues.email ||
        formValues.role !== currentRole ||
        formValues.status !== defaultValues.status ||
        (changePassword && formValues.password !== "");
      
      setHasChanges(hasFormChanges);
    });
    return () => subscription.unsubscribe();
  }, [form, defaultValues, changePassword]);

  const handleDiscard = () => {
    setShowDiscardDialog(false);
    setHasChanges(false);
    form.reset();
    setChangePassword(false);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasChanges) {
      setShowDiscardDialog(true);
    } else {
      onOpenChange(newOpen);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
    setHasChanges(false);
    // Clear URL query parameters
    const params = new URLSearchParams(searchParams.toString());
    params.delete('edit');
    navigate(`?${params.toString()}`, { replace: true });
    // Close the modal
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
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
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as RoleId)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={RoleId.Admin}>Administrator</SelectItem>
                        <SelectItem value={RoleId.Employee}>Employee</SelectItem>
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
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="changePassword"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Change Password
                      </FormLabel>
                      <FormDescription>
                        Check this to set a new password for the user
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("changePassword") && (
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
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Must be at least 8 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDiscardDialog(false)}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
