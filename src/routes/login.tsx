import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Sign in — Pixly" }],
  }),
});

/**
 * Demo sign-in. In production this triggers MSAL `loginRedirect`
 * against an Azure AD B2C user-flow. Role is read from the ID
 * token's custom `extension_role` claim.
 */
function LoginPage() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handle = (role: "creator" | "consumer") => {
    loginAs(role);
    navigate({ to: role === "creator" ? "/dashboard" : "/feed" });
  };

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-subtle" />
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl" />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card/80 p-8 shadow-elegant backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-elegant">
            <Camera className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Welcome to Pixly</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a role to continue. In production this is a single button
            wired to Azure AD B2C; the role comes from your ID token claims.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            onClick={() => handle("creator")}
            className="w-full h-14 justify-start gap-3 bg-gradient-primary border-0 shadow-elegant hover:opacity-90"
          >
            <Camera className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Continue as Creator</div>
              <div className="text-xs opacity-90">
                Upload, tag, manage your library
              </div>
            </div>
          </Button>

          <Button
            onClick={() => handle("consumer")}
            variant="outline"
            className="w-full h-14 justify-start gap-3 hover:bg-muted"
          >
            <Users className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Continue as Consumer</div>
              <div className="text-xs text-muted-foreground">
                Browse, search, rate, comment
              </div>
            </div>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to the demo terms. No real account needed.
        </p>
      </div>
    </div>
  );
}
