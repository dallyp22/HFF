import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-6 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <strong>Capital Requests:</strong> Capital Requests must go through the Foundation Director. Do not apply for a Capital Grant through this portal.
        </div>
        <div className="text-center">
          <Link
            href="/sample-loi.pdf"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--hff-teal)] hover:underline"
          >
            View Sample LOI (PDF)
          </Link>
        </div>
      </div>
      <SignIn forceRedirectUrl="/auth/redirect" />
    </div>
  )
}
