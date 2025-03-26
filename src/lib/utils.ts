import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * This background color is used for the sidebar.
 * --sidebar = hsl(0 0% 100%);
 * --sidebar-foreground = hsl(222.2 47.4% 11.2%);
 * --sidebar-border = hsl(214.3 31.8% 91.4%);
 * --sidebar-ring = hsl(215 20.2% 65.1%);
 * --sidebar-accent = hsl(210 40% 96.1%);
 * --sidebar-accent-foreground = hsl(222.2 47.4% 11.2%);
 */
