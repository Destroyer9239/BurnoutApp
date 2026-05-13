// /onboarding — 4-step wizard that captures niche, profile, baseline MBI,
// and goals. Auth-gated by middleware; redirected here from the dashboard
// layout when profiles.onboarded_at is null.

import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import {
  createSupabaseServerClient,
  fetchProfile,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await fetchProfile(supabase, user.id);
  if (profile?.onboarded_at) redirect("/dashboard");

  return <OnboardingWizard initialName={profile?.display_name ?? ""} />;
}
