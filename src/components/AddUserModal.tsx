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
import { RoleId } from "@/lib/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  password: z.string()
    .min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => void;
  errors?: Record<string, string[]>;
}

export const AddUserModal = ({
  open,
  onOpenChange,
  onSubmit,
  errors = {}
}: AddUserModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      role: RoleId.Employee,
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

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset();
      setHasChanges(false);
    }
  }, [open, form]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleDiscard = () => {
    setShowDiscardDialog(false);
    setHasChanges(false);
    form.reset();
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
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
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
                    <FormMessage>{errors?.username?.[0]}</FormMessage>
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
                    <FormMessage>{errors?.name?.[0]}</FormMessage>
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
                    <FormMessage>{errors?.email?.[0]}</FormMessage>
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
                    <FormMessage>{errors?.role?.[0]}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
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
                    <FormMessage>{errors?.password?.[0]}</FormMessage>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Add User</Button>
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
