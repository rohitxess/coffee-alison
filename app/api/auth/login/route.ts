import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Hardcoded user for now — replace with Firebase Auth later
const MOCK_USER = {
  email: 'alison@coffee.com',
  passwordHash: '$2b$10$iGmSNXtiUXgIENGI1b8//OLZ7fsHLppfk7SUtQVZrsSUqeD65t2Nu',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ← Zod validation
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Check email
    if (email !== MOCK_USER.email) {
      return NextResponse.json(
        { success: false, errors: { email: ['Email not found'] } },
        { status: 401 }
      );
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, MOCK_USER.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, errors: { password: ['Incorrect password'] } },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { email, role: 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }     //change this for 24hrs
    );

    // Set token as HTTP-only cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (e: any) {
    console.error('Login error:', e.message);
    return NextResponse.json(
      { success: false, errors: { general: ['Something went wrong'] } },
      { status: 500 }
    );
  }
}