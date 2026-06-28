import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q.trim() || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  // Get token from cookies to authenticate the request
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || cookieStore.get("jwt")?.value;

  try {
    const res = await fetch(
      `${BACKEND_URL}/users/search?q=${encodeURIComponent(q)}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    const users = data?.data || [];
    return NextResponse.json(users);
  } catch (error) {
    console.error("Users search error:", error);
    return NextResponse.json([]);
  }
}
