import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  Brain,
  ChevronRight,
  Lightbulb,
  Printer,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import type { SessionQuestion } from "../lib/geminiApi";

const DIFF_STYLES: Record<string, string> = {
  easy: "bg-green-500/15 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function GeminiInterviewResults() {
  const sessionRaw = localStorage.getItem("gemini-interview-session");
  const configRaw = localStorage.getItem("gemini-interview-config");
  const session: SessionQuestion[] = sessionRaw ? JSON.parse(sessionRaw) : [];
  const config = configRaw
    ? (JSON.parse(configRaw) as {
        role: string;
        difficulty: string;
        count: number;
      })
    : null;

  const scores = session.map((s) => s.evaluation?.score ?? 5);
  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const tier =
    avg >= 7
      ? {
          label: "Excellent",
          color: "text-green-400",
          bg: "bg-green-500/10 border-green-500/30",
        }
      : avg >= 5
        ? {
            label: "Good",
            color: "text-yellow-400",
            bg: "bg-yellow-500/10 border-yellow-500/30",
          }
        : {
            label: "Needs Improvement",
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/30",
          };

  const avgColor =
    avg >= 7 ? "text-green-400" : avg >= 5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="container max-w-2xl py-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Trophy className="h-8 w-8" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold">
          Interview Complete 🎉
        </h1>
        <p className="text-muted-foreground">
          {config?.role} · {session.length} questions answered
        </p>

        <div className="inline-flex flex-col items-center gap-2">
          <span className={`font-display text-6xl font-black ${avgColor}`}>
            {avg}
          </span>
          <span className="text-muted-foreground text-sm">out of 10</span>
          <Badge
            variant="outline"
            className={`capitalize ${tier.bg} ${tier.color}`}
          >
            {tier.label}
          </Badge>
        </div>
      </motion.div>

      {/* Difficulty Progression */}
      {session.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Difficulty Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {session.map((s, i) => {
                const diff = s.followUp?.difficulty ?? s.question.difficulty;
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: ordered result list
                    key={i}
                    className="flex items-center gap-1"
                  >
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${DIFF_STYLES[diff] ?? ""}`}
                    >
                      Q{i + 1}: {diff}
                    </Badge>
                    {i < session.length - 1 && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-question Accordion */}
      {session.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-3">
            Question Breakdown
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {session.map((s, i) => (
              <AccordionItem
                // biome-ignore lint/suspicious/noArrayIndexKey: ordered result list
                key={i}
                value={`q-${i}`}
                className="border border-border/60 rounded-lg px-4"
                data-ocid={`gemini_results.item.${i + 1}`}
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium line-clamp-1 flex-1">
                      {s.question.question}
                    </span>
                    {s.evaluation && (
                      <Badge
                        variant="outline"
                        className={`ml-auto shrink-0 text-xs ${
                          s.evaluation.score >= 7
                            ? "border-green-500/40 bg-green-500/10 text-green-400"
                            : s.evaluation.score >= 5
                              ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                              : "border-red-500/40 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {s.evaluation.score}/10
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  <div className="rounded-lg bg-muted/40 border border-border/40 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Your Answer
                    </p>
                    <p className="text-sm">
                      {s.answer || "(no answer provided)"}
                    </p>
                  </div>
                  {s.evaluation && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                        <ThumbsUp className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-green-400 mb-0.5">
                            Strengths
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.evaluation.strengths}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                        <ThumbsDown className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-red-400 mb-0.5">
                            Weaknesses
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.evaluation.weaknesses}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                        <Lightbulb className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-blue-400 mb-0.5">
                            Improvement Tip
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.evaluation.improvement_tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Action Buttons */}
      <div
        className="flex flex-col sm:flex-row gap-3"
        data-ocid="gemini_results.panel"
      >
        <Button
          asChild
          className="flex-1 gap-2"
          data-ocid="gemini_results.primary_button"
        >
          <Link to="/gemini-interview">
            <Sparkles className="h-4 w-4" />
            Start New Interview
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex-1 gap-2 border-border/60"
          data-ocid="gemini_results.secondary_button"
        >
          <Link to="/candidate">
            <Brain className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.print()}
          data-ocid="gemini_results.button"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
