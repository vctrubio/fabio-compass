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
                "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors",
                "bg-background text-foreground border-border hover:bg-muted",
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </div>
    );
}
