# Org Admin Permission Mapping - Quick Reference

## Current Sidebar Permission Configuration

### Main Navigation Items

| Menu Item | Path | Required Permissions (OR logic) |
|-----------|------|--------------------------------|
| Dashboard | `/admin` | `[]` (Always visible) |
| Finance Dashboard | `/admin/finance` | `payments.view` OR `payments.create` OR `payments.update` |
| Notifications | `/admin/notifications` | `[]` (Always visible) |
| Set Announcements | `/admin/set-announcements` | `announcement.create` OR `announcement.view` OR `announcement.update` OR `announcement.publish` |
| Settings | `/admin/settings` | `organization.view` OR `organization.update` |

### Exams Dropdown

| Menu Item | Path | Required Permissions (OR logic) |
|-----------|------|--------------------------------|
| Manage Exams | `/admin/manage-exams` | `exam.create` OR `exam.view` OR `exam.update` OR `exam.schedule.set` OR `exam.schedule.update` OR `exam.registration.deadline.set` OR `exam.registration.deadline.extend` |
| Publish Results | `/admin/publish-results` | `exam.view` OR `exam.update` |

**Note:** The entire "Exams" dropdown is hidden if user has no exam-related permissions.

### Manage Users Dropdown

| Menu Item | Path | Required Permissions (OR logic) |
|-----------|------|--------------------------------|
| Manage Students | `/admin/student-management` | `student.create` OR `student.view` OR `student.update` OR `student.delete` OR `student.detail.view` |
| Manage Admin | `/admin/manage-users` | `organization.admins.create` OR `organization.admins.view` OR `organization.admins.update` OR `organization.admins.delete` |

**Note:** The entire "Manage Users" dropdown is hidden if user has no student or admin management permissions.

---

## All Available Permissions

### Organization Management (2)
```
organization.view
organization.update
```

### Organization Admin Management (4)
```
organization.admins.create
organization.admins.view
organization.admins.update
organization.admins.delete
```

### Student Management (5)
```
student.create
student.view
student.update
student.delete
student.detail.view
```

### Exam Management (7)
```
exam.create
exam.view
exam.update
exam.schedule.set
exam.schedule.update
exam.registration.deadline.set
exam.registration.deadline.extend
```

### Payment Management (3)
```
payments.view
payments.create
payments.update
```

### Announcement Management (4)
```
announcement.create
announcement.view
announcement.update
announcement.publish
```

**Total: 25 permissions**

---

## Permission Groups for Common Roles

### Full Super Admin
```json
[
  "organization.view",
  "organization.update",
  "organization.admins.create",
  "organization.admins.view",
  "organization.admins.update",
  "organization.admins.delete",
  "student.create",
  "student.view",
  "student.update",
  "student.delete",
  "student.detail.view",
  "exam.create",
  "exam.view",
  "exam.update",
  "exam.schedule.set",
  "exam.schedule.update",
  "exam.registration.deadline.set",
  "exam.registration.deadline.extend",
  "payments.view",
  "payments.create",
  "payments.update",
  "announcement.create",
  "announcement.view",
  "announcement.update",
  "announcement.publish"
]
```

### Finance Manager
```json
[
  "payments.view",
  "payments.create",
  "payments.update"
]
```

### Exam Coordinator
```json
[
  "exam.create",
  "exam.view",
  "exam.update",
  "exam.schedule.set",
  "exam.schedule.update",
  "exam.registration.deadline.set",
  "exam.registration.deadline.extend"
]
```

### Student Administrator
```json
[
  "student.create",
  "student.view",
  "student.update",
  "student.delete",
  "student.detail.view"
]
```

### Admin Manager
```json
[
  "organization.admins.create",
  "organization.admins.view",
  "organization.admins.update",
  "organization.admins.delete"
]
```

### Communications Manager
```json
[
  "announcement.create",
  "announcement.view",
  "announcement.update",
  "announcement.publish"
]
```

### Settings Manager
```json
[
  "organization.view",
  "organization.update"
]
```

### Read-Only Viewer
```json
[
  "organization.view",
  "student.view",
  "student.detail.view",
  "exam.view",
  "payments.view",
  "announcement.view"
]
```

---

## Quick Test Cases

### Test Case 1: Finance Only
**Permissions:** `["payments.view"]`
**Expected Sidebar:**
- ✅ Dashboard
- ✅ Finance Dashboard
- ✅ Notifications
- ❌ Set Announcements
- ❌ Settings
- ❌ Exams
- ❌ Manage Users

### Test Case 2: Exam Manager
**Permissions:** `["exam.create", "exam.view", "exam.update"]`
**Expected Sidebar:**
- ✅ Dashboard
- ✅ Exams → Manage Exams, Publish Results
- ✅ Notifications
- ❌ Finance Dashboard
- ❌ Set Announcements
- ❌ Settings
- ❌ Manage Users

### Test Case 3: Student Manager
**Permissions:** `["student.view", "student.update"]`
**Expected Sidebar:**
- ✅ Dashboard
- ✅ Manage Users → Manage Students
- ✅ Notifications
- ❌ Finance Dashboard
- ❌ Set Announcements
- ❌ Settings
- ❌ Exams

### Test Case 4: Announcement Manager
**Permissions:** `["announcement.create", "announcement.publish"]`
**Expected Sidebar:**
- ✅ Dashboard
- ✅ Set Announcements
- ✅ Notifications
- ❌ Finance Dashboard
- ❌ Settings
- ❌ Exams
- ❌ Manage Users

### Test Case 5: Your Current Setup
**Permissions:** `["exam.create", "payments.view", "payments.create", "payments.update"]`
**Expected Sidebar:**
- ✅ Dashboard
- ✅ Finance Dashboard
- ✅ Exams → Manage Exams, Publish Results
- ✅ Notifications
- ❌ Set Announcements (needs announcement permissions)
- ❌ Settings (needs organization permissions)
- ❌ Manage Users (needs student/admin permissions)

---

## How to Grant Permissions

### Backend Implementation Example
When creating/updating an org admin in your Laravel backend:

```php
// Assign specific permissions
$orgAdmin->permissions = [
    'exam.create',
    'exam.view',
    'exam.update',
    'payments.view'
];

// Or assign all permissions
$orgAdmin->permissions = [
    'organization.view',
    'organization.update',
    // ... all 25 permissions
];
```

### Login Response Format
```json
{
  "message": "Login successful",
  "token": "5|Zz1hyGNcTNTukTBHpTrmMilAQaMsZRAgnvuMYxnA4e517ffb",
  "type": "user",
  "role": "org_admin",
  "id": 15,
  "organization_id": 1,
  "user_type": "org-admin",
  "data": {
    "name": "Havi",
    "email": "ah@h.c",
    "created_at": "2025-10-18T07:11:30.000000Z",
    "student": null
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

---

## Testing Checklist

- [ ] Test with no permissions (should only see Dashboard and Notifications)
- [ ] Test with payment permissions only (Finance Dashboard should appear)
- [ ] Test with exam permissions only (Exams dropdown should appear)
- [ ] Test with student permissions only (Manage Students should appear)
- [ ] Test with admin permissions only (Manage Admin should appear)
- [ ] Test with announcement permissions only (Set Announcements should appear)
- [ ] Test with organization permissions only (Settings should appear)
- [ ] Test with all permissions (all menu items should appear)
- [ ] Test permission mixing (e.g., exams + payments)
- [ ] Verify dropdowns hide when all sub-items are hidden
- [ ] Verify direct URL access is also protected (not just sidebar hiding)

---

## Important Notes

1. **OR Logic**: Users need **at least ONE** of the listed permissions to see a menu item
2. **Always Visible**: Dashboard and Notifications appear regardless of permissions
3. **Dropdown Visibility**: Dropdowns (Exams, Manage Users) only show if at least one sub-item is accessible
4. **Security**: Sidebar hiding is for UX only - implement backend permission checks too
5. **Case Sensitive**: All permissions are lowercase with dots (e.g., `exam.create` not `Exam.Create`)

---

## Troubleshooting

### "Set Announcements not showing"
✅ User needs at least one of: `announcement.create`, `announcement.view`, `announcement.update`, or `announcement.publish`

### "Settings not showing"
✅ User needs at least one of: `organization.view` or `organization.update`

### "Exams dropdown not showing"
✅ User needs at least one exam permission (`exam.*`)

### "Manage Users dropdown not showing"
✅ User needs at least one student permission (`student.*`) OR one admin permission (`organization.admins.*`)

### "Finance Dashboard not showing"
✅ User needs at least one of: `payments.view`, `payments.create`, or `payments.update`
