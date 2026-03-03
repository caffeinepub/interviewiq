import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  BookOpen,
  Brain,
  Camera,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  LogIn,
  PlayCircle,
  Settings,
  ShieldCheck,
  Shuffle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Difficulty } from "../backend.d";
import { DifficultyBadge } from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateMockInterview,
  useGetAllQuestions,
  useSelfRegisterAsUser,
} from "../hooks/useQueries";

const assessmentRules = [
  {
    icon: Shuffle,
    title: "Auto-Selected Questions",
    description:
      "5 questions are automatically picked from the bank — mixed difficulty for a balanced challenge.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Clock,
    title: "30-Minute Time Limit",
    description:
      "You have exactly 30 minutes to answer all 5 questions. The timer starts when you begin.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Layers,
    title: "Mixed Difficulty",
    description:
      "Questions span easy, medium, and hard — designed to test your full range of knowledge.",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    icon: Brain,
    title: "AI-Driven Selection",
    description:
      "Questions are intelligently drawn from all available categories for well-rounded coverage.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Camera,
    title: "Camera Proctoring",
    description:
      "Optionally enable your webcam or share your screen before starting for a fully proctored session. Camera and screen share monitoring are both available — you can still take the test without them.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Cheat Monitoring",
    description:
      "Screen sharing and camera monitoring are available. Tab switches and window focus changes are tracked automatically. 5 or more violations will auto-submit your session.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
];

function selectAssessmentQuestions(
  questions: { id: bigint; difficulty: Difficulty }[],
  count = 5,
): bigint[] {
  if (questions.length === 0) return [];

  const easy = questions.filter((q) => q.difficulty === Difficulty.easy);
  const medium = questions.filter((q) => q.difficulty === Difficulty.medium);
  const hard = questions.filter((q) => q.difficulty === Difficulty.hard);

  const shuffle = <T,>(arr: T[]): T[] =>
    [...arr].sort(() => Math.random() - 0.5);

  const shuffledEasy = shuffle(easy);
  const shuffledMedium = shuffle(medium);
  const shuffledHard = shuffle(hard);

  const selected: { id: bigint; difficulty: Difficulty }[] = [];

  // Aim for 1 easy, 2 medium, 2 hard — fill with random if not enough
  const targets = [
    { pool: shuffledEasy, want: 1 },
    { pool: shuffledMedium, want: 2 },
    { pool: shuffledHard, want: 2 },
  ];

  for (const { pool, want } of targets) {
    for (let i = 0; i < want && i < pool.length; i++) {
      selected.push(pool[i]);
    }
  }

  // If still need more, fill from remaining
  if (selected.length < count) {
    const selectedIds = new Set(selected.map((q) => q.id.toString()));
    const remaining = shuffle(
      questions.filter((q) => !selectedIds.has(q.id.toString())),
    );
    const needed = count - selected.length;
    selected.push(...remaining.slice(0, needed));
  }

  return selected.slice(0, count).map((q) => q.id);
}

export function AssessmentPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const navigate = useNavigate();

  const { data: questions, isLoading: loadingQuestions } = useGetAllQuestions();
  const selfRegister = useSelfRegisterAsUser();
  const createMockInterview = useCreateMockInterview();

  const [isStarting, setIsStarting] = useState(false);

  const categoryBreakdown = (questions ?? []).reduce<Record<string, number>>(
    (acc, q) => {
      acc[q.category] = (acc[q.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const difficultyBreakdown = {
    easy: (questions ?? []).filter((q) => q.difficulty === Difficulty.easy)
      .length,
    medium: (questions ?? []).filter((q) => q.difficulty === Difficulty.medium)
      .length,
    hard: (questions ?? []).filter((q) => q.difficulty === Difficulty.hard)
      .length,
  };

  const totalQuestions = questions?.length ?? 0;
  const canStart = totalQuestions >= 1;

  async function handleStartAssessment() {
    if (!questions || questions.length === 0) {
      toast.error(
        "Question bank is empty. An admin needs to seed questions first from the Admin Dashboard.",
      );
      return;
    }

    setIsStarting(true);
    try {
      const selectedIds = selectAssessmentQuestions(questions, 5);

      if (selectedIds.length === 0) {
        toast.error("Could not select questions. Please try again.");
        setIsStarting(false);
        return;
      }

      // Step 1: Ensure user is registered (ignore errors — backend autoRegisters on createMockInterview too)
      try {
        await selfRegister.mutateAsync();
      } catch (regErr) {
        console.warn("selfRegisterAsUser skipped:", regErr);
      }

      // Step 2: Small delay to ensure registration propagates to the canister
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 3: Create the mock interview session
      const sessionId = await createMockInterview.mutateAsync({
        questionIds: selectedIds,
        timeLimitMinutes: BigInt(30),
      });

      toast.success("Assessment created! Starting your session...");
      void navigate({
        to: "/session/$id",
        params: { id: sessionId.toString() },
      });
    } catch (err) {
      console.error("Assessment creation failed:", err);
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("anonymous")
      ) {
        toast.error(
          "Please sign in with Internet Identity to start the assessment.",
        );
      } else if (message.toLowerCase().includes("not connected")) {
        toast.error(
          "Connection not ready. Please wait a moment and try again.",
        );
      } else {
        toast.error(`Failed to start assessment: ${message}`);
      }
    } finally {
      setIsStarting(false);
    }
  }

  // Not signed in
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16">
        <Card
          className="border-border/60 max-w-md w-full mx-4 text-center"
          data-ocid="assessment.signin_card"
        >
          <CardContent className="pt-10 pb-8 px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20 mx-auto mb-5">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Assessment Center
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Sign in to take an auto-generated timed assessment. 5 questions,
              30 minutes — structured to test your real knowledge.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="assessment.signin_button"
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {isLoggingIn ? "Connecting..." : "Sign In to Take Assessment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]" data-ocid="assessment.page">
      {/* Hero */}
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <Badge
            variant="outline"
            className="mb-4 border-primary/40 bg-primary/5 text-primary px-3 py-1 text-xs"
          >
            AI-Powered Assessment
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-3 md:text-5xl">
            Assessment <span className="text-primary">Center</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Get an auto-generated set of 5 questions across mixed difficulties —
            no setup required. Just start and prove your knowledge.
          </p>

          {loadingQuestions ? (
            <div className="flex justify-center">
              <Loader2
                className="h-6 w-6 animate-spin text-primary"
                data-ocid="assessment.loading_state"
              />
            </div>
          ) : !canStart ? (
            <div
              className="max-w-md mx-auto space-y-3"
              data-ocid="assessment.empty_state"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="leading-relaxed">
                  No questions in the bank yet. An admin must seed the question
                  bank before assessments can be taken.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <Link to="/admin/dashboard" data-ocid="assessment.admin_link">
                    <Settings size={13} />
                    Go to Admin Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-border/60"
                  asChild
                >
                  <Link to="/questions" data-ocid="assessment.questions_link">
                    <BookOpen size={13} />
                    View Question Bank
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="lg"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-8"
              onClick={handleStartAssessment}
              disabled={isStarting}
              data-ocid="assessment.start_button"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Assessment…
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Start Assessment Now
                </>
              )}
            </Button>
          )}
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-12">
        {/* Assessment Rules */}
        <section data-ocid="assessment.rules_section">
          <div className="mb-7">
            <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
              How It Works
            </h2>
            <p className="text-muted-foreground text-sm">
              Your assessment is generated instantly — no manual question
              selection needed.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assessmentRules.map((rule, idx) => (
              <Card
                key={rule.title}
                className="border-border/60 hover:border-primary/30 transition-colors"
                data-ocid={`assessment.rule.item.${idx + 1}`}
              >
                <CardContent className="p-5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${rule.bg} ${rule.color} mb-4`}
                  >
                    <rule.icon size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-2 leading-snug">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rule.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Question Bank Overview */}
        <section data-ocid="assessment.bank_section">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight mb-1">
                Question Pool
              </h2>
              <p className="text-muted-foreground text-sm">
                {loadingQuestions
                  ? "Loading..."
                  : `${totalQuestions} questions available across ${Object.keys(categoryBreakdown).length} categories`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-border/60"
              asChild
            >
              <Link to="/questions" data-ocid="assessment.view_bank_link">
                <BookOpen size={13} />
                View All
              </Link>
            </Button>
          </div>

          {loadingQuestions ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Difficulty Breakdown */}
              <Card className="border-border/60 col-span-full sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-sm">
                    By Difficulty
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      label: "Easy",
                      count: difficultyBreakdown.easy,
                      diff: Difficulty.easy,
                    },
                    {
                      label: "Medium",
                      count: difficultyBreakdown.medium,
                      diff: Difficulty.medium,
                    },
                    {
                      label: "Hard",
                      count: difficultyBreakdown.hard,
                      diff: Difficulty.hard,
                    },
                  ].map(({ label, count, diff }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <DifficultyBadge difficulty={diff} />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card className="border-border/60 col-span-full sm:col-span-2 lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-sm">
                    By Category
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your assessment pulls from all categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(categoryBreakdown).length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No questions yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(categoryBreakdown).map(([cat, count]) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="border-border/60 gap-1.5 text-xs"
                        >
                          {cat}
                          <span className="text-muted-foreground">{count}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Ready to Start CTA */}
        {canStart && !loadingQuestions && (
          <section
            className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center"
            data-ocid="assessment.cta_section"
          >
            <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold mb-2">
              Ready to begin?
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              5 questions · 30 minutes · Mixed difficulty. Your assessment is
              generated automatically — no setup needed.
            </p>
            <Button
              size="lg"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-8"
              onClick={handleStartAssessment}
              disabled={isStarting}
              data-ocid="assessment.cta_start_button"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <PlayCircle className="h-5 w-5" />
                  Start Assessment
                </>
              )}
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
