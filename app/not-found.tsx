import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-semibold tracking-tight">404</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        That page doesn't exist. Head back to your dashboard or sign in.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
