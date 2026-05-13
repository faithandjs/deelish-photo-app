import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Upload, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { RequireRole, useAuth } from "@/lib/auth";
import { apiFetch, authStore } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LocationAutocomplete } from "@/components/ui/autocompleteInput";

export const Route = createFileRoute("/upload")({
  component: () => (
    <RequireRole role="creator">
      <UploadPage />
    </RequireRole>
  ),
  head: () => ({ meta: [{ title: "Upload — Deelish" }] }),
});

const uploadSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(120),
  caption: z.string().trim().max(500),
  location: z.string().trim().max(120),
  people: z.string().trim().max(500),
});

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function UploadPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    caption: "",
    location: "",
    people: "",
    tags: [] as string[],
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || form.tags.includes(t)) return;
    if (form.tags.length >= 20) {
      toast.error("Max 20 tags");
      return;
    }
    setForm((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput("");
  };

  const handleFile = async (f: File | null) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      toast.error("Only JPEG, PNG, or WebP images");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("Image must be under 10 MB");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));

    // AI analysis only — no media upload yet
    setAiLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", f);
      const ai = await apiFetch<AIAnalysis>("/ai/analyse", {
        method: "POST",
        body: fd,
      }); // no auth — public endpoint

      setForm((p) => ({
        ...p,
        caption: p.caption || ai.caption,
        tags: p.tags.length ? p.tags : ai.tags,
      }));
      toast.success("AI suggestions applied");
    } catch {
      // AI is optional — silently continue
    } finally {
      setAiLoading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Pick an image first");
      const parsed = uploadSchema.parse(form);

      // Single multipart request — social service handles media internally
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", parsed.title);
      if (parsed.caption) fd.append("caption", parsed.caption);
      if (parsed.location) fd.append("location", parsed.location);
      form.tags.forEach((t) => fd.append("tags", t));
      if (parsed.people) {
        parsed.people
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((p) => fd.append("people", p));
      }

      return apiFetch<Photo>(
        "/social/photos",
        {
          method: "POST",
          body: fd,
        },
        authStore.getToken(),
      );
    },
    onSuccess: (photo) => {
      toast.success("Photo posted!");
      console.log("inval");
      qc.invalidateQueries({ queryKey: ["social", "feed", 1] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      navigate({ to: "/photo/$photoId", params: { photoId: photo.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Creator</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Upload a photo</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="grid gap-8 lg:grid-cols-[1fr_1fr]"
      >
        <div>
          {preview ? (
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-soft">
              <img src={preview} alt="preview" className="aspect-square w-full object-cover" />
              {aiLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 animate-pulse text-primary" />
                  <p className="text-sm font-medium">Analysing image…</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setForm((p) => ({ ...p, caption: "", tags: [] }));
                }}
                className="absolute right-3 top-3 rounded-full bg-background/90 p-2 shadow-soft hover:bg-background"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="file"
              className="pl-3 flex aspect-square cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card text-center transition-colors hover:border-primary hover:bg-muted"
            >
              <ImagePlus className="h-10 w-10 text-muted-foreground" />
              <span className="mt-3 font-medium">Click to choose an image</span>
              <span className="mt-1 text-xs text-muted-foreground">
                JPEG, PNG, WebP · up to 10 MB
              </span>
              <input
                id="file"
                type="file"
                accept={ACCEPTED.join(",")}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>

        <div className="space-y-5">
          <Field label="Title" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Alpine Solitude"
              maxLength={120}
              required
            />
          </Field>

          <Field label="Caption">
            <Textarea
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="Tell the story behind the shot…"
              maxLength={500}
              className="min-h-25 resize-none"
            />
            {/* {form.caption && !aiLoading &&(
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" /> AI suggested — edit freely
              </p>
            )} */}
          </Field>

          <Field label="Tags">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-input bg-background p-2 min-h-9">
              {form.tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  #{t}
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }))}
                    className="ml-1 hover:text-destructive"
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
                placeholder={form.tags.length === 0 ? "Type and press Enter…" : ""}
                className="flex-1 min-w-30 bg-transparent text-sm outline-none"
                maxLength={32}
              />
            </div>
            {form.tags.length > 0 && !aiLoading && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" /> AI suggested — edit freely
              </p>
            )}
          </Field>

          <Field label="Location">
            <LocationAutocomplete
              value={form.location}
              onChange={(address) => setForm({ ...form, location: address })}
              placeholder="Dolomites, Italy"
              maxLength={120}
            />
          </Field>

          <Field label="People" hint="Comma-separated names of people in the photo">
            <Input
              value={form.people}
              onChange={(e) => setForm({ ...form, people: e.target.value })}
              placeholder="Jane Doe, John Smith"
              maxLength={500}
            />
          </Field>

          <Button
            type="submit"
            disabled={mutation.isPending || !file}
            className="w-full h-12 bg-gradient-primary border-0 shadow-elegant hover:opacity-90"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Posting…
              </>
            ) : aiLoading ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" /> Analysing…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Upload photo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
