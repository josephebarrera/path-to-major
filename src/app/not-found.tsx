import { Compass } from "lucide-react";
import Link from "next/link";
import { ErrorCard } from "~/components/error-card";

export default function NotFound() {
  return (
    <ErrorCard
      icon={Compass}
      iconClassName="bg-primary/15 text-primary"
      title="Page not found"
      description="This page doesn't exist or may have been moved."
    >
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Back home
      </Link>
    </ErrorCard>
  );
}
