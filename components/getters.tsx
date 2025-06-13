import { Badge } from "@/components/ui/badge";
import { UserType } from "@/rails/model";
import { getRoleColors } from "@/config/entity";

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

export const getRoleBadgeStyle = (role: UserType['role']) => {
  const colors = getRoleColors(role);
  return {
    backgroundColor: colors.secondary,
    color: colors.primary,
    borderColor: colors.primary,
  };
};