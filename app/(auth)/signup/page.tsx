// /signup — creates the auth user; the on_auth_user_created trigger seeds an
// empty profile row, then we redirect into the onboarding wizard.

import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create your account" };
export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
