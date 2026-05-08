export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex justify-center max-w-7xl px-4 py-2 text-xs text-muted-foreground ">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} Deelish</span>
        </div>
      </div>
    </footer>
  );
}
