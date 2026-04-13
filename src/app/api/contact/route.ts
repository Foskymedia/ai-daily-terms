import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // TODO: Wire up email sending (e.g. Resend, SendGrid, Postmark)
    // Replace the console.log below with an actual email send:
    //
    // await resend.emails.send({
    //   from: 'noreply@aidailyterms.com',
    //   to: 'foskymedia@gmail.com',
    //   subject: `Contact form: ${name}`,
    //   text: `From: ${name} <${email}>\n\n${message}`,
    // })

    console.log('[Contact Form Submission]', { name, email, message, timestamp: new Date().toISOString() })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 })
  }
}
