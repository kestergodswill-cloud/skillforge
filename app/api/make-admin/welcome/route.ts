import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error("BREVO_API_KEY is missing in environment variables.");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { 
          name: "SkillForge", 
          email: "support@skillforge.africa"
        },
        to: [{ email, name: name || 'Community Member' }],
        templateId: 2,
        params: {
          userName: name || 'there'
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API rejection response:", data);
      return NextResponse.json({ error: data.message || 'Failed to send template via Brevo' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Welcome template sent successfully' });
  } catch (error: any) {
    console.error("Internal Server Error in /api/welcome:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}