import React from 'react';
import { cn } from "@/lib/utils";

/* NOTE
tag should always have values passed as props
str ... in another model... should take the self and display the values
card ... in another model... should take the object of the model, and call relatable tags 

*/


export interface ATagProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: React.ReactNode;
    children: React.ReactNode;
}

export function ATag({ icon, children, className, ...props }: ATagProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors",
                "bg-background text-foreground border-border",
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </div>
    );
}