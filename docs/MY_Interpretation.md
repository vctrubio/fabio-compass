# MY_Interpretation: Whiteboard Backend Service

This document outlines a proposed `WhiteboardBackendService` class, designed to centralize the data processing and business logic for the whiteboard frontend. The goal is to provide a clean interface for the UI to interact with, abstracting complex data manipulations.

## Proposed `WhiteboardBackendService` Class

This class will serve as the primary interface between the raw data from the database (via Drizzle) and the frontend components that display and interact with the whiteboard.

### Constructor

```typescript
class WhiteboardBackendService {
  constructor(
    bookings: DrizzleData<BookingType>[],
    teachers: DrizzleData<TeacherType>[],
    selectedDate: Date
  ) {
    // ... initialization logic ...
  }
}
```

*   **Purpose:** To initialize the service with all necessary raw data for a specific date.

### Key Properties (Internal State)

*   `today_kite_events`: A representation of all [Kite Events](./databaseModels.md#kiteevent) scheduled for the `selectedDate`, organized by teacher in a linked list format (e.g., an instance of `TeacherEventLinkedList`). This structure facilitates time-based calculations and gap analysis for each teacher's schedule.
*   `earliest_flag_time`: The earliest possible start time for any event on the `selectedDate`, derived from existing events or a default value.

### Core Methods

These methods expose the functionality required by the frontend, performing the necessary data processing internally.

*   `modify_event_time(eventId: string, newTime: string, newDuration?: number, newLocation?: string)`
    *   **Purpose:** To update the time, duration, or location of an existing [Kite Event](./databaseModels.md#kiteevent).
    *   **Details:** This method would encapsulate the logic for recalculating subsequent event times for the affected teacher and handling any potential conflicts.

*   `get_earliest_available_start_time(): string`
    *   **Purpose:** To determine the earliest available time slot for new lessons on the `selectedDate`.
    *   **Details:** This would consider existing [Kite Events](./databaseModels.md#kiteevent) and teacher availability.

*   `get_all_available_lessons(): LessonWithStudents[]`
    *   **Purpose:** To identify and return a list of lessons that are available to be scheduled as new [Kite Events](./databaseModels.md#kiteevent) for the `selectedDate`.
    *   **Details:** This includes lessons from bookings that have remaining hours and do not yet have [Kite Events](./databaseModels.md#kiteevent) assigned for the `selectedDate`.

### Calculations (from `absModels.md`)

These methods provide aggregated data for the `selectedDate`.

*   `get_total_kite_lessons(): number`
    *   **Purpose:** Calculates the total number of [Kite Events](./databaseModels.md#kiteevent) for the `selectedDate`.

*   `get_total_kite_hours(): number`
    *   **Purpose:** Calculates the total duration (sum of `duration` from [Kite Events](./databaseModels.md#kiteevent)) for the `selectedDate`.

*   `get_total_kite_revenue(): number`
    *   **Purpose:** Calculates the total revenue from [Kite Events](./databaseModels.md#kiteevent) for the `selectedDate`, linked via [Transaction](./databaseModels.md#transaction) and [Lesson](./databaseModels.md#lesson) to the [Booking](./databaseModels.md#booking) and its associated [PackageStudent](./databaseModels.md#packagestudent).

### Export Functions (from `absModels.md`)

These methods provide different views or export formats of the whiteboard data.

*   `view_as_table(): string`
    *   **Purpose:** Returns today's whiteboard data formatted as a human-readable table, including today's date and company name.

*   `view_as_law_enforcement(): string`
    *   **Purpose:** Returns a view suitable for law enforcement, showing [Student](./databaseModels.md#student).name and [Student](./databaseModels.md#student).passport_number for the `selectedDate`, including today's date and company name.

*   `view_as_text(): string`
    *   **Purpose:** Returns the table view as plain text, including today's date and company name.

*   `view_as_csv(): string`
    *   **Purpose:** Returns all [Kite Events](./databaseModels.md#kiteevent) for the `selectedDate` in CSV format, including today's date and company name. The specific columns will be described as we iterate.
