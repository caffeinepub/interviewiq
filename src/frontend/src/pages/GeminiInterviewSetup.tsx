import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Brain, ExternalLink, Eye, EyeOff, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DIFFICULTIES = [
  {
    value: "easy",
    label: "Easy",
    color:
      "border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20",
    ring: "ring-green-500",
  },
  {
    value: "medium",
    label: "Medium",
    color:
      "border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
    ring: "ring-yellow-500",
  },
  {
    value: "hard",
    label: "Hard",
    color: "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20",
    ring: "ring-red-500",
  },
] as const;

const QUESTION_COUNTS = [5, 8, 10];

const FEATURES = [
  {
    icon: <Brain className="h-5 w-5 text-primary" />,
    title: "Dynamic Questions",
    desc: "AI generates unique, role-specific questions every session based on your job target.",
  },
  {
    icon: <Zap className="h-5 w-5 text-yellow-400" />,
    title: "Adaptive Follow-ups",
    desc: "Difficulty adjusts in real-time based on your answers — stronger answers get harder follow-ups.",
  },
  {
    icon: <Sparkles className="h-5 w-5 text-cyan-400" />,
    title: "AI Evaluation",
    desc: "Each answer is scored with strengths, weaknesses, and improvement tips powered by Gemini.",
  },
];

export function GeminiInterviewSetup() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("gemini-api-key") ?? "",
  );
  const [showKey, setShowKey] = useState(false);
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [count, setCount] = useState(5);

  const canStart = apiKey.trim().length > 0 && role.trim().length > 0;

  const handleStart = () => {
    if (!canStart) {
      toast.error("Please enter your API key and job role to continue.");
      return;
    }
    localStorage.setItem("gemini-api-key", apiKey.trim());
    localStorage.setItem(
      "gemini-interview-config",
      JSON.stringify({ role: role.trim(), difficulty, count }),
    );
    void navigate({ to: "/gemini-interview/session" });
  };

  return (
    <div className="container max-w-2xl py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Brain className="h-6 w-6" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-gradient">
          AI-Powered Interview
        </h1>
        <p className="text-muted-foreground">
          Powered by{" "}
          <span className="text-primary font-medium">Google Gemini</span> —
          adaptive questions that evolve with your answers
        </p>
      </div>

      {/* Setup Card */}
      <Card className="border-border/60 border-glow">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Interview Setup
          </CardTitle>
          <CardDescription>Configure your AI interview session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">
              Gemini API Key{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs inline-flex items-center gap-0.5 ml-1"
              >
                Get your API key <ExternalLink className="h-3 w-3" />
              </a>
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
                data-ocid="gemini_setup.input"
              />
              <button
                type="button"
                onClick={() => setShowKey((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="gemini_setup.toggle"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your key is stored locally only — never sent to our servers.
            </p>
          </div>

          {/* Job Role */}
          <div className="space-y-2">
            <Label htmlFor="job-role">Job Role</Label>
            <Input
              id="job-role"
              placeholder="e.g. Frontend Developer, Java Developer, Data Scientist"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              data-ocid="gemini_setup.role_input"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => {
                const isSelected = difficulty === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${d.color} ${
                      isSelected
                        ? `ring-2 ring-offset-1 ring-offset-background ${d.ring}`
                        : "opacity-60"
                    }`}
                    data-ocid={`gemini_setup.${d.value}_button`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all border-border/60 hover:border-primary/40 hover:bg-primary/5 ${
                    count === n
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                      : "text-muted-foreground"
                  }`}
                  data-ocid={`gemini_setup.count_${n}_button`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <Button
            className="w-full gap-2 shadow-glow"
            size="lg"
            disabled={!canStart}
            onClick={handleStart}
            data-ocid="gemini_setup.primary_button"
          >
            <Sparkles className="h-4 w-4" />
            Start AI Interview
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title} className="border-border/60 text-center">
            <CardContent className="pt-6 pb-5 space-y-2">
              <div className="flex justify-center">{f.icon}</div>
              <p className="font-display font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note */}
      <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-muted/30 p-4 text-sm text-muted-foreground">
        <Badge variant="outline" className="shrink-0 mt-0.5 text-xs">
          Note
        </Badge>
        <p>
          This feature uses the Google Gemini API directly from your browser.
          You need a valid API key from{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google AI Studio
          </a>
          . Free tier is sufficient for most interviews.
        </p>
      </div>
    </div>
  );
}
