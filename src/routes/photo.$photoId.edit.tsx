import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { RequireRole, useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/photo/$photoId/edit")({
  component: () => (
    <RequireRole role="creator">
      <EditPhotoPage />
    </RequireRole>
  ),
  head: () => ({ meta: [{ title: "Edit photo — Deelish" }] }),
});

function EditPhotoPage() {
  const { photoId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: photo, isLoading } = useQuery({
    queryKey: ["photo", photoId],
    queryFn: () => api.getPhoto(photoId),
  });

  const [form, setForm] = useState({
    title: "",
    caption: "",
    location: "",
    people: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (photo) {
      setForm({
        title: photo.title,
        caption: photo.caption,
        location: photo.location,
        people: photo.people.join(", "),
      });
      setTags(photo.tags);
    }
  }, [photo]);

  // Defence in depth — server enforces ownership too, but block UI early.
  useEffect(() => {
    if (photo && user && photo.ownerId !== user.id) {
      toast.error("You can only edit your own photos");
      navigate({ to: "/dashboard" });
    }
  }, [photo, user, navigate]);

  const mutation = useMutation({
    mutationFn: () =>
      api.updatePhoto(
        photoId,
        {
          title: form.title.trim(),
          caption: form.caption.trim(),
          location: form.location.trim(),
          people: form.people
            ? form.people
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          tags,
        },
        user!,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photo", photoId] });
      qc.invalidateQueries({ queryKey: ["my-photos"] });
      qc.invalidateQueries({ queryKey: ["photos"] });
      toast.success("Saved");
      navigate({ to: "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    if (tags.length >= 20) {
      toast.error("Max 20 tags");
      return;
    }
    setTags([...tags, t]);
    setTagInput("");
  };

  if (isLoading || !photo) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/dashboard">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to dashboard
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Edit photo</h1>
      <p className="mt-1 text-muted-foreground">
        Update metadata and tags. Image cannot be replaced (re-upload instead).
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]"
      >
        <div className="overflow-hidden rounded-3xl border border-border shadow-soft h-max">
          <img src={photo.imageUrl} alt={photo.title} className="w-full object-cover" />
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={120}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Caption</Label>
            <Textarea
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              maxLength={500}
              className="min-h-25 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label>People</Label>
            <Input
              value={form.people}
              onChange={(e) => setForm({ ...form, people: e.target.value })}
              placeholder="Comma-separated names"
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-input bg-background p-2 min-h-11">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  #{t}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${t}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder={tags.length === 0 ? "Type and press Enter…" : ""}
                className="flex-1 min-w-30 bg-transparent text-sm outline-none"
                maxLength={32}
              />
            </div>
            {/* <p className="text-xs text-muted-foreground">
              Auto-generated by Azure Cognitive Services on upload. Edit freely.
            </p> */}
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-12 bg-gradient-primary border-0 shadow-elegant hover:opacity-90"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
