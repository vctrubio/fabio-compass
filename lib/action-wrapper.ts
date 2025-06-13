import { internalActionTracker } from '@/lib/internal-action-tracker';
import { revalidatePath } from 'next/cache';

/**
 * Wrapper for server actions that modify the database.
 * This ensures that real-time listeners ignore changes from our own actions.
 * 
 * @param actionFn - The async function that performs the database operation
 * @param revalidatePathValue - The path to revalidate after the action (default: "/fabio")
 * @returns The result of the action function
 */
export async function withInternalActionTracking<T>(
  actionFn: () => Promise<T>,
  revalidatePathValue: string = "/fabio"
): Promise<T> {
  try {
    // Mark that we're executing an internal action
    internalActionTracker.setExecuting(true);
    
    // Execute the actual action
    const result = await actionFn();
    
    // Revalidate the path to update the UI
    revalidatePath(revalidatePathValue);
    
    return result;
  } finally {
    // Always reset the flag, even if there was an error
    // Use a significantly longer timeout to ensure components have time
    // to respond to the action completion before we reset state
    setTimeout(() => internalActionTracker.setExecuting(false), 500);
  }
}
