import { NextRequest, NextResponse } from "next/server";

// Use environment variable for backend URL, fallback to localhost for development
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

async function proxyRequest(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname; // e.g., /api/admin/dashboard-stats/
  const search = url.search; // query params

  const backendUrl = `${BACKEND_URL}${path}${search}`;

  // Forward the request with cookies
  const headers = new Headers();

  // Forward relevant headers
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  headers.set("content-type", request.headers.get("content-type") || "application/json");

  // Forward authorization header if present
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers.set("authorization", authHeader);
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  // Forward body for non-GET requests
  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";

    // For multipart/form-data (file uploads), we need to preserve binary data
    // Using arrayBuffer() prevents text encoding corruption
    if (contentType.includes("multipart/form-data")) {
      // Pass the raw bytes to preserve file integrity
      fetchOptions.body = await request.arrayBuffer();
    } else {
      // For JSON and other text content, text() is fine
      fetchOptions.body = await request.text();
    }
  }

  try {
    const response = await fetch(backendUrl, fetchOptions);

    const contentType = response.headers.get("content-type") || "application/json";

    // Handle binary responses (images, PDFs, etc.) differently from text/JSON
    const isBinaryContent =
      contentType.startsWith("image/") ||
      contentType === "application/pdf" ||
      contentType === "application/octet-stream";

    if (isBinaryContent) {
      // Use arrayBuffer for binary content to avoid corruption
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "content-type": contentType,
        },
      });
    }

    // For text/JSON responses, use text()
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request to backend" },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}
