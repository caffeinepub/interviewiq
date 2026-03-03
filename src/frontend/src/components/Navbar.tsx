import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  BrainCircuit,
  ChevronDown,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  PlayCircle,
  Users,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

export function Navbar() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsCallerAdmin();
  const location = useLocation();

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 8)}...`
    : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary/20 group-hover:ring-primary/40">
            <BrainCircuit className="h-4.5 w-4.5" size={18} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Interview<span className="text-primary">IQ</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {isAuthenticated && !isAdmin && (
            <>
              <NavLink
                to="/candidate"
                label="Dashboard"
                icon={<LayoutDashboard size={15} />}
                active={location.pathname === "/candidate"}
                ocid="nav.dashboard_link"
              />
              <NavLink
                to="/mock-interview/new"
                label="Mock Interview"
                icon={<PlayCircle size={15} />}
                active={location.pathname.startsWith("/mock-interview")}
                ocid="nav.mock_link"
              />
            </>
          )}
          {isAuthenticated && isAdmin && (
            <>
              <NavLink
                to="/evaluator"
                label="Evaluator"
                icon={<Users size={15} />}
                active={location.pathname === "/evaluator"}
                ocid="nav.dashboard_link"
              />
              <NavLink
                to="/questions"
                label="Question Bank"
                icon={<BookOpen size={15} />}
                active={location.pathname === "/questions"}
                ocid="nav.questions_link"
              />
            </>
          )}
        </nav>

        {/* Auth Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated && isAdmin && (
            <Badge
              variant="outline"
              className="hidden sm:flex border-primary/40 text-primary bg-primary/5 text-xs"
            >
              Admin
            </Badge>
          )}

          {isInitializing ? (
            <Button variant="ghost" size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border/60 font-mono text-xs"
                >
                  {principalShort}
                  <ChevronDown size={12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                data-ocid="nav.dropdown_menu"
              >
                {!isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/candidate" data-ocid="nav.dashboard_link">
                      <LayoutDashboard size={14} className="mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/evaluator" data-ocid="nav.dashboard_link">
                        <Users size={14} className="mr-2" />
                        Evaluator
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/questions" data-ocid="nav.questions_link">
                        <BookOpen size={14} className="mr-2" />
                        Question Bank
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={clear}
                  className="text-destructive focus:text-destructive"
                  data-ocid="nav.logout_button"
                >
                  <LogOut size={14} className="mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="sm"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="nav.login_button"
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn size={14} />
              )}
              {isLoggingIn ? "Connecting..." : "Sign In"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  to,
  label,
  icon,
  active,
  ocid,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  ocid: string;
}) {
  return (
    <Link
      to={to}
      data-ocid={ocid}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
