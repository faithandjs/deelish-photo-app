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
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Sign up — Deelish" }],
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
  const [form, setForm] = useState({
    role: "consumer" as UserRole,
    name: "",
    password: "",
  });

  const handle = () => {
    loginAs(form.role);
    navigate({ to: form.role === "creator" ? "/dashboard" : "/feed" });
  };

  return (
    <Auth>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handle();
          // mutation.mutate();
        }}
        className=""
      >
        <div className="mt-8 space-y-3 flex gap-3 w-full *:w-1/2">
          {(
            [
              {
                role: "consumer",
                icon: Users,
              },
              {
                role: "creator",
                icon: Camera,
              },
            ] as const
          ).map(({ role, ...props }) => (
            <Button
              key={role}
              type="button"
              onClick={() => {
                setForm((p) => ({ ...p, role }));
              }}
              variant={"outline"}
              className={`h-14 justify-start gap-3 transition-all *:transition-all  ${form.role === role ? "text-gradient border-[#f84c41] hover:text-gradient" : "hover:bg-muted "}`}
            >
              <props.icon className={`"h-5 w-5 ${form.role === role && "stroke-[#f84c41]"}`} />
              <div className="font-semibold capitalize"> {role}</div>
            </Button>
          ))}
        </div>
        <div className="space-y-5 pb-5">
          <Field label="Name" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Alpine Solitude"
              maxLength={120}
              required
            />
          </Field>
          <Field label="Password" required>
            <Input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="********"
              maxLength={8}
              minLength={4}
              required
              type="password"
            />
            <div
              className={` px-2 ${form.password.length > 0 ? "flex justify-between gap-3 items-center" : "hidden"}`}
            >
              <p className="text-xs text-muted-foreground italic">{form.password}</p>
              <button type="button">
                <Copy />
              </button>
            </div>
          </Field>
        </div>
        <Button className="w-full h-14 bg-gradient-primary hover:opacity-90 font-semibold">
          Sign up
        </Button>
      </form>
    </Auth>
  );
}
