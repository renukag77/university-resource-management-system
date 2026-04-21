# Venue Booking Feature - User Stories 5 & 6

## User Story 5: Club Head Venue Request & Conflict Detection

**As a** club head  
**I want to** request a venue and avoid scheduling conflicts  
**So that** events are scheduled properly with adequate resources  

### Description
Club heads can now create events through a 2-step process where they first provide basic event details, then select an appropriate venue while viewing real-time conflict information. The system detects both approved (hard) and pending (soft) conflicts, allowing club heads to make informed decisions and submit requests to the admin for final approval.

---

### Acceptance Criteria

#### AC 5.1: Two-Step Event Creation Process
- [ ] **Step 1 - Event Basics**: Club head can create an event with title, description, date/time, poster, required skills, capacity, and problem statement
  - No venue selection required at this stage
  - Event is created with "draft" or "submitted" status
  - All basic info fields are validated before proceeding

- [ ] **Step 2 - Venue Selection**: After Step 1, club head proceeds to venue selection screen
  - Displays two options: Select from system venues OR enter a custom venue name
  - Shows event details summary (title, date)
  - Lists available venues with conflict indicators
  - Cannot proceed without venue selection or custom venue entry

#### AC 5.2: Venue Selection from Available Venues
- [ ] **Venue List Display**:
  - Shows all system venues with name, capacity, and location
  - Displays venue availability status for selected time period
  - Venues are dynamically loaded based on event date/time

- [ ] **Conflict Detection**:
  - **Hard Conflicts** (Red indicator ⚠️ CONFLICT): Approved events already booked on this venue at this time
    - Shows conflicting event title and exact time slot
    - Admin must resolve priority
  - **Pending Conflicts** (Yellow indicator ⏳ PENDING): Pending venue requests on this venue at this time
    - Shows event title without exact details
    - May be approved, providing option to resolve
  - **Available** (Green): No conflicts detected

- [ ] **Conflict Information Display**:
  - Clear summary of what each conflict type means
  - Conflicting event details visible on hover/expansion
  - Warning message when conflicts are detected
  - User can proceed even with conflicts (admin reviews)

#### AC 5.3: Custom Venue Request Option
- [ ] Club head can request a custom venue by entering venue name
  - Input field accepts any venue name (e.g., "Outdoor Auditorium", "Off-campus studio")
  - No conflict checking for custom venues (handled by admin case-by-case)
  - Custom venue can be submitted directly to admin
  - Custom venue name is stored with the request

#### AC 5.4: Venue Request Submission
- [ ] Venue request includes:
  - Event ID
  - Selected venue ID (system) OR custom venue name
  - Start date/time and end date/time
  - Conflict detection results (marker only, not blocking)
  
- [ ] Confirmation message shows:
  - "Venue request submitted successfully"
  - Conflict warning if applicable: "Note: Conflicts were detected, admin will review"
  - Success or error status

#### AC 5.5: Navigation & UI Flow
- [ ] "Back" button on Step 2 allows return to Step 1 for editing
- [ ] Step indicator shows current step (Step 1/2)
- [ ] Sidebar shows "Venue Requests" menu item for tracking
- [ ] Form validation prevents submission with missing fields

---

### Feature Implementation Details

#### Backend Components
- **Model**: `VenueRequest` schema with fields for eventId, venueId, customVenueName, dates, status
- **Controller**: `requestVenue()` endpoint accepts venueId OR customVenue (mutually exclusive)
- **Utility**: `venueConflictChecker.js` with `checkVenueConflicts()` for real-time conflict detection
- **Conflict Logic**:
  - Checks VenueRequest (approved) for hard conflicts
  - Checks pending VenueRequests for soft conflicts
  - Ignores custom venues (no conflict checking)

#### Frontend Components
- **Component**: `CreateEvent.js` with 2-step form
  - State: `step`, `formData`, `selectedVenueId`, `customVenue`, `useCustomVenue`
  - Step 1: Basic event form
  - Step 2: Venue selection with toggle for custom entry
- **Service**: `eventService.getAllEventsForAdmin()` and `eventService.requestVenue()`
- **UI**: Radio buttons to switch between venue modes, venue cards with conflict badges

#### API Endpoints
```
POST /api/club-head/events
  ├─ Creates event without venue (Step 1)
  └─ Returns event object with ID

POST /api/club-head/events/{eventId}/request-venue
  ├─ Accepts: venueId XOR customVenue, startDate, endDate
  ├─ Performs conflict checking (if venueId)
  └─ Returns: VenueRequest with conflictDetected flag

GET /api/club-head/venues-with-conflicts
  ├─ Query: startDate, endDate
  └─ Returns: Venues with conflict metadata
```

---

### Testing & Validation

#### Unit Testing - Conflict Detection
```javascript
describe('Venue Conflict Checker', () => {
  test('Should detect hard conflicts from approved requests', async () => {
    // Setup: Create approved venue request for venue A, 2pm-4pm
    // Action: Check conflicts for same venue, 3pm-5pm
    // Assert: Returns hasConflict: true, conflicts array populated
  });

  test('Should detect pending conflicts from pending requests', async () => {
    // Setup: Create pending venue request for venue A
    // Action: Check conflicts with pending flag
    // Assert: Returns hasPendingConflicts: true
  });

  test('Should NOT mark custom venues as conflicts', async () => {
    // Setup: Submit custom venue request
    // Action: Check for conflicts
    // Assert: Returns conflictDetected: false (no checking done)
  });
});
```

#### Integration Testing - Two-Step Flow
```javascript
describe('Event Creation - Two Step Flow', () => {
  test('Step 1: Should create event without venue', async () => {
    // POST /api/club-head/events with no venue field
    // Assert: Event created with status "submitted", venue: null
  });

  test('Step 1: Should validate required fields', async () => {
    // POST /api/club-head/events without title
    // Assert: Returns 400 "Event name is required"
  });

  test('Step 2: Should submit venue request with system venue', async () => {
    // POST /api/club-head/events/{id}/request-venue with venueId
    // Assert: VenueRequest created, TimeSlot created (if approved later)
  });

  test('Step 2: Should submit venue request with custom venue', async () => {
    // POST /api/club-head/events/{id}/request-venue with customVenue
    // Assert: VenueRequest created, no TimeSlot created
  });

  test('Step 2: Should reject when both venueId and customVenue missing', async () => {
    // POST /api/club-head/events/{id}/request-venue without either field
    // Assert: Returns 400 error
  });
});
```

#### Frontend Testing - UI & UX
```javascript
describe('CreateEvent Component - UI Tests', () => {
  test('Should show Step 1 form initially', () => {
    // Render component
    // Assert: Title input, description textarea, date picker visible
    // Assert: Step 2 content hidden
  });

  test('Should proceed to Step 2 after Step 1 submission', async () => {
    // Fill and submit Step 1
    // Assert: Step 2 content appears, Step 1 hidden
  });

  test('Should display conflict indicators correctly', () => {
    // Mock venues with hasConflict: true and hasPendingConflicts: true
    // Assert: Red badge "⚠️ CONFLICT" shown
    // Assert: Yellow badge "⏳ PENDING" shown
    // Assert: Conflict details displayed on expand
  });

  test('Should toggle between venue selection and custom input', () => {
    // Click "Request custom venue" radio button
    // Assert: Venue list hidden, custom input shown
    // Click "Select from available" radio button
    // Assert: Custom input hidden, venue list shown
  });

  test('Should validate Step 2 before submission', async () => {
    // Try to submit without venue/custom venue selection
    // Assert: Validation error shown
  });
});
```

#### Manual Testing Scenarios

| Scenario | Steps | Expected Result | Status |
|----------|-------|-----------------|--------|
| System Venue - No Conflicts | Create event → Select free venue → Submit | Venue request submitted, no warnings | ✅ |
| System Venue - Hard Conflict | Create event → Select booked venue → Note warning → Submit | Warning shown: "Conflicts detected, admin will review" | ✅ |
| System Venue - Pending Conflict | Create event → Select venue with pending request → Submit | Yellow pending badge shown | ✅ |
| Custom Venue Entry | Create event → Toggle custom option → Enter "Outdoor Hall" → Submit | Custom venue saved with request | ✅ |
| Back Navigation | Complete Step 1 → Go to Step 2 → Click Back | Returns to Step 1, data preserved | ✅ |
| Date/Time Validation | Enter past date on Step 1 | Error: "Event date must be in the future" | ✅ |

---

## User Story 6: Admin Venue Request Review & Approval

**As an** admin  
**I want to** review, approve, or reject venue requests with conflict resolution  
**So that** venues are properly allocated and scheduling conflicts are resolved fairly  

### Description
Admin users have a centralized dashboard for reviewing all pending venue requests from club heads. They can view conflict details, approve requests (creating time slot bookings for system venues), reject with comments, or view all events across the system with filtering capabilities.

---

### Acceptance Criteria

#### AC 6.1: Pending Venue Requests Dashboard
- [ ] **Request List Display**:
  - Shows all pending venue requests in a table/card view
  - Displays: Event title, club head name, venue name (system or custom), requested dates, status
  - Sorted by most recent first
  - Pagination or infinite scroll for large datasets

- [ ] **Request Filtering & Sorting**:
  - Filter by status (pending, approved, rejected, cancelled)
  - Sort by request date, event date, venue name
  - Search by event title or club head name

- [ ] **Conflict Information Display**:
  - Shows "Conflicts Detected: Yes/No" badge
  - Displays conflicting events if applicable
  - Shows conflict severity (approved vs pending)
  - Detailed conflict information on click/expand

#### AC 6.2: Venue Request Review Modal/Details View
- [ ] **Request Details Panel** shows:
  - Event title and description
  - Club head name and email
  - Selected venue (name, capacity, location if system venue)
  - Requested start and end date/time
  - Conflict detection results with details
  - Current request status
  - Admin comments (if already reviewed)

- [ ] **Conflict Display**:
  - List of conflicting events with:
    - Event title
    - Conflicting club head
    - Time overlap details
    - Event status
  - Warning color coding (red for approved, yellow for pending)

#### AC 6.3: Approve Venue Request
- [ ] **Approval Action**:
  - Admin clicks "Approve" button
  - Optional admin comment field
  - Confirmation prompt before approval

- [ ] **Backend Processing on Approval**:
  - Updates VenueRequest status to "approved"
  - Sets approvedAt timestamp
  - **For system venues**: Creates TimeSlot entry to lock in the booking
    - Marks as isBooked: true
    - Sets bookedBy: clubHeadId
    - Creates entry with exact requested dates
  - **For custom venues**: No TimeSlot created (venue not in system)
  - Updates Event record:
    - Sets approvedLocation = venue name
    - Sets approvedStartDate and approvedEndDate
    - Sets status = "approved"

- [ ] **User Feedback**:
  - Success message: "Venue request approved successfully"
  - Request removed from pending list or marked as approved
  - Club head receives notification (email/dashboard update)

#### AC 6.4: Reject Venue Request
- [ ] **Rejection Action**:
  - Admin clicks "Reject" button
  - **Required**: Admin must provide rejection reason/comment
  - Confirmation prompt before rejection

- [ ] **Backend Processing on Rejection**:
  - Updates VenueRequest status to "rejected"
  - Sets rejectedAt timestamp
  - Stores admin comment
  - Updates Event status back to "draft" for resubmission
  - Stores rejection comment in event record

- [ ] **User Feedback**:
  - Success message: "Venue request rejected"
  - Admin comment visible in request details
  - Club head can view rejection reason and resubmit

#### AC 6.5: All Events Dashboard
- [ ] **Events List View**:
  - Shows all events filtered by status (approved, pending/submitted, active)
  - Displays: Title, club head, venue, event date, capacity, status badge
  - Color-coded status indicators

- [ ] **Event Details Card**:
  - Event title and description
  - Club head name and email
  - Venue (approved or requested)
  - Event date and time
  - Capacity and required skills
  - Creation date
  - Ideation requirement indicator

- [ ] **Event Filtering**:
  - Filter buttons: All, Approved, Submitted, Active, Draft, Rejected
  - Shows count or active filter indicator
  - Dynamically updates event list on filter change

- [ ] **Event Data Fields**:
  - Event title, description, dates
  - Assigned venue (system or custom)
  - Club head contact information
  - Skills required
  - Event capacity
  - Status with visual indicator

#### AC 6.6: Navigation & Dashboard Integration
- [ ] Sidebar shows "Pending Requests" menu item linking to requests dashboard
- [ ] Sidebar shows "All Events" menu item linking to events list
- [ ] Navigation between different admin views is seamless
- [ ] Admin dashboard home shows counts of pending requests

---

### Feature Implementation Details

#### Backend Components
- **Models**: 
  - `VenueRequest` with status, conflict tracking, admin comments
  - `TimeSlot` for venue bookings
  - `Event` with approvedLocation, status tracking

- **Controller Functions**:
  - `getPendingVenueRequests()` - Fetch pending requests with populated data
  - `getVenueRequestDetails()` - Get single request with all relations
  - `approveVenueRequest()` - Approve with optional comment
  - `rejectVenueRequest()` - Reject with required comment
  - `getAllEvents()` - Fetch all events with status filtering

- **Business Logic**:
  - On approve: Create TimeSlot if system venue, update event status
  - On reject: Reset event to draft for resubmission
  - Conflict detection only impacts display (not blocking)

#### Frontend Components
- **Component 1**: `PendingRequests.js` (updated)
  - Tab-based view with "Venue Requests" tab
  - Request list with conflict badges
  - Modal for approve/reject with comment fields
  - Loading and error states

- **Component 2**: `AllEvents.js` (new)
  - Status filter buttons
  - Event cards with comprehensive display
  - Sorting and filtering logic
  - Responsive grid layout

- **Service Functions**:
  - `getAdminPendingVenueRequests()` - Fetch pending requests
  - `approveVenueRequest(id, comment)` - POST to approve
  - `rejectVenueRequest(id, comment)` - POST to reject
  - `getAllEventsForAdmin(status)` - Fetch filtered events

#### API Endpoints
```
GET /api/admin/venue-requests
  └─ Returns: Array of pending VenueRequest objects

GET /api/admin/venue-requests/{venueRequestId}
  └─ Returns: Single VenueRequest with populated details

PUT /api/admin/venue-requests/{venueRequestId}/approve
  ├─ Body: { adminComment: string }
  ├─ Creates TimeSlot (if system venue)
  ├─ Updates Event status
  └─ Returns: Updated VenueRequest

PUT /api/admin/venue-requests/{venueRequestId}/reject
  ├─ Body: { adminComment: string } [REQUIRED]
  ├─ Resets Event to draft
  └─ Returns: Updated VenueRequest

GET /api/admin/all-events?status=approved
  └─ Returns: Array of Event objects (filtered by status)
```

---

### Testing & Validation

#### Unit Testing - Admin Actions
```javascript
describe('Admin Venue Request Processing', () => {
  test('Should approve venue request and create TimeSlot', async () => {
    // Setup: Pending venue request with system venueId
    // Action: Call approveVenueRequest with comment
    // Assert: VenueRequest.status = "approved"
    // Assert: TimeSlot created with isBooked: true
    // Assert: Event.approvedLocation set
  });

  test('Should approve custom venue without creating TimeSlot', async () => {
    // Setup: Pending venue request with customVenueName, no venueId
    // Action: Call approveVenueRequest
    // Assert: VenueRequest.status = "approved"
    // Assert: No TimeSlot created
    // Assert: Event.approvedLocation = customVenueName
  });

  test('Should reject venue request and reset event to draft', async () => {
    // Setup: Pending venue request
    // Action: Call rejectVenueRequest with comment
    // Assert: VenueRequest.status = "rejected"
    // Assert: Event.status = "draft"
    // Assert: Admin comment stored
  });

  test('Should require comment when rejecting', async () => {
    // Setup: Pending venue request
    // Action: Try to reject without comment
    // Assert: Returns 400 error "Comment required"
  });
});
```

#### Integration Testing - Approval Workflow
```javascript
describe('Complete Approval Workflow', () => {
  test('End-to-end: Request → Review → Approve', async () => {
    // 1. Club head creates event (Step 1)
    // 2. Club head selects venue (Step 2)
    // 3. Admin views pending requests
    // 4. Admin approves with comment
    // 5. Assert: Event marked approved, TimeSlot created
    // 6. Club head can view approved event
  });

  test('End-to-end: Request → Review → Reject → Resubmit', async () => {
    // 1. Club head submits venue request
    // 2. Admin rejects with comment
    // 3. Club head sees rejection and resubmits with different venue
    // 4. Admin approves second request
    // 5. Assert: First request rejected, second approved
  });

  test('Conflict detection during approval', async () => {
    // 1. Create approved venue request (locked in)
    // 2. Submit conflicting venue request
    // 3. Admin views second request, sees conflict warning
    // 4. Admin can still approve (conflict noted)
    // 5. Assert: Both requests approved, conflict recorded
  });
});
```

#### Frontend Testing - Admin UI
```javascript
describe('Admin Venue Request Dashboard', () => {
  test('Should display pending requests with conflict badges', () => {
    // Mock pending requests with varying conflict states
    // Assert: Red badge for hard conflicts
    // Assert: Yellow badge for pending conflicts
    // Assert: No badge for available venues
  });

  test('Should show detailed conflict information on expand', () => {
    // Click conflict badge
    // Assert: Conflicting event details visible
    // Assert: Time overlap clearly shown
  });

  test('Should require admin comment when rejecting', async () => {
    // Click reject without entering comment
    // Assert: Submit button disabled or error shown
  });

  test('Should update request status after approval/rejection', async () => {
    // Approve a request
    // Assert: Request disappears from pending list
    // Assert: Status updated to "approved"
  });
});

describe('All Events Dashboard', () => {
  test('Should fetch and display all events', () => {
    // Render component
    // Assert: Events list populated
    // Assert: Shows title, club head, venue, date
  });

  test('Should filter events by status', async () => {
    // Click "Approved" filter button
    // Assert: Only approved events shown
    // Assert: Other events hidden
  });

  test('Should display required skills as badges', () => {
    // Event with skills: ["teamwork", "leadership"]
    // Assert: Skills displayed as individual badges
  });
});
```

#### Manual Testing Scenarios

| Scenario | Steps | Expected Result | Status |
|----------|-------|-----------------|--------|
| Approve System Venue | View pending request → Review details → Click Approve → Add comment → Confirm | Request approved, TimeSlot created, Event status updated | ✅ |
| Approve Custom Venue | View pending custom venue request → Click Approve | Request approved, NO TimeSlot created, Event updated | ✅ |
| Reject with Comment | View pending request → Click Reject → Enter rejection reason → Confirm | Request rejected, comment stored, Event reverted to draft | ✅ |
| View Conflict Details | View request with conflicts → Click/Expand conflict section | Conflicting event details visible, time overlap shown | ✅ |
| Filter All Events | Click different status filters on All Events page | Event list updates to show only matching status | ✅ |
| Sort Events | View all events list → Click sort options | Events re-ordered by selected criteria | ✅ |

---

### Integration Points

#### System Venue Booking
1. Club head requests system venue → VenueRequest created
2. Admin approves → TimeSlot created (marks time as booked)
3. No other club can request same venue/time (conflict detection prevents)
4. Real-time conflict checking prevents double-booking

#### Custom Venue Handling
1. Club head requests custom venue → VenueRequest with customVenueName
2. Admin approves → No TimeSlot (custom venue not in system)
3. Admin handles as special case (email coordination, external booking)
4. Event marked "approved" for tracking

#### Event Status Lifecycle
```
Step 1: Event created → status: "submitted"
         ↓
Step 2: Venue request submitted → Event remains "submitted"
         ↓
Admin reviews → Options:
         ├─ Approve → Event status: "approved"
         └─ Reject → Event status: "draft" (for resubmission)
         ↓
Approved Event → Event becomes "active" on event date
         ↓
Event completed → status: "completed" (future enhancement)
```

---

### Success Metrics & Validation

#### Feature Completeness
- ✅ 2-step event creation process implemented
- ✅ Real-time conflict detection with visual indicators
- ✅ System and custom venue support
- ✅ Admin approval workflow with TimeSlot creation
- ✅ Venue request tracking for club heads
- ✅ All events dashboard with filtering
- ✅ Conflict resolution capability

#### User Experience
- ✅ Clear navigation between venues and event creation
- ✅ Visual conflict indicators (colors, badges, details)
- ✅ Informative error messages and validation
- ✅ Success confirmations with next steps
- ✅ Responsive design across devices

#### Data Integrity
- ✅ No orphaned requests or events
- ✅ Proper status tracking through workflow
- ✅ Audit trail with timestamps (createdAt, approvedAt, rejectedAt)
- ✅ Comment preservation for transparency
- ✅ TimeSlot prevents double-booking of system venues

---

### Future Enhancements

1. **Conflict Resolution Engine**: Automatic suggestion of alternative times/venues
2. **Notifications**: Email alerts to club heads on approval/rejection
3. **Analytics**: Dashboard showing venue utilization, booking trends
4. **Bulk Operations**: Admin ability to approve/reject multiple requests
5. **Calendar View**: Visual calendar for venue availability and bookings
6. **Conflict Appeal**: Club head can appeal rejected requests
7. **Recurring Events**: Support for repeating weekly/monthly events
