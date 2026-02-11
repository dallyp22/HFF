/**
 * Create 3 test applicant accounts in Clerk for Deb to test with.
 *
 * Usage: node scripts/create-test-users.mjs
 *
 * These accounts use +alias emails so all emails route to deb@heistandfamilyfoundation.org
 */

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error('Error: CLERK_SECRET_KEY environment variable is required.');
  console.error('Run with: CLERK_SECRET_KEY=sk_test_... node scripts/create-test-users.mjs');
  process.exit(1);
}

const TEST_USERS = [
  {
    email: 'deb+testapplicant1@heistandfamilyfoundation.org',
    password: 'HFF-Test-2026!a',
    firstName: 'Test',
    lastName: 'Applicant One',
  },
  {
    email: 'deb+testapplicant2@heistandfamilyfoundation.org',
    password: 'HFF-Test-2026!b',
    firstName: 'Test',
    lastName: 'Applicant Two',
  },
  {
    email: 'deb+testapplicant3@heistandfamilyfoundation.org',
    password: 'HFF-Test-2026!c',
    firstName: 'Test',
    lastName: 'Applicant Three',
  },
];

async function createUser(user) {
  const res = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: [user.email],
      password: user.password,
      first_name: user.firstName,
      last_name: user.lastName,
      skip_password_checks: false,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data.errors?.map(e => e.long_message || e.message).join(', ') || JSON.stringify(data);
    throw new Error(`Failed to create ${user.email}: ${errorMsg}`);
  }

  return data;
}

async function main() {
  console.log('Creating 3 test applicant accounts in Clerk...\n');

  const results = [];

  for (const user of TEST_USERS) {
    try {
      const created = await createUser(user);
      results.push({ success: true, email: user.email, password: user.password, clerkId: created.id });
      console.log(`  ✓ Created: ${user.email} (Clerk ID: ${created.id})`);
    } catch (err) {
      results.push({ success: false, email: user.email, error: err.message });
      console.log(`  ✗ Failed: ${user.email} — ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('TEST CREDENTIALS FOR DEB');
  console.log('='.repeat(70));

  for (const r of results) {
    if (r.success) {
      console.log(`\n  Email:    ${r.email}`);
      console.log(`  Password: ${r.password}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\nDeb can sign in at /sign-in with any of these credentials.');
  console.log('Each account will go through the full applicant flow:');
  console.log('  Sign in → Complete org profile → Submit LOI → Submit application');
  console.log('\nAll emails will be delivered to: deb@heistandfamilyfoundation.org');
}

main().catch(console.error);
