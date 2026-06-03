import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Scaffolding for future auth checks
  // const token = request.cookies.get("session-token");
  // if (!token) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/settings/:path*",
    "/bookmarks/:path*",
    "/submissions/:path*",
  ],
};
