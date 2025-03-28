
import React from "react";
import { LucideIcon } from "lucide-react";

interface ManagementHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

const ManagementHeader = ({
  title,
  description,
  icon: Icon
}: ManagementHeaderProps) => {
  return (
    <div className="flex items-center mb-8">
      {Icon && <Icon className="h-8 w-8 mr-4 text-primary" />}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

export default ManagementHeader;
