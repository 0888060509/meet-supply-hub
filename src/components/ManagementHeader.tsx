import { LucideIcon } from "lucide-react";

interface ManagementHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const ManagementHeader = ({ title, description, icon: Icon }: ManagementHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}; 