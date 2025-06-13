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
    disabled?: boolean;
}

export function DropdownTag({ 
    currentValue, 
    options, 
    onSelect, 
    currentColorClass,
    className,
    disabled = false
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
            <DropdownMenuTrigger asChild disabled={disabled}>
                <span className={`text-xs font-medium rounded-md px-2 py-1 inline-flex items-center gap-1.5 transition-opacity ${currentColorClass} ${className || ''} ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}>
                    {currentValue}
                    <ChevronDown className="w-3 h-3" />
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px] p-1">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className="text-sm hover:bg-transparent focus:bg-transparent p-1 cursor-pointer"
                        disabled={disabled}
                    >
                        <span className={`w-full inline-flex items-center justify-between text-xs font-medium rounded-md px-2 py-1.5 ${option.colorClass}`}>
                            {option.label}
                            {option.value === currentValue && (
                                <span className="text-xs opacity-70">✓</span>
                            )}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}