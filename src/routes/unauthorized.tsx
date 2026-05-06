import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
  head: () => ({ meta: [{ title: "Unauthorized — Pixly" }] }),
});

function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-muted-foreground">
          Your role doesn't have permission to view that page. Creator-only
          areas are protected by route guards and server-side checks.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/feed">Browse feed</Link>
          </Button>
          <Button asChild className="bg-gradient-primary border-0 hover:opacity-90">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
