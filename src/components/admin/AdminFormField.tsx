
import React, { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AdminFormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: ReactNode;
  description?: string;
}

export function AdminFormField({
  label,
  htmlFor,
  error,
  className,
  children,
  description,
}: AdminFormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={htmlFor} 
        className={cn(error && "text-destructive")}
      >
        {label}
      </Label>
      
      {children}
      
      {description && !error && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
