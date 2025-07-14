import { useState } from "react";
import { MapPin, MoreHorizontal, Trash2, Clock } from "lucide-react";
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
import {
    updateKiteEventLocation,
    deleteKiteEvent,
    updateKiteEventStatus,
    updateKiteEventTime,
} from "@/actions/kite-actions";

interface KiteClassFooterProps {
    id: string;
    status: string;
    location: string;
    time: string;
    eventDate: string; // The full date string from the event
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export function KiteClassFooter({
    id,
    status,
    location,
    time,
    eventDate,
    isLoading,
    setIsLoading,
}: KiteClassFooterProps) {
    const [editedTime, setEditedTime] = useState(time);

    const handleLocationUpdate = async (newLocation: string) => {
        if (newLocation === location) return;

        setIsLoading(true);
        try {
            const result = await updateKiteEventLocation(
                id,
                newLocation as "Los Lances" | "Valdevaqueros",
            );
            if (!result.success) {
                console.error("Failed to update location:", result.error);
            }
        } catch (error) {
            console.error("Failed to update location:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (newStatus === status) return;

        setIsLoading(true);
        try {
            const result = await updateKiteEventStatus(id, newStatus);
            if (!result.success) {
                console.error("Failed to update status:", result.error);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        setIsLoading(true);
        try {
            const result = await deleteKiteEvent(id);
            if (!result.success) {
                console.error("Failed to delete event:", result.error);
            }
        } catch (error) {
            console.error("Failed to delete event:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-2 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-900 rounded-b-lg mt-auto">
            <span className={`text-xs font-medium capitalize ${
                status.includes('planned') ? 'text-blue-500 dark:text-blue-400' :
                status.includes('Confirmation') ? 'text-purple-500 dark:text-purple-400' :
                status.includes('completed') ? 'text-green-500 dark:text-green-400' :
                'text-gray-500 dark:text-gray-400'
            }`}>
                {status.replace('plannedAuto', 'Planned').replace('teacherConfirmation', 'Confirmation')}
            </span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="p-1 rounded-md hover:bg-muted transition-colors"
                        disabled={isLoading}
                        type="button"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[180px]" sideOffset={5}>
                    {/* Update Location */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <MapPin className="w-3 h-3 mr-2" />
                            Change Location
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem
                                onClick={() => handleLocationUpdate('Los Lances')}
                                disabled={location === 'Los Lances' || isLoading}
                            >
                                Los Lances
                                {location === 'Los Lances' && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleLocationUpdate('Valdevaqueros')}
                                disabled={location === 'Valdevaqueros' || isLoading}
                            >
                                Valdevaqueros
                                {location === 'Valdevaqueros' && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Update Time */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Clock className="w-3 h-3 mr-2" />
                            Change Time
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <div className="p-2">
                                <input
                                    type="time"
                                    value={editedTime}
                                    onChange={(e) => setEditedTime(e.target.value)}
                                    className="w-full p-1 border rounded-md text-sm"
                                />
                                <button
                                    onClick={async () => {
                                        setIsLoading(true);
                                        try {
                                            const result = await updateKiteEventTime(id, editedTime, eventDate);
                                            if (!result.success) {
                                                console.error("Failed to update time:", result.error);
                                            }
                                        } catch (error) {
                                            console.error("Failed to update time:", error);
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                    disabled={isLoading || editedTime === time}
                                    className="mt-2 w-full bg-blue-500 text-white py-1 px-2 rounded-md text-sm hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    Update Time
                                </button>
                            </div>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Update Status */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Clock className="w-3 h-3 mr-2" />
                            Change Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem
                                onClick={() => handleStatusUpdate('planned')}
                                disabled={status === 'planned' || isLoading}
                            >
                                Planned
                                {status === 'planned' && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleStatusUpdate('completed')}
                                disabled={status === 'completed' || isLoading}
                            >
                                Completed
                                {status === 'completed' && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleStatusUpdate('teacherConfirmation')}
                                disabled={status === 'teacherConfirmation' || isLoading}
                            >
                                Teacher Confirmation
                                {status === 'teacherConfirmation' && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleStatusUpdate('plannedAuto')}
                                disabled={status === 'plannedAuto' || isLoading}
                            >
                                Planned Auto
                                {status === 'plannedAuto' && <span className="ml-auto text-xs">✓</span>}
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
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete Event
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
