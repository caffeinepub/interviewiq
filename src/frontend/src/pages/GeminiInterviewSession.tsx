import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Brain,
  ChevronRight,
  Lightbulb,
  Loader2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  evaluateAnswer,
  generateFollowUp,
  generateQuestions,
} from "../lib/geminiApi";
import type {
  Evaluation,
  FollowUp,
  Question,
  SessionQuestion,
} from "../lib/geminiApi";

type Phase = "loading" | "questioning" | "evaluating" | "followup" | "complete";

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-green-500/15 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function GeminiInterviewSession() {
  const navigate = useNavigate();
  // Read once from localStorage on mount — stored in refs to avoid dep issues
  const apiKeyRef = useRef(localStorage.getItem("gemini-api-key") ?? "");
  const configRef = useRef(
    (() => {
      const raw = localStorage.getItem("gemini-interview-config");
      return raw
        ? (JSON.parse(raw) as {
            role: string;
            difficulty: string;
            count: number;
          })
        : null;
    })(),
  );

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(
    configRef.current?.difficulty ?? "medium",
  );
  const [sessionData, setSessionData] = useState<SessionQuestion[]>([]);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount
  useEffect(() => {
    const apiKey = apiKeyRef.current;
    const config = configRef.current;
    if (!apiKey || !config) {
      void navigate({ to: "/gemini-interview" });
      return;
    }
    generateQuestions(apiKey, config.role, config.difficulty, config.count)
      .then((qs) => {
        setQuestions(qs);
        setPhase("questioning");
      })
      .catch(() => {
        toast.error("Failed to generate questions. Please check your API key.");
        void navigate({ to: "/gemini-interview" });
      });
  }, []);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || answer.length < 10) return;
    setPhase("evaluating");
    const currentQ = questions[currentIdx];
    const apiKey = apiKeyRef.current;
    const evalResult = await evaluateAnswer(apiKey, currentQ.question, answer);
    setEvaluation(evalResult);
    setPhase("followup");
    const fu = await generateFollowUp(
      apiKey,
      currentQ.question,
      answer,
      currentDifficulty,
    );
    setFollowUp(fu);
    setCurrentDifficulty(fu.difficulty);
  };

  const handleNextQuestion = () => {
    const currentQ = questions[currentIdx];
    const record: SessionQuestion = {
      question: currentQ,
      answer,
      evaluation,
      followUp,
    };
    const updated = [...sessionData, record];
    setSessionData(updated);
    localStorage.setItem("gemini-interview-session", JSON.stringify(updated));

    if (currentIdx + 1 >= questions.length) {
      setPhase("complete");
      void navigate({ to: "/gemini-interview/results" });
      return;
    }
    setCurrentIdx((i) => i + 1);
    setAnswer("");
    setEvaluation(null);
    setFollowUp(null);
    setPhase("questioning");
    setTimeout(() => answerRef.current?.focus(), 100);
  };

  const currentQ = questions[currentIdx];
  const progress =
    questions.length > 0 ? (currentIdx / questions.length) * 100 : 0;
  const config = configRef.current;

  if (phase === "loading") {
    return (
      <div className="container max-w-2xl py-12">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <Brain className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">
              Preparing Your Interview
            </h2>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI is generating your questions…
            </p>
          </div>
          <Card className="glass-card gradient-border-blue">
            <CardContent className="pt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="console-bg min-h-screen">
      <div className="container max-w-2xl py-8 space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <Badge
              variant="outline"
              className={`capitalize ${DIFFICULTY_STYLES[currentDifficulty] ?? ""}`}
            >
              {currentDifficulty}
            </Badge>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"
            data-ocid="gemini_session.loading_state"
          />
        </div>

        {/* Interviewer Avatar */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-2 ring-primary/20"
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold">Gemini AI Interviewer</p>
            <p className="text-xs text-muted-foreground capitalize">
              {config?.role} · {currentDifficulty} difficulty
            </p>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border/60 border-glow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-xs capitalize border-primary/30 text-primary bg-primary/5"
                    >
                      {currentQ.type}
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-lg leading-relaxed">
                    {currentQ.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Textarea
                      ref={answerRef}
                      placeholder="Type your answer here… Be specific and use examples."
                      rows={5}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={phase !== "questioning"}
                      className="resize-none"
                      data-ocid="gemini_session.textarea"
                    />
                    {phase === "evaluating" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-md">
                        <div className="flex items-center gap-2 text-primary">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-sm font-medium">
                            AI is evaluating your answer…
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {phase === "questioning" && (
                    <Button
                      className="w-full gap-2"
                      disabled={answer.length < 10}
                      onClick={handleSubmitAnswer}
                      data-ocid="gemini_session.submit_button"
                    >
                      <Sparkles className="h-4 w-4" />
                      Submit Answer
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Evaluation Card */}
        <AnimatePresence>
          {evaluation && phase === "followup" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                className="glass-card gradient-border-blue"
                data-ocid="gemini_session.success_state"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base">
                      AI Evaluation
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Score
                      </span>
                      <span
                        className={`font-display text-2xl font-bold ${
                          evaluation.score >= 7
                            ? "text-green-400"
                            : evaluation.score >= 5
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {evaluation.score}/10
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                    <ThumbsUp className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-green-400 mb-0.5">
                        Strengths
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {evaluation.strengths}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <ThumbsDown className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-0.5">
                        Areas to Improve
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {evaluation.weaknesses}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                    <Lightbulb className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-400 mb-0.5">
                        Tip
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {evaluation.improvement_tip}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {followUp && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4"
                >
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mt-0.5">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-primary mb-1">
                            Follow-up Question
                          </p>
                          <p className="text-sm">
                            {followUp.follow_up_question}
                          </p>
                          <Badge
                            variant="outline"
                            className={`mt-2 text-xs capitalize ${DIFFICULTY_STYLES[followUp.difficulty] ?? ""}`}
                          >
                            {followUp.difficulty} difficulty
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <Button
                className="w-full mt-4 gap-2"
                onClick={handleNextQuestion}
                data-ocid="gemini_session.primary_button"
              >
                {currentIdx + 1 >= questions.length
                  ? "Finish Interview"
                  : "Next Question"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
