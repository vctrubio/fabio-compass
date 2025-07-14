import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { updateLessonStatusAndDuration } from "@/actions/lesson-actions";
import {
    ChevronUp,
    ChevronDown,
    Check,
    Loader2,
    CalendarCheck,
    CalendarX,
    Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeacherKiteClassFooterProps {
    lesson_id: string;
    status: string;
    duration: number;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

export function TeacherKiteClassFooter({
    lesson_id,
    status,
    duration,
    isLoading,
    setIsLoading,
}: TeacherKiteClassFooterProps) {
    const [currentDuration, setCurrentDuration] = useState(duration);
    const [continueTomorrow, setContinueTomorrow] = useState(true);

    const handleConfirmAction = async () => {
        setIsLoading(true);
        try {
            await updateLessonStatusAndDuration(
                lesson_id,
                currentDuration,
                continueTomorrow,
            );
            // Optionally, add a success toast or refresh data
        } catch (error) {
            console.error("Failed to update lesson:", error);
            // Optionally, add an error toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleDurationChange = (increment: number) => {
        setCurrentDuration((prev) => Math.max(0, prev + increment));
    };

    return (
        <div className="p-3 rounded-b-lg flex flex-col gap-2 border-y">
            <div className="flex items-center justify-between mb-2">
                <div className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-1 rounded">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <Button
                    onClick={handleConfirmAction}
                    disabled={isLoading || status === "completed"}
                    size="sm"
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Hours:
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDurationChange(-30)}
                        disabled={isLoading || currentDuration <= 0}
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Input
                        type="number"
                        value={currentDuration / 60}
                        onChange={(e) =>
                            setCurrentDuration(parseFloat(e.target.value) * 60)
                        }
                        className="w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-gray-300 dark:border-gray-600"
                        disabled={isLoading}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDurationChange(30)}
                        disabled={isLoading}
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Continuing for tomorrow:
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setContinueTomorrow((prev) => !prev)}
                    disabled={isLoading}
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {continueTomorrow ? (
                        <CalendarCheck className="h-4 w-4 text-green-600" />
                    ) : (
                        <CalendarX className="h-4 w-4 text-red-600" />
                    )}
                </Button>
            </div>
        </div>
    );
}
