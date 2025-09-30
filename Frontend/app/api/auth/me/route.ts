// File: Frontend/app/api/auth/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
// We no longer need to import 'cookies' from 'next/headers'
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "YOUR_SUPER_SECRET_KEY_THAT_IS_AT_LEAST_32_CHARACTERS_LONG";

export async function GET(request: NextRequest) {
    // Get the cookie directly from the incoming request object
    const token = request.cookies.get('sessionToken');

    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        // The rest of the logic is the same
        const decoded = jwt.verify(token.value, JWT_SECRET);
        return NextResponse.json(decoded, { status: 200 });

    } catch (error) {
        console.error('Invalid token:', error);
        const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        response.cookies.set('sessionToken', '', { expires: new Date(0) });
        return response;
    }
}