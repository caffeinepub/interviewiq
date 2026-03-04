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
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Gauge,
  KeyRound,
  ListChecks,
  Loader2,
  LogIn,
  Sparkles,
  TrendingUp,
  Wifi,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Difficulty } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateMockInterview,
  useGetAllQuestions,
  useSelfRegisterAsUser,
} from "../hooks/useQueries";

const FEATURE_CARDS = [
  {
    icon: TrendingUp,
    title: "Real-Time Adaptation",
    description:
      "Difficulty adjusts after every answer based on your performance score. Score high and the next question gets harder.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: ListChecks,
    title: "10 Questions",
    description:
      "A longer, deeper session — 10 adaptive questions chosen dynamically for comprehensive evaluation.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: KeyRound,
    title: "Keyword Intelligence",
    description:
      "The engine analyzes your answer against domain-specific keywords for the question type — detecting STAR method usage, career vocabulary, self-awareness signals, and more.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const STEPS = [
  {
    num: 1,
    label: "Start",
    desc: "First question is medium difficulty",
  },
  {
    num: 2,
    label: "Answer",
    desc: "Submit your text or code response",
  },
  {
    num: 3,
    label: "Adapt",
    desc: "AI evaluates keywords, domain vocabulary, and answer structure",
  },
  {
    num: 4,
    label: "Next",
    desc: "Gets harder or easier based on your score",
  },
  {
    num: 5,
    label: "Results",
    desc: "Full breakdown with recommendations",
  },
];

function selectAdaptiveQuestions(
  questions: { id: bigint; difficulty: Difficulty }[],
  count = 10,
): bigint[] {
  if (questions.length === 0) return [];

  const easy = questions.filter((q) => q.difficulty === Difficulty.easy);
  const medium = questions.filter((q) => q.difficulty === Difficulty.medium);
  const hard = questions.filter((q) => q.difficulty === Difficulty.hard);

  const shuffle = <T,>(arr: T[]): T[] =>
    [...arr].sort(() => Math.random() - 0.5);

  // Good spread: start medium-heavy, let engine decide
  const shuffledEasy = shuffle(easy);
  const shuffledMedium = shuffle(medium);
  const shuffledHard = shuffle(hard);

  const selected: { id: bigint; difficulty: Difficulty }[] = [];

  const targets = [
    { pool: shuffledEasy, want: 2 },
    { pool: shuffledMedium, want: 4 },
    { pool: shuffledHard, want: 4 },
  ];

  for (const { pool, want } of targets) {
    for (let i = 0; i < want && i < pool.length; i++) {
      selected.push(pool[i]);
    }
  }

  // Fill remaining if needed
  if (selected.length < count) {
    const selectedIds = new Set(selected.map((q) => q.id.toString()));
    const remaining = shuffle(
      questions.filter((q) => !selectedIds.has(q.id.toString())),
    );
    selected.push(...remaining.slice(0, count - selected.length));
  }

  // Shuffle the final selection so engine can pick adaptively
  return shuffle(selected)
    .slice(0, count)
    .map((q) => q.id);
}

export function AdaptiveAssessmentPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const navigate = useNavigate();

  const { data: questions, isLoading: loadingQuestions } = useGetAllQuestions();
  const selfRegister = useSelfRegisterAsUser();
  const createMockInterview = useCreateMockInterview();

  const [isStarting, setIsStarting] = useState(false);

  const totalQuestions = questions?.length ?? 0;
  const canStart = totalQuestions >= 1;

  async function handleStartAdaptive() {
    if (!questions || questions.length === 0) {
      toast.error(
        "Question bank is empty. An admin needs to seed questions first.",
      );
      return;
    }

    setIsStarting(true);
    try {
      const selectedIds = selectAdaptiveQuestions(
        questions,
        Math.min(10, questions.length),
      );

      if (selectedIds.length === 0) {
        toast.error("Could not select questions. Please try again.");
        setIsStarting(false);
        return;
      }

      try {
        await selfRegister.mutateAsync();
      } catch (regErr) {
        console.warn("selfRegisterAsUser skipped:", regErr);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const sessionId = await createMockInterview.mutateAsync({
        questionIds: selectedIds,
        timeLimitMinutes: BigInt(45),
      });

      toast.success("Adaptive session created! Starting...");
      void navigate({
        to: "/adaptive-session/$id",
        params: { id: sessionId.toString() },
      });
    } catch (err) {
      console.error("Adaptive session creation failed:", err);
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("anonymous")
      ) {
        toast.error(
          "Please sign in with Internet Identity to start the assessment.",
        );
      } else {
        toast.error(`Failed to start session: ${message}`);
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
          data-ocid="adaptive-assessment.page"
        >
          <CardContent className="pt-10 pb-8 px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20 mx-auto mb-5">
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
            <Badge
              variant="outline"
              className="mb-4 border-primary/40 bg-primary/5 text-primary px-3 py-1 text-xs gap-1"
            >
              <Sparkles size={11} />
              Generative AI Powered
            </Badge>
            <h2 className="font-display text-2xl font-bold mb-2">
              Adaptive AI Assessment
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Sign in to experience AI-driven adaptive interviews that adjust
              question difficulty in real-time based on your answers.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="adaptive-assessment.signin_button"
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {isLoggingIn ? "Connecting..." : "Sign In to Start"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-4rem)]"
      data-ocid="adaptive-assessment.page"
    >
      {/* Hero */}
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/8 via-primary/3 to-background py-14">
        <div className="container max-w-3xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 relative w-fit">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 ring-2 ring-primary/30 mx-auto">
              <BrainCircuit className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-sm">
              <Sparkles size={12} className="text-primary-foreground" />
            </div>
          </div>

          <Badge
            variant="outline"
            className="mb-4 border-primary/40 bg-primary/5 text-primary px-4 py-1.5 text-xs gap-1.5 font-medium"
          >
            <Sparkles size={11} />
            Generative AI Powered
          </Badge>

          <h1 className="font-display text-4xl font-bold tracking-tight mb-4 md:text-5xl">
            Adaptive AI{" "}
            <span className="text-primary relative">
              Assessment
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/30 rounded-full" />
            </span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed mb-4">
            Our adaptive engine analyzes your responses in real-time and adjusts
            question difficulty to match your performance level. Each answer you
            give shapes the next question you receive.
          </p>

          {/* Live from Question Bank badge */}
          {!loadingQuestions && totalQuestions > 0 && (
            <div className="flex justify-center mb-6">
              <Badge
                variant="outline"
                className="border-success/30 bg-success/10 text-success gap-1.5 px-3 py-1 text-xs font-medium"
              >
                <Wifi size={11} />
                {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}{" "}
                fetched live from question bank
              </Badge>
            </div>
          )}

          {loadingQuestions ? (
            <div
              className="flex justify-center"
              data-ocid="adaptive-assessment.loading_state"
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !canStart ? (
            <div
              className="max-w-md mx-auto space-y-3"
              data-ocid="adaptive-assessment.empty_state"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="leading-relaxed">
                  No questions available. An admin must seed the question bank
                  first.
                </AlertDescription>
              </Alert>
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <Link to="/admin/dashboard">Go to Admin Dashboard</Link>
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="gap-2.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-10 h-12 text-base"
              onClick={handleStartAdaptive}
              disabled={isStarting}
              data-ocid="adaptive-assessment.start_button"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Adaptive Session…
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Start Adaptive Assessment
                </>
              )}
            </Button>
          )}

          {canStart && !loadingQuestions && (
            <p className="mt-3 text-xs text-muted-foreground">
              {Math.min(10, totalQuestions)} questions · 45 min · Adaptive
              difficulty · {totalQuestions} available
            </p>
          )}
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-14">
        {/* Feature Cards */}
        <section>
          <div className="mb-7 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
              What Makes It Adaptive
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Unlike standard assessments, this engine learns from your answers
              and responds dynamically.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {FEATURE_CARDS.map((card, idx) => (
              <Card
                key={card.title}
                className="border-border/60 hover:border-primary/30 transition-all hover:shadow-sm"
                data-ocid={`adaptive-assessment.feature.item.${idx + 1}`}
              >
                <CardContent className="p-6">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg} ${card.color} mb-4`}
                  >
                    <card.icon size={22} />
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-2 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section>
          <div className="mb-7">
            <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
              How It Works
            </h2>
            <p className="text-muted-foreground text-sm">
              A 5-step adaptive loop that personalizes every question.
            </p>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-6 left-6 right-6 h-px bg-border/60 hidden sm:block" />
            <div className="grid sm:grid-cols-5 gap-4 relative">
              {STEPS.map((step) => (
                <div
                  key={step.num}
                  className="flex flex-col items-center text-center gap-3"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 text-primary font-bold font-display text-lg relative z-10 bg-background">
                    {step.num}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Performance Meter Preview */}
        <section>
          <Card className="border-border/60 overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-primary" />
                <CardTitle className="font-display text-base">
                  Live Performance Meter
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-xs border-primary/30 text-primary bg-primary/5 ml-auto"
                >
                  In-session feature
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Track your performance in real-time as you answer each question
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Demo meter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Performance Level
                    </span>
                    <span className="text-xs font-bold text-warning">
                      Medium Difficulty
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[55%] rounded-full bg-gradient-to-r from-success via-warning to-warning transition-all duration-500" />
                  </div>
                </div>
                {/* Difficulty trend dots */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Difficulty trend:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { color: "bg-success", label: "easy" },
                      { color: "bg-success", label: "easy" },
                      { color: "bg-warning", label: "medium" },
                      { color: "bg-warning", label: "medium" },
                      { color: "bg-destructive", label: "hard" },
                    ].map((dot) => (
                      <div
                        key={`demo-dot-${dot.label}`}
                        title={dot.label}
                        className={`h-2.5 w-2.5 rounded-full ${dot.color} opacity-80`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      (example)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Green dots = easy questions, Yellow = medium, Red = hard. Your
                  answers drive the sequence.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        {canStart && !loadingQuestions && (
          <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Ready to be challenged?
            </h2>
            <p className="text-muted-foreground text-sm mb-7 max-w-sm mx-auto leading-relaxed">
              {Math.min(10, totalQuestions)} adaptive questions · 45 minutes ·
              The engine adapts after every single answer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-9"
                onClick={handleStartAdaptive}
                disabled={isStarting}
                data-ocid="adaptive-assessment.start_button"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Session…
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-5 w-5" />
                    Start Adaptive Assessment
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="gap-2 border-border/60"
              >
                <Link to="/assessment">
                  <ChevronRight size={15} className="rotate-180" />
                  Standard Assessment
                </Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
