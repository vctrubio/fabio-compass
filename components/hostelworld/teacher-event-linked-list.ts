import { KiteEventData, TeacherLessonEvent } from './types';

/**
 * Node in the linked list representing a kite event
 */
export class KiteEventNode {
    public event: KiteEventData;
    public next: KiteEventNode | null = null;
    public gapAfter: number = 0; // Gap in minutes after this event

    constructor(event: KiteEventData) {
        this.event = event;
    }

    /**
     * Calculate gap after this event to the next one
     */
    calculateGapToNext(): void {
        if (!this.next) {
            this.gapAfter = 0;
            return;
        }

        const currentEndTime = this.getEndTime();
        const nextStartTime = this.next.getStartTime();
        
        this.gapAfter = nextStartTime - currentEndTime;
    }

    /**
     * Get start time in minutes from midnight
     */
    getStartTime(): number {
        const [hours, minutes] = this.event.time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Get end time in minutes from midnight
     */
    getEndTime(): number {
        return this.getStartTime() + this.event.duration;
    }

    /**
     * Check if there's a problematic gap after this event
     */
    hasProblematicGap(): boolean {
        return this.gapAfter > 0; // Any gap is considered problematic for teachers
    }
}

/**
 * Teacher node that holds a linked list of kite events
 */
export class TeacherNode {
    public teacher: TeacherLessonEvent;
    public eventHead: KiteEventNode | null = null;
    public eventCount: number = 0;

    constructor(teacher: TeacherLessonEvent) {
        this.teacher = teacher;
    }

    /**
     * Add a kite event to this teacher's linked list
     */
    addEvent(event: KiteEventData): void {
        const newNode = new KiteEventNode(event);
        
        if (!this.eventHead) {
            this.eventHead = newNode;
        } else {
            let current = this.eventHead;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        
        this.eventCount++;
        
        // Calculate gaps after adding all events
        this.calculateAllGaps();
    }

    /**
     * Calculate gaps between all consecutive events
     */
    private calculateAllGaps(): void {
        let current = this.eventHead;
        while (current) {
            current.calculateGapToNext();
            current = current.next;
        }
    }

    /**
     * Get all gaps in this teacher's schedule
     */
    getAllGaps(): number[] {
        const gaps: number[] = [];
        let current = this.eventHead;
        while (current) {
            if (current.gapAfter > 0) {
                gaps.push(current.gapAfter);
            }
            current = current.next;
        }
        return gaps;
    }

    /**
     * Check if teacher has any events
     */
    hasEvents(): boolean {
        return this.eventHead !== null;
    }

    /**
     * Get all events as an array
     */
    getAllEvents(): KiteEventData[] {
        const events: KiteEventData[] = [];
        let current = this.eventHead;
        while (current) {
            events.push(current.event);
            current = current.next;
        }
        return events;
    }

    /**
     * Check availability for a new lesson at a specific time
     */
    getAvailabilityAt(startTime: string, duration: number): {
        calculatedTime: string;
        conflicts: any[];
        endTime: string;
    } {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + duration;

        const conflicts: any[] = [];
        let calculatedTime = startTime;

        // Check against all existing events
        let current = this.eventHead;
        while (current) {
            const eventStart = current.getStartTime();
            const eventEnd = current.getEndTime();

            // Check for overlap
            if (startMinutes < eventEnd && endMinutes > eventStart) {
                conflicts.push({
                    type: 'event',
                    time: current.event.time,
                    duration: current.event.duration
                });

                // Suggest time after this event
                const suggestedMinutes = eventEnd;
                const suggestedHours = Math.floor(suggestedMinutes / 60);
                const suggestedMins = suggestedMinutes % 60;
                calculatedTime = `${suggestedHours.toString().padStart(2, '0')}:${suggestedMins.toString().padStart(2, '0')}`;
            }

            current = current.next;
        }

        // Calculate end time
        const [calcHours, calcMinutes] = calculatedTime.split(':').map(Number);
        const calcEndMinutes = (calcHours * 60 + calcMinutes) + duration;
        const endHours = Math.floor(calcEndMinutes / 60);
        const endMins = calcEndMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

        return {
            calculatedTime,
            conflicts,
            endTime
        };
    }
}

/**
 * Main linked list structure that holds all teachers and their events
 */
export class TeacherEventLinkedList {
    private teachers: Map<string, TeacherNode> = new Map();

    constructor(teacherEvents: TeacherLessonEvent[], kiteEvents: KiteEventData[]) {
        // Initialize teachers
        teacherEvents.forEach(teacherEvent => {
            const teacherNode = new TeacherNode(teacherEvent);
            this.teachers.set(teacherEvent.teacher.model.id, teacherNode);
        });

        // Add events to their respective teachers
        kiteEvents.forEach(event => {
            const teacherNode = this.teachers.get(event.teacher.id);
            if (teacherNode) {
                teacherNode.addEvent(event);
            }
        });
    }

    /**
     * Get a teacher by ID
     */
    getTeacherById(teacherId: string): TeacherNode | undefined {
        return this.teachers.get(teacherId);
    }

    /**
     * Get all teachers
     */
    getTeachers(): TeacherNode[] {
        return Array.from(this.teachers.values());
    }

    /**
     * Get teacher lesson availability for scheduling
     */
    getTeacherLessonAvailability(
        teacherId: string, 
        requestedTime: string, 
        duration: number = 120, 
        existingEvents: any[] = []
    ): {
        calculatedTime: string;
        conflicts: any[];
        endTime: string;
    } {
        const teacherNode = this.teachers.get(teacherId);
        
        if (!teacherNode) {
            // If teacher not found, return the requested time
            const [hours, minutes] = requestedTime.split(':').map(Number);
            const endMinutes = (hours * 60 + minutes) + duration;
            const endHours = Math.floor(endMinutes / 60);
            const endMins = endMinutes % 60;
            const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

            return {
                calculatedTime: requestedTime,
                conflicts: [],
                endTime
            };
        }

        return teacherNode.getAvailabilityAt(requestedTime, duration);
    }

    /**
     * Get summary statistics
     */
    getSummary(): {
        totalTeachers: number;
        totalEvents: number;
        averageEventsPerTeacher: number;
    } {
        const totalEvents = Array.from(this.teachers.values()).reduce((sum, teacher) => sum + teacher.eventCount, 0);
        
        return {
            totalTeachers: this.teachers.size,
            totalEvents,
            averageEventsPerTeacher: this.teachers.size > 0 ? totalEvents / this.teachers.size : 0
        };
    }
}