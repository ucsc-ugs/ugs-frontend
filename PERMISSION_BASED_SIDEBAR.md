# Permission-Based Dynamic Sidebar

## Overview
The `OrgAdminSidebar` component now dynamically shows/hides menu items based on the user's permissions from the authentication context. Only sidebar tabs with matching permissions will be displayed.

## How It Works

### 1. Permission System
The sidebar reads permissions from the `AuthContext` which are populated during login:

```typescript
const { user: authUser } = useAuth();
const userPermissions = authUser?.meta?.permissions || [];
```

### 2. Permission Checking Function
```typescript
const hasPermission = (userPermissions: string[] | undefined, requiredPermissions: string[]): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No permissions required, always visible
  }
  if (!userPermissions || userPermissions.length === 0) {
    return false; // No user permissions
  }
  // Check if user has at least one of the required permissions (OR logic)
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};
```

### 3. Menu Item Permissions

#### Main Links
- **Dashboard**: `[]` - Always visible
- **Finance Dashboard**: `["payments.view", "payments.create", "payments.update"]`
- **Notifications**: `[]` - Always visible
- **Set Announcements**: `["announcement.create", "announcement.view", "announcement.update", "announcement.publish"]`
- **Settings**: `["organization.view", "organization.update"]`

#### Exam Management Links
- **Manage Exams**: `["exam.create", "exam.view", "exam.update", "exam.schedule.set", "exam.schedule.update", "exam.registration.deadline.set", "exam.registration.deadline.extend"]`
- **Publish Results**: `["exam.view", "exam.update"]`

#### User Management Links
- **Manage Students**: `["student.create", "student.view", "student.update", "student.delete", "student.detail.view"]`
- **Manage Admin**: `["organization.admins.create", "organization.admins.view", "organization.admins.update", "organization.admins.delete"]`

### 4. Dynamic Filtering
The sidebar filters all menu items based on permissions:

```typescript
const filteredMainLinks = mainLinks.filter(link => hasPermission(userPermissions, link.permissions));
const filteredExamLinks = examLinks.filter(link => hasPermission(userPermissions, link.permissions));
const filteredUserLinks = userLinks.filter(link => hasPermission(userPermissions, link.permissions));

// Dropdowns are only shown if they have at least one visible sub-item
const showExamsDropdown = filteredExamLinks.length > 0;
const showUsersDropdown = filteredUserLinks.length > 0;
```

## Example Scenarios

### Scenario 1: Finance-Only Admin
**Login Response:**
```json
{
  "meta": {
    "permissions": ["payments.view", "payments.create", "payments.update"]
  }
}
```

**Visible Sidebar Items:**
- ✅ Dashboard
- ✅ Finance Dashboard
- ✅ Notifications
- ❌ Set Announcements (needs announcement permissions)
- ❌ Settings (needs organization permissions)
- ❌ Exams dropdown (hidden - no exam permissions)
- ❌ Manage Users dropdown (hidden - no user management permissions)

### Scenario 2: Exam-Only Admin
**Login Response:**
```json
{
  "meta": {
    "permissions": [
      "exam.create",
      "exam.view",
      "exam.update",
      "exam.schedule.set",
      "exam.schedule.update"
    ]
  }
}
```

**Visible Sidebar Items:**
- ✅ Dashboard
- ✅ Exams dropdown
  - ✅ Manage Exams
  - ✅ Publish Results
- ✅ Notifications
- ❌ Finance Dashboard (hidden - no payment permissions)
- ❌ Set Announcements (hidden - no announcement permissions)
- ❌ Settings (hidden - no organization permissions)
- ❌ Manage Users dropdown (hidden - no user management permissions)

### Scenario 3: Full Access Admin (Your Case)
**Login Response:**
```json
{
  "meta": {
    "permissions": [
      "exam.create",
      "payments.view",
      "payments.create",
      "payments.update"
    ]
  }
}
```

**Visible Sidebar Items:**
- ✅ Dashboard
- ✅ Finance Dashboard (has payment permissions)
- ✅ Exams dropdown (has exam permissions)
  - ✅ Manage Exams
  - ✅ Publish Results
- ✅ Notifications
- ❌ Set Announcements (needs announcement.create, announcement.view, announcement.update, or announcement.publish)
- ❌ Settings (needs organization.view or organization.update)
- ❌ Manage Users dropdown (needs student or admin management permissions)

### Scenario 4: User Management Admin
**Login Response:**
```json
{
  "meta": {
    "permissions": [
      "student.view",
      "student.create",
      "student.update",
      "organization.admins.view"
    ]
  }
}
```

**Visible Sidebar Items:**
- ✅ Dashboard
- ✅ Manage Users dropdown
  - ✅ Manage Students
  - ✅ Manage Admin
- ✅ Notifications
- ❌ Finance Dashboard (hidden)
- ❌ Set Announcements (hidden)
- ❌ Settings (hidden)
- ❌ Exams dropdown (hidden)

### Scenario 5: Announcement Manager
**Login Response:**
```json
{
  "meta": {
    "permissions": [
      "announcement.create",
      "announcement.view",
      "announcement.update",
      "announcement.publish"
    ]
  }
}
```

**Visible Sidebar Items:**
- ✅ Dashboard
- ✅ Set Announcements
- ✅ Notifications
- ❌ Finance Dashboard (hidden)
- ❌ Settings (hidden)
- ❌ Exams dropdown (hidden)
- ❌ Manage Users dropdown (hidden)

### Scenario 6: Settings Manager
**Login Response:**
```json
{
  "meta": {
    "permissions": ["organization.view", "organization.update"]
  }
}
```

**Visible Sidebar Items:**
- ✅ Dashboard
- ✅ Settings
- ✅ Notifications
- ❌ Finance Dashboard (hidden)
- ❌ Set Announcements (hidden)
- ❌ Exams dropdown (hidden)
- ❌ Manage Users dropdown (hidden)

### Scenario 7: Comprehensive Admin
**Login Response:**
```json
{
  "meta": {
    "permissions": [
      "organization.view",
      "organization.update",
      "organization.admins.view",
      "student.view",
      "student.update",
      "exam.create",
      "exam.view",
      "exam.update",
      "payments.view",
      "announcement.create",
      "announcement.view",
      "announcement.update",
      "announcement.publish"
    ]
  }
}
```

**Visible Sidebar Items:**
- ✅ Dashboard
- ✅ Finance Dashboard
- ✅ Exams dropdown (full access)
  - ✅ Manage Exams
  - ✅ Publish Results
- ✅ Manage Users dropdown (full access)
  - ✅ Manage Students
  - ✅ Manage Admin
- ✅ Notifications
- ✅ Set Announcements
- ✅ Settings

## Customization Guide

### Adding New Permissions

To add a new permission-protected menu item:

```typescript
const mainLinks = [
  // Existing items...
  { 
    name: "Reports", 
    path: "/admin/reports", 
    icon: FileText, 
    permissions: ["reports.view", "reports.generate"]
  },
];
```

### Modifying Permission Requirements

To change which permissions are required for a menu item:

```typescript
// Original
{ name: "Finance Dashboard", path: "/admin/finance", icon: DollarSign, permissions: ["payments.view", "payments.create", "payments.update"] }

// Modified to require only view permission
{ name: "Finance Dashboard", path: "/admin/finance", icon: DollarSign, permissions: ["payments.view"] }
```

### Making a Protected Item Always Visible

To make a currently protected item always visible, set permissions to empty array:

```typescript
// Before: Requires permissions
{ name: "Finance Dashboard", path: "/admin/finance", icon: DollarSign, permissions: ["payments.view"] }

// After: Always visible
{ name: "Finance Dashboard", path: "/admin/finance", icon: DollarSign, permissions: [] }
```

### Making an Always-Visible Item Protected

To add permission requirements to an item that's always visible:

```typescript
// Before: Always visible
{ name: "Notifications", path: "/admin/notifications", icon: Bell, permissions: [] }

// After: Requires notification permissions
{ name: "Notifications", path: "/admin/notifications", icon: Bell, permissions: ["notifications.view"] }
```

## Permission Logic

### OR Logic (Current Implementation)
The current implementation uses **OR logic** - a user needs **at least ONE** of the required permissions:

```typescript
return requiredPermissions.some(permission => userPermissions.includes(permission));
```

**Example:**
- Required: `["payments.view", "payments.create", "payments.update"]`
- User has: `["payments.view"]`
- **Result:** ✅ Access granted (has one of the required permissions)

### AND Logic (Alternative)
If you want to require **ALL** permissions instead, change to:

```typescript
return requiredPermissions.every(permission => userPermissions.includes(permission));
```

**Example:**
- Required: `["payments.view", "payments.create"]`
- User has: `["payments.view"]`
- **Result:** ❌ Access denied (needs both permissions)

## Backend Integration

Ensure your backend returns permissions in the login response:

```json
{
  "message": "Login successful",
  "token": "...",
  "type": "user",
  "role": "org_admin",
  "id": 15,
  "organization_id": 1,
  "user_type": "org-admin",
  "data": {
    "name": "Havi",
    "email": "ah@h.c"
  },
  "meta": {
    "permissions": [
      "exam.create",
      "payments.view",
      "payments.create",
      "payments.update"
    ]
  }
}
```

## Testing

### Testing Different Permission Sets

1. **Create test users** with different permission combinations in your backend
2. **Log in** with each user
3. **Verify** that the sidebar shows only the appropriate menu items
4. **Test navigation** - ensure users can't access routes they shouldn't see
5. **Test dropdowns** - verify they disappear when all sub-items are hidden

### Quick Test Commands

```bash
# Test in browser console after login
console.log('User Permissions:', localStorage.getItem('auth_token'));

# Or check the auth context
// In React DevTools, look at the AuthContext provider value
```

## Complete Permission List

Here's the complete list of all possible org admin permissions:

### Organization Permissions
- `organization.view` - View organization information
- `organization.update` - Update organization settings

### Organization Admin Management
- `organization.admins.create` - Create new organization admins
- `organization.admins.view` - View organization admins
- `organization.admins.update` - Update organization admin details
- `organization.admins.delete` - Delete organization admins

### Student Management Permissions
- `student.create` - Create new students
- `student.view` - View student list
- `student.update` - Update student information
- `student.delete` - Delete students
- `student.detail.view` - View detailed student information

### Exam Permissions
- `exam.create` - Create new exams
- `exam.view` - View exam information
- `exam.update` - Update/edit exams
- `exam.schedule.set` - Set exam schedules
- `exam.schedule.update` - Update exam schedules
- `exam.registration.deadline.set` - Set exam registration deadlines
- `exam.registration.deadline.extend` - Extend exam registration deadlines

### Payment Permissions
- `payments.view` - View payment/finance information
- `payments.create` - Create new payments
- `payments.update` - Update payment information

### Announcement Permissions
- `announcement.create` - Create new announcements
- `announcement.view` - View announcements
- `announcement.update` - Update/edit announcements
- `announcement.publish` - Publish announcements

## Security Note

⚠️ **Important:** The sidebar visibility is for UI/UX only. You MUST also implement permission checks on:
1. **Backend API endpoints** - Verify permissions server-side
2. **Frontend route guards** - Prevent direct URL access to protected pages
3. **Component-level checks** - Hide/disable features within pages based on permissions

The sidebar filtering provides a better user experience, but does not replace proper authorization checks.

## Troubleshooting

### Sidebar items not appearing
- Check if user permissions are loaded: `console.log(authUser?.meta?.permissions)`
- Verify permissions array matches exactly (case-sensitive)
- Check if AuthContext is properly populated after login

### Dropdowns showing when they shouldn't
- Verify that all sub-items have appropriate permissions set
- Check the filtering logic is working: `console.log(filteredExamLinks)`

### All items appearing for all users
- Ensure permissions are being retrieved from AuthContext
- Check if permissions array is properly formatted in login response
- Verify the `hasPermission` function is being called correctly

## Future Enhancements

1. **Role-based permissions** - Map roles to permission sets
2. **Hierarchical permissions** - Support parent/child permission relationships
3. **Dynamic permission loading** - Fetch permissions separately from login
4. **Permission caching** - Cache permissions to reduce API calls
5. **Granular permissions** - Add more specific permissions for each feature
