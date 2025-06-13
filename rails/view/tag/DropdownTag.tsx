import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DropdownOption {
    value: string;
    label: string;
    colorClass: string;
}

interface DropdownTagProps {
    currentValue: string;
    options: DropdownOption[];
    onSelect: (value: string) => void;
    currentColorClass: string;
    className?: string;
}

export function DropdownTag({ 
    currentValue, 
    options, 
    onSelect, 
    currentColorClass,
    className 
}: DropdownTagProps) {
    const handleSelect = (selectedValue: string) => {
        // Only call onSelect if the selected value is different from current
        if (selectedValue !== currentValue) {
            console.log(`Status change: ${currentValue} → ${selectedValue}`);
            onSelect(selectedValue);
        } else {
            console.log(`No change needed: ${selectedValue} is already selected`);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <span className={`text-xs font-medium rounded px-1 cursor-pointer hover:opacity-80 inline-flex items-center gap-1 transition-opacity ${currentColorClass} ${className}`}>
                    {currentValue}
                    <ChevronDown className="w-3 h-3" />
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[120px]">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`text-sm ${option.value === currentValue ? 'bg-accent' : ''}`}
                    >
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${option.colorClass}`} />
                        {option.label}
                        {option.value === currentValue && (
                            <span className="ml-auto text-xs text-muted-foreground">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}