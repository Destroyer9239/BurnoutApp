"use client";

// Shared email/password + Google OAuth form for both /login and /signup.
// All auth calls go through the browser Supabase client because the session
// cookie is set there during the OAuth handshake.

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

interface AuthFormProps {
  mode: Mode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [oauthPending, setOauthPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
              },
            });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      if (mode === "signup" && !result.data.session) {
        toast.success("Check your email", { description: "We sent a confirmation link." });
        return;
      }

      toast.success(mode === "login" ? "Welcome back" : "Account created");
      router.replace(mode === "signup" ? "/onboarding" : next);
      router.refresh();
    });
  }

  async function handleGoogle() {
    setOauthPending(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          mode === "signup" ? "/onboarding" : next,
        )}`,
      },
    });
    if (error) {
      toast.error(error.message);
      setOauthPending(false);
    }
  }

  return (
    <Card className="border-border/60 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to continue tracking your wellbeing."
            : "Start with a baseline check-in in under two minutes."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
          disabled={oauthPending}
        >
          {oauthPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </Button>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs uppercase tracking-wide text-muted-foreground">
            or with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <Link
            href={mode === "login" ? "/signup" : "/login"}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.97 6.97 0 0 1 5.46 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
