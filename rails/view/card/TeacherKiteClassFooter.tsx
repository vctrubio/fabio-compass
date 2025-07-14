import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { updateLessonStatusAndDuration } from "@/actions/lesson-actions";
import { ChevronUp, ChevronDown, Check, Loader2 } from "lucide-react"; // Import icons
import { Badge } from "@/components/ui/badge"; // Import Badge component

interface TeacherKiteClassFooterProps {
    id: string;
    lesson_id: string;
    status: string;
    location: string;
    time: string;
    eventDate: string;
    duration: number;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

export function TeacherKiteClassFooter({
    id,
    lesson_id,
    status,
    location,
    time,
    eventDate,
    duration,
    isLoading,
    setIsLoading,
}: TeacherKiteClassFooterProps) {
    const [currentDuration, setCurrentDuration] = useState(duration);
    const [continueTomorrow, setContinueTomorrow] = useState(true);

    const isTeacherConfirmation = status === "teacherConfirmation";

    const handleConfirmAction = async () => {
        setIsLoading(true);
        try {
            const newStatus = isTeacherConfirmation ? "completed" : "completed";
            await updateLessonStatusAndDuration(lesson_id, newStatus, currentDuration, continueTomorrow);
            // Optionally, add a success toast or refresh data
        } catch (error) {
            console.error("Failed to update lesson:", error);
            // Optionally, add an error toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleDurationChange = (increment: number) => {
        setCurrentDuration(prev => Math.max(0, prev + increment));
    };

    const getStatusBadgeVariant = (currentStatus: string) => {
        switch (currentStatus) {
            case "completed":
                return "bg-green-500 text-white";
            case "planned":
                return "bg-blue-500 text-white";
            case "teacherConfirmation":
                return "bg-yellow-500 text-black";
            default:
                return "bg-gray-500 text-white";
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-b-lg flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <Badge className={getStatusBadgeVariant(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                <Button
                    onClick={handleConfirmAction}
                    disabled={isLoading || status === "completed"}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Hours:</span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDurationChange(-30)}
                        disabled={isLoading || currentDuration <= 0}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Input
                        type="number"
                        value={currentDuration / 60}
                        onChange={(e) => setCurrentDuration(parseFloat(e.target.value) * 60)}
                        className="w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        disabled={isLoading}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDurationChange(30)}
                        disabled={isLoading}
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Continuing for tomorrow:</span>
                <Checkbox
                    id="continueTomorrow"
                    checked={continueTomorrow}
                    onCheckedChange={(checked) => setContinueTomorrow(checked as boolean)}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}
