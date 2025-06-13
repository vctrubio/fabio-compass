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