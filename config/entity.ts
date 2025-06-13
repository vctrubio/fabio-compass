export const ENTITY_COLORS = {
  students: {
    primary: 'hsl(var(--orange-cabrinha))', // Orange-cabrinha from globals.css
    secondary: '#FEF3C7', // Light orange/yellow background
    text: 'text-orange-800', // Orange text
    ring: 'ring-orange-500'
  },
  teachers: {
    primary: 'hsl(var(--green-mqueen))', // Green-mqueen from globals.css
    secondary: '#D1FAE5',
    text: 'text-emerald-100',
    ring: 'ring-emerald-600'
  },
  admin: {
    primary: 'hsl(var(--blue-reach))', // Blue-reach from globals.css
    secondary: '#DBEAFE', // Light blue background
    text: 'text-blue-800',
    ring: 'ring-blue-500'
  }
};

// Role mapping for easier access
export const getRoleColors = (role: string) => {
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