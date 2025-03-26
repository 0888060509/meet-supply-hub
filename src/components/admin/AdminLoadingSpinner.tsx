
import React from "react";

interface AdminLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AdminLoadingSpinner({ 
  size = "md", 
  className 
}: AdminLoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-t-transparent border-primary ${sizeClasses[size]} ${className}`}
      />
    </div>
  );
}
