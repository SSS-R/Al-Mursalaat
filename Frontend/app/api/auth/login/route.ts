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
        // Parse form-encoded data from the request body
        const body = await request.text();
        const params = new URLSearchParams(body);
        const email = params.get('username'); // Note: form sends 'username', not 'email'
        const password = params.get('password');

        if (!email || !password) {
            return NextResponse.json(
                { detail: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check if the credentials match the hardcoded supreme admin
        if (email === SUPREME_ADMIN_EMAIL && password === SUPREME_ADMIN_PASSWORD) {
            // If they match, create a session token (JWT)
            const token = jwt.sign(
                { 
                    email: email, 
                    role: 'supreme-admin'
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Return success with access_token (matching frontend expectations)
            return NextResponse.json(
                { access_token: token, token_type: 'bearer' },
                { status: 200 }
            );
        }

        // If no credentials match, return an unauthorized error
        return NextResponse.json(
            { detail: 'Invalid email or password' },
            { status: 401 }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { detail: 'An internal server error occurred' },
            { status: 500 }
        );
    }
}