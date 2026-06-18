import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q.trim() || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/problems/search?q=${encodeURIComponent(q)}&limit=6`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    // Backend returns { success, data: { query, totalResults, results: [...] } }
    const problems = data?.data?.results || data?.data || [];
    // Normalize field names: backend uses 'name', frontend expects 'title'
    const normalized = problems.slice(0, 6).map((p: any) => ({
      id: p.externalId || p.id || p._id,
      title: p.name || p.title,
      difficulty: p.difficulty ? p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase() : "Unknown",
      cfTags: p.cfTags || p.cf_tags || [],
    }));
    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json([]);
  }
}
