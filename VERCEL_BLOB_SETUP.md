# Vercel Blob Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Create Blob Storage

1. Go to your Vercel project dashboard
2. Click **"Storage"** tab in the left sidebar
3. Click **"Create Database"**
4. Select **"Blob"**
5. Click **"Continue"**
6. Name it: `hff-documents` (or any name)
7. Click **"Create"**

### Step 2: Get Token

After creation, Vercel will show you:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

**Copy this token!**

### Step 3: Add to Environment Variables

1. In Vercel project settings
2. Go to **"Environment Variables"** tab
3. Click **"Add New"**
4. Name: `BLOB_READ_WRITE_TOKEN`
5. Value: Paste the token you copied
6. Select all environments (Production, Preview, Development)
7. Click **"Save"**

### Step 4: Redeploy

1. Go to **"Deployments"** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait ~2 minutes

### Step 5: Test

After redeployment:
1. Log in to your portal
2. Go to **"Documents"** → **"Upload New"**
3. Upload a test PDF
4. Should upload successfully to Vercel Blob!

---

## Verification

Document uploads will now:
- Store in Vercel Blob (not local filesystem)
- Generate public URLs for downloads
- Support up to 10MB files
- Work reliably in production

---

## Troubleshooting

**If upload fails:**
1. Check Vercel environment variables have BLOB_READ_WRITE_TOKEN
2. Check deployment logs for errors
3. Verify token starts with `vercel_blob_rw_`
4. Try redeploying again

**Storage Location:**
Files are stored as:
- `organizations/{orgId}/filename.pdf`
- `applications/{appId}/filename.pdf`

You can view uploaded files in:
- Vercel Dashboard → Storage → Blob → Browse files
