# Frontend Development Requirements - Test Management System

## Project Overview

Build a professional, user-friendly web application for a comprehensive test management system that allows enterprises to create, manage, and administer tests with AI-powered scoring capabilities.

---

## Technology Stack Requirements

### Core Framework
- **React 18+** with TypeScript (strongly recommended)
- **React Router v6** for routing
- **State Management**: Redux Toolkit or Zustand
- **Form Management**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors

### UI/UX Libraries
- **UI Framework**: Material-UI (MUI) v5 or Ant Design
- **Icons**: Material Icons or Heroicons
- **Notifications**: React Hot Toast or Notistack
- **Loading States**: React Loading Skeleton
- **Modals/Popups**: Custom modals with overlay
- **Charts**: Recharts or Chart.js for analytics

### Development Tools
- **Build Tool**: Vite
- **Code Quality**: ESLint, Prettier
- **API Types**: Generate from OpenAPI spec using `openapi-typescript-codegen` or `orval`

---

## API Integration

### OpenAPI Specification
- **Location**: `/openapi.yaml` (root of this project)
- **Base URL Development**: `http://localhost:8080/api-rest-1.0-SNAPSHOT`
- **Base URL Production**: `https://api.testmanagement.com/api-rest-1.0-SNAPSHOT`

### Type Generation
1. Install: `npm install --save-dev openapi-typescript-codegen`
2. Generate types: `npx openapi-typescript-codegen --input ./openapi.yaml --output ./src/types/api --client axios`
3. This will auto-generate:
   - TypeScript interfaces for all schemas
   - API service functions
   - Request/Response types

### Authentication Method
- **Type**: Cookie-based JWT authentication
- **Cookie Name**: `test_token`
- **Important**: Axios must be configured with `withCredentials: true`
- **Token Handling**: Backend sets HttpOnly cookie, frontend doesn't manage token directly
- **Flow**:
  - Login → Backend sets cookie
  - Subsequent requests → Cookie sent automatically
  - Logout → Backend clears cookie

### Axios Configuration
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // CRITICAL for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Application Features

### 1. Authentication & Authorization
- Admin login (username/password)
- Candidate login (email/access code)
- Session management via cookies
- Logout functionality
- Protected routes based on user role

### 2. Enterprise Management
- Create new enterprise with auto-generated admin credentials
- View enterprise details
- Domain management (create, list domains)
- Display enterprise name and domain in header/sidebar

### 3. Test Management (Admin)
- Create new tests with questions
- List all tests for enterprise
- View test details with questions
- Configure test duration
- Set test visibility (active/public)
- View test sessions/submissions

### 4. Question Bank (Admin)
- Create questions (QCM, True/False, Open)
- List all questions in the bank
- Filter questions by type
- Add questions to tests
- Preview questions with answers

### 5. Candidate Invitation (Admin)
- Send test invitations to candidates
- Bulk email invitation
- Set expiration dates
- Generate access codes automatically
- Track invitation status

### 6. Test Session Management (Admin)
- View all sessions for a test
- See candidate details (email, access code)
- Monitor session status (PLANNED, ACTIVE, FINISHED)
- View scores and results
- Track session timeline

### 7. Test Taking (Candidate)
- Login with email and access code
- View test information (name, duration, question count)
- Answer questions (multiple choice, true/false, open text)
- Timer countdown
- Navigation between questions
- Submit test
- View results after submission

### 8. Results & Analytics (Admin & Candidate)
- Overall test score (percentage)
- Question-by-question breakdown
- Correct/incorrect indicators
- Points earned vs max points
- AI feedback for open questions
- Export results (future enhancement)

### 9. AI Scoring
- Automatic scoring for QCM and True/False
- Groq AI scoring for open-ended questions
- Feedback generation
- Score calculation and aggregation

---

## Application Pages & Components

### Public Pages (No Authentication)

#### 1. Landing Page `/`
**Purpose**: Marketing/introduction page

**Content**:
- Hero section with product tagline
- Key features highlights (cards with icons)
- Call-to-action buttons: "Create Enterprise" and "Login"
- Benefits section
- Footer with links

**Components**:
- `<Hero />`
- `<FeaturesGrid />`
- `<CTASection />`
- `<Footer />`

---

#### 2. Enterprise Registration `/register`
**Purpose**: Create a new enterprise account

**Content**:
- Page title: "Create Your Enterprise Account"
- Form fields:
  - Enterprise Name (text input, required)
  - Domain selection (dropdown, searchable)
  - Button: "Create Domain" (opens modal)
- Submit button: "Create Enterprise"
- Success modal showing:
  - Generated username
  - Generated password
  - "Copy Credentials" button
  - "Go to Login" button

**Workflow**:
1. User fills form
2. Selects domain from dropdown (or creates new one)
3. Submits form
4. Loading spinner during API call
5. Success modal appears with credentials
6. User copies credentials
7. Redirects to login

**API Calls**:
- `GET /enterprises/domains` - Load domains for dropdown
- `POST /enterprises/domain` - Create new domain (modal)
- `POST /enterprises` - Create enterprise

**Components**:
- `<EnterpriseRegistrationForm />`
- `<DomainSelector />`
- `<CreateDomainModal />`
- `<CredentialsSuccessModal />`

**Validation**:
- Enterprise name: required, min 2 chars
- Domain: required

**UX Enhancements**:
- Real-time validation
- Loading states on buttons
- Clear error messages
- Tooltip: "Save these credentials securely"

---

#### 3. Admin Login `/login`
**Purpose**: Admin authentication

**Content**:
- Page title: "Admin Login"
- Form fields:
  - Username (text input)
  - Password (password input with show/hide toggle)
- Submit button: "Login"
- Link: "Register Enterprise" → `/register`
- Link: "Candidate Login" → `/candidate-login`

**Workflow**:
1. User enters credentials
2. Submits form
3. Loading spinner
4. On success: redirect to `/dashboard`
5. On error: show error toast

**API Calls**:
- `POST /auth`

**Components**:
- `<LoginForm />`
- `<FormInput />`
- `<PasswordInput />`

**Validation**:
- Username: required
- Password: required, min 6 chars

---

#### 4. Candidate Login `/candidate-login`
**Purpose**: Candidate authentication

**Content**:
- Page title: "Take Your Test"
- Subtitle: "Enter your credentials to start"
- Form fields:
  - Email (email input)
  - Access Code (text input, uppercase, 6 chars)
- Submit button: "Start Test"
- Link: "Admin Login" → `/login`

**Workflow**:
1. Candidate enters email and access code
2. Submits form
3. Loading spinner
4. On success: redirect to `/candidate/test`
5. On error: show error message (invalid code, expired, already used)

**API Calls**:
- `POST /auth/candidate`

**Response Handling**:
- Store test session data: `testSessionId`, `testId`, `testName`, `durationMinutes`

**Components**:
- `<CandidateLoginForm />`

**Validation**:
- Email: required, valid email format
- Access code: required, exactly 6 chars

---

### Admin Pages (Requires Authentication)

#### 5. Admin Dashboard `/dashboard`
**Purpose**: Main admin landing page with overview

**Content**:
- Welcome message: "Welcome back, [Enterprise Name]"
- Statistics cards (4 cards in a row):
  - Total Tests Created
  - Active Tests
  - Total Invitations Sent
  - Completed Sessions
- Quick actions:
  - "Create New Test" button → `/tests/create`
  - "Create Question" button → `/questions/create`
  - "Send Invitation" button → `/invitations/send`
- Recent activity table:
  - Recent test sessions
  - Candidate names/emails
  - Test names
  - Scores
  - Status badges

**API Calls**:
- `GET /test` - Get all tests
- `GET /test/{testId}/sessions` - Get recent sessions (for each test)

**Components**:
- `<DashboardStats />`
- `<QuickActions />`
- `<RecentActivityTable />`
- `<StatCard />`

**UX Enhancements**:
- Skeleton loaders while fetching data
- Empty states if no data
- Hover effects on action buttons

---

#### 6. Tests List `/tests`
**Purpose**: View all tests created by enterprise

**Content**:
- Page title: "My Tests"
- Button: "Create New Test" → `/tests/create`
- Search bar (filter by test name)
- Filter dropdown: All / Active / Inactive
- Tests table with columns:
  - Test Name
  - Duration (minutes)
  - Questions Count
  - Status (Active badge / Inactive badge)
  - Actions:
    - "View" button → `/tests/{testId}`
    - "Sessions" button → `/tests/{testId}/sessions`
    - "Invite" button → `/invitations/send?testId={testId}`
- Pagination if many tests

**API Calls**:
- `GET /test`

**Components**:
- `<TestsTable />`
- `<SearchBar />`
- `<FilterDropdown />`
- `<StatusBadge />`
- `<ActionButtons />`

**UX Enhancements**:
- Loading skeleton for table
- Empty state: "No tests created yet. Create your first test!"
- Row hover effect

---

#### 7. Test Details `/tests/:testId`
**Purpose**: View specific test details and questions

**Content**:
- Breadcrumb: Home > Tests > [Test Name]
- Test information card:
  - Test Name
  - Duration
  - Total Questions
  - Total Points
  - Status (Active/Inactive toggle)
- Questions section:
  - Section title: "Questions ([count])"
  - Button: "Add Questions" (opens modal to select from question bank)
  - Questions list (ordered by position):
    - Position number
    - Question label
    - Question type badge (QCM, True/False, Open)
    - Points
    - Expand/collapse to view answers
    - Actions: Remove from test
- Action buttons:
  - "Send Invitations"
  - "View Sessions"

**API Calls**:
- `GET /test/{testId}/questions`

**Components**:
- `<TestInfoCard />`
- `<QuestionsList />`
- `<QuestionItem />` (expandable)
- `<AddQuestionsModal />`
- `<AnswersList />`

**UX Enhancements**:
- Collapsible question items
- Drag-and-drop to reorder questions (future)
- Confirmation dialog before removing questions

---

#### 8. Create Test `/tests/create`
**Purpose**: Create a new test

**Content**:
- Page title: "Create New Test"
- Breadcrumb: Home > Tests > Create
- Form:
  - Test Name (text input, required)
  - Duration in Minutes (number input, required)
  - Questions section:
    - "Add Questions" button (opens question selector modal)
    - Selected questions list (draggable to reorder)
    - Each item shows: position, label, type, points
    - Remove button per item
- Buttons:
  - "Cancel" → `/tests`
  - "Create Test" (disabled if no questions)

**Workflow**:
1. Fill test details
2. Click "Add Questions"
3. Modal opens with all questions from question bank
4. Multi-select questions (checkboxes)
5. Confirm selection
6. Questions appear in list
7. Reorder if needed
8. Submit form
9. Success toast
10. Redirect to test details page

**API Calls**:
- `GET /test/questions` - Get all questions for modal
- `POST /test` - Create test

**Request Body**:
```json
{
  "name": "Java Fundamentals",
  "duration_minute": 60,
  "questions": [
    {"questionId": 1, "position": 1},
    {"questionId": 5, "position": 2}
  ]
}
```

**Components**:
- `<CreateTestForm />`
- `<QuestionSelectorModal />`
- `<SelectedQuestionsList />`
- `<DraggableQuestionItem />`

**Validation**:
- Test name: required, min 3 chars
- Duration: required, min 5, max 300
- Questions: at least 1 question required

**UX Enhancements**:
- Real-time validation
- Question search in selector modal
- Filter by question type in modal
- Preview question details in modal
- Loading spinner on submit

---

#### 9. Question Bank `/questions`
**Purpose**: View and manage all questions

**Content**:
- Page title: "Question Bank"
- Button: "Create Question" → `/questions/create`
- Filters:
  - Search bar (by label)
  - Question type filter (All, QCM, True/False, Open)
- Questions grid/table:
  - Question label
  - Type badge
  - Points
  - Hint (truncated, show on hover)
  - Answers count
  - Actions: "View" (expand inline), "Edit", "Delete"
- Pagination

**API Calls**:
- `GET /test/questions`

**Components**:
- `<QuestionsGrid />`
- `<QuestionCard />`
- `<QuestionTypeFilter />`
- `<SearchBar />`

**UX Enhancements**:
- Card layout for better visualization
- Skeleton loaders
- Empty state with illustration
- Expandable cards to view answers

---

#### 10. Create Question `/questions/create`
**Purpose**: Create a new question

**Content**:
- Page title: "Create New Question"
- Breadcrumb: Home > Questions > Create
- Form:
  - Question Type selector (radio buttons or tabs):
    - Multiple Choice (QCM)
    - True or False
    - Open Question
  - Question Label (textarea, required)
  - Hint (text input, optional)
  - Points (number input, required)
  
  **If QCM selected**:
  - Answers section:
    - "Add Answer" button
    - Answer items (minimum 2):
      - Answer text (input)
      - Correct checkbox (radio, only one can be correct)
      - Remove button
  
  **If True/False selected**:
  - Auto-generate two answers: "True" and "False"
  - Correct answer selector (radio)
  
  **If Open Question selected**:
  - Expected Answer (textarea, for AI scoring reference)
  - Keywords section:
    - "Add Keyword" button
    - Keyword items:
      - Keyword text (input)
      - Remove button

- Buttons:
  - "Cancel"
  - "Create Question"

**Workflow**:
1. Select question type
2. Form adapts to show relevant fields
3. Fill in question details
4. Add answers/keywords as needed
5. Submit
6. Success toast
7. Redirect to question bank

**API Calls**:
- `POST /test/questions`

**Request Examples**:

*QCM*:
```json
{
  "label": "What is polymorphism?",
  "hint": "Think about OOP",
  "points": 10.0,
  "questionType": "QCM",
  "answers": [
    {"label": "Ability to take many forms", "correct": true},
    {"label": "A loop", "correct": false}
  ]
}
```

*Open Question*:
```json
{
  "label": "Explain the JVM",
  "hint": "Think about execution",
  "points": 10.0,
  "questionType": "OPEN_QUESTION",
  "openAnswers": {
    "expectedAnswer": "The JVM is a runtime environment...",
    "keyWords": [
      {"keyword": "bytecode"},
      {"keyword": "platform independence"}
    ]
  }
}
```

**Components**:
- `<CreateQuestionForm />`
- `<QuestionTypeSelector />`
- `<AnswersManager />` (for QCM/True-False)
- `<KeywordsManager />` (for Open)
- `<DynamicAnswerInput />`

**Validation**:
- Label: required, min 10 chars
- Points: required, min 1, max 100
- QCM: at least 2 answers, exactly 1 correct
- True/False: must select correct answer
- Open: expected answer required

**UX Enhancements**:
- Dynamic form based on question type
- Visual preview of question
- Clear error messages
- Confirmation dialog if navigating away with unsaved changes

---

#### 11. Send Invitations `/invitations/send`
**Purpose**: Invite candidates to take a test

**Content**:
- Page title: "Send Test Invitations"
- Breadcrumb: Home > Invitations > Send
- Form:
  - Test selection (dropdown, searchable, required)
    - Shows test name and duration
  - Email addresses section:
    - Multiple email inputs (dynamic)
    - "Add Email" button
    - Remove button per email
    - OR: Bulk email textarea (comma or newline separated)
  - Expiration date/time picker (required)
    - Default: 7 days from now
- Preview section:
  - Shows how many invitations will be sent
  - Test details recap
- Buttons:
  - "Cancel"
  - "Send Invitations"

**Workflow**:
1. Select test from dropdown
2. Add candidate emails (one by one or bulk)
3. Set expiration date
4. Review preview
5. Submit
6. Loading state
7. Success modal:
   - "X invitations sent successfully"
   - "Access codes have been sent via email"
   - "View Sessions" button → test sessions page
8. Toast notification

**API Calls**:
- `GET /test` - Load tests for dropdown
- `POST /test/invitation`

**Request Body**:
```json
{
  "testId": 1,
  "emailCandidate": [
    "candidate1@email.com",
    "candidate2@email.com"
  ],
  "dateExpiration": "2026-02-01T23:59:59"
}
```

**Components**:
- `<SendInvitationsForm />`
- `<TestSelector />`
- `<EmailInputManager />`
- `<DateTimePicker />`
- `<InvitationPreview />`
- `<SuccessModal />`

**Validation**:
- Test: required
- Emails: at least 1, valid email format, no duplicates
- Expiration: required, must be future date

**UX Enhancements**:
- Email validation on blur
- Duplicate email detection
- Bulk paste support
- Loading spinner during submission
- Success animation

---

#### 12. Test Sessions `/tests/:testId/sessions`
**Purpose**: View all sessions for a specific test

**Content**:
- Page title: "[Test Name] - Sessions"
- Breadcrumb: Home > Tests > [Test Name] > Sessions
- Test info summary:
  - Test name
  - Duration
  - Total questions
- Statistics cards:
  - Total Invitations
  - Completed Sessions
  - Average Score
  - Pending Sessions
- Sessions table:
  - Candidate Email
  - Access Code
  - Status badge (PLANNED, ACTIVE, FINISHED)
  - Start Time
  - Expiration Time
  - Score (if finished)
  - Actions:
    - "View Results" (if finished) → results modal
    - "Resend Invitation" (if not used)
- Filters:
  - Status filter (All, Planned, Active, Finished)
  - Date range picker
- Export button: "Export to CSV"

**API Calls**:
- `GET /test/{testId}/sessions`

**Components**:
- `<SessionsTable />`
- `<SessionStatsCards />`
- `<StatusFilter />`
- `<ResultsModal />`
- `<StatusBadge />`

**UX Enhancements**:
- Color-coded status badges
- Sortable columns
- Real-time status updates (optional websocket)
- Loading skeleton
- Empty state

---

### Candidate Pages (Requires Candidate Authentication)

#### 13. Test Taking Page `/candidate/test`
**Purpose**: Candidate takes the test

**Layout**:
- Fixed header:
  - Test name
  - Timer (countdown, prominent, red when < 5 minutes)
  - Question counter: "Question X of Y"
- Main content (centered):
  - Current question display:
    - Question label
    - Hint (collapsible/toggleable)
    - Points indicator
    - Answer options based on type:
      - **QCM**: Radio buttons or checkboxes
      - **True/False**: Two large buttons (True/False)
      - **Open**: Textarea (rich text editor optional)
- Fixed footer:
  - Progress bar (% of questions answered)
  - "Previous" button (disabled on first question)
  - "Next" button
  - "Submit Test" button (only on last question or if all answered)

**Navigation**:
- Question carousel/pagination
- Side panel (collapsible) showing all questions:
  - Question numbers
  - Answered status (checkmark icon)
  - Click to jump to question

**Workflow**:
1. Page loads with test questions
2. Timer starts automatically
3. Candidate answers questions
4. Can navigate between questions
5. Can review answers before submission
6. Click "Submit Test"
7. Confirmation modal: "Are you sure? You cannot change answers after submission."
8. Confirm
9. Loading spinner
10. Redirect to results page

**Auto-submit**:
- When timer reaches 0, auto-submit test
- Show warning at 5 minutes remaining
- Show modal: "Time's up! Submitting your test..."

**API Calls**:
- `GET /auth/test/{testId}/questions` - Load questions
- `POST /candidate/submit-test` - Submit answers

**Request Body**:
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedAnswerId": 3,
      "openAnswerText": null
    },
    {
      "questionId": 2,
      "selectedAnswerId": null,
      "openAnswerText": "The JVM is a runtime environment..."
    }
  ]
}
```

**Components**:
- `<TestTakingLayout />`
- `<TestHeader />`
- `<Timer />`
- `<QuestionDisplay />`
- `<AnswerOptions />`
- `<NavigationFooter />`
- `<QuestionSidebar />`
- `<SubmitConfirmationModal />`
- `<TimeWarningModal />`

**State Management**:
- Store all answers in state
- Track current question index
- Track answered questions
- Timer state
- Auto-save answers to localStorage (recovery on refresh)

**Validation**:
- Warn if submitting with unanswered questions
- Validate open question text (not empty, min length)

**UX Enhancements**:
- Smooth transitions between questions
- Visual indicator for answered questions
- Keyboard shortcuts (arrow keys for navigation)
- Auto-focus on answer inputs
- Confirmation before leaving page
- Progress persistence (localStorage)

---

#### 14. Test Results Page `/candidate/results`
**Purpose**: Candidate views their test results

**Content**:
- Page title: "Your Test Results"
- Overall score card (large, centered):
  - Score percentage (large font)
  - Progress circle/bar
  - Score fraction: "85.5/100.0"
  - Status: "Test Completed"
- Summary statistics:
  - Total Questions
  - Questions Answered
  - Correct Answers
  - Test Name
  - Completion Time
- Detailed results section:
  - Section title: "Question-by-Question Breakdown"
  - Accordion/expandable list of all questions:
    - Question label
    - Question type badge
    - Your answer
    - Correct answer (for QCM/True-False)
    - Correctness indicator (✓ or ✗ icon)
    - Score earned: "8.0/10.0"
    - AI Feedback (for open questions)
- Actions:
  - "Download Results" button (PDF)
  - "Logout" button

**API Calls**:
- `GET /candidate/results`

**Response Example**:
```json
{
  "testSessionId": 5,
  "scorePercentage": 85.5,
  "totalScoreFraction": "85.5/100.0",
  "totalQuestions": 10,
  "answeredQuestions": 10,
  "status": "FINISHED",
  "questionResults": [
    {
      "questionId": 1,
      "questionLabel": "What is polymorphism?",
      "questionType": "QCM",
      "candidateAnswer": "Ability to take many forms",
      "correctAnswer": "Ability to take many forms",
      "isCorrect": true,
      "scoreFraction": "10.0/10.0",
      "pointsEarned": 10.0,
      "maxPoints": 10.0
    }
  ]
}
```

**Components**:
- `<ResultsOverview />`
- `<ScoreCard />`
- `<ResultsStats />`
- `<QuestionResultsList />`
- `<QuestionResultItem />` (expandable)
- `<FeedbackDisplay />`

**UX Enhancements**:
- Animated score reveal
- Color-coded results (green for correct, red for incorrect)
- Collapsible question details
- Print-friendly styles
- Celebrate animation if score > 80%

---

### Common Components

#### Navigation & Layout

**Admin Layout** (`<AdminLayout />`)
- Sidebar navigation:
  - Dashboard
  - Tests
  - Questions
  - Invitations (or integrated in tests)
  - Settings
  - Logout
- Top bar:
  - Enterprise name
  - User menu (logout)
  - Notifications (optional)
- Responsive (collapse sidebar on mobile)

**Candidate Layout** (`<CandidateLayout />`)
- Minimal header (just logo/test name)
- No sidebar
- Full-screen test interface

---

#### Reusable Components

**`<LoadingSpinner />`**
- Full-page overlay with spinner
- Use during API calls
- Prop: `message` (e.g., "Loading tests...")

**`<SkeletonLoader />`**
- Placeholder for loading content
- Variants: table, card, list

**`<Toast />`**
- Success, error, info, warning variants
- Auto-dismiss after 5 seconds
- Stack multiple toasts

**`<ConfirmDialog />`**
- Generic confirmation modal
- Props: title, message, onConfirm, onCancel
- Use for destructive actions

**`<EmptyState />`**
- Illustration + message
- Call-to-action button
- Props: title, message, actionLabel, onAction

**`<DataTable />`**
- Reusable table with:
  - Sorting
  - Pagination
  - Search
  - Custom cell renderers

**`<FormField />`**
- Wrapper for form inputs
- Label, error message, helper text
- Validation state styling

**`<StatusBadge />`**
- Color-coded badges for statuses
- Variants: success, warning, error, info

**`<PageHeader />`**
- Page title
- Breadcrumb
- Action buttons

---

## User Flows & Guidance Popups

### Onboarding Flow (Admin First Login)

**Step 1: Welcome Modal**
- Trigger: First login after enterprise creation
- Content:
  - "Welcome to Test Management System!"
  - "Let's get you started in 3 easy steps"
  - Illustration
  - "Start Tour" button

**Step 2: Create First Test (Guided)**
- Spotlight on "Create Test" button
- Tooltip: "Click here to create your first test"
- After click, guide through form fields with tooltips

**Step 3: Create Questions**
- Spotlight on "Create Question" button
- Tooltip: "Add questions to your question bank"

**Step 4: Send Invitations**
- Spotlight on "Send Invitations" button
- Tooltip: "Invite candidates to take your test"

**Implementation**: Use React Joyride or Intro.js

---

### Help System

**Help Icon** (Question mark icon in top bar)
- Click to open help panel
- Context-sensitive help based on current page
- Links to documentation
- "Show Tour Again" option

**Tooltips**
- Hover over icons/buttons to see descriptions
- Use for complex features

**Empty States**
- Show helpful messages when no data
- Guide user to create first item

---

## Design System

### Color Palette

**Primary Colors**
- Primary: `#1976d2` (Blue)
- Secondary: `#dc004e` (Pink/Red)
- Success: `#4caf50` (Green)
- Warning: `#ff9800` (Orange)
- Error: `#f44336` (Red)
- Info: `#2196f3` (Light Blue)

**Neutral Colors**
- Background: `#f5f5f5`
- Surface: `#ffffff`
- Text Primary: `#212121`
- Text Secondary: `#757575`
- Border: `#e0e0e0`

**Status Colors**
- PLANNED: `#9e9e9e` (Gray)
- ACTIVE: `#2196f3` (Blue)
- FINISHED: `#4caf50` (Green)
- EXPIRED: `#f44336` (Red)

### Typography

**Font Family**
- Sans-serif: `'Roboto', 'Helvetica', 'Arial', sans-serif`
- Monospace: `'Courier New', monospace` (for code/access codes)

**Font Sizes**
- h1: 2.5rem (40px)
- h2: 2rem (32px)
- h3: 1.75rem (28px)
- h4: 1.5rem (24px)
- h5: 1.25rem (20px)
- h6: 1rem (16px)
- body: 1rem (16px)
- small: 0.875rem (14px)

### Spacing

- Use 8px grid system
- Spacing scale: 8, 16, 24, 32, 40, 48, 64, 80

### Components Styling

**Buttons**
- Primary: Filled, primary color, white text
- Secondary: Outlined, primary color
- Text: No background, primary color text
- Disabled: Gray, 50% opacity
- Border radius: 4px
- Padding: 8px 16px
- Font weight: 500
- Hover: Darken 10%

**Cards**
- Background: White
- Border radius: 8px
- Box shadow: `0 2px 4px rgba(0,0,0,0.1)`
- Hover: Lift effect (increase shadow)

**Inputs**
- Border: 1px solid `#e0e0e0`
- Border radius: 4px
- Focus: Blue border, box shadow
- Error: Red border
- Padding: 12px
- Font size: 1rem

**Modals**
- Overlay: `rgba(0,0,0,0.5)`
- Modal: White background, centered
- Border radius: 8px
- Max width: 600px
- Padding: 24px
- Close button: Top right

**Tables**
- Header: Bold, background `#f5f5f5`
- Rows: Alternate row background for readability
- Hover: Light gray background
- Border: 1px solid `#e0e0e0`

### Icons
- Use consistent icon library (Material Icons)
- Size: 24px default
- Color: Match text color or primary

### Responsive Design

**Breakpoints**
- xs: 0px
- sm: 600px
- md: 960px
- lg: 1280px
- xl: 1920px

**Mobile First Approach**
- Design for mobile first
- Progressively enhance for larger screens
- Stack elements vertically on mobile
- Collapsible sidebar on mobile
- Touch-friendly button sizes (min 44px)

---

## Loading States & Animations

### Page Load
- Show skeleton loaders for content
- Fade in content when loaded
- Don't show spinners for < 200ms loads

### Button Actions
- Show spinner inside button during API call
- Disable button during loading
- Change button text: "Creating..." / "Saving..."

### Form Submission
- Full-page loader with overlay
- Message: "Submitting test..." / "Creating enterprise..."

### Data Tables
- Skeleton loader for table rows
- Shimmer animation effect

### Transitions
- Page transitions: Fade (200ms)
- Modal: Fade + scale (300ms)
- Tooltips: Fade (150ms)

---

## Error Handling

### API Errors

**401 Unauthorized**
- Clear session
- Redirect to login
- Toast: "Session expired. Please login again."

**400 Bad Request**
- Show field-level errors
- Toast: "Please check the form and try again."

**404 Not Found**
- Show 404 page
- "The page you're looking for doesn't exist"
- Button: "Go to Dashboard"

**500 Server Error**
- Toast: "Something went wrong. Please try again."
- Log error to console
- Option to retry

### Network Errors
- Toast: "Network error. Please check your connection."
- Retry button

### Validation Errors
- Inline field errors (red text below input)
- Prevent form submission
- Focus on first error field

---

## Accessibility

### WCAG 2.1 Level AA Compliance
- Color contrast ratio: 4.5:1 for text
- Keyboard navigation support
- Focus indicators
- ARIA labels on icons
- Alt text for images
- Semantic HTML

### Keyboard Shortcuts
- Tab: Navigate form fields
- Enter: Submit forms
- Escape: Close modals
- Arrow keys: Navigate questions (test taking)

### Screen Reader Support
- Proper heading hierarchy
- Descriptive link text
- Form labels associated with inputs
- Status announcements (live regions)

---

## Security Considerations

### Authentication
- Never store passwords in state/localStorage
- Cookie is HttpOnly (backend managed)
- Session timeout after 24 hours
- Logout clears cookies

### Data Protection
- Sanitize user inputs (prevent XSS)
- Use HTTPS in production
- Don't expose sensitive data in URLs
- Validate all inputs client-side and server-side

### CORS
- Backend must allow credentials: `Access-Control-Allow-Credentials: true`
- Frontend must send: `withCredentials: true`

---

## Performance Optimization

### Code Splitting
- Lazy load routes with React.lazy
- Separate admin and candidate bundles
- Load heavy libraries on demand

### Caching
- Cache API responses (React Query or SWR)
- Invalidate on mutations
- Cache static assets

### Image Optimization
- Use SVG for icons
- Compress images
- Lazy load images

### Bundle Size
- Tree shaking
- Remove unused dependencies
- Analyze bundle with webpack-bundle-analyzer

---

## Testing Requirements

### Unit Tests
- Test utility functions
- Test form validation
- Test API service functions
- Coverage: > 70%

### Component Tests
- Test with React Testing Library
- Test user interactions
- Test error states
- Test loading states

### E2E Tests
- Use Cypress or Playwright
- Test critical flows:
  - Enterprise registration
  - Admin login
  - Create test
  - Send invitation
  - Candidate login
  - Take test
  - View results

---

## Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api-rest-1.0-SNAPSHOT
VITE_ENV=development
```

Production `.env.production`:

```env
VITE_API_BASE_URL=https://api.testmanagement.com/api-rest-1.0-SNAPSHOT
VITE_ENV=production
```

---

## Project Structure

```
src/
├── assets/              # Images, icons, fonts
├── components/          # Reusable components
│   ├── common/         # Common UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Toast.tsx
│   │   └── ...
│   ├── forms/          # Form components
│   │   ├── FormField.tsx
│   │   ├── FormInput.tsx
│   │   ├── FormSelect.tsx
│   │   └── ...
│   ├── layout/         # Layout components
│   │   ├── AdminLayout.tsx
│   │   ├── CandidateLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   └── ...
├── pages/              # Page components
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── TestsList.tsx
│   │   ├── TestDetails.tsx
│   │   ├── CreateTest.tsx
│   │   ├── QuestionBank.tsx
│   │   ├── CreateQuestion.tsx
│   │   ├── SendInvitations.tsx
│   │   └── TestSessions.tsx
│   ├── candidate/
│   │   ├── TestTaking.tsx
│   │   └── Results.tsx
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── CandidateLogin.tsx
│   │   └── Register.tsx
│   ├── Landing.tsx
│   └── NotFound.tsx
├── services/           # API services
│   ├── api.ts         # Axios instance
│   ├── auth.service.ts
│   ├── test.service.ts
│   ├── question.service.ts
│   └── ...
├── store/             # State management
│   ├── slices/
│   │   ├── auth.slice.ts
│   │   ├── test.slice.ts
│   │   └── ...
│   └── store.ts
├── types/             # TypeScript types
│   ├── api/          # Auto-generated from OpenAPI
│   ├── models.ts
│   └── ...
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   ├── useTimer.ts
│   └── ...
├── utils/             # Utility functions
│   ├── validation.ts
│   ├── formatting.ts
│   └── ...
├── constants/         # Constants
│   ├── routes.ts
│   ├── statusColors.ts
│   └── ...
├── styles/            # Global styles
│   ├── theme.ts
│   ├── global.css
│   └── ...
├── App.tsx
├── main.tsx
└── router.tsx
```

---

## Implementation Phases

### Phase 1: Setup & Authentication (Week 1)
- [ ] Project setup (Vite + React + TypeScript)
- [ ] Install dependencies
- [ ] Generate API types from OpenAPI spec
- [ ] Configure Axios with interceptors
- [ ] Implement authentication flow
- [ ] Create login pages (admin + candidate)
- [ ] Create registration page
- [ ] Implement protected routes
- [ ] Create basic layouts (admin + candidate)

### Phase 2: Admin Dashboard & Test Management (Week 2)
- [ ] Dashboard with statistics
- [ ] Tests list page
- [ ] Create test page
- [ ] Test details page
- [ ] Test sessions page
- [ ] Send invitations page

### Phase 3: Question Management (Week 3)
- [ ] Question bank page
- [ ] Create question page (all types)
- [ ] Question selector modal
- [ ] Question preview components

### Phase 4: Candidate Test Taking (Week 4)
- [ ] Test taking interface
- [ ] Timer implementation
- [ ] Question navigation
- [ ] Answer submission
- [ ] Results page
- [ ] AI scoring integration

### Phase 5: Polish & UX (Week 5)
- [ ] Add all loading states
- [ ] Add skeleton loaders
- [ ] Implement guided tours
- [ ] Add help system
- [ ] Error handling & validation
- [ ] Responsive design
- [ ] Accessibility improvements
- [ ] Performance optimization

### Phase 6: Testing & Deployment (Week 6)
- [ ] Unit tests
- [ ] Component tests
- [ ] E2E tests
- [ ] Fix bugs
- [ ] Production build
- [ ] Deploy

---

## Key Implementation Notes

### 1. Cookie-Based Authentication
**CRITICAL**: The API uses cookie-based authentication. The frontend **must**:
- Set `withCredentials: true` in Axios config
- Never try to manually manage JWT tokens
- Let the browser handle cookie storage
- Backend sets `HttpOnly` cookies for security

### 2. OpenAPI Type Generation
**DO THIS FIRST**:
```bash
npm install --save-dev openapi-typescript-codegen
npx openapi-typescript-codegen --input ./openapi.yaml --output ./src/types/api --client axios
```

This generates:
- All TypeScript interfaces
- API service functions
- Request/Response types

**Use generated types everywhere**:
```typescript
import { TestResponse, TestRequest } from '@/types/api';
import { TestService } from '@/types/api/services/TestService';

// Use generated service
const tests = await TestService.getAllTests();
```

### 3. Form Validation
Use Zod for schema validation:
```typescript
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
```

### 4. State Management
Use Redux Toolkit or Zustand:
- Store: auth state (user, isAuthenticated, role)
- Store: current test session (for candidates)
- Don't over-store: use React Query for server state

### 5. Timer Implementation (Candidate Test)
```typescript
const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);

useEffect(() => {
  const interval = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        handleAutoSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

### 6. Auto-Save Answers
```typescript
useEffect(() => {
  localStorage.setItem('testAnswers', JSON.stringify(answers));
}, [answers]);

// On mount
useEffect(() => {
  const saved = localStorage.getItem('testAnswers');
  if (saved) setAnswers(JSON.parse(saved));
}, []);
```

### 7. Error Boundary
Wrap app in error boundary:
```typescript
class ErrorBoundary extends React.Component {
  // Catch runtime errors
  // Show fallback UI
  // Log to error service
}
```

---

## Success Criteria

### Functionality
- ✅ All features from OpenAPI spec implemented
- ✅ Authentication works correctly
- ✅ Tests can be created and managed
- ✅ Candidates can take tests
- ✅ Results are displayed accurately
- ✅ AI scoring works for open questions

### UX
- ✅ Intuitive navigation
- ✅ Responsive on all devices
- ✅ Fast loading times (< 2s for pages)
- ✅ Clear error messages
- ✅ Helpful empty states
- ✅ Smooth animations

### Code Quality
- ✅ TypeScript strict mode enabled
- ✅ No linting errors
- ✅ Consistent code style
- ✅ Reusable components
- ✅ Proper error handling
- ✅ Test coverage > 70%

### Accessibility
- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ WCAG 2.1 Level AA compliant
- ✅ Good color contrast

---

## Final Notes

This is a comprehensive test management system with both admin and candidate interfaces. Focus on:

1. **Security**: Cookie-based auth, input validation, HTTPS
2. **UX**: Loading states, error handling, helpful guidance
3. **Performance**: Code splitting, caching, optimization
4. **Accessibility**: Keyboard nav, ARIA labels, semantic HTML
5. **Maintainability**: Clean code, TypeScript, reusable components

**Reference the OpenAPI spec (`/openapi.yaml`) for all API contracts, request/response formats, and endpoint details.**

Good luck building an amazing test management application! 🚀

