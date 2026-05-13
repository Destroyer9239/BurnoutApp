// Authenticated app shell. Resolves the current user + profile on the server,
// then forwards them to the topbar. Routes that need a complete onboarding
// redirect to /onboarding here (one place — every nested page benefits).

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import {
  createSupabaseServerClient,
  fetchProfile,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await fetchProfile(supabase, user.id);

  const pathname = headers().get("x-invoke-path") ?? "";
  if (!profile?.onboarded_at && !pathname.startsWith("/onboarding")) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <Topbar email={user.email ?? ""} displayName={profile?.display_name ?? null} />
        <main id="main" className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">{children}</div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
