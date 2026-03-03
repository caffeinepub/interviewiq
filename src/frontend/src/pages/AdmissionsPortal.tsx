import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  LogIn,
  PlayCircle,
  Shield,
  Trophy,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllQuestions,
  useGetCallerUserProfile,
  useGetCandidateProfile,
} from "../hooks/useQueries";

const testSteps = [
  {
    step: "01",
    icon: UserCheck,
    title: "Sign In & Set Up Profile",
    description:
      "Sign in with Internet Identity and complete your candidate profile — your name, target role, and experience level.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    step: "02",
    icon: BookOpen,
    title: "Select Questions",
    description:
      "Browse the question bank, filter by category and difficulty, then choose 3–6 questions that match your target role.",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    step: "03",
    icon: Clock,
    title: "Start the Timed Test",
    description:
      "The timer starts when you begin. Answer each question carefully in text or code mode and submit each one.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    step: "04",
    icon: Trophy,
    title: "Submit & View Report",
    description:
      "Submit your interview when done. View your full assessment report with scores, feedback, and improvement areas.",
    color: "text-success",
    bg: "bg-success/10",
  },
];

const testCategories = [
  {
    name: "Behavioral",
    icon: "💬",
    description: "Soft skills & situational questions",
  },
  { name: "Technical", icon: "💻", description: "Algorithms & system design" },
  { name: "Interview", icon: "🎯", description: "Classic interview questions" },
  { name: "Frontend", icon: "🖥️", description: "HTML, CSS, React & JS" },
  { name: "Backend", icon: "⚙️", description: "APIs, databases & architecture" },
  { name: "System Design", icon: "🏗️", description: "Scalable system concepts" },
];

export function AdmissionsPortal() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: loadingProfile } =
    useGetCallerUserProfile();
  const principalStr = identity?.getPrincipal().toString() ?? null;
  const { data: candidateProfile, isLoading: loadingCandidate } =
    useGetCandidateProfile(principalStr);
  const { data: questions, isLoading: loadingQuestions } = useGetAllQuestions();

  const isLoading = isInitializing || loadingProfile || loadingCandidate;
  const hasProfile = !!candidateProfile || !!userProfile;
  const displayName = userProfile?.name ?? candidateProfile?.name ?? null;
  const targetRole = candidateProfile?.targetRole ?? null;

  const categoryQuestionCounts = (questions ?? []).reduce<
    Record<string, number>
  >((acc, q) => {
    acc[q.category] = (acc[q.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-[calc(100vh-4rem)]" data-ocid="admissions.page">
      {/* Hero Banner */}
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-background py-14">
        <div className="container max-w-4xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <Badge
            variant="outline"
            className="mb-4 border-primary/40 bg-primary/5 text-primary px-3 py-1 text-xs"
          >
            Candidate Admissions Portal
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-3 md:text-5xl">
            Begin Your <span className="text-primary">Interview Journey</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Take a structured mock interview, practice with real questions, and
            get a detailed performance report — all in one place.
          </p>

          {/* Auth Actions */}
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                data-ocid="admissions.login_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isLoggingIn ? "Connecting..." : "Sign In to Start Test"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-border/60"
                asChild
              >
                <Link
                  to="/questions"
                  data-ocid="admissions.browse_questions_button"
                >
                  <BookOpen className="h-4 w-4" />
                  Browse Questions
                </Link>
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {!hasProfile ? (
                <Button
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                  asChild
                >
                  <Link
                    to="/onboarding"
                    data-ocid="admissions.setup_profile_button"
                  >
                    <User className="h-4 w-4" />
                    Set Up Profile First
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                  asChild
                >
                  <Link
                    to="/mock-interview/new"
                    data-ocid="admissions.start_test_button"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Start New Test
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-border/60"
                asChild
              >
                <Link to="/candidate" data-ocid="admissions.dashboard_button">
                  <BrainCircuit className="h-4 w-4" />
                  My Dashboard
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-14">
        {/* Candidate Status Panel (if logged in) */}
        {isAuthenticated && (
          <section data-ocid="admissions.candidate_status_panel">
            {isLoading ? (
              <Card
                className="border-border/60"
                data-ocid="admissions.loading_state"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card
                className="border-border/60 bg-primary/5"
                data-ocid="admissions.candidate_card"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display font-semibold text-lg">
                            {displayName ?? "Candidate"}
                          </p>
                          {hasProfile && (
                            <Badge
                              className="bg-success/10 text-success border-success/30 text-xs"
                              variant="outline"
                            >
                              <CheckCircle2 size={10} className="mr-1" />
                              Profile Ready
                            </Badge>
                          )}
                        </div>
                        {targetRole ? (
                          <p className="text-sm text-muted-foreground">
                            Target Role:{" "}
                            <span className="font-medium text-foreground">
                              {targetRole}
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No target role set
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!hasProfile && (
                        <Button
                          size="sm"
                          className="gap-1.5 bg-primary text-primary-foreground"
                          asChild
                        >
                          <Link
                            to="/onboarding"
                            data-ocid="admissions.complete_profile_button"
                          >
                            Complete Profile
                            <ArrowRight size={12} />
                          </Link>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-border/60"
                        asChild
                      >
                        <Link
                          to="/onboarding"
                          data-ocid="admissions.edit_profile_button"
                        >
                          Edit Profile
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {!hasProfile && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
                      <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Please complete your candidate profile before starting a
                        test. Your profile helps us tailor questions to your
                        experience level and target role.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* Test Process Steps */}
        <section data-ocid="admissions.process_section">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
              How the Test Process Works
            </h2>
            <p className="text-muted-foreground">
              Follow these four steps to complete your interview assessment.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {testSteps.map((step, idx) => (
              <Card
                key={step.step}
                className="border-border/60 hover:border-primary/30 transition-colors relative overflow-hidden"
                data-ocid={`admissions.step.item.${idx + 1}`}
              >
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${step.bg} ${step.color}`}
                    >
                      <step.icon size={20} />
                    </div>
                    <span className="font-display text-2xl font-bold text-border/40">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
                {idx < testSteps.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border/60">
                    <ChevronRight size={12} className="text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Available Test Categories */}
        <section data-ocid="admissions.categories_section">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight mb-1">
                Available Test Categories
              </h2>
              <p className="text-muted-foreground text-sm">
                {loadingQuestions
                  ? "Loading..."
                  : `${questions?.length ?? 0} questions across ${Object.keys(categoryQuestionCounts).length} categories`}
              </p>
            </div>
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/60"
                asChild
              >
                <Link
                  to="/mock-interview/new"
                  data-ocid="admissions.browse_all_button"
                >
                  <BookOpen size={13} />
                  Browse All
                </Link>
              </Button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {testCategories.map((cat, idx) => {
              const count = categoryQuestionCounts[cat.name] ?? 0;
              return (
                <Card
                  key={cat.name}
                  className="border-border/60 hover:border-primary/30 transition-colors group cursor-pointer"
                  data-ocid={`admissions.category.item.${idx + 1}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{cat.name}</p>
                          {loadingQuestions ? (
                            <Skeleton className="h-4 w-8" />
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs border-border/60"
                            >
                              {count} Q
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Test Rules & Guidelines */}
        <section data-ocid="admissions.rules_section">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-lg">
                  Test Rules & Guidelines
                </CardTitle>
              </div>
              <CardDescription>
                Please read before starting your interview session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">
                    During the Test
                  </p>
                  <ul className="space-y-2">
                    {[
                      "The timer starts as soon as you click 'Start Interview'",
                      "You can navigate between questions freely at any time",
                      "Submit each answer individually before moving on",
                      "Your session is auto-submitted when time expires",
                      "You cannot restart a submitted session",
                    ].map((rule) => (
                      <li
                        key={rule}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">
                    Answer Format
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Use Text Mode for behavioral and verbal answers",
                      "Use Code Mode for technical / programming questions",
                      "Be specific and use examples wherever possible",
                      "STAR method recommended for behavioral questions",
                      "Explain your reasoning, not just the final answer",
                    ].map((rule) => (
                      <li
                        key={rule}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  Your responses are stored securely on the Internet Computer
                  blockchain.
                </div>
                {isAuthenticated ? (
                  <Button
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                    asChild
                    data-ocid="admissions.ready_button"
                  >
                    <Link
                      to={hasProfile ? "/mock-interview/new" : "/onboarding"}
                    >
                      <PlayCircle className="h-4 w-4" />
                      {hasProfile
                        ? "I'm Ready — Start Test"
                        : "Complete Profile First"}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    onClick={login}
                    disabled={isLoggingIn}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                    data-ocid="admissions.signin_ready_button"
                  >
                    {isLoggingIn ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                    {isLoggingIn ? "Connecting..." : "Sign In to Begin"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Admin Access Note */}
        <section>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  Are you an evaluator or admin?
                </p>
                <p className="text-xs text-muted-foreground">
                  Sign in and visit the Admin Portal to manage roles, seed
                  questions, and review candidate sessions.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border/60 gap-1.5 shrink-0"
              asChild
              data-ocid="admissions.admin_portal_button"
            >
              <Link to="/admin">
                <Shield size={13} />
                Admin Portal
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
