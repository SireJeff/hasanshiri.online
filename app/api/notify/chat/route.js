import { NextResponse } from 'next/server'

// This endpoint receives notifications about new chat messages
// and can forward them via email, webhook, or other notification systems

export async function POST(request) {
  try {
    const { message, visitorName, visitorEmail } = await request.json()

    // Verify the request (basic security)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.NOTIFICATION_SECRET || 'chat-notify-secret'

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin email from environment
    const adminEmail = process.env.ADMIN_EMAIL

    if (!adminEmail) {
      console.log('ADMIN_EMAIL not configured, skipping email notification')
      return NextResponse.json({ success: true, skipped: true })
    }

    // Option 1: Use Resend (if RESEND_API_KEY is set)
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'Chat Notification <noreply@hasanshiri.online>',
          to: adminEmail,
          subject: `New chat message from ${visitorName || 'Visitor'}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">New Chat Message</h2>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px;"><strong>From:</strong> ${visitorName || 'Anonymous'}</p>
                <p style="margin: 0 0 10px;"><strong>Email:</strong> ${visitorEmail || 'Not provided'}</p>
                <p style="margin: 0;"><strong>Message:</strong></p>
                <p style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                  ${message}
                </p>
              </div>
              <p style="color: #666;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hasanshiri.online'}/admin/chat"
                   style="color: #0066cc;">
                  View in Admin Dashboard
                </a>
              </p>
            </div>
          `,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Resend error:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }

      return NextResponse.json({ success: true, method: 'resend' })
    }

    // Option 2: Use a webhook (if NOTIFICATION_WEBHOOK is set)
    // This could be Telegram, Slack, Discord, etc.
    const webhookUrl = process.env.NOTIFICATION_WEBHOOK
    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New chat message from ${visitorName || 'Visitor'} (${visitorEmail || 'no email'}):\n\n${message}`,
          // For Telegram bot:
          // chat_id: process.env.TELEGRAM_CHAT_ID,
        }),
      })

      if (!response.ok) {
        console.error('Webhook error:', await response.text())
      }

      return NextResponse.json({ success: true, method: 'webhook' })
    }

    // No notification method configured
    console.log('No notification method configured (RESEND_API_KEY or NOTIFICATION_WEBHOOK)')
    return NextResponse.json({ success: true, skipped: true })

  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
