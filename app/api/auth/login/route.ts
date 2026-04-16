import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const body = await request.text();

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.access_token) {
      return NextResponse.json(
        { detail: data?.detail || "Invalid username or password" },
        { status: res.status || 401 }
      );
    }

    // Ensure user object has permissions array
    const user = data.user ?? {};
    if (!user.permissions) {
      user.permissions = [];
    }

    const response = NextResponse.json({ user });
    response.cookies.set("hes_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch {
    return NextResponse.json(
      { detail: "Unable to reach authentication server. Please try again later." },
      { status: 503 }
    );
  }
}
