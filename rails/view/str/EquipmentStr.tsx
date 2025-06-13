import React from 'react';
import { AStr } from './AStr';
import { Separator } from '@/components/ui/separator';
import { ENTITY_CONFIGS } from '@/config/entities';

interface EquipmentStrProps {
    id?: string;
    serialId?: string;
    type?: string;
    model?: string;
    size?: number;
    className?: string;
}

export function EquipmentStr({ 
    id, 
    serialId, 
    type, 
    model, 
    size, 
    className 
}: EquipmentStrProps) {
    const EquipmentIcon = ENTITY_CONFIGS.equipments.icon;
    
    // Use serialId if available, otherwise use truncated id, otherwise fallback
    const displayId = serialId || (id ? `#${id.slice(0, 8)}` : 'Unknown');
    
    return (
        <AStr
            icon={<EquipmentIcon className="w-4 h-4" />}
            className={className}
        >
            {model && (
                <>
                    <span>{model}</span>
                    {(size || type || displayId) && <Separator orientation="vertical" className="h-4" />}
                </>
            )}
            
            {size && (
                <>
                    <span>{size}</span>
                    {(type || displayId) && <Separator orientation="vertical" className="h-4" />}
                </>
            )}
            
            {type && (
                <>
                    <span>{type}</span>
                    {displayId && <Separator orientation="vertical" className="h-4" />}
                </>
            )}
            
            <span className="text-muted-foreground">{displayId}</span>
        </AStr>
    );
}
