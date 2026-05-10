import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Camera, LogOut, Search, Upload, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/**
 * Top navigation. Adapts to role:
 * - Creator: shows Dashboard + Upload links.
 * - Consumer: shows Browse + Search.
 * - Anonymous: shows Sign in.
 */
export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant transition-transform group-hover:scale-105">
            <Camera className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Dee<span className="text-gradient">lish</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user?.role === "creator" && (
            <>
              <NavLink to="/dashboard" active={pathname.startsWith("/dashboard")}>
                Dashboard
              </NavLink>
            </>
          )}{" "}
          <NavLink to="/feed" active={pathname.startsWith("/feed")}>
            <ImageIcon className="h-4 w-4" /> Browse
          </NavLink>
          <NavLink to="/search" active={pathname.startsWith("/search")}>
            <Search className="h-4 w-4" /> Search
          </NavLink>
          {user?.role === "creator" && (
            <>
              <NavLink to="/upload" active={pathname.startsWith("/upload")}>
                <Upload className="h-4 w-4" /> Upload
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-muted transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                      {user.username
                        .split(" ")
                        .map((s) => s[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <Badge variant="secondary" className="hidden sm:inline-flex capitalize">
                    {user.role}
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-xs text-muted-foreground">{user.role}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant="default"
              className="bg-gradient-primary border-0 shadow-elegant hover:opacity-90"
            >
              {isLogin ? <Link to="/signup">Sign up</Link> : <Link to="/login">Login</Link>}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}
