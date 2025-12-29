# UI Specification - Task Management Interface

## Overview
This document defines the user interface requirements for the task management system. The frontend is built with Next.js and integrates with the authenticated backend API.

## Technology Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth integration
- **API Integration**: Server-side and client-side API calls

## Page Structure

### 1. Authentication Pages
#### Login Page (`/login`)
- Email and password input fields
- Better Auth integration
- "Sign up" link for new users
- Error handling for authentication failures

#### Sign Up Page (`/signup`)
- Email and name input fields
- Password confirmation
- Better Auth integration
- "Already have an account?" link

### 2. Dashboard Pages
#### Task List Page (`/dashboard` or `/`)
- **Title**: "Your Tasks"
- **Header**: Welcome message with user name
- **Task List**: Display all tasks for the authenticated user
- **Add Task Button**: Modal or separate page for adding tasks
- **Task Cards**: Each task displayed as a card with:
  - Title (clickable to view/edit)
  - Description (truncated if long)
  - Completion status (checkbox)
  - Created date
  - Action buttons (Edit, Delete)

#### Add Task Page (`/tasks/new`)
- **Form Fields**:
  - Title (required, max 255 chars)
  - Description (optional, max 1000 chars)
  - Completed status (checkbox, defaults to false)
- **Submit Button**: "Create Task"
- **Cancel Button**: Return to task list

#### Edit Task Page (`/tasks/[id]/edit`)
- **Form Fields** (pre-filled with existing data):
  - Title (required, max 255 chars)
  - Description (optional, max 1000 chars)
  - Completed status (checkbox)
- **Submit Button**: "Update Task"
- **Cancel Button**: Return to task list
- **Delete Button**: Confirm and delete task

## Component Specifications

### Task Card Component
- **Visual Elements**:
  - Title with appropriate heading level
  - Description in smaller text
  - Checkbox for completion status
  - Date created/updated
  - Action buttons (Edit, Delete)
- **Behavior**:
  - Clicking title navigates to edit page
  - Checkbox updates completion status via API
  - Action buttons trigger appropriate API calls

### Task Form Component
- **Fields**:
  - Title input (text, required)
  - Description textarea (optional)
  - Completed checkbox (boolean)
- **Validation**:
  - Title: 1-255 characters
  - Description: max 1000 characters
  - Real-time validation feedback
- **Buttons**:
  - Submit (with loading state)
  - Cancel/Back navigation

## Authentication Integration
- **Session Management**: Better Auth session handling
- **Protected Routes**: Middleware to redirect unauthenticated users
- **User Context**: Global user state management
- **Token Handling**: Automatic JWT token attachment to API requests

## API Integration
- **Request Headers**: Authorization header with JWT token
- **Error Handling**: Display API errors to users
- **Loading States**: Visual feedback during API calls
- **Data Synchronization**: Real-time updates after API operations

## Responsive Design
- **Mobile**: Single-column layout, touch-friendly controls
- **Tablet**: Two-column layout for task lists
- **Desktop**: Multi-column layout with sidebar navigation

## User Experience
### Loading States
- Skeleton screens during data loading
- Progress indicators for API calls
- Optimistic updates where appropriate

### Error Handling
- Form validation errors
- API error messages
- Network error handling
- User-friendly error messages

### Accessibility
- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility

## Navigation Structure
```
/
├── /login
├── /signup
├── /dashboard (protected)
├── /tasks/new (protected)
├── /tasks/[id]/edit (protected)
└── /tasks/[id] (protected)
```

## Security Considerations
1. **Client-Side Validation**: Additional validation beyond API validation
2. **Authorization Headers**: Automatic token attachment to requests
3. **Session Expiry**: Handle token expiration gracefully
4. **Data Sanitization**: Sanitize user input before display