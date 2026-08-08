import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function ErrorCard({
  icon: Icon,
  iconClassName = "bg-destructive/15 text-destructive",
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div
          className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${iconClassName}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {children}
      </div>
    </div>
  );
}
