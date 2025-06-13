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

// Date formatting functions for consistent date display across the app
// Using explicit locale and timezone to prevent hydration mismatches
export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/New_York'
  });
};

export const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });
};

export const formatDateRange = (startDate: string | Date, endDate: string | Date) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const formatTimeRange = (startDate: string | Date, endDate: string | Date) => {
  return `${formatTime(startDate)} - ${formatTime(endDate)}`;
};

export const formatDateTime = (date: string | Date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatDateTimeRange = (startDate: string | Date, endDate: string | Date) => {
  return `${formatDateTime(startDate)} - ${formatDateTime(endDate)}`;
};