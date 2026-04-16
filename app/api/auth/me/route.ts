import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("hes_token")?.value;

  if (!token) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // Token is invalid or expired — clear cookie and return 401
      const response = NextResponse.json(
        { detail: "Session expired" },
        { status: 401 }
      );
      response.cookies.set("hes_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    const user = await res.json();

    // Ensure permissions array exists
    if (!user.permissions) {
      user.permissions = [];
    }

    return NextResponse.json({ user });
  } catch {
    // Backend unreachable — cannot validate session
    return NextResponse.json(
      { detail: "Authentication server unavailable" },
      { status: 503 }
    );
  }
}
