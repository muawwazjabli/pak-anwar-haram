import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Find user
    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or user not found' }, { status: 401 });
    }

    // Return session info with role
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
