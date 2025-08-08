# Interactive Seating Chart - TODO List

This document tracks the development tasks for the Interactive Seating Chart application, based on the requirements outlined in `prd.md`.

## Phase 1: Core Functionality

### F-01: Guest List Import & Management
- [x] Create UI for file upload (`.xlsx`, `.xls`, `.csv`).
- [x] Integrate SheetJS for client-side file parsing.
- [x] Read and process guests from all sheets within a workbook.
- [x] Map spreadsheet columns: `Name`, `Group`, `RSVP`, `PlusOnes`.
- [x] Automatically create guest entries for `PlusOnes`.
- [x] Display the imported guest list.
- [x] Show total guest count and attending count.
- [x] Add robust error handling (e.g., missing name, invalid file).
- [x] Allow users to manually add, edit, or delete guests from the list.
- [x] Filter guest list by RSVP status or search by name.

### F-02: Table Configuration
- [x] Create a UI form to add and configure tables.
- [x] Allow users to specify the number of tables, seats per table, table shape (circle/rectangle), and a custom name/label for each table.
- [x] Allow users to edit table names directly on the seating plan.
- [x] Display configured tables visually in the "Seating Area".
- [x] Show a real-time capacity counter (Total Seats vs. Attending Guests).
- [x] Add input validation for all configuration fields.

### F-03: Seat Assignment System
- [x] Display a list of unassigned guests (who are "Attending").
- [x] Implement drag-and-drop functionality to assign guests to seats.
- [x] Allow dragging guests between tables or back to the unassigned list.
- [x] Provide clear visual feedback for drag operations (e.g., highlighting drop zones).
- [x] Prevent assigning more guests to a table than it has seats.
- [x] Implement an "Auto-Seat" feature that assigns guests to tables based on their "Group".
- [x] Implement a "Seat All Guests" feature that assigns guests regardless of group.
- [x] Add a visual alert if a group has to be split across tables.
- [x] Implement a "Clear All Assignments" button to reset the seating plan.
- [x] Assign guests to individual seats within each table.
- [x] (Stretch Goal) Add an "Undo" feature for assignment and table changes.

### F-04: Visualization & PDF Export
- [x] Visually represent assigned guests at their tables.
- [x] On hover, show guest details (name, group).
- [x] Fade or visually distinguish guests with an RSVP of "Not Attending".
- [x] Implement an "Export to PDF" button.
- [x] Use a library like `pdf-lib` to generate the PDF.
- [x] Create a multi-page PDF, with one page dedicated to each table.
- [x] Each page should include the table name and a visual layout of the table with guests placed at their assigned seats.

### F-05: Save & Load Seating Chart State
- [x] Implement a "Save" button that serializes the entire app state (guest list, table configs, seat assignments) into a JSON object.
- [x] Trigger a local download of the state as a `.json` file.
- [x] Implement a "Load" button that allows a user to upload a previously saved `.json` file.
- [x] Restore the application state from the loaded file.
- [x] Add validation to handle potentially malformed or outdated state files gracefully.

## Refactoring & Maintenance
- [x] Refactor project from a single `index.tsx` file into a component-based directory structure as defined in `prd.md`.

## Security
- [x] Implement a password screen to protect access to the application.

## Phase 2: Future Enhancements
- [ ] **AI-Assisted Seating:** Integrate Gemini to suggest optimal seating arrangements based on guest groups or other criteria.
- [ ] **Cloud Sync:** Use a backend service (like Firebase) to save and sync charts across devices.
- [ ] **Real-Time Collaboration:** Allow multiple users to edit a seating chart simultaneously.
- [ ] **Venue Map Integration:** Let users upload a floor plan image and place tables on top of it.
- [ ] **Custom PDF Templates:** Offer different visual styles for the PDF export.
- [ ] **Advanced Guest Tagging:** Add custom tags to guests (e.g., VIP, dietary restrictions) and use them for filtering and seating rules.