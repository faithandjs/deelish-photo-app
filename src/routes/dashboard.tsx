import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Image as ImageIcon, Plus, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { RequireRole, useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireRole role="creator">
      <DashboardPage />
    </RequireRole>
  ),
  head: () => ({ meta: [{ title: "Dashboard — Pixly" }] }),
});

function DashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-photos", user?.id],
    queryFn: () =>
      api.listPhotos({ ownerId: user!.id, pageSize: 100 }),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePhoto(id, user!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-photos"] });
      qc.invalidateQueries({ queryKey: ["photos"] });
      toast.success("Photo deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const photos = data?.items ?? [];
  const totalRatings = photos.reduce((s, p) => s + p.ratingCount, 0);
  const totalComments = photos.reduce((s, p) => s + p.commentCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Creator dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {user?.displayName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your library, track engagement, and upload new work.
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-primary border-0 shadow-elegant hover:opacity-90"
        >
          <Link to="/upload">
            <Plus className="mr-1.5 h-4 w-4" /> New upload
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Photos" value={photos.length} icon={<ImageIcon className="h-5 w-5" />} />
        <StatCard label="Total ratings" value={totalRatings} icon={<Star className="h-5 w-5" />} />
        <StatCard label="Total comments" value={totalComments} icon={<Edit3 className="h-5 w-5" />} />
      </div>

      {/* Library */}
      <div className="mt-12">
        <h2 className="mb-5 text-xl font-bold">Your library</h2>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <EmptyLibrary />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <div
                key={p.id}
                className="group overflow-hidden rounded-2xl bg-card shadow-soft transition-all hover:shadow-elegant"
              >
                <Link
                  to="/photo/$photoId"
                  params={{ photoId: p.id }}
                  className="block aspect-[4/3] overflow-hidden"
                >
                  <img
                    src={p.thumbnailUrl}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-1">{p.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {p.location || "—"}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {p.ratingAvg.toFixed(1)} ({p.ratingCount})
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                      >
                        <Link
                          to="/photo/$photoId/edit"
                          params={{ photoId: p.id }}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{p.title}" and its comments will be removed permanently.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(p.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

function EmptyLibrary() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
      <Upload className="h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No photos yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Upload your first photo to start building your library.
      </p>
      <Button
        asChild
        className="mt-6 bg-gradient-primary border-0 hover:opacity-90"
      >
        <Link to="/upload">
          <Plus className="mr-1.5 h-4 w-4" /> Upload a photo
        </Link>
      </Button>
    </div>
  );
}
