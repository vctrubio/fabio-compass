// Server-side action tracker for tracking internal database operations
// This can be imported by both server actions and client components

class InternalActionTracker {
  private static instance: InternalActionTracker;
  private isExecutingAction: boolean = false;

  private constructor() {}

  public static getInstance(): InternalActionTracker {
    if (!InternalActionTracker.instance) {
      InternalActionTracker.instance = new InternalActionTracker();
    }
    return InternalActionTracker.instance;
  }

  public setExecuting(executing: boolean): void {
    this.isExecutingAction = executing;
  }

  public isExecuting(): boolean {
    return this.isExecutingAction;
  }
}

// Export singleton instance
export const internalActionTracker = InternalActionTracker.getInstance();
