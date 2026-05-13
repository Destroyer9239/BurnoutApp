// Shared layout for /login and /signup. Centered card on a soft gradient.

import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div aria-hidden className="gradient-mesh absolute inset-0 -z-10" />
      <Link href="/" className="absolute left-6 top-6">
        <Logo />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
