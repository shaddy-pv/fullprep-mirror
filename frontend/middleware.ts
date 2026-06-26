import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// All routes that require the user to be logged in
const PROTECTED_ROUTES = [
  "/problems",
  "/leaderboard",
  "/learning-paths",
  "/learning",
  "/contests",
  "/ai-hints",
  "/submissions",
  "/profile",
  "/bookmarks",
  "/settings",
  "/activity",
  "/stats",
  "/notifications",
];

// Auth pages — logged-in users should be redirected away from these
const AUTH_ROUTES = ["/login", "/signup", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the session cookie set by our auth service
  const token = request.cookies.get("fp_session")?.value;
  const isLoggedIn = !!token;

  // ── 1. Redirect authenticated users away from auth pages ────────────────
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── 2. Protect dashboard routes ─────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    // Pass the original destination so we can redirect back after login
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Ensure browser doesn't cache this redirect
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  // ── 3. Add no-cache headers to all protected pages ──────────────────────
  // This prevents the browser Back/Forward cache from showing stale
  // authenticated pages after logout.
  if (isProtected && isLoggedIn) {
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - API routes (/api/...)
     * - Next.js internals (_next/static, _next/image)
     * - Static files (favicon.ico, images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)",
  ],
};
