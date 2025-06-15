"use client";

import { KiteEventTag } from "@/rails/view/tag/KiteEventTag";
import { StudentTag } from "@/rails/view/tag/StudentTag";
import { HelmetIcon } from "@/assets/svg/HelmetIcon";
import { formatDuration } from "@/components/formatters";
import { MoreHorizontal, MapPin, Trash2 } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateKiteEventLocation, deleteKiteEvent } from "@/actions/kite-actions";

interface EventCardProps {
    event: {
        id: string;
        time: string;
        duration: number;
        date: string;
        status: string;
        location: string;
        students: Array<{
            id: string;
            name: string;
        }>;
    };
    viewMode?: 'grid' | 'print';
    showDropdown?: boolean;
}

export function EventCard({ 
    event, 
    viewMode = 'grid', 
    showDropdown = true 
}: EventCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLocationUpdate = async (newLocation: string) => {
        if (newLocation === event.location) return;
        
        setIsLoading(true);
        try {
            const result = await updateKiteEventLocation(event.id, newLocation as 'Los Lances' | 'Valdevaqueros');
            if (!result.success) {
                console.error('Failed to update location:', result.error);
            }
        } catch (error) {
            console.error('Failed to update location:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        
        setIsLoading(true);
        try {
            const result = await deleteKiteEvent(event.id);
            if (!result.success) {
                console.error('Failed to delete event:', result.error);
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create kite event object for the tag
    const kiteEventForTag = {
        id: event.id,
        duration: event.duration,
        date: event.date,
        status: event.status,
        location: event.location,
        equipments: []
    };

    if (viewMode === 'print') {
        return (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-3 space-y-3">
                {/* Duration and Location Header */}
                <div className="flex items-center justify-between px-3">
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                        {formatDuration(event.duration)}
                    </div>
                    {event.location && (
                        <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                            📍 {event.location}
                        </div>
                    )}
                </div>
                
                {/* Students Section */}
                {event.students.length > 0 && (
                    <div className="space-y-2">
                       
                        <div className="flex flex-wrap gap-2">
                            {event.students.map(student => (
                                <div key={student.id} className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-3 py-1.5 rounded-full text-xl font-medium">
                                    <HelmetIcon className="w-4 h-4" />
                                    {student.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg w-full p-2">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <KiteEventTag kiteEvent={kiteEventForTag} viewFull={false} />
                </div>
                {showDropdown && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="p-1 rounded-md hover:bg-muted transition-colors ml-2"
                                disabled={isLoading}
                                type="button"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-[180px]" sideOffset={5}>
                            {/* Location Updates */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <MapPin className="w-3 h-3" />
                                    Change Location
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem
                                        onClick={() => handleLocationUpdate('Los Lances')}
                                        disabled={event.location === 'Los Lances' || isLoading}
                                    >
                                        <MapPin className="w-3 h-3" />
                                        Los Lances
                                        {event.location === 'Los Lances' && <span className="ml-auto text-xs">✓</span>}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleLocationUpdate('Valdevaqueros')}
                                        disabled={event.location === 'Valdevaqueros' || isLoading}
                                    >
                                        <MapPin className="w-3 h-3" />
                                        Valdevaqueros
                                        {event.location === 'Valdevaqueros' && <span className="ml-auto text-xs">✓</span>}
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator />

                            {/* Delete */}
                            <DropdownMenuItem
                                className="hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                <Trash2 className="w-3 h-3" />
                                Delete Event
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            {event.students.length > 0 && (
                <div className="mt-2 ml-2">
                    {event.students.map(student => (
                        <StudentTag
                            key={student.id}
                            name={student.name}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}