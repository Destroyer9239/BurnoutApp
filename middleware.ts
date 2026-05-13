// Next.js middleware. Refreshes the Supabase session cookie and gates
// authenticated routes (/dashboard, /check-in, /analytics, /resources,
// /settings, /onboarding). Public routes (marketing landing, /login,
// /signup, /auth/callback) are always accessible.

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/check-in",
  "/analytics",
  "/resources",
  "/settings",
  "/onboarding",
];

const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.some((p) => path === p);

  if (needsAuth && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.svg).*)"],
};
