import React from 'react';
import { cn } from "@/lib/utils";

export interface ATagProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: React.ReactNode;
    children: React.ReactNode;
}

export function ATag({ icon, children, className, ...props }: ATagProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors",
                "text-foreground",
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </div>
    );
}