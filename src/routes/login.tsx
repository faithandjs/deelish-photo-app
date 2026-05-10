import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Copy } from "@/components/ui/icons/copy";
import { Auth } from "@/components/layout/Auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Sign in — Deelish" }],
  }),
});

/**
 * Demo sign-in. In production this triggers MSAL `loginRedirect`
 * against an Azure AD B2C user-flow. Role is read from the ID
 * token's custom `extension_role` claim.
 */
function LoginPage() {
  const { login, user } = useAuth(); // ← pull user from context
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.username, form.password);
      // user state is now updated in context — read it directly
      console.log(user);
      navigate({ to: user?.role === "creator" ? "/dashboard" : "/feed" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };
  console.log(error);
  return (
    <Auth>
      <form onSubmit={handle} className="">
        <div className="space-y-5 pb-5">
          <Field label="Username" required>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Alpine Solitude"
              maxLength={30}
              required
            />
          </Field>
          <Field label="Password" required>
            <Input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="********"
              minLength={8}
              required
              type="password"
            />
          </Field>
        </div>
        {error && <p className="mb-4 text-sm text-destructive text-center">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-gradient-primary hover:opacity-90 font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Auth>
  );
}
