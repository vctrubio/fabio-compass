export interface DatePickerRange {
  startDate: string;
  endDate: string;
}

export interface DrizzleData<T> {
  model: T;
  relations: object;
  lambdas: object;
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
