import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema } from '@/lib/validation';

const MOCK_USER = {
  email: 'alison@coffee.com.au',
  passwordHash:'$2b$10$K2t/ttPTC0SkDPJoDxGQEeG.y/emPSUh/pRPJU26VBmfL2T2o0ATy',
};

export async function POST(req: Request) {
  try {
    console.log('🔑 Login attempt started');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    const body = await req.json();
    const {email, password} = body;
    console.log('Email');

    if (!email || !password) {
      return NextResponse.json(
        { success: false, errors: { general: ['Email and password required'] } },
        { status: 400 }
      );
    }    

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      console.log('Validation failed:', result.error.flatten());
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // const { email, password } = result.data;

    if (email !== MOCK_USER.email) {
      return NextResponse.json(
        { success: false, errors: { email: ['Email not found'] } },
        { status: 401 }
      );
    }

    const passwordMatch = await compare(password, MOCK_USER.passwordHash);

    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, errors: { password: ['Incorrect password'] } },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined!');
      return NextResponse.json(
        { success: false, errors: { general: ['Server configuration error'] } },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log('✅ Login successful!');
    return response;

  } catch (e: any) {
    console.error('Login error:', e.message);
    console.error('Stack:', e.stack);
    return NextResponse.json(
      { success: false, errors: { general: [e.message] } },
      { status: 500 }
    );
  }
}