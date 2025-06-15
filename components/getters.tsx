import { Badge } from "@/components/ui/badge";
import { UserType } from "@/rails/model";
import { ENTITY_COLORS } from "@/config/entities";

export const getLanguageBadge = (languages: string[]) => {
    return languages.map((lang, index) => (
        <Badge key={index} variant="outline" className="mr-1">
            {lang}
        </Badge>
    ));
};

export const getRoleBadgeVariant = (role: UserType['role']) => {
    switch (role) {
        case 'admin':
        case 'teacherAdmin':
            return 'destructive';
        case 'teacher':
            return 'default';
        case 'student':
            return 'secondary';
        case 'pendingStudent':
        case 'pendingTeacher':
        case 'pendingAdmin':
            return 'outline';
        case 'disabled':
            return 'destructive';
        default:
            return 'outline';
    }
};

export const getUserRoleColor = (role: UserType['role']) => {
    switch (role) {
        case 'student':
        case 'pendingStudent':
            return ENTITY_COLORS.students;
        case 'teacher':
        case 'teacherAdmin':
        case 'pendingTeacher':
            return ENTITY_COLORS.teachers;
        case 'admin':
        case 'pendingAdmin':
            return ENTITY_COLORS.admin;
        default:
            return ENTITY_COLORS.admin; // fallback
    }
};

export const getRoleBadgeStyle = (role: UserType['role']) => {
    const colors = getUserRoleColor(role);
    return {
        backgroundColor: colors.secondary,
        color: colors.primary,
        borderColor: colors.primary,
    };
};

// Date string getters - Spanish months with ES timezone
export const getDateString = (date: Date) => {
    const month = date.toLocaleString("es-ES", { month: "long", timeZone: "Europe/Madrid" });
    const day = date.getDate();
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear !== year ? `${month} ${day}, ${year}` : `${month} ${day}`;
};

// Date string with day of the week - always displays weekday
export const getDateStringWithWeek = (date: Date) => {
    const weekday = date.toLocaleString("es-ES", { weekday: "long", timeZone: "Europe/Madrid" });
    const month = date.toLocaleString("es-ES", { month: "long", timeZone: "Europe/Madrid" });
    const day = date.getDate();
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear !== year ? `${weekday}, ${month} ${day}, ${year}` : `${weekday}, ${month} ${day}`;
};

// Time formatter - formats date to HH:MM
export const getTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

/**
 * Creates a Date object that when converted to ISO string, maintains the Madrid time correctly
 * This function handles the timezone conversion properly for database storage
 */
export const createMadridDateTime = (baseDate: Date, timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Get the date components from baseDate
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();
    
    // Create a date string in Madrid timezone format (ISO format interpreted as local time)
    // We need to create the date as if it's UTC so when it gets stored in database as UTC,
    // it will display correctly in Madrid timezone
    const madridDateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000Z`;
    
    return new Date(madridDateString);
};