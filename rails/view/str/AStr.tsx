import React from 'react';
import { cn } from "@/lib/utils";

export interface AStrProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: React.ReactNode;
    children: React.ReactNode;
}

export function AStr({ icon, children, className, ...props }: AStrProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                // Border class is conditional based on the className passed from parent
                !className?.includes("border-none") && "border border-border", 
                "bg-background text-foreground hover:bg-muted",
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </div>
    );
}
