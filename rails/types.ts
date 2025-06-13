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
