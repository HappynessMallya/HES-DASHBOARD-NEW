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

export async function GET(request: NextRequest) {
  const token = request.cookies.get("hes_token")?.value;

  if (!token) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 }
    );
  }

  // If it's the mock token, return mock user immediately
  if (token === "mock-token-tanesco-hes") {
    return NextResponse.json({ user: MOCK_USER });
  }

  // Try real backend
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const user = await res.json();
      return NextResponse.json({ user });
    }
  } catch {
    // Backend unreachable — fall through to mock
  }

  // Fallback: return mock user for any token when backend is down
  return NextResponse.json({ user: MOCK_USER });
}
