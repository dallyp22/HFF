# HFF Grant Portal

A comprehensive grant management system for the Heistand Family Foundation, built with Next.js 14, TypeScript, Prisma, and Clerk authentication.

## Mission

"To encourage and multiply opportunities for children in poverty" in the Omaha/Council Bluffs metro area and Western Iowa.

## Features Implemented

### Phase 1: Core Portal (✅ Completed)

- ✅ **Project Setup & Branding**
  - Next.js 14 with App Router
  - TypeScript configuration
  - Tailwind CSS with HFF brand colors (#204652 Teal, #536872 Slate)
  - shadcn/ui component library
  - HFF logo integration (full color, black, icon variants)
  - Inter font family

- ✅ **Authentication System**
  - Clerk authentication integration
  - Dual user types (Applicants vs. Reviewers)
  - Middleware for route protection
  - User sync webhook
  - Role-based access control
  - Sign-in/Sign-up pages

- ✅ **Database Architecture**
  - Prisma ORM with PostgreSQL
  - Comprehensive schema with 12+ models
  - Support for:
    - Users and Organizations
    - Applications with multi-step progress
    - Document library
    - AI-generated summaries
    - Status history and communications
    - Grant cycle configurations
    - Email templates
    - Audit logs

- ✅ **Branding Components**
  - Logo component (multiple variants and sizes)
  - Header with navigation (public, applicant, reviewer variants)
  - Footer with foundation information
  - HFF color system integrated into Tailwind

- ✅ **Public Marketing Pages**
  - Landing page with hero, grant cycles, and focus areas
  - About page with mission and grant approach
  - Eligibility criteria page with requirements

- ✅ **Organization Profile System**
  - Profile creation and editing
  - Comprehensive validation with Zod
  - Profile completion tracking
  - API routes for CRUD operations
  - Display of organization details

- ✅ **Applicant Dashboard**
  - Welcome screen with user greeting
  - Profile completion alerts
  - Application statistics
  - Quick action cards
  - Recent activity feed

### Phase 2: Features to Complete

#### Document Library (TODO)
- Vercel Blob storage integration
- Document upload/download
- Document categorization (Form 990, financials, etc.)
- Copy from library to applications

#### Application Form (TODO)
- 9-step multi-step form
- Auto-save functionality (every 30 seconds)
- Step navigation with progress tracking
- Document attachment
- Form validation
- Submit functionality

#### Reviewer Portal (TODO)
- Reviewer dashboard with statistics
- Application list with filters and search
- Application detail view with tabs
- Organization view with history
- Status management
- Private notes system

#### Email System (TODO)
- Resend integration
- HFF-branded email templates
- Automated notifications
- Communication tracking

#### AI Integration (TODO)
- OpenAI GPT-4o integration
- Application summary generation
- Mission alignment scoring
- Budget analysis
- Recommended questions

### Phase 3: Admin & Polish (TODO)

- User management interface
- Grant cycle configuration
- Email template editor
- Audit logging system
- Analytics dashboard
- Data export functionality
- Testing suite
- Performance optimization
- Security hardening

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Authentication:** Clerk
- **Database:** PostgreSQL (Railway recommended)
- **ORM:** Prisma
- **File Storage:** Vercel Blob
- **AI:** OpenAI GPT-4o
- **Email:** Resend
- **Hosting:** Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database (Railway, Neon, or local)
- Clerk account
- OpenAI API key (for AI features)
- Resend account (for emails)

### Installation

1. **Clone and Install Dependencies**

```bash
cd hff-grant-portal
npm install
```

2. **Environment Variables**

Create or update `.env.local`:

```env
# Database (get from Railway or your PostgreSQL provider)
DATABASE_URL="postgresql://user:password@host:port/database"

# Clerk (provided)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_ZWFzeS1yZWRiaXJkLTE1LmNsZXJrLmFjY291bnRzLmRldiQ"
CLERK_SECRET_KEY="sk_test_f45eCpRdKkYsVrYgGCcDjXZgQmwfo0oZgmxzLid7sx"
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/profile"

# OpenAI
OPENAI_API_KEY="sk-..."

# Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="grants@heistandfamilyfoundation.org"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. **Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (when database is configured)
npx prisma migrate dev

# Seed database with grant cycles and email templates
npx prisma db seed
```

4. **Run Development Server**

```bash
npm run dev
```

Visit `http://localhost:3000`

## Database Setup with Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string
5. Update `DATABASE_URL` in `.env.local`
6. Run migrations: `npx prisma migrate deploy`
7. Seed database: `npx prisma db seed`

## Clerk Configuration

1. Go to [clerk.com](https://clerk.com)
2. Create application
3. Configure OAuth providers (Google, Microsoft recommended)
4. Set up webhook:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy webhook secret to `CLERK_WEBHOOK_SECRET`
5. Create organization for reviewers
6. Add reviewer staff as organization members

## Project Structure

```
hff-grant-portal/
├── app/
│   ├── (applicant)/          # Applicant portal (auth required)
│   │   ├── dashboard/         # ✅ Dashboard
│   │   ├── profile/           # ✅ Organization profile
│   │   ├── documents/         # ⏳ Document library
│   │   └── applications/      # ⏳ Application management
│   ├── (reviewer)/            # ⏳ Reviewer portal
│   ├── api/                   # API routes
│   │   ├── organizations/     # ✅ Org CRUD
│   │   ├── applications/      # ⏳ App CRUD
│   │   ├── documents/         # ⏳ Document handling
│   │   └── webhooks/clerk/    # ✅ User sync
│   ├── sign-in/               # ✅ Sign in page
│   ├── sign-up/               # ✅ Sign up page
│   ├── about/                 # ✅ About page
│   ├── eligibility/           # ✅ Eligibility page
│   └── page.tsx               # ✅ Landing page
├── components/
│   ├── brand/                 # ✅ HFF branding components
│   └── ui/                    # ✅ shadcn/ui components
├── lib/
│   ├── auth/                  # ✅ Auth helpers
│   ├── validation/            # ✅ Zod schemas
│   └── prisma.ts              # ✅ Prisma client
├── prisma/
│   ├── schema.prisma          # ✅ Database schema
│   └── seed.ts                # ✅ Seed data
└── public/logos/              # ✅ HFF logo assets
```

## Key Implementation Notes

### Database Schema

The schema includes:
- **User** - Synced from Clerk, linked to Organization
- **Organization** - Nonprofit profile with Form 990 data
- **Application** - Grant applications with multi-step progress
- **Document** - File storage with organization/application scope
- **Note** - Private reviewer notes
- **StatusHistory** - Application status audit trail
- **Communication** - Email and message tracking
- **GrantCycleConfig** - Spring/Fall cycle configuration
- **EmailTemplate** - Customizable email templates
- **AuditLog** - System-wide activity logging

### Authentication Flow

1. User signs up via Clerk
2. Webhook creates User record in database
3. User redirected to create Organization profile
4. Once profile complete, can create Applications

**Reviewers:**
- Added as Clerk organization members
- Roles: `org:member` (viewer), `org:manager`, `org:admin`
- Middleware redirects to `/reviewer/dashboard`

### Profile Completion

Required fields:
- Legal name, EIN
- Address (street, city, state, ZIP)
- Phone, mission statement
- 501(c)(3) status
- Executive Director name and email

Completion percentage calculated and displayed. Applications cannot be submitted until profile is 100% complete.

### HFF Brand Colors

```css
--hff-teal: #204652        /* Primary brand color */
--hff-teal-50: #e8f4f6     /* Light backgrounds */
--hff-teal-900: #204652    /* Dark accents */

--hff-slate: #536872       /* Secondary color */
--hff-slate-50: #f5f7f8    /* Light backgrounds */
--hff-slate-900: #354047   /* Dark accents */
```

## Development Guidelines

### Adding New Features

1. Create necessary database models in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name feature_name`
3. Add validation schemas in `lib/validation/`
4. Create API routes in `app/api/`
5. Build UI components in `app/` and `components/`
6. Add to appropriate navigation in Header component

### Creating API Routes

All API routes should:
- Check authentication via `currentUser()`
- Validate user access (applicant vs. reviewer)
- Validate input with Zod schemas
- Handle errors appropriately
- Return consistent JSON responses

Example:
```typescript
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... implementation
}
```

### Access Control

Use helper functions from `lib/auth/access.ts`:
- `canAccessApplication(id)` - Check if user can view application
- `canModifyApplication(id)` - Check if user can edit application
- `isReviewer()` - Check if user is a reviewer
- `isManager()` - Check if user can manage statuses
- `isAdmin()` - Check if user has admin access

## Next Steps for Completion

### Immediate Priorities

1. **Complete Application Form** (High Priority)
   - Create 9-step form component
   - Implement auto-save
   - Add document attachment
   - Create submission workflow

2. **Build Document Library** (High Priority)
   - Set up Vercel Blob storage
   - Create upload/download UI
   - Implement document categorization
   - Enable library-to-application copying

3. **Reviewer Portal** (High Priority)
   - Dashboard with statistics
   - Application list with filters
   - Detail view with tabs
   - Status management UI

4. **AI Integration** (Medium Priority)
   - OpenAI client setup
   - Prompt engineering
   - Summary generation API
   - UI for displaying summaries

5. **Email System** (Medium Priority)
   - Resend integration
   - Template rendering
   - Automated notifications
   - Track communications

### Testing Strategy

- Unit tests for validation schemas
- Integration tests for API routes
- E2E tests for critical user flows
- Manual cross-browser testing

### Deployment Checklist

- [ ] Set up Railway PostgreSQL production database
- [ ] Configure Vercel project
- [ ] Add all environment variables to Vercel
- [ ] Set up Clerk production instance
- [ ] Configure custom domain
- [ ] Set up Vercel Blob storage
- [ ] Configure Resend domain verification
- [ ] Test webhook endpoints
- [ ] Run database migrations
- [ ] Seed production data (grant cycles, templates)
- [ ] Test complete user flows
- [ ] Set up monitoring and error tracking

## Support

For questions or issues, contact the development team or refer to the PRD documentation.

## License

Proprietary - Heistand Family Foundation

---

**Current Status:** Phase 1 Core Portal Complete (6/23 todos)
**Next Milestone:** Complete Application Form and Document Library
