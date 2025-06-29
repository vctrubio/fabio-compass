# Database Models

This document outlines the database models used in this application.

## `user_wallet`

*   **Purpose:** Stores user wallet information, including their role, email, and balance.
*   **Relations:**
    *   Links to the `auth.users` table via the `sk` column.

## `Student`

*   **Purpose:** Stores information about students.
*   **Relations:** Students create bookings to attend class.

## `Teacher`

*   **Purpose:** Stores information about teachers.
*   **Relations:** A lesson is assigned to each teacher, through bookings.

## `PackageStudent`

*   **Purpose:** Dictates the price and agreement of booking.
*   **Relations:** All bookings must have a package.

## `Booking`

*   **Purpose:** To create a new reservation by the client (student), gets date of availability.
*   **Relations:** Lessons, has one or more lessons (teachers) and kite events, to satisfy the total number of hours (from package).

## `BookingStudent`

*   **Purpose:** A join table that links bookings to students.
*   **Relations:** To add students to bookings for lessons. Without this, booking mapping is not possible.

## `Lesson`

*   **Purpose:** Assigned to a teacher, has a status, which shows the state of the lesson.
*   **Relations:** Has many kite events, days of kiting.

## `KiteEvent`

*   **Purpose:** A kite session between teacher (lesson) and students (booking_students).
*   **Relations:** Has many equipment, for tracking of kites. Belongs to a lesson. Kite event cannot exist on its own. (for now later we will add rentals).

## `Transaction`

*   **Purpose:** Stores information about transactions.
*   **Relations:**
    *   Links to `KiteEvent` via the `lesson_event_id` column.
    *   Links to `Lesson` via the `lesson_id` column.
    *   Links to `Booking` via the `booking_id` column.
    *   Links to `PackageStudent` via the `package_id` column.
    *   Links to `Student` via the `student_id` column.
    *   Links to `Teacher` via the `teacher_id` column.

## `Payment`

*   **Purpose:** Stores information about payments.
*   **Relations:**
    *   Links to `Transaction` via the `transaction_id` column.

## `Commission`

*   **Purpose:** Stores information about commissions.
*   **Relations:**
    *   Links to `Transaction` via the `transaction_id` column.

## `Equipment`

*   **Purpose:** All equipments that can be assigned to an event. Each equipment should be linnked to teachers usage (not avaiasble yet).
*   **Relations:** Kite events, has_many to track when and who used it.

## `KiteEventEquipment`

*   **Purpose:** A join table that links kite events to equipment.
*   **Relations:**
    *   Links to `KiteEvent` via the `kite_event_id` column.
    *   Links to `Equipment` via the `equipment_id` column.
