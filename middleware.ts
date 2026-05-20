import { NextResponse } from "next/server";

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' covers the inline theme bootstrap in app/layout.tsx and
  // the hydration data Next/RSC injects. Move to nonces if a CSP middleware
  // is added later.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // data: covers the inline SVG hero pattern in globals.css; https: keeps the
  // sponsor list editable without CSP churn (every sponsor logo is HTTPS).
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": contentSecurityPolicy,
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
};

export function middleware() {
  const response = NextResponse.next();
  for (const [name, value] of Object.entries(securityHeaders)) {
    response.headers.set(name, value);
  }
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image).*)",
};
