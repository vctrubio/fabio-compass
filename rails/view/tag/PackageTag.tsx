import React from 'react';
import { User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ATag } from './ATag';
import { ENTITY_CONFIGS } from '@/config/entities';

interface PackageTagProps {
    price: number;
    duration: number; // in minutes
    capacity: number;
    className?: string;
}

export default function PackageTag({ price, duration, capacity, className = "" }: PackageTagProps) {
    const hoursDecimal = duration > 0 ? duration / 60 : 0;
    const hours = hoursDecimal % 1 === 0 ? `${Math.floor(hoursDecimal)}h` : `${hoursDecimal.toFixed(1)}h`;
    const avgPricePerHour = duration > 0 ? (price / (duration / 60)).toFixed(0) : 0;
    const PackageIcon = ENTITY_CONFIGS.packages.icon;

    return (
        <ATag icon={<PackageIcon className="w-4 h-4" />} className={className}>

            <span className="text-xs font-semibold">
                €{price}
            </span>

            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs">
                {hours}
            </span>

            <span className="text-xs font-medium bg-orange-200 text-orange-800 rounded px-1">
                €{avgPricePerHour}/h
            </span>

            <Separator orientation="vertical" className="h-4" />

            {/* Capacity Icons */}
            <div className="flex items-center gap-0.5">
                {Array.from({ length: capacity }, (_, index) => (
                    <User key={index} className="w-3 h-3 text-muted-foreground" />
                ))}
            </div>
        </ATag>
    );
}