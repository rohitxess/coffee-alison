import { NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: Request) {

  try{
    const { answer } = await req.json();

    const message = await client.messages.create({
      body: `Shawttyyy — New response: "${answer}"`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.MY_PHONE_NUMBER!,
    });
  
  
    console.log('SMS sent! SID:', message.sid);
    return NextResponse.json({ success: true });
  } catch(e: any){

    console.error('Error sending SMS:', e);
    return NextResponse.json({ success: false, error: e.message}, {status: 500});
  }
}