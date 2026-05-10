import { Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, Star } from "lucide-react";

/** Feed card — used in browse, search, dashboard grids. */
export function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <Link
      to="/photo/$photoId"
      params={{ photoId: photo.id }}
      className="group relative overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:shadow-elegant hover:-translate-y-1"
    >
      <div className="aspect-4/5 overflow-hidden bg-muted">
        <img
          src={photo.url}
          alt={photo.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
        <h3 className="font-semibold text-white line-clamp-1">{photo.title}</h3>
        <div className="mt-1 flex items-center gap-3 text-xs text-white/80">
          {photo.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {photo.location}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-white/90">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {photo.avg_rating.toFixed(1)}
            <span className="text-white/60">({photo.rating_count})</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {photo.comment_count}
          </span>
        </div>
      </div>
    </Link>
  );
}
