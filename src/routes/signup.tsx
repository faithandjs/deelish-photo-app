import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Copy } from "@/components/ui/icons/copy";
import { Auth } from "@/components/layout/Auth";

export const Route = createFileRoute("/signup")({
  component: SignUp,
  head: () => ({
    meta: [{ title: "Sign up — Deelish" }],
  }),
});

/**
 * Demo sign-in. In production this triggers MSAL `loginRedirect`
 * against an Azure AD B2C user-flow. Role is read from the ID
 * token's custom `extension_role` claim.
 */
function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "consumer" as UserRole,
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    // letters, numbers, underscores only
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!usernameRegex.test(form.username)) {
      return "Username: letters, numbers, underscores only";
    }

    if (form.username.length < 3) {
      return "Username must be at least 3 characters";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (!/\d/.test(form.password)) {
      return "Password must contain at least one number";
    }

    return null;
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await register(form.username, form.password, form.role);
      navigate({ to: form.role === "creator" ? "/dashboard" : "/feed" });
    } catch (err) {
      console.log(err instanceof Error ? err.message : "failed");
      setError("Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Auth>
      <form onSubmit={handle} className="">
        <div className="mt-8 space-y-3 flex gap-3 w-full *:w-1/2">
          {(
            [
              { role: "consumer", icon: Users },
              { role: "creator", icon: Camera },
            ] as const
          ).map(({ role, ...props }) => (
            <Button
              key={role}
              type="button"
              onClick={() => setForm((p) => ({ ...p, role }))}
              variant="outline"
              className={`h-14 justify-start gap-3 transition-all *:transition-all ${
                form.role === role
                  ? "text-gradient border-[#f84c41] hover:text-gradient"
                  : "hover:bg-muted"
              }`}
            >
              <props.icon className={`h-5 w-5 ${form.role === role ? "stroke-[#f84c41]" : ""}`} />
              <div className="font-semibold capitalize">{role}</div>
            </Button>
          ))}
        </div>
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
              pattern="^(?=.*\d).{8,}$"
              title="Password must be at least 8 characters and contain a number"
            />
          </Field>
          {error && <p className="mb-4 text-sm text-destructive text-center">{error}</p>}
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-gradient-primary hover:opacity-90 font-semibold"
        >
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </Auth>
  );
}
