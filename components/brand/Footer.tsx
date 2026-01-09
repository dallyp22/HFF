import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Heistand Family Foundation</h3>
            <p className="text-sm text-gray-600">
              To encourage and multiply opportunities for children in poverty
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-[var(--hff-teal)]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/eligibility" className="text-sm text-gray-600 hover:text-[var(--hff-teal)]">
                  Eligibility Criteria
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="text-sm text-gray-600 hover:text-[var(--hff-teal)]">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-sm text-gray-600 hover:text-[var(--hff-teal)]">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
            <p className="text-sm text-gray-600">
              Email: <a href="mailto:grants@heistandfamilyfoundation.org" className="hover:text-[var(--hff-teal)]">
                grants@heistandfamilyfoundation.org
              </a>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Serving the Omaha/Council Bluffs metro area and Western Iowa
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {currentYear} Heistand Family Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
