# User Management UI - Implementation Plan

## Overview
Build a comprehensive User Management interface in the Admin panel to allow admins to invite reviewers, manage roles, and view reviewer activity - eliminating the need to use the Clerk dashboard directly.

**Priority:** Medium  
**Estimated Effort:** 6-8 hours  
**Impact:** Low (Clerk dashboard workaround exists, but this improves admin UX significantly)

## Current State
- Admin dashboard at `app/reviewer/admin/page.tsx` has a "Manage Reviewers" card (line 120-130) that links to `/reviewer/admin/users`
- The page `/reviewer/admin/users` does NOT exist yet
- Admin dashboard already fetches reviewer count from Clerk (lines 16-27)
- HFF Organization ID is hardcoded: `org_382FE_JSV0UZW59`

## Features to Build

### 1. Users List Page ✅
**Location:** `app/reviewer/admin/users/page.tsx`

**Display:**
- Table/list showing all reviewers
- Columns: Name, Email, Role, Join Date, Actions
- Search/filter by name or email
- "Invite Reviewer" button at top
- Empty state if no reviewers
- Loading states

### 2. Invite Reviewer Dialog ✅
**Component:** `components/admin/InviteReviewerDialog.tsx`

**Fields:**
- Email address (required, validated)
- Role selection (Admin/Manager/Member)
- Optional welcome message

**Actions:**
- Send invitation via Clerk API
- Show success toast
- Refresh users list

### 3. Role Management ✅
**Inline Component or:** `components/admin/RoleChangeDropdown.tsx`

**Features:**
- Dropdown showing current role
- Options: Admin, Manager, Member
- Confirmation before changing
- Optimistic UI update
- Error handling with rollback

### 4. Remove User ✅
**Component:** `components/admin/RemoveUserDialog.tsx`

**Features:**
- Warning message about consequences
- Confirmation required
- API call to remove from organization
- Success feedback

## API Endpoints Needed

### 1. POST /api/admin/users/invite
**Request:**
```json
{
  "email": "reviewer@example.com",
  "role": "org:member",
  "message": "Welcome to HFF Grant Review Team"
}
```

**Clerk API:**
```typescript
await client.organizations.createOrganizationInvitation({
  organizationId: HFF_ORG_ID,
  emailAddress: email,
  role: role,
})
```

### 2. PATCH /api/admin/users/[userId]/role
**Request:**
```json
{
  "role": "org:admin"
}
```

**Clerk API:**
```typescript
await client.organizations.updateOrganizationMembership({
  organizationId: HFF_ORG_ID,
  userId: userId,
  role: role,
})
```

### 3. DELETE /api/admin/users/[userId]
**Clerk API:**
```typescript
await client.organizations.deleteOrganizationMembership({
  organizationId: HFF_ORG_ID,
  userId: userId,
})
```

## UI Design

### Users List Page
```
┌──────────────────────────────────────────────────────────────┐
│ Manage Reviewers                               [Invite User] │
├──────────────────────────────────────────────────────────────┤
│ [🔍 Search reviewers...]                                     │
├──────────────────────────────────────────────────────────────┤
│ Card: Reviewers List                                         │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Name            Email                  Role      Actions│   │
│ │ ─────────────────────────────────────────────────────── │   │
│ │ John Doe        john@hff.org          Admin     [···]  │   │
│ │ Jane Smith      jane@hff.org          Manager   [···]  │   │
│ │ Bob Johnson     bob@hff.org           Member    [···]  │   │
│ └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Actions Menu (···)
```
┌─────────────────┐
│ Change Role  >  │ → Admin / Manager / Member
│ Remove User     │
└─────────────────┘
```

### Invite Dialog
```
┌────────────────────────────────────┐
│ Invite Reviewer              [×]   │
├────────────────────────────────────┤
│ Email Address *                    │
│ ┌────────────────────────────────┐ │
│ │ reviewer@example.com           │ │
│ └────────────────────────────────┘ │
│                                    │
│ Role *                             │
│ ┌────────────────────────────────┐ │
│ │ Member               ▼         │ │
│ └────────────────────────────────┘ │
│                                    │
│ Welcome Message (Optional)         │
│ ┌────────────────────────────────┐ │
│ │                                │ │
│ └────────────────────────────────┘ │
│                                    │
│          [Cancel]  [Send Invite]   │
└────────────────────────────────────┘
```

## Implementation Steps

### Phase 1: Users List Page (2-3 hours)
1. Create `app/reviewer/admin/users/page.tsx`
2. Fetch members from Clerk API
3. Display in table format with shadcn/ui Table component
4. Add search input with client-side filtering
5. Add loading skeleton
6. Add empty state

### Phase 2: API Endpoints (2-3 hours)
1. Create `app/api/admin/users/invite/route.ts`
   - Validate email
   - Check admin access
   - Call Clerk API
   - Handle errors
2. Create `app/api/admin/users/[userId]/role/route.ts`
   - Validate role
   - Check admin access
   - Update via Clerk API
3. Create `app/api/admin/users/[userId]/route.ts` (DELETE)
   - Confirm admin access
   - Remove from organization via Clerk API

### Phase 3: Invite Dialog (1-2 hours)
1. Create `components/admin/InviteReviewerDialog.tsx`
2. Form with react-hook-form + zod validation
3. Email validation
4. Role selector
5. Submit to API
6. Success/error toast notifications
7. Close and refresh list on success

### Phase 4: Role Management (1 hour)
1. Add dropdown menu to each row
2. Confirm dialog before role change
3. Call PATCH API
4. Optimistic UI update
5. Toast notification

### Phase 5: Remove User (1 hour)
1. Create `components/admin/RemoveUserDialog.tsx`
2. Warning message
3. Confirm button
4. Call DELETE API
5. Remove from list on success
6. Toast notification

### Phase 6: Polish & Testing (1 hour)
1. Loading states during API calls
2. Error handling and messages
3. Mobile responsiveness
4. Test all actions
5. Update admin dashboard link

## Clerk Role Mapping

**Display Names → Clerk Roles:**
```typescript
const ROLE_DISPLAY = {
  'admin': 'Admin',
  'org:admin': 'Admin',
  'org:manager': 'Manager',
  'org:member': 'Member',
}

const ROLE_VALUES = {
  'Admin': 'org:admin',
  'Manager': 'org:manager',
  'Member': 'org:member',
}
```

## Authorization

All endpoints must verify admin access:
```typescript
import { currentUser } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/access'

const user = await currentUser()
if (!user || !(await isAdmin())) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

## Error Handling

**Common Errors:**
- User already invited → Show friendly message
- Invalid email → Client-side validation
- Permission denied → Check admin access first
- Network errors → Retry option
- User not found → Handle gracefully

## Success Feedback

- **Invitation sent:** Toast notification + add to pending section
- **Role changed:** Optimistic update + toast
- **User removed:** Remove from UI + toast
- All actions use `sonner` toast (already installed)

## Testing Checklist

- [ ] List displays all reviewers correctly
- [ ] Search filters work
- [ ] Invite sends and adds to list
- [ ] Role change updates role
- [ ] Remove deletes user
- [ ] Loading states appear
- [ ] Errors display properly
- [ ] Only admins can access
- [ ] Mobile responsive
- [ ] All toasts work

## Files to Create

1. `app/reviewer/admin/users/page.tsx` - Main users list page
2. `app/api/admin/users/invite/route.ts` - Invite endpoint
3. `app/api/admin/users/[userId]/role/route.ts` - Role change endpoint
4. `app/api/admin/users/[userId]/route.ts` - Remove user endpoint
5. `components/admin/InviteReviewerDialog.tsx` - Invite dialog component
6. `components/admin/RemoveUserDialog.tsx` - Remove confirmation dialog

## Dependencies

**Already Available:**
- `@clerk/nextjs` ✅
- `clerkClient()` ✅
- UI components (Button, Card, Dialog, Table, etc.) ✅
- `sonner` for toasts ✅
- `lucide-react` for icons ✅

**No new dependencies needed!**

## Notes

- Move `HFF_ORG_ID` to environment variable in future
- Invited users receive Clerk's default invitation email
- Role changes reflect immediately after webhook is configured
- This page is admin-only (requires `isAdmin()`)

## Future Enhancements (Out of Scope)

- Bulk invite (CSV upload)
- Pending invitations list
- User activity log
- Custom invitation email templates
- Usage statistics per reviewer
