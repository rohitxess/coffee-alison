import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasJwtSecret:      !!process.env.JWT_SECRET,
    hasFirebaseKey:    !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasFirebaseProject: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    hasTwilioSid:      !!process.env.TWILIO_ACCOUNT_SID,
    nodeEnv:           process.env.NODE_ENV,
  });
}