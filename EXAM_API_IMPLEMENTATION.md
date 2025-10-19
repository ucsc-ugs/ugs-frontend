# Super Admin Exam Management API Implementation

## Overview
This document outlines the implementation of the Super Admin exam management system using centralized API services and proper error handling.

## Key Changes Made

### 1. Centralized API Service (`src/lib/superAdminApi.ts`)

**New Functions Added:**
- `getSuperAdminExams()` - Fetch all exams with student counts
- `deleteSuperAdminExam(examId)` - Delete a specific exam
- `updateSuperAdminExamStatus(examId, isActive)` - Toggle exam status

**API Endpoint Used:**
```
GET /api/admin/exam
DELETE /api/admin/exam/{id}
PATCH /api/admin/exam/{id}
```

**Authentication:**
- Uses Laravel Sanctum bearer token from `localStorage.getItem('super_admin_auth_token')`
- Automatic token validation and error handling
- Session expiry detection and cleanup

### 2. Updated ManageExams Component (`src/pages/superAdmin/ManageExams.tsx`)

**Improvements:**
- Removed duplicate API client code
- Uses centralized `superAdminApi` service
- Improved TypeScript type safety
- Better error handling with user-friendly messages
- Consistent data extraction pattern

**Data Structure Expected:**
```typescript
interface SuperAdminExam {
  id: number;
  name: string;
  description: string;
  price: number;
  organization: {
    id: number;
    name: string;
  };
  students_count: number;           // Primary student count field
  total_students_enrolled: number; // Alternative/backup field
  passing_rate: number;
  created_at: string;
  is_active: boolean;
}
```

## API Response Format

The backend should return data in this format:

```json
{
  "message": "Exams retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Sample Exam",
      "description": "Sample exam description",
      "price": 100.00,
      "organization": {
        "id": 1,
        "name": "University of Colombo School of Computing"
      },
      "students_count": 4,
      "total_students_enrolled": 4,
      "passing_rate": 75.5,
      "created_at": "2025-01-01T10:00:00.000000Z",
      "is_active": true
    }
  ]
}
```

## Frontend Usage Examples

### Fetching Exams
```typescript
import { getSuperAdminExams } from "@/lib/superAdminApi";

const fetchExams = async () => {
  try {
    const response = await getSuperAdminExams();
    const exams = response.data || [];
    setExams(exams);
  } catch (error) {
    console.error("Failed to fetch exams:", error);
    setError(error.message);
  }
};
```

### Deleting an Exam
```typescript
import { deleteSuperAdminExam } from "@/lib/superAdminApi";

const handleDelete = async (examId: number) => {
  try {
    await deleteSuperAdminExam(examId);
    setExams(prev => prev.filter(e => e.id !== examId));
  } catch (error) {
    console.error("Failed to delete exam:", error);
    setError(error.message);
  }
};
```

## Error Handling

The system handles these error scenarios:
- **401 Unauthorized**: Session expired, redirect to login
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Validation Error**: Invalid request data
- **500 Server Error**: Backend server issues

## Student Count Display

The frontend displays student enrollment counts using this priority:
1. `exam.students_count` (primary field)
2. `exam.total_students_enrolled` (fallback)
3. `exam.registered_students_count` (legacy support)
4. `0` (if none available)

## Real-time Updates

The component supports:
- **Manual Refresh**: Click refresh button
- **Auto Refresh**: Toggle 30-second automatic updates
- **Live Data**: Shows last updated timestamp

## Security Features

- Token-based authentication
- Automatic session expiry handling
- CSRF protection via API headers
- Input validation and sanitization

## Development Notes

- TypeScript strict mode enabled
- All API calls are properly typed
- Error boundaries implemented
- Loading states managed
- No console warnings or errors

## Testing the Implementation

1. Start the development server: `npm run dev`
2. Navigate to Super Admin → Manage Exams
3. Verify exam data loads correctly
4. Test refresh functionality
5. Test delete functionality (with proper confirmation)
6. Check error handling by testing with invalid tokens

## Performance Considerations

- Data fetching is optimized with loading states
- Auto-refresh can be toggled to reduce server load
- API calls are debounced where appropriate
- Minimal re-renders using proper dependency arrays

---

This implementation provides a robust, type-safe, and user-friendly exam management system for Super Admins with proper error handling and real-time capabilities.