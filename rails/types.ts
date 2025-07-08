export interface DatePickerRange {
  startDate: string;
  endDate: string;
}

export interface DrizzleData<T> {
  model: T;
  relations: object;
  lambdas: object;
}

// Detailed types for booking with relations
export interface BookingStudent {
  id: string;
  booking_id: string;
  student_id: string;
  student: {
    id: string;
    name: string;
    languages?: string[];
    phone?: string;
    country?: string;
    age?: number;
    weight?: number;
    height?: number;
    passport_number?: string;
    created_at?: string;
    deleted_at?: string;
  };
}

export interface KiteEvent {
  id: string;
  lesson_id: string;
  date: string;
  duration: number;
  location: string;
  status: string;
  trigger_transaction: boolean;
  created_at?: string;
}

export interface Lesson {
  id: string;
  teacher_id: string;
  booking_id: string;
  status: string;
  created_at?: string;
  deleted_at?: string;
  teacher?: {
    id: string;
    name: string;
    languages?: string[];
    phone?: string;
    country?: string;
    passport_number?: string;
    teacher_role: string;
    created_at?: string;
    deleted_at?: string;
  };
  kiteEvents?: KiteEvent[];
}

export interface PackageStudent {
  id: string;
  price: number;
  duration: number;
  capacity: number;
  description?: string;
  created_at?: string;
}

export interface BookingRelations {
  bookingStudents: BookingStudent[];
  lessons: Lesson[];
  package: PackageStudent;
}

export interface BookingLambdas {
  students: Array<{
    id: string;
    name: string;
  }>;
  totalLessons: number;
  totalKiteEvents: number;
}

// Specific type for booking with relations
export interface BookingWithRelations extends DrizzleData<import('@/rails/model/BookingModel').BookingType> {
  relations: BookingRelations;
  lambdas: BookingLambdas;
}

// Detailed types for kite events with relations
export interface Equipment {
  id: string;
  serial_id: string;
  type: string;
  model: string;
  size: number;
  created_at?: string;
  updated_at?: string;
}

export interface KiteEventRelations {
  booking: {
    id: string;
    package_id: string;
    date_start: string;
    date_end: string;
    created_at?: string;
    deleted_at?: string;
    signer_pk: string;
    package: PackageStudent;
    bookingStudents: BookingStudent[];
  } | null;
  lesson: {
    id: string;
    teacher_id: string;
    booking_id: string;
    status: string;
    created_at?: string;
    deleted_at?: string;
    teacher: {
      id: string;
      name: string;
      languages?: string[];
      phone?: string;
      country?: string;
      passport_number?: string;
      teacher_role: string;
      created_at?: string;
      deleted_at?: string;
    };
    booking: {
      id: string;
      package_id: string;
      date_start: string;
      date_end: string;
      created_at?: string;
      deleted_at?: string;
      signer_pk: string;
      package: PackageStudent;
      bookingStudents: BookingStudent[];
    };
  };
  transactions: any[];
  equipmentItems: Equipment[];
  kiteEventEquipments: Array<{
    id: string;
    kite_event_id: string;
    equipment_id: string;
    equipment: Equipment;
  }>;
}

export interface KiteEventLambdas {
  studentsCount: number;
  equipmentCount: number;
  studentNames: string[];
  equipmentTypes: string[];
}

// Specific type for kite event with relations
export interface KiteEventWithRelations extends DrizzleData<import('@/rails/model/KiteEventModel').KiteEventType> {
  relations: KiteEventRelations;
  lambdas: KiteEventLambdas;
}

export interface ApiAction {
  success: boolean;
  error?: string;
  data?: unknown;
}

export type UserRole = 'student' | 'teacher' | 'admin' | 'guest';

export interface Wallet {
  sk: string; //secret key, = user_wallet.id inside db
  pk: string; //public key, = student.id or teacher.id or null if admin
  role: UserRole; //role of the user, student, teacher or admin
  status: boolean; //true if authenticated, false otherwise
  email: string; //email of the user
}
