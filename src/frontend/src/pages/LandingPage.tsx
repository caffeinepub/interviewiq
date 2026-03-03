import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: BrainCircuit,
    title: "Adaptive AI Interviews",
    description:
      "Questions adapt in real-time based on candidate responses, ensuring a personalized and accurate assessment every time.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Layers,
    title: "Multi-format Evaluation",
    description:
      "Support text, code snippets, and structured responses. Evaluate technical depth, communication, and problem-solving skills.",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description:
      "Comprehensive score breakdowns with per-question analytics, evaluator notes, and exportable PDF reports.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: ShieldCheck,
    title: "Anti-cheat & Fairness",
    description:
      "Session flagging, time tracking, and behavioral analysis ensure a fair, credible evaluation process.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Users,
    title: "Role-based Access",
    description:
      "Clear separation between candidates, evaluators, and admins — each with focused, purpose-built dashboards.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    icon: BookOpen,
    title: "Question Bank",
    description:
      "Curated library of questions by category, difficulty, and tags. Evaluators can customize every interview.",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
  },
];

const steps = [
  {
    num: "01",
    title: "Create your profile",
    description:
      "Sign in and set up your candidate or evaluator profile in under a minute.",
  },
  {
    num: "02",
    title: "Schedule or start an interview",
    description:
      "Evaluators create sessions; candidates can start mock interviews anytime.",
  },
  {
    num: "03",
    title: "Answer adaptively",
    description:
      "Work through questions with a built-in timer, code editor, and auto-save.",
  },
  {
    num: "04",
    title: "Get scored & reported",
    description:
      "AI and human evaluators score answers. View your comprehensive report instantly.",
  },
];

const stats = [
  { value: "10K+", label: "Interviews Completed" },
  { value: "98%", label: "Candidate Satisfaction" },
  { value: "<2min", label: "Average Setup Time" },
  { value: "500+", label: "Question Library" },
];

export function LandingPage() {
  const { login, isLoggingIn, identity } = useInternetIdentity();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32 gradient-hero">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-6 border-primary/40 bg-primary/5 text-primary px-4 py-1 text-sm"
            >
              <Zap size={12} className="mr-1.5" />
              AI-Powered Hiring Platform
            </Badge>

            <h1 className="font-display text-5xl font-bold tracking-tight leading-tight mb-6 md:text-6xl lg:text-7xl">
              Interview smarter,{" "}
              <span className="text-primary">hire better</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto md:text-xl">
              InterviewIQ is an intelligent adaptive platform that creates
              personalized interview experiences, evaluates candidates
              objectively, and delivers data-driven hiring insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {identity ? (
                <Button
                  asChild
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 transition-all"
                >
                  <Link to="/candidate" data-ocid="landing.get_started_button">
                    Go to Dashboard
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 transition-all"
                  data-ocid="landing.get_started_button"
                >
                  {isLoggingIn ? "Connecting..." : "Get Started Free"}
                  <ArrowRight size={16} />
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-border/60"
                asChild
              >
                <Link to="/questions">View Question Bank</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur-sm"
              >
                <div className="font-display text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="font-display text-3xl font-bold tracking-tight mb-4 md:text-4xl">
              Everything you need for{" "}
              <span className="text-primary">world-class hiring</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              From adaptive questioning to structured evaluation — every tool in
              one platform.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/60 bg-card hover:border-primary/30 transition-colors group"
              >
                <CardContent className="p-6">
                  <div
                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg} ${feature.color}`}
                  >
                    <feature.icon size={20} />
                  </div>
                  <h3 className="font-display text-base font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="font-display text-3xl font-bold tracking-tight mb-4 md:text-4xl">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg">
              From signup to scored report in four simple steps.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute top-5 left-[calc(50%+2rem)] hidden h-px w-[calc(100%-4rem)] bg-border/60 lg:block" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                    <span className="font-display text-xs font-bold text-primary">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 flex justify-center gap-1">
              {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                <Star key={k} size={16} className="fill-warning text-warning" />
              ))}
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight mb-4 md:text-4xl">
              Ready to transform your hiring?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of companies using InterviewIQ to find the best
              talent faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {identity ? (
                <Button
                  asChild
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link to="/candidate">
                    <CheckCircle2 size={16} />
                    Open Dashboard
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="landing.get_started_button"
                >
                  <CheckCircle2 size={16} />
                  {isLoggingIn ? "Connecting..." : "Start for Free"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
