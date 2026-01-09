# Deployment Guide

## Quick Start Deployment

This guide will walk you through deploying the HFF Grant Portal to Vercel (frontend) and Railway (database).

---

## Step 1: Railway Database Setup (15 minutes)

### 1.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended for easy integration)
3. Verify your email

### 1.2 Create New Project

1. Click **"New Project"**
2. Select **"Provision PostgreSQL"**
3. Railway will create a PostgreSQL database instance

### 1.3 Get Database Connection String

1. Click on your PostgreSQL service
2. Go to **"Variables"** tab
3. Copy the **`DATABASE_URL`** value
4. It will look like: `postgresql://postgres:password@region.railway.app:5432/railway`

### 1.4 Save Connection String

Keep this `DATABASE_URL` - you'll need it for:
- Vercel environment variables
- Local development (.env.local)

---

## Step 2: Vercel Deployment (10 minutes)

### 2.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with the **same GitHub account** you used for the repository
3. Verify your email

### 2.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Find and select the **`dallyp22/HFF`** repository
3. Click **"Import"**

### 2.3 Configure Build Settings

Vercel should auto-detect Next.js settings:
- **Framework Preset:** Next.js
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)

Click **"Deploy"** (will fail due to missing environment variables - that's expected!)

### 2.4 Add Environment Variables

1. Go to your project **Settings** → **Environment Variables**
2. Add the following variables:

#### Database
```
DATABASE_URL = [paste your Railway DATABASE_URL here]
```

#### Clerk (use your existing keys)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_ZWFzeS1yZWRiaXJkLTE1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY = sk_test_f45eCpRdKkYsVrYgGCcDjXZgQmwfo0oZgmxzLid7sx
CLERK_WEBHOOK_SECRET = [leave empty for now, will add after webhook setup]
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /profile
```

#### App URL (update after deployment)
```
NEXT_PUBLIC_APP_URL = [will be your-project.vercel.app]
```

#### Optional (can add later)
```
OPENAI_API_KEY = [your OpenAI key - add when ready to implement AI features]
RESEND_API_KEY = [get from resend.com when ready for emails]
EMAIL_FROM = grants@heistandfamilyfoundation.org
BLOB_READ_WRITE_TOKEN = [get from Vercel when ready for file uploads]
```

3. Click **"Save"**

### 2.5 Redeploy

1. Go to **"Deployments"** tab
2. Click **"..."** menu on the failed deployment
3. Select **"Redeploy"**

Your app should now build successfully! 🎉

---

## Step 3: Database Migration (5 minutes)

### 3.1 Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 3.2 Link Project

```bash
cd /Users/dallas/HFF/hff-grant-portal
vercel link
```

Follow prompts to link to your Vercel project.

### 3.3 Run Migrations on Production Database

```bash
# Pull environment variables from Vercel
vercel env pull .env.production

# Run migrations using production database
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy
```

### 3.4 Seed Production Database

```bash
# Seed grant cycles and email templates
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma db seed
```

---

## Step 4: Configure Clerk Webhook (10 minutes)

### 4.1 Get Vercel Deployment URL

1. In Vercel dashboard, find your deployment URL
2. It will be something like: `hff-grant-portal.vercel.app`
3. Or use your custom domain if configured

### 4.2 Create Clerk Webhook

1. Go to [clerk.com](https://clerk.com) dashboard
2. Select your application
3. Go to **"Webhooks"** in sidebar
4. Click **"Add Endpoint"**

### 4.3 Configure Webhook

**Endpoint URL:**
```
https://your-app.vercel.app/api/webhooks/clerk
```

**Subscribe to Events:**
- ✅ `user.created`
- ✅ `user.updated`
- ✅ `user.deleted`

Click **"Create"**

### 4.4 Get Webhook Secret

1. After creating, click on the webhook
2. Reveal the **Signing Secret**
3. Copy it (starts with `whsec_`)

### 4.5 Add Secret to Vercel

1. Back in Vercel → **Settings** → **Environment Variables**
2. Add new variable:
   ```
   CLERK_WEBHOOK_SECRET = whsec_your_secret_here
   ```
3. Click **"Save"**

### 4.6 Redeploy (Final Time)

1. Go to **"Deployments"**
2. Redeploy to pick up new environment variable

---

## Step 5: Configure Clerk Organization (5 minutes)

### 5.1 Create Organization for Reviewers

1. In Clerk dashboard, go to **"Organizations"**
2. Click **"Create Organization"**
3. Name it: **"HFF Reviewers"** or similar
4. This will be used for foundation staff/reviewers

### 5.2 Add Staff Members

1. Click on the organization
2. Go to **"Members"**
3. Click **"Invite Member"**
4. Enter staff email addresses
5. Assign roles:
   - **Admin** - Full system access
   - **Manager** - Can change application statuses
   - **Member** - View-only reviewer access

---

## Step 6: Test Your Deployment ✅

### 6.1 Test Public Pages

Visit your Vercel URL:
- ✅ Landing page loads
- ✅ About page works
- ✅ Eligibility page displays

### 6.2 Test Authentication

1. Click **"Apply for Grant"** or **"Sign Up"**
2. Create a test account
3. Verify email
4. Should redirect to `/dashboard`

### 6.3 Test Webhook

After creating account, check:
1. Railway database (via Prisma Studio)
2. New user should appear in `User` table
3. This confirms webhook is working

### 6.4 Test Profile Creation

1. From dashboard, click **"Create Profile"**
2. Fill in organization details
3. Submit
4. Verify data saves to database

---

## Step 7: Optional Enhancements

### 7.1 Custom Domain

1. In Vercel, go to **Settings** → **Domains**
2. Add: `grants.heistandfamilyfoundation.org`
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 7.2 Vercel Blob Storage (for file uploads)

When ready to implement document library:

1. In Vercel project, go to **Storage**
2. Click **"Create Database"**
3. Select **"Blob"**
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add to environment variables

### 7.3 Resend Email Setup

When ready for email notifications:

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Get API key
4. Add `RESEND_API_KEY` to environment variables

---

## Monitoring & Maintenance

### View Logs

**Vercel:**
- Go to **Deployments** → Click deployment → **Logs**

**Railway:**
- Click PostgreSQL service → **Logs** tab

### Database Management

**View Data:**
```bash
# From local machine, using production DATABASE_URL
npx prisma studio
```

**Run Migrations:**
```bash
# After schema changes
DATABASE_URL="your_production_url" npx prisma migrate deploy
```

### Rollback Deployment

In Vercel:
1. Go to **Deployments**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

---

## Troubleshooting

### Build Fails on Vercel

**Check:**
- Environment variables are set correctly
- No TypeScript errors locally (`npm run build`)
- Dependencies are in package.json

**Solution:**
```bash
# Test build locally
npm run build

# If it works locally but not on Vercel, check build logs
```

### Database Connection Errors

**Check:**
- `DATABASE_URL` is correct in Vercel environment variables
- Railway database is running (not paused)
- Migrations have been run

**Solution:**
```bash
# Re-run migrations
DATABASE_URL="your_url" npx prisma migrate deploy
```

### Webhook Not Working

**Check:**
- Webhook URL is correct (`https://your-app.vercel.app/api/webhooks/clerk`)
- `CLERK_WEBHOOK_SECRET` is set in Vercel
- Events are subscribed (user.created, user.updated, user.deleted)

**Test:**
- Create new user in Clerk
- Check webhook logs in Clerk dashboard
- Check Vercel function logs

### Users Not Appearing in Database

**Likely cause:** Webhook not configured

**Solution:**
1. Verify webhook endpoint in Clerk
2. Check Clerk webhook logs for errors
3. Verify `CLERK_WEBHOOK_SECRET` matches
4. Redeploy Vercel after adding secret

---

## Production Checklist

Before going live:

- [ ] Database migrations run on production
- [ ] Database seeded with grant cycles
- [ ] Clerk webhook configured and tested
- [ ] All environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Test user registration flow
- [ ] Test organization profile creation
- [ ] Clerk organization created for reviewers
- [ ] Staff members invited to Clerk organization
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Backup strategy for database

---

## Cost Estimates

**Vercel (Hobby Plan - Free):**
- Suitable for development and small production
- 100GB bandwidth/month
- Serverless function execution

**Railway (Hobby Plan - $5/month):**
- PostgreSQL database
- 500 hours/month execution time
- Shared CPU
- 8GB storage

**Clerk (Free Tier):**
- Up to 10,000 monthly active users
- Email/password + social logins
- Basic user management

**Total:** ~$5/month for development, scales as needed

---

## Next Steps

After successful deployment:

1. **Complete Application Form** - Allow users to submit grants
2. **Build Document Library** - File upload functionality
3. **Create Reviewer Portal** - For staff to review applications
4. **Integrate OpenAI** - AI-powered summaries
5. **Set up Emails** - Automated notifications

Refer to **PROJECT_STATUS.md** for detailed roadmap.

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Railway database logs
3. Review Clerk webhook logs
4. Test locally with production DATABASE_URL
5. Refer to DEVELOPMENT.md for troubleshooting

**Deployment complete!** 🚀

Your grant portal is now live and accessible at your Vercel URL!
