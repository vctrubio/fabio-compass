/**
 * Example usage of WhiteboardStyles utility
 * 
 * This file demonstrates how to use the centralized styling utility
 * across different components for consistent booking color coding.
 */

import { WhiteboardStyles } from "./whiteboard-classes";

/**
 * Color Legend Component
 * Shows what each color means for documentation/UI purposes
 */
export function BookingColorLegend() {
  return (
    <div className="p-4 bg-card rounded-lg border">
      <h4 className="font-medium mb-3">Booking Color Legend</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded border ${WhiteboardStyles.CLASSES.HAS_KITE_EVENTS_TODAY}`}></div>
          <span>Has kite events for today/selected date</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded border ${WhiteboardStyles.CLASSES.HAS_LESSONS_NO_KITE_EVENTS}`}></div>
          <span>Has lessons but no kite events for today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded border ${WhiteboardStyles.CLASSES.PROGRESS_NOT_COMPLETED}`}></div>
          <span>Progress not completed (progress-based styling only)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded border ${WhiteboardStyles.CLASSES.DEFAULT}`}></div>
          <span>Default state</span>
        </div>
      </div>
    </div>
  );
}
