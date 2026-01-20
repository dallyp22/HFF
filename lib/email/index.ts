import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Heistand Family Foundation <grants@heistandfamilyfoundation.org>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://grants.heistandfamilyfoundation.org'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email:', { to, subject })
    return { success: false, error: 'Email not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', data?.id)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// ============================================
// LOI EMAILS
// ============================================

export async function sendLOISubmittedToAdmin(params: {
  loiId: string
  projectTitle: string
  organizationName: string
  contactEmail: string
  requestAmount: string
  adminEmails: string[]
}) {
  const { loiId, projectTitle, organizationName, contactEmail, requestAmount, adminEmails } = params

  if (adminEmails.length === 0) {
    console.warn('No admin emails configured for LOI submission notification')
    return
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #204652; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Letter of Interest</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px; color: #374151;">A new Letter of Interest has been submitted and is ready for review.</p>

        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: #204652; margin-top: 0;">LOI Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 140px;">Organization:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${organizationName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Project Title:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${projectTitle || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Request Amount:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${requestAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Contact Email:</td>
              <td style="padding: 8px 0; color: #111827;">${contactEmail}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${APP_URL}/reviewer/lois/${loiId}"
             style="background: #204652; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review LOI
          </a>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Heistand Family Foundation Grant Portal</p>
      </div>
    </div>
  `

  return sendEmail({
    to: adminEmails,
    subject: `New LOI Submitted: ${organizationName}`,
    html,
  })
}

export async function sendLOIApproved(params: {
  loiId: string
  applicationId: string
  projectTitle: string
  organizationName: string
  applicantEmail: string
  fullAppDeadline?: string
}) {
  const { loiId, applicationId, projectTitle, organizationName, applicantEmail, fullAppDeadline } = params

  const deadlineText = fullAppDeadline
    ? `<p style="font-size: 16px; color: #374151;"><strong>Important:</strong> Please complete your full application by <strong>${new Date(fullAppDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.</p>`
    : ''

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #059669; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">LOI Approved!</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px; color: #374151;">
          Great news! Your Letter of Interest for <strong>${projectTitle || 'your project'}</strong> has been approved.
        </p>

        <p style="font-size: 16px; color: #374151;">
          You may now proceed to complete your full grant application. We've pre-filled some information from your LOI to make the process easier.
        </p>

        ${deadlineText}

        <div style="text-align: center; margin-top: 30px;">
          <a href="${APP_URL}/applications/${applicationId}/edit"
             style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Complete Full Application
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          If you have any questions, please contact us at grants@heistandfamilyfoundation.org
        </p>
      </div>
      <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Heistand Family Foundation Grant Portal</p>
      </div>
    </div>
  `

  return sendEmail({
    to: applicantEmail,
    subject: `LOI Approved: ${projectTitle || organizationName}`,
    html,
  })
}

export async function sendLOIDeclined(params: {
  projectTitle: string
  organizationName: string
  applicantEmail: string
  reason?: string
}) {
  const { projectTitle, organizationName, applicantEmail, reason } = params

  const reasonText = reason
    ? `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
         <p style="margin: 0; color: #991b1b;"><strong>Feedback from reviewer:</strong></p>
         <p style="margin: 10px 0 0 0; color: #7f1d1d;">${reason}</p>
       </div>`
    : ''

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #6b7280; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">LOI Update</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px; color: #374151;">
          Thank you for your interest in the Heistand Family Foundation. After careful review, we regret to inform you that your Letter of Interest for <strong>${projectTitle || 'your project'}</strong> has not been selected to move forward at this time.
        </p>

        ${reasonText}

        <p style="font-size: 16px; color: #374151;">
          We encourage you to apply again in future grant cycles. If you have questions about this decision, please contact us.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${APP_URL}/dashboard"
             style="background: #204652; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Dashboard
          </a>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Heistand Family Foundation Grant Portal</p>
      </div>
    </div>
  `

  return sendEmail({
    to: applicantEmail,
    subject: `LOI Update: ${projectTitle || organizationName}`,
    html,
  })
}

// ============================================
// APPLICATION EMAILS
// ============================================

export async function sendApplicationSubmittedToAdmin(params: {
  applicationId: string
  projectTitle: string
  organizationName: string
  contactEmail: string
  requestAmount: string
  adminEmails: string[]
}) {
  const { applicationId, projectTitle, organizationName, contactEmail, requestAmount, adminEmails } = params

  if (adminEmails.length === 0) {
    console.warn('No admin emails configured for application submission notification')
    return
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #204652; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Application Submitted</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px; color: #374151;">A full grant application has been submitted and is ready for review.</p>

        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: #204652; margin-top: 0;">Application Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 140px;">Organization:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${organizationName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Project Title:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${projectTitle || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Request Amount:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${requestAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Contact Email:</td>
              <td style="padding: 8px 0; color: #111827;">${contactEmail}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${APP_URL}/reviewer/applications/${applicationId}"
             style="background: #204652; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Application
          </a>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Heistand Family Foundation Grant Portal</p>
      </div>
    </div>
  `

  return sendEmail({
    to: adminEmails,
    subject: `New Application: ${organizationName} - ${projectTitle || 'Grant Request'}`,
    html,
  })
}

export async function sendApplicationStatusChange(params: {
  applicationId: string
  projectTitle: string
  applicantEmail: string
  newStatus: string
  reason?: string
}) {
  const { applicationId, projectTitle, applicantEmail, newStatus, reason } = params

  const statusConfig: Record<string, { title: string; color: string; message: string }> = {
    UNDER_REVIEW: {
      title: 'Application Under Review',
      color: '#7c3aed',
      message: 'Your application is now being reviewed by our team. We will notify you of any updates.',
    },
    APPROVED: {
      title: 'Application Approved!',
      color: '#059669',
      message: 'Congratulations! Your grant application has been approved. Our team will be in touch with next steps.',
    },
    DECLINED: {
      title: 'Application Update',
      color: '#6b7280',
      message: 'After careful consideration, we are unable to fund your application at this time.',
    },
    INFO_REQUESTED: {
      title: 'Additional Information Needed',
      color: '#d97706',
      message: 'We need some additional information to continue reviewing your application. Please log in to respond.',
    },
  }

  const config = statusConfig[newStatus] || {
    title: 'Application Status Update',
    color: '#204652',
    message: `Your application status has been updated to: ${newStatus}`,
  }

  const reasonText = reason
    ? `<div style="background: #f3f4f6; border-left: 4px solid ${config.color}; padding: 15px; margin: 20px 0;">
         <p style="margin: 0; color: #374151;">${reason}</p>
       </div>`
    : ''

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${config.color}; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">${config.title}</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px; color: #374151;">
          Regarding your application: <strong>${projectTitle || 'Grant Application'}</strong>
        </p>

        <p style="font-size: 16px; color: #374151;">${config.message}</p>

        ${reasonText}

        <div style="text-align: center; margin-top: 30px;">
          <a href="${APP_URL}/applications/${applicationId}"
             style="background: #204652; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Application
          </a>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Heistand Family Foundation Grant Portal</p>
      </div>
    </div>
  `

  return sendEmail({
    to: applicantEmail,
    subject: `${config.title}: ${projectTitle || 'Your Application'}`,
    html,
  })
}

export async function sendInfoRequest(params: {
  applicationId: string
  projectTitle: string
  applicantEmail: string
  message: string
  deadline?: string
}) {
  const { applicationId, projectTitle, applicantEmail, message, deadline } = params

  const deadlineText = deadline
    ? `<p style="font-size: 16px; color: #d97706;"><strong>Please respond by:</strong> ${new Date(deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>`
    : ''

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #d97706; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Information Request</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px; color: #374151;">
          The Heistand Family Foundation has requested additional information regarding your application: <strong>${projectTitle || 'Grant Application'}</strong>
        </p>

        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #d97706;">
          <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
        </div>

        ${deadlineText}

        <div style="text-align: center; margin-top: 30px;">
          <a href="${APP_URL}/applications/${applicationId}"
             style="background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Respond to Request
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          If you have questions, please contact us at grants@heistandfamilyfoundation.org
        </p>
      </div>
      <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Heistand Family Foundation Grant Portal</p>
      </div>
    </div>
  `

  return sendEmail({
    to: applicantEmail,
    subject: `Information Needed: ${projectTitle || 'Your Application'}`,
    html,
  })
}

// ============================================
// HELPER: Get Admin Emails
// ============================================

export async function getAdminEmails(): Promise<string[]> {
  // For now, use a configured list or fetch from Clerk org
  const configuredEmails = process.env.ADMIN_NOTIFICATION_EMAILS
  if (configuredEmails) {
    return configuredEmails.split(',').map(e => e.trim())
  }

  // Fallback to hardcoded for now
  // TODO: Fetch from Clerk organization admins
  return ['dallas.polivka@vsinsights.ai']
}
