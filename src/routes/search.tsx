import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { PhotoCard } from "@/components/photo/PhotoCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Search — Pixly" },
      {
        name: "description",
        content:
          "Search photos by title, caption, location, people, or tags.",
      },
    ],
  }),
});

const SUGGESTIONS = ["mountain", "tokyo", "ocean", "night", "forest"];

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [input, setInput] = useState(search.q);

  const { data, isLoading } = useQuery({
    queryKey: ["search", search.q],
    queryFn: () => api.listPhotos({ q: search.q || undefined, pageSize: 50 }),
    enabled: true,
  });

  const submit = (q: string) => {
    setInput(q);
    navigate({ search: { q } });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Search the <span className="text-gradient">archive</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Full-text across titles, captions, locations, people, and AI tags.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="mt-6 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try: sunset, Tokyo, Maya Chen…"
              className="h-12 pl-12 text-base"
              maxLength={200}
            />
          </div>
          <Button
            type="submit"
            className="h-12 px-6 bg-gradient-primary border-0 hover:opacity-90"
          >
            Search
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Try:
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12">
        {search.q && (
          <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
            {data && (
              <>
                <Badge variant="secondary">{data.total}</Badge>
                results for "{search.q}"
              </>
            )}
          </div>
        )}

        {isLoading ? (
          <p className="text-muted-foreground">Searching…</p>
        ) : data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p) => (
              <PhotoCard key={p.id} photo={p} />
            ))}
          </div>
        ) : search.q ? (
          <p className="py-12 text-center text-muted-foreground">
            Nothing matches that query yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
