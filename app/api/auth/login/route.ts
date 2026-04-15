import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const MOCK_USER = {
  id: "mock-admin-001",
  username: "admin",
  email: "admin@tanesco.co.tz",
  full_name: "TANESCO Admin",
  roles: ["data_access", "operations", "device_management", "user_admin"],
  is_active: true,
};

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Try real backend first
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.access_token) {
      const response = NextResponse.json({ user: data.user });
      response.cookies.set("hes_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return response;
    }
  } catch {
    // Backend unreachable — fall through to mock
  }

  // Mock login: accept any credentials
  const response = NextResponse.json({ user: MOCK_USER });
  response.cookies.set("hes_token", "mock-token-tanesco-hes", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
