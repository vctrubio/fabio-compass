/**
 * Example usage of WhiteboardStyles utility
 * 
 * This file demonstrates how to use the centralized styling utility
 * across different components for consistent booking color coding.
 */

import { DrizzleData } from "@/rails/types";
import { BookingType } from "@/rails/model/BookingModel";
import { BookingCard } from "@/rails/view/card/BookingCard";
import { WhiteboardStyles, getBookingHeaderClass } from "./whiteboard-classes";
import { ProcessedBookingData } from "./whiteboard-backend";

// Example 1: Using the class methods directly
function ExampleComponent1({ 
  booking, 
  selectedDate, 
  whiteboardData 
}: {
  booking: DrizzleData<BookingType>;
  selectedDate?: Date;
  whiteboardData?: any;
}) {
  return (
    <BookingCard 
      booking={booking}
      headerClassName={WhiteboardStyles.getBookingHeaderClass(
        booking, 
        selectedDate, 
        whiteboardData
      )}
    />
  );
}

// Example 2: Using the convenience function
function ExampleComponent2({ 
  booking, 
  selectedDate, 
  whiteboardData 
}: {
  booking: DrizzleData<BookingType>;
  selectedDate?: Date;
  whiteboardData?: any;
}) {
  return (
    <BookingCard 
      booking={booking}
      headerClassName={getBookingHeaderClass(booking, selectedDate, whiteboardData)}
    />
  );
}

// Example 3: Using basic styling without whiteboard data
function ExampleComponent3({ 
  booking, 
  selectedDate 
}: {
  booking: DrizzleData<BookingType>;
  selectedDate?: Date;
}) {
  return (
    <BookingCard 
      booking={booking}
      headerClassName={WhiteboardStyles.getBookingHeaderClassBasic(booking, selectedDate)}
    />
  );
}

// Example 4: Using progress-based styling
function ExampleComponent4({ 
  booking, 
  selectedDate, 
  whiteboardData 
}: {
  booking: DrizzleData<BookingType>;
  selectedDate?: Date;
  whiteboardData?: any;
}) {
  return (
    <BookingCard 
      booking={booking}
      headerClassName={getBookingHeaderClass(
        booking, 
        selectedDate, 
        whiteboardData, 
        'progress-based'
      )}
    />
  );
}

// Example 5: Custom logic using the predefined classes
function ExampleComponent5({ 
  booking,
  isSpecialCase
}: {
  booking: DrizzleData<BookingType>;
  isSpecialCase: boolean;
}) {
  let headerClass;
  
  if (isSpecialCase) {
    headerClass = WhiteboardStyles.CLASSES.HAS_KITE_EVENTS_TODAY;
  } else {
    headerClass = WhiteboardStyles.CLASSES.DEFAULT;
  }

  return (
    <BookingCard 
      booking={booking}
      headerClassName={headerClass}
    />
  );
}

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
