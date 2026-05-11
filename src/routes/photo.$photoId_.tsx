import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, MessageCircle, Send, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, authStore } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { StarRating } from "@/components/photo/StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/photo/$photoId_")({
  component: PhotoDetailPage,
  head: () => ({ meta: [{ title: "Photo — Deelish" }] }),
});

function PhotoDetailPage() {
  const { photoId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  // Single photo — includes comments, avgRating, userRating
  const { data: photo, isLoading } = useQuery({
    queryKey: ["social", "photo", photoId],
    queryFn: () =>
      apiFetch<SinglePhoto>(`/social/photos/${photoId}`, {}, authStore.getToken() ?? undefined),
  });

  const rateMutation = useMutation({
    mutationFn: (value: number) => {
      if (!user) throw new Error("Sign in to rate");
      return apiFetch(
        `/social/photos/${photoId}/rate`,
        { method: "POST", body: JSON.stringify({ value }) },
        authStore.getToken(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social", "photo", photoId] });
      qc.invalidateQueries({ queryKey: ["social", "feed", 1] });
      qc.invalidateQueries({ queryKey: ["analytics", user?.id] });
      qc.invalidateQueries({ queryKey: ["media", "my-uploads"] });
      toast.success("Rating saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const commentMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Sign in to comment");
      return apiFetch(
        `/social/photos/${photoId}/comment`,
        { method: "POST", body: JSON.stringify({ body: comment }) },
        authStore.getToken(),
      );
    },
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["social", "photo", photoId] });
      qc.invalidateQueries({ queryKey: ["social", "feed", 1] });
      qc.invalidateQueries({ queryKey: ["analytics", user?.id] });
      qc.invalidateQueries({ queryKey: ["media", "my-uploads"] });

      toast.success("Comment posted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="aspect-16/10 rounded-3xl" />
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Photo not found</h2>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/feed">Back to feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl bg-card shadow-elegant">
          <img src={photo.url} alt={photo.title} className="h-full w-full object-cover" />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{photo.title}</h1>
            {photo.caption && <p className="mt-2 text-muted-foreground">{photo.caption}</p>}
          </div>

          {/* Author */}
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {photo.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{photo.username}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(photo.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-2 text-sm">
            {photo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {photo.location}
              </div>
            )}
            {photo.people.length > 0 && (
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>{photo.people.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {photo.tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  #{t}
                </Badge>
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Average rating
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{photo.avgRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    / 5 · {photo.ratingCount} votes
                  </span>
                </div>
              </div>
              <Star className="h-8 w-8 fill-warning text-warning" />
            </div>
            {user?.role !== "creator" ? (
              <div className="mt-4 border-t border-border pt-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Your rating
                </div>
                <div className="mt-2">
                  {user ? (
                    <StarRating
                      value={photo.userRating ?? 0}
                      onChange={(v) => rateMutation.mutate(v)}
                    />
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => navigate({ to: "/login" })}>
                      Sign in to rate
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <MessageCircle className="h-5 w-5" />
          Comments
          <Badge variant="secondary">{photo.comments.length}</Badge>
        </h2>

        {user ? (
          user.role === "consumer" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                commentMutation.mutate();
              }}
              className="mt-4 flex gap-3"
            >
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts…"
                maxLength={500}
                className="min-h-20 resize-none"
              />
              <Button
                type="submit"
                disabled={!comment.trim() || commentMutation.isPending}
                className="bg-gradient-primary border-0 hover:opacity-90 self-start"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <></>
          )
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary underline">
              Sign in
            </Link>
            &nbsp;to leave a comment.
          </div>
        )}

        <div className="mt-6 space-y-4">
          {photo.comments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {user?.role === "consumer" ? "Be the first to comment." : "No comments yet"}
            </p>
          )}
          {photo.comments.map((c) => (
            <div key={c.id} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {c.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{c.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
