import { useRouterState } from "@tanstack/react-router";
import { Camera } from "lucide-react";

export function Auth({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/login";

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
          <h1 className="mt-5 text-2xl font-bold">Welcome{isLogin ? " back" : ""} to Deelish</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin
              ? "Enter your details to proceed"
              : "Sign up as a creator to upload photos and as a consumer to interact with photos"}
          </p>
        </div>

        {children}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {isLogin
            ? "Terms and Conditions apply"
            : "By continuing you agree to the terms and conditions of this service."}
        </p>
      </div>
    </div>
  );
}
