import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Search } from "lucide-react";
import { api } from "@/lib/api";
import { PhotoCard } from "@/components/photo/PhotoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/feed")({
  component: FeedPage,
  head: () => ({
    meta: [
      { title: "Browse — Pixly" },
      {
        name: "description",
        content: "Discover photos from creators around the world.",
      },
    ],
  }),
});

const PAGE_SIZE = 12;

function FeedPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [submittedQ, setSubmittedQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["photos", { page, q: submittedQ }],
    queryFn: () =>
      api.listPhotos({ page, pageSize: PAGE_SIZE, q: submittedQ || undefined }),
  });

  // Reset to page 1 when search changes.
  useEffect(() => {
    setPage(1);
  }, [submittedQ]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Browse
          </h1>
          <p className="mt-1 text-muted-foreground">
            The latest from every creator.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedQ(q);
          }}
          className="flex w-full max-w-md gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Quick search…"
              className="pl-9"
              maxLength={200}
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {isLoading ? (
        <GridSkeleton />
      ) : !data || data.items.length === 0 ? (
        <EmptyState query={submittedQ} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p) => (
              <PhotoCard key={p.id} photo={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
      ))}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
      <ImageIcon className="h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">
        {query ? `No results for "${query}"` : "No photos yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Try a different keyword or browse everything.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/feed">Reset</Link>
      </Button>
    </div>
  );
}
