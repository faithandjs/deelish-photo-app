import { Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          <span>© {new Date().getFullYear()} Pixly — A photo platform.</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/feed" className="hover:text-foreground transition-colors">Browse</Link>
          <Link to="/search" className="hover:text-foreground transition-colors">Search</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}
