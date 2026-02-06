import { NextRequest, NextResponse } from "next/server";

// Use environment variable for backend URL, fallback to localhost for development
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    // Reconstruct the path: e.g., ["teacher-photo", "uuid.jpg"] -> "/api/files/teacher-photo/uuid.jpg"
    const pathSegments = params.path;
    const backendPath = `/api/files/${pathSegments.join("/")}`;
    const backendUrl = `${BACKEND_URL}${backendPath}`;

    try {
        const response = await fetch(backendUrl, {
            method: "GET",
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        });

        if (!response.ok) {
            // Return error from backend
            const errorText = await response.text();
            return new NextResponse(errorText, {
                status: response.status,
                headers: { "content-type": "application/json" },
            });
        }

        // Get the binary data as ArrayBuffer to avoid corruption
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "application/octet-stream";

        // Return the file with proper headers
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "content-type": contentType,
                "content-length": buffer.byteLength.toString(),
                "cache-control": "public, max-age=31536000", // Cache for 1 year
            },
        });
    } catch (error) {
        console.error("File serving error:", error);
        return NextResponse.json(
            { error: "Failed to fetch file from backend" },
            { status: 502 }
        );
    }
}
