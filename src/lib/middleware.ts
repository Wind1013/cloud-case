import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("better-auth.session_token"); // adjust cookie name

  if (!authCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up).*)",
  ],
};
