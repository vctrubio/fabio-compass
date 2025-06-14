import React from 'react';
import { cn } from "@/lib/utils";

export interface ALinkProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: React.ReactNode;
    children: React.ReactNode;
}

export function ALink({ icon, children, className, ...props }: ALinkProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-gray-300 cursor-pointer hover:border-orange-400 hover:opacity-80 transition-all duration-300 ease-in-out",
                className
            )}
            {...props}
        >
            {icon}
            <span className="flex items-center gap-0.5">
                <span className="text-orange-500 font-medium">!</span>
                {children}
            </span>
        </div>
    );
}
