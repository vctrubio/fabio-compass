import React from 'react';
import { ATag } from './ATag';
import { Separator } from '@/components/ui/separator';
import { ENTITY_CONFIGS } from '@/config/entities';
import { EquipmentType } from "@/rails/model/EquipmentModel";

interface EquipmentTagProps {
    equipment: EquipmentType;
}

export function EquipmentTag({ equipment }: EquipmentTagProps) {
    const EquipmentIcon = ENTITY_CONFIGS.equipments.icon;
    
    const id = equipment.id;
    const serialId = equipment.serial_id;
    const type = equipment.type;
    const model = equipment.model;
    const size = equipment.size;
    
    // Use serialId if available, otherwise use truncated id, otherwise fallback
    const displayId = serialId || (id ? `#${id.slice(0, 8)}` : 'Unknown');
    
    return (
        <ATag
            icon={<EquipmentIcon className="w-4 h-4" />}
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
        </ATag>
    );
}
