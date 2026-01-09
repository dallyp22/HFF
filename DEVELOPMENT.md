# Development Guide

## Getting Started

### Local Development Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Set Up Database**

Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
# or use Docker

# Start PostgreSQL
brew services start postgresql

# Create database
createdb hff_grants_dev

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://localhost:5432/hff_grants_dev"
```

Option B: Railway (Recommended)
```bash
# Go to railway.app and create project
# Add PostgreSQL service
# Copy connection string to .env.local
```

3. **Run Migrations**
```bash
# Create database tables
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed initial data
npx prisma db seed
```

4. **Configure Clerk**
- Sign up at clerk.com
- Create new application
- Copy API keys to .env.local
- Set up webhook for user sync

5. **Start Development Server**
```bash
npm run dev
```

## Database Management

### Prisma Commands

```bash
# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name description_of_changes

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Format schema file
npx prisma format

# Generate TypeScript types
npx prisma generate
```

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change_name`
3. Prisma will:
   - Create migration file
   - Apply to database
   - Regenerate client types

### Seeding Data

The seed file (`prisma/seed.ts`) creates:
- Spring and Fall 2026 grant cycles
- Email templates
- Test organization (development only)

Run seed:
```bash
npx prisma db seed
```

## Project Architecture

### Route Organization

```
app/
├── (applicant)/     # Grouped routes for applicants
│   ├── layout.tsx   # Shared layout with auth check
│   └── */           # Individual pages
├── (reviewer)/      # Grouped routes for reviewers
├── api/             # API endpoints
└── *.tsx            # Public pages
```

### Data Flow

1. **User Authentication**
   - Clerk handles auth
   - Webhook syncs to database
   - Middleware protects routes

2. **Organization Profile**
   - User creates Organization
   - User linked to Organization
   - Profile completion tracked

3. **Applications**
   - Linked to Organization
   - Multi-step progress saved
   - Documents attached
   - AI summaries generated

### Component Patterns

**Server Components (default)**
```typescript
// Can fetch data directly
import { prisma } from '@/lib/prisma'

export default async function Page() {
  const data = await prisma.organization.findMany()
  return <div>{/* ... */}</div>
}
```

**Client Components**
```typescript
'use client'

import { useState } from 'react'

export function ClientComponent() {
  const [state, setState] = useState()
  // Can use hooks and interactivity
}
```

**Form Handling**
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(mySchema),
  })
  
  async function onSubmit(data) {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}
```

## API Route Patterns

### Standard GET Route
```typescript
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await prisma.model.findMany()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### POST with Validation
```typescript
import { mySchema } from '@/lib/validation/my-schema'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = mySchema.parse(body)

    const result = await prisma.model.create({
      data: validatedData,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Dynamic Routes
```typescript
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Use id to fetch specific resource
}
```

## Testing

### Unit Tests (TODO)
```bash
# Install testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

### E2E Tests (TODO)
```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test
```

## Environment Variables

Required variables:
```env
DATABASE_URL=              # PostgreSQL connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=  # Clerk public key
CLERK_SECRET_KEY=          # Clerk secret key
CLERK_WEBHOOK_SECRET=      # Clerk webhook signing secret
```

Optional (for full functionality):
```env
OPENAI_API_KEY=            # For AI summaries
RESEND_API_KEY=            # For emails
BLOB_READ_WRITE_TOKEN=     # For file uploads
```

## Common Tasks

### Add a New Page

1. Create file in appropriate directory
2. Export default component
3. Add to navigation in Header component

### Add a New API Endpoint

1. Create route file: `app/api/[endpoint]/route.ts`
2. Export HTTP method functions (GET, POST, etc.)
3. Add authentication check
4. Implement logic
5. Return NextResponse.json()

### Add a New Database Model

1. Add to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_model_name`
3. Use in API routes and pages

### Add Form Validation

1. Create schema in `lib/validation/[name].ts`
2. Export Zod schema and TypeScript type
3. Use in forms with react-hook-form
4. Use in API routes for validation

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Reset database
npx prisma migrate reset

# Check connection
npx prisma db pull
```

### Prisma Client Not Found
```bash
# Regenerate client
npx prisma generate
```

### Clerk Webhook Not Working
1. Check webhook secret in .env.local
2. Verify webhook URL in Clerk dashboard
3. Check logs for error messages
4. Test with Clerk webhook test feature

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Check for TypeScript errors
npm run build
```

## Code Style

- Use TypeScript for all files
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer async/await over promises
- Use descriptive variable names
- Add comments for complex logic
- Keep components small and focused

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/name

# Create pull request on GitHub
```

## Performance Tips

- Use Server Components when possible
- Minimize client-side JavaScript
- Optimize images with next/image
- Use database indexes (already in schema)
- Implement pagination for large lists
- Cache frequently accessed data
- Use Suspense for loading states

## Security Checklist

- ✅ Authentication on all protected routes
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ⏳ File upload validation
- ⏳ Rate limiting
- ⏳ CSRF protection
- ⏳ XSS protection
- ⏳ Security headers

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev)
