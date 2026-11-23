import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();
    const loginIdentifier = ((email || username || '') as string).toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    // Check master admin credentials
    if (
      (loginIdentifier === 'admin' ||
       loginIdentifier === 'admin@pakanwarharam.com' ||
       loginIdentifier === 'owner@pakanwarharam.com') &&
      (cleanPassword === 'PakAnwar#786' || cleanPassword === 'anwar786' || cleanPassword === 'admin')
    ) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'usr-owner-1',
          email: 'admin@pakanwarharam.com',
          fullName: 'Muawwaz Jabli (Owner/Admin)',
          role: 'owner'
        }
      });
      response.cookies.set('pah_auth_token', 'admin-token-valid', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
      return response;
    }

    // Check staff credentials
    if (
      (loginIdentifier === 'staff' || loginIdentifier === 'staff@pakanwarharam.com') &&
      (cleanPassword === 'PakAnwar#786' || cleanPassword === 'staff123')
    ) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'usr-staff-1',
          email: 'staff@pakanwarharam.com',
          fullName: 'Operations Staff',
          role: 'staff'
        }
      });
      response.cookies.set('pah_auth_token', 'staff-token-valid', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
      return response;
    }

    // Check in database users list
    const user = db.users.find(u => u.email.toLowerCase() === loginIdentifier);
    if (user && (cleanPassword === 'PakAnwar#786' || cleanPassword === 'anwar786')) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
      response.cookies.set('pah_auth_token', `${user.id}-token-valid`, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
      return response;
    }

    return NextResponse.json(
      { error: 'Invalid username/email or password. Please use admin / PakAnwar#786' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
