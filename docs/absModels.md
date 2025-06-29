# Abstract Models

This document outlines the abstract models used in this application.

## `BookingManager`

**Based** on selected date. [Bookings](./databaseModels.md#booking)

**Input:** All available [Lessons](./databaseModels.md#lesson) (with [Teacher](./databaseModels.md#teacher)). If no lesson is assigned to a [Booking](./databaseModels.md#booking), then the lesson will not appear in the whiteboard.

**Purpose:** To CRUD [Kite Events](./databaseModels.md#kiteevent) operation. Through simple and elegant UI/UX. To do this we must think of all the possible edge cases.

## `Teacher_linked_event`

- **Description:** A list of available teachers to get from. We can create a linked list by adding a kite event, then an event_gap.
- **`event_gap`:** A gap between one lesson and another represents a mis-optimization of the day.
- **Node Structure:** Each event or node should contain its own data and point to the next node or a gap if the starting time of the next event is not equal to this event's end time.

### Variables

- `starting_flag_time`: The earliest possible start time of the selected date.
- `recalculate_flag_time`: Set a new time and move all teacher_linked_events to that time.

### Calculations

- `Total Kite Lessons`: Total number of [Kite Events](./databaseModels.md#kiteevent) for that day.
- `Total Kite Hours`: Total duration (sum of `duration` from [Kite Events](./databaseModels.md#kiteevent)) for that day.
- `Total Kite Revenue`: Total revenue calculated from the `amount` in the [Transaction](./databaseModels.md#transaction) table, linked via [KiteEvent](./databaseModels.md#kiteevent) and [Lesson](./databaseModels.md#lesson) to the [Booking](./databaseModels.md#booking) and its associated [PackageStudent](./databaseModels.md#packagestudent).

### Export Functions

- `view_as_table`: Today's BookingManager, viewed as a table, including today's date and company name.ur- `view_as_law_enforcement`: View as [Student](./databaseModels.md#student).name and [Student](./databaseModels.md#student).passport_number, on date, including today's date and company name. `view_as_text`: View as table into text, including today's date and company name. `view_as_csv`: All [Kite Events](./databaseModels.md#kiteevent) in CSV format, including today's date and company name. <!-- IMPORTANT: For future AI agents, if a term is already linked within this file (e.g., [Booking](./databaseModels.md#booking)), please do not relink it. -->
