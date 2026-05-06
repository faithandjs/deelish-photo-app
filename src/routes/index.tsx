import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Sparkles, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Pixly — Share what you see" },
      {
        name: "description",
        content:
          "A modern photo platform with creator tools, AI-powered tagging, and a beautiful browsing experience.",
      },
    ],
  }),
});

function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-subtle">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-32 -right-24 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">
                AI-tagged uploads · Searchable in seconds
              </span>
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Share what you{" "}
              <span className="text-gradient">see.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              A photo platform built for creators who care about their craft —
              and viewers who want to find the next image they love.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gradient-primary border-0 shadow-elegant hover:opacity-90 h-12 px-6 text-base"
              >
                <Link to="/login">
                  Get started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base"
              >
                <Link to="/feed">Browse photos</Link>
              </Button>
            </div>
          </div>

          {/* Hero collage */}
          <div className="relative mx-auto mt-20 grid max-w-5xl grid-cols-3 gap-3 sm:gap-5">
            {[
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70",
              "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=600&q=70",
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70",
            ].map((src, i) => (
              <div
                key={src}
                className={`overflow-hidden rounded-2xl shadow-elegant ${
                  i === 1 ? "aspect-[3/4] -translate-y-6" : "aspect-square"
                }`}
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two-role split */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for two kinds of people.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Whether you make images or admire them, Pixly fits.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-2">
          <RoleCard
            icon={<Camera className="h-5 w-5" />}
            title="Creator"
            description="Upload, tag, and manage your photo library with AI assistance."
            features={[
              "Direct-to-cloud upload pipeline",
              "Auto-generated tags from image AI",
              "Edit metadata anytime",
              "Full ownership controls",
            ]}
          />
          <RoleCard
            icon={<Users className="h-5 w-5" />}
            title="Consumer"
            description="Explore, search, and engage with the work of creators."
            features={[
              "Beautiful paginated feed",
              "Search across tags, places, people",
              "Rate photos 1–5 stars",
              "Comment on what moves you",
            ]}
          />
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

function RoleCard({
  icon,
  title,
  description,
  features,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-soft transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
          {icon}
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      <p className="mt-3 text-muted-foreground">{description}</p>
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-sm text-foreground/90"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
