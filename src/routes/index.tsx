import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Deelish — Share what you see" },
      {
        name: "description",
        content:
          "A modern photo platform with creator tools, AI-powered tagging, and a beautiful browsing experience.",
      },
    ],
  }),
});

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const previewImgs = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70",
    "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=600&q=70",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70",
  ];

  useEffect(() => {
    if (user) {
      if (user.role === "consumer") {
        navigate({ to: "/feed" });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [user]);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-subtle">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-32 -right-24 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-20 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">
                AI-tagged uploads · Searchable in seconds
              </span>
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Share what you <span className="text-gradient">see.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              A photo platform built for lovers of multimedia.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gradient-primary border-0 shadow-elegant hover:opacity-90 h-12 px-6 text-base"
              >
                <Link to="/signup">
                  Share photos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/feed">Browse photos</Link>
              </Button>
            </div>
          </div>

          {/* Hero collage */}
          <div className="relative mx-auto mt-20 grid max-w-5xl grid-cols-3 gap-3 sm:gap-5">
            {previewImgs.map((src, i) => (
              <div
                key={src}
                className={`overflow-hidden rounded-2xl shadow-elegant ${
                  i === 1 ? "aspect-3/4 -translate-y-6" : "aspect-square"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 bg-gradient-subtle">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Upload className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to share your first photo?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Sign in as a creator and your dashboard is one click away.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-gradient-primary border-0 shadow-elegant hover:opacity-90 h-12 px-6 text-base"
          >
            <Link to="/login">
              Sign in <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
