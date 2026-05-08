import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { RequireRole, useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
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

/**
 * Strict input validation, mirrored on the server.
 * In production the server ALSO validates with the same schema
 * (shared via a /packages/contracts workspace).
 */
const uploadSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(120),
  caption: z.string().trim().max(500),
  location: z.string().trim().max(120),
  people: z.string().trim().max(500),
});

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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
    setForm((p) => ({ ...p, tags: [...form.tags, t] }));
    setTagInput("");
  };
  const handleFile = (f: File | null) => {
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
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Pick an image first");
      const parsed = uploadSchema.parse(form);
      return api.uploadPhoto(
        {
          file,
          title: parsed.title,
          caption: parsed.caption,
          location: parsed.location,
          people: parsed.people
            ? parsed.people
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        },
        user!,
      );
    },
    onSuccess: (photo) => {
      toast.success("Photo uploaded");
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
        {/* Drop zone */}
        <div>
          {preview ? (
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-soft">
              <img src={preview} alt="preview" className="aspect-square w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
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

        {/* Metadata */}
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
          </Field>
          <Field label="Tags">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-input bg-background p-2 min-h-9">
              {form.tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  #{t}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, tags: form.tags.filter((x) => x !== t) }))
                    }
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
                placeholder={form.tags.length === 0 ? "Type and press Enter…" : ""}
                className="flex-1 min-w-30 bg-transparent text-sm outline-none"
                maxLength={32}
              />
            </div>
            {/* <p className="text-xs text-muted-foreground">
              Auto-generated by Azure Cognitive Services on upload. Edit freely.
            </p> */}
          </Field>
          <Field label="Location">
            <LocationAutocomplete
              value={form.location}
              onChange={(address) => setForm({ ...form, location: address })}
              placeholder="Dolomites, Italy"
              maxLength={120}
              // className={/* pass whatever className your <Input> uses */}
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
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
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
