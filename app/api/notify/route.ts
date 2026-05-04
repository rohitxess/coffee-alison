import { NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: Request) {
  const { answer } = await req.json();

  await client.messages.create({
    body: `Shawttyyy — New response: "${answer}"`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: process.env.MY_PHONE_NUMBER!,
  });

  return NextResponse.json({ success: true });
}