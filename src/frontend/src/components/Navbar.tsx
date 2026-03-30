import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  Brain,
  BrainCircuit,
  Briefcase,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  LogIn,
  LogOut,
  MessageCircle,
  Mic2,
  PlayCircle,
  Shield,
  ShieldCheck,
  Sparkles,
  GraduationCap as StudentIcon,
  User,
  Users,
  Users2,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

// Portal switcher pills
function PortalSwitcher({ isAdmin }: { isAdmin: boolean | undefined }) {
  const location = useLocation();

  const isCandidate =
    location.pathname.startsWith("/candidate") ||
    location.pathname.startsWith("/assessment") ||
    location.pathname.startsWith("/adaptive") ||
    location.pathname.startsWith("/session") ||
    location.pathname.startsWith("/student-dashboard") ||
    location.pathname.startsWith("/mock-interview") ||
    location.pathname.startsWith("/onboarding") ||
    location.pathname.startsWith("/gemini-interview") ||
    location.pathname.startsWith("/voice-interview") ||
    location.pathname.startsWith("/ai-interviewer") ||
    location.pathname.startsWith("/panel-interview");

  const isEvaluator =
    location.pathname.startsWith("/evaluator") ||
    location.pathname.startsWith("/questions") ||
    location.pathname.startsWith("/interview-answers");

  const isRecruiter = location.pathname.startsWith("/recruiter");

  const isAdminPortal = location.pathname.startsWith("/admin");

  const portals = [
    {
      label: "Candidate",
      icon: <User size={13} />,
      to: "/candidate",
      active: isCandidate,
      ocid: "nav.candidate_portal_button",
    },
    {
      label: "Recruiter",
      icon: <Briefcase size={13} />,
      to: "/recruiter",
      active: isRecruiter,
      ocid: "nav.recruiter_portal_button",
    },
    {
      label: "Evaluator",
      icon: <Users size={13} />,
      to: "/evaluator",
      active: isEvaluator,
      ocid: "nav.evaluator_portal_button",
    },
    {
      label: "Admin",
      icon: <Shield size={13} />,
      to: isAdmin ? "/admin/dashboard" : "/admin",
      active: isAdminPortal,
      ocid: "nav.admin_portal_button",
    },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 p-1">
      {portals.map((portal) => (
        <Link
          key={portal.label}
          to={portal.to}
          data-ocid={portal.ocid}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
            portal.active
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {portal.icon}
          <span className="hidden sm:inline">{portal.label}</span>
        </Link>
      ))}
    </div>
  );
}

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
      <div className="container flex h-16 items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary/20 group-hover:ring-primary/40">
            <BrainCircuit className="h-4.5 w-4.5" size={18} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Interview<span className="text-primary">IQ</span>
          </span>
        </Link>

        {/* Portal Switcher — center */}
        {isAuthenticated && <PortalSwitcher isAdmin={isAdmin} />}

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/admissions"
            label="Admissions"
            icon={<GraduationCap size={15} />}
            active={location.pathname === "/admissions"}
            ocid="nav.admissions_link"
          />
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
                to="/assessment"
                label="Assessment"
                icon={<Brain size={15} />}
                active={
                  location.pathname.startsWith("/assessment") &&
                  !location.pathname.startsWith("/adaptive")
                }
                ocid="nav.assessment_link"
              />
              <NavLink
                to="/admin"
                label="Admin"
                icon={<Shield size={15} />}
                active={location.pathname.startsWith("/admin")}
                ocid="nav.admin_link"
                secondary
              />
            </>
          )}
          {!isAuthenticated && (
            <NavLink
              to="/admin"
              label="Admin Portal"
              icon={<Shield size={15} />}
              active={location.pathname.startsWith("/admin")}
              ocid="nav.admin_link"
              secondary
            />
          )}
          {isAuthenticated && isAdmin && (
            <>
              <NavLink
                to="/admin/dashboard"
                label="Admin Portal"
                icon={<Shield size={15} />}
                active={location.pathname.startsWith("/admin")}
                ocid="nav.admin_link"
              />
              <NavLink
                to="/evaluator"
                label="Evaluator"
                icon={<Users size={15} />}
                active={location.pathname === "/evaluator"}
                ocid="nav.dashboard_link"
              />
              <NavLink
                to="/questions"
                label="Questions"
                icon={<BookOpen size={15} />}
                active={location.pathname === "/questions"}
                ocid="nav.questions_link"
              />
            </>
          )}
        </nav>

        {/* Auth Controls */}
        <div className="flex items-center gap-3 shrink-0">
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
                className="w-56"
                data-ocid="nav.dropdown_menu"
              >
                <DropdownMenuItem asChild>
                  <Link to="/admissions" data-ocid="nav.admissions_link">
                    <GraduationCap size={14} className="mr-2" />
                    Admissions Portal
                  </Link>
                </DropdownMenuItem>
                {!isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/candidate" data-ocid="nav.dashboard_link">
                        <LayoutDashboard size={14} className="mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/student-dashboard"
                        data-ocid="nav.student_link"
                      >
                        <StudentIcon size={14} className="mr-2" />
                        My Learning
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/assessment" data-ocid="nav.assessment_link">
                        <Brain size={14} className="mr-2" />
                        Assessment
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/adaptive-assessment"
                        data-ocid="nav.adaptive_link"
                      >
                        <Sparkles size={14} className="mr-2" />
                        Adaptive Mode
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/gemini-interview" data-ocid="nav.gemini_link">
                        <Sparkles size={14} className="mr-2 text-primary" />
                        Gemini AI Interview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/voice-interview" data-ocid="nav.voice_link">
                        <Mic2 size={14} className="mr-2 text-cyan-400" />
                        Voice Interview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/ai-interviewer"
                        data-ocid="nav.ai_interviewer_link"
                      >
                        <Bot size={14} className="mr-2 text-violet-400" />
                        AI Interviewer
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/panel-interview" data-ocid="nav.panel_link">
                        <Users2 size={14} className="mr-2 text-success" />
                        Panel Interview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/mock-interview/new" data-ocid="nav.mock_link">
                        <PlayCircle size={14} className="mr-2" />
                        Mock Interview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/interview-answers"
                        data-ocid="nav.answers_link"
                      >
                        <Lightbulb size={14} className="mr-2" />
                        Answer Guide
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/recruiter" data-ocid="nav.recruiter_link">
                        <Briefcase size={14} className="mr-2" />
                        Recruiter Portal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" data-ocid="nav.admin_link">
                        <Shield size={14} className="mr-2" />
                        Admin Portal
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" data-ocid="nav.admin_link">
                        <Shield size={14} className="mr-2" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/recruiter" data-ocid="nav.recruiter_link">
                        <Briefcase size={14} className="mr-2" />
                        Recruiter Portal
                      </Link>
                    </DropdownMenuItem>
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
                    <DropdownMenuItem asChild>
                      <Link
                        to="/interview-answers"
                        data-ocid="nav.answers_link"
                      >
                        <Lightbulb size={14} className="mr-2" />
                        Answer Guide
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/gemini-interview" data-ocid="nav.gemini_link">
                        <Sparkles size={14} className="mr-2 text-primary" />
                        Gemini AI Interview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/voice-interview" data-ocid="nav.voice_link">
                        <Mic2 size={14} className="mr-2 text-cyan-400" />
                        Voice Interview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/ai-interviewer"
                        data-ocid="nav.ai_interviewer_link"
                      >
                        <Bot size={14} className="mr-2 text-violet-400" />
                        AI Interviewer
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/panel-interview" data-ocid="nav.panel_link">
                        <Users2 size={14} className="mr-2 text-success" />
                        Panel Interview
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/privacy-settings" data-ocid="nav.privacy_link">
                    <ShieldCheck size={14} className="mr-2" />
                    Privacy Settings
                  </Link>
                </DropdownMenuItem>
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
  secondary,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  ocid: string;
  secondary?: boolean;
}) {
  return (
    <Link
      to={to}
      data-ocid={ocid}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : secondary
            ? "text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/50"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
