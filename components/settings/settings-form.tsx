"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Download, FileDown, Loader2, LogOut, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NICHE_DEFINITIONS } from "@/lib/niches/configs";
import type { NicheSlug, NotificationPrefs, ProfileRow } from "@/types/domain";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Props {
  profile: ProfileRow;
  email: string;
}

export function SettingsForm({ profile, email }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const [displayName, setDisplayName] = React.useState(profile.display_name ?? "");
  const [niche, setNiche] = React.useState<NicheSlug>(
    (profile.niche as NicheSlug) ?? "custom",
  );
  const [customNiche, setCustomNiche] = React.useState(profile.custom_niche_label ?? "");

  const defaultPrefs: NotificationPrefs = { daily_reminder: true, weekly_summary: true };
  const initial =
    profile.notification_prefs &&
    typeof profile.notification_prefs === "object" &&
    !Array.isArray(profile.notification_prefs)
      ? (profile.notification_prefs as unknown as NotificationPrefs)
      : defaultPrefs;
  const [prefs, setPrefs] = React.useState<NotificationPrefs>(initial);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim(),
          niche,
          custom_niche_label: niche === "custom" ? customNiche.trim() || null : null,
          notification_prefs: prefs,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Could not save");
      toast.success("Settings saved");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.replace("/");
    router.refresh();
  }

  function exportFile(kind: "csv" | "pdf") {
    window.location.href = `/api/export/${kind}`;
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={saveProfile}>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your display name and the niche we tailor content to.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="niche">Niche</Label>
              <Select value={niche} onValueChange={(v) => setNiche(v as NicheSlug)}>
                <SelectTrigger id="niche">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NICHE_DEFINITIONS.map((n) => (
                    <SelectItem key={n.slug} value={n.slug}>
                      {n.emoji} {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {niche === "custom" ? (
              <div className="space-y-1.5">
                <Label htmlFor="custom-niche">Custom label</Label>
                <Input
                  id="custom-niche"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  placeholder="e.g. Doctoral researcher"
                />
              </div>
            ) : null}
            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Switch between light and dark modes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={theme ?? "system"} onValueChange={(v) => setTheme(v)}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose when we nudge you. Email delivery requires an SMTP setup.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Daily reminder</p>
              <p className="text-xs text-muted-foreground">A gentle nudge to check in once a day.</p>
            </div>
            <Switch
              checked={prefs.daily_reminder}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, daily_reminder: v }))}
              aria-label="Daily reminder"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly summary</p>
              <p className="text-xs text-muted-foreground">A Sunday digest with insights and the next plan.</p>
            </div>
            <Switch
              checked={prefs.weekly_summary}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, weekly_summary: v }))}
              aria-label="Weekly summary"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export your data</CardTitle>
          <CardDescription>Download a copy whenever you want. Your data, your call.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => exportFile("csv")}>
            <FileDown className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportFile("pdf")}>
            <Download className="h-4 w-4" /> Export PDF report
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Signing out clears this session. Deleting your account is permanent.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign out
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toast.info("Email support@lumen.app to delete your account.", {
                description: "We'll wipe your data within 24 hours.",
              })
            }
          >
            <Trash2 className="h-4 w-4" /> Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
