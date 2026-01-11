# Clerk Webhook Setup Instructions

## Quick Setup (10 minutes)

This will fix the organization membership issue and enable proper role detection.

### Step 1: Create Webhook in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Click **"Webhooks"** in the left sidebar
4. Click **"Add Endpoint"**

### Step 2: Configure Webhook

**Endpoint URL:**
```
https://hff-five.vercel.app/api/webhooks/clerk
```

**Subscribe to Events:**
- ✅ `user.created`
- ✅ `user.updated`
- ✅ `user.deleted`
- ✅ `organizationMembership.created` (IMPORTANT!)
- ✅ `organizationMembership.updated`
- ✅ `organizationMembership.deleted`

Click **"Create"**

### Step 3: Get Signing Secret

1. After creating, click on the webhook
2. Reveal the **"Signing Secret"**
3. Copy it (starts with `whsec_`)

### Step 4: Add to Vercel

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Find `CLERK_WEBHOOK_SECRET` (or add new if doesn't exist)
3. Value: Paste the `whsec_...` secret
4. Save

### Step 5: Redeploy

1. Vercel → Deployments
2. Redeploy latest
3. Wait ~2 minutes

### Step 6: Test Webhook

**Create a test user:**
1. Sign up with a new email
2. Check Vercel function logs for webhook call
3. Check Railway database - user should appear in User table

**Add user to organization:**
1. In Clerk, add someone to HFF Reviewers
2. They should receive invitation email
3. After accepting, webhook should fire
4. Log out and log back in
5. Organization membership should now appear in session!

---

## Verification

After setup, users should:
- Automatically sync to database on signup
- Have organization memberships in session after login
- See correct role (Admin/Manager/Member)
- No more 403 errors
- Admin link appears without hardcoded email check

---

## Troubleshooting

**Webhook not firing:**
1. Check URL is exactly: `https://hff-five.vercel.app/api/webhooks/clerk`
2. Verify signing secret matches in Vercel env vars
3. Check Clerk webhook logs for delivery status
4. Check Vercel function logs for errors

**Still no organization membership in session:**
1. User must fully log out (not just close tab)
2. Clear browser cookies for the site
3. Log back in fresh
4. Check /debug page for organization data

**If still doesn't work:**
- Keep hardcoded email override
- Works as temporary solution
- Investigate Clerk session configuration further
