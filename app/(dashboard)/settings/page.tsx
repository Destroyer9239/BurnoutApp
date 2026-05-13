// /settings — profile, theme, notification toggles, exports, danger zone.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import {
  createSupabaseServerClient,
  fetchProfile,
  requireUser,
} from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const profile = await fetchProfile(supabase, user.id);
  if (!profile) redirect("/onboarding");
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Profile, appearance, notifications, and data exports." />
      <SettingsForm profile={profile} email={user.email ?? ""} />
    </div>
  );
}
