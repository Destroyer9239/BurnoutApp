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
  const res = NextResponse.next({ request: { headers: req.headers } });
  const path = req.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.some((p) => path === p);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, let the request through so the landing /
  // setup pages can still render — protected routes fall through to the
  // server components, which will surface the missing-env error there.
  if (!url || !anon) return res;

  try {
    const supabase = createServerClient<Database>(url, anon, {
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
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (needsAuth && !user) {
      const redirect = req.nextUrl.clone();
      redirect.pathname = "/login";
      redirect.searchParams.set("next", path);
      return NextResponse.redirect(redirect);
    }

    if (isAuthPage && user) {
      const redirect = req.nextUrl.clone();
      redirect.pathname = "/dashboard";
      redirect.search = "";
      return NextResponse.redirect(redirect);
    }
  } catch {
    // Never let middleware crash the request — fall through.
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.svg).*)"],
};
