// File: Frontend/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

// It's highly recommended to move these to environment variables (.env.local)
// for better security, especially the JWT_SECRET.
const SUPREME_ADMIN_EMAIL = "ataullahkhalid007@gmail.com";
const SUPREME_ADMIN_PASSWORD = "YourSuperSecretPassword!@#$";
const JWT_SECRET = "YOUR_SUPER_SECRET_KEY_THAT_IS_AT_LEAST_32_CHARACTERS_LONG";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

    // Check if the credentials match the hardcoded supreme admin
        if (email === SUPREME_ADMIN_EMAIL && password === SUPREME_ADMIN_PASSWORD) {
      // If they match, create a session token (JWT)
            const token = jwt.sign(
            { 
            email: email, 
            role: 'supreme-admin' // This is where we assign the role!
            },
            JWT_SECRET,
            { expiresIn: '7d' } // Token will be valid for 7 days
            );

      // Serialize the cookie to be set in the browser
            const serializedCookie = serialize('sessionToken', token, {
                httpOnly: true, // Prevents client-side JS from accessing the cookie
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                sameSite: 'strict', // Protects against CSRF attacks
                maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
                path: '/',
            });

      // Return a success response with the 'Set-Cookie' header
            return new Response(JSON.stringify({ message: 'Login successful' }), {
                status: 200,
                headers: { 'Set-Cookie': serializedCookie },
            });
        }

    // If credentials for other roles (admin, teacher) are checked, that logic will go here.
    
    // If no credentials match, return an unauthorized error
        return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
        );

    } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
        { error: 'An internal server error occurred' },
        { status: 500 }
        );
    }
}