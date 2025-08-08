1. Executive Summary
This application is a browser-only, interactive seating chart generator built for weddings and other large events. It provides drag-and-drop seat arrangement, Excel-based guest import, and professional-grade multi-page PDF export. Built as a single-page application (SPA), it requires no backend server and supports local state management with .json save/load.

2. Key Features and Capabilities
Capability	Description
Guest List Import	Upload and map Excel files with Name, Group, RSVP, Plus-Ones
Table Setup	Configure table shapes, sizes, and labels
Auto & Manual Seat Assignment	Auto-group guests; override with drag-and-drop
PDF Export	Render multi-page printable PDF; one page per table
State Save & Resume	Save/load project state as .json
RSVP Handling	Show “not attending” guests faded or excluded
Browser-Only	Runs 100% locally with zero server dependencies

3. Personas & User Stories
🎯 Primary Users
Role	Needs
Wedding Couples	Plan seating easily, make changes interactively, export printable chart
Wedding Planners	Manage hundreds of guests efficiently, reuse guest list formats
Event Coordinators	Communicate seating clearly to vendors and venues

📘 Core User Stories
ID	User Story
US01	As a user, I want to upload my Excel guest list without having to reformat.
US02	As a user, I want to assign custom table names and layouts.
US03	As a user, I want an algorithm to auto-seat guests by group.
US04	As a user, I want to manually drag and drop guests between tables.
US05	As a user, I want to preview and export the chart as a clean PDF.
US06	As a user, I want to save my current chart and reload it later.

4. Functional Requirements (Feature Breakdown)
🔹 F-01: Guest List Import & Column Mapping
Details:

Upload .xlsx or .xls file via file input.

Use SheetJS to parse Excel on client-side.

Map columns: Name (required), Group, RSVP, Plus-Ones.

Automatically add virtual guest entries for Plus-Ones.

Edge Cases:

Missing Name or duplicated entries → show toast error.

Plus-Ones > 10 → warning popup.

Invalid file → prevent further processing.

🔹 F-02: Table Configuration
Details:

Allow user to define:

Total number of tables

Number of seats per table

Table shape: Circle or Rectangle

Custom table names

Ensure total seats ≥ total guests.

UI Features:

Real-time capacity calculator.

Input field validation (min/max values).

Default table naming (Table 1, Table 2…).

🔹 F-03: Seat Assignment System
Auto-Placement Algorithm:

Group guests by Group field.

Allocate entire groups to tables if space allows.

If a group is too large, split it and alert user visually.

Manual Assignment:

dnd-kit powered drag-and-drop.

Unassigned guest sidebar.

Drag guests between table slots or back to unassigned list.

Conflict Handling:

Visual indication if table is overfilled.

Reset button for full seat unassignment.

Undo button (last 5 actions).

🔹 F-04: Visualization & PDF Export
In-App Display:

Render seats and tables on canvas layout.

Hover to show guest name.

Guests with RSVP = No appear 50% opacity.

PDF Export:

Use pdf-lib to create:

A4-sized multi-page layout

One table per page

Table name as title

Guest list below each layout

Additional Options:

Include date, footer branding, optional group color-coding.

🔹 F-05: Save & Load Seating Chart State
Local Save (Download):

Save current project state to .json file:

Guest list

RSVP statuses

Table configurations

Seat assignments

Load State (Upload):

Read .json file to restore entire session.

Validation:

Verify file version and schema.

Handle outdated/missing keys with graceful fallback.

5. Technical Specification
🎯 Frontend Architecture
Layer	Technology
Build Tool	Vite
Framework	React 18+
Styling	Tailwind CSS
Drag-and-Drop	dnd-kit
Excel Parser	SheetJS
PDF Generator	pdf-lib
State Management	React Context + Reducers
Form Validation	Zod or manual
Dev Tools	ESLint, Prettier, TypeScript

📦 Folder Structure Example
```bash
src/
├── components/         # TableCanvas, GuestList, TableCard
├── hooks/              # useSeatingPlan, useExcelImport
├── context/            # AppStateContext.tsx
├── utils/              # autoSeating.ts, pdfExport.ts, validation.ts
├── assets/             # Icons, logos
├── styles/             # Tailwind overrides
├── App.tsx
├── main.tsx
```

🛡 Debugging & Resilience
Area	Implementation Details
Form Validation	All user inputs validated before proceeding
Drag & Drop Sync	Assignments reflect visually and in app state immediately
Toasts	Show for success/errors (e.g., file errors, overfill)
Error Boundaries	Prevent crashes from corrupt files or logic issues
Responsive Design	Tailwind breakpoints ensure mobile/tablet support

6. Future-Proofing & Enhancements
🚀 Phase 2 Ideas
Feature	Description
Cloud Save/Sync	Use Firebase to persist user charts via auth
Real-Time Collaboration	Enable shared editing via WebSocket or Firestore
AI-Assisted Seating	Integrate Gemini/GPT to auto-optimize table harmony
Venue Map Integration	Upload background floorplan image and drag tables on top
Custom Export Templates	Choose from print-friendly styles (minimal, calligraphy, floral, etc.)
Guest Tags & Filters	Add custom tags (e.g., VIP, wheelchair, child), filter by status

7. Glossary
Term	Definition
SPA	Single Page Application: Runs fully in the browser
RSVP	Responded invitation status: Attending / Not Attending / Pending
Plus-One	Additional unnamed guest accompanying a primary guest
JSON Save File	Local file storing all app data; used to restore session later
dnd-kit	Drag-and-drop library for React
