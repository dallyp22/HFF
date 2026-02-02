import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/access'
import { sendEmail } from '@/lib/email'

const SIGN_UP_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`
  : 'https://hff-five.vercel.app/sign-up'

export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const senderName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'The Heistand Family Foundation'

    const result = await sendEmail({
      to: email,
      subject: 'You\'re Invited to Apply - Heistand Family Foundation Grant Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #204652; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Grant Portal Invitation</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <p style="font-size: 16px; color: #374151;">
              ${senderName} has invited you to register on the Heistand Family Foundation Grant Portal.
            </p>

            <p style="font-size: 16px; color: #374151;">
              Through the portal, your organization can submit Letters of Interest and full grant applications for funding consideration.
            </p>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #204652; margin-top: 0; font-size: 16px;">Getting Started</h2>
              <ol style="color: #374151; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Click the button below to create your account</li>
                <li style="margin-bottom: 8px;">Complete your organization profile</li>
                <li style="margin-bottom: 8px;">Submit a Letter of Interest when a grant cycle is open</li>
              </ol>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${SIGN_UP_URL}"
                 style="background: #204652; color: white; padding: 14px 36px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: 500;">
                Create Your Account
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
              Questions? Contact us at grants@heistandfamilyfoundation.org
            </p>
          </div>
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Heistand Family Foundation Grant Portal</p>
          </div>
        </div>
      `,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send invitation email' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
