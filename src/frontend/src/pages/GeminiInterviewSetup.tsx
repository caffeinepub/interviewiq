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
import {
  Brain,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
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
    glow: "gradient-border-blue",
    bg: "bg-primary/5",
  },
  {
    icon: <Zap className="h-5 w-5 text-yellow-400" />,
    title: "Adaptive Follow-ups",
    desc: "Difficulty adjusts in real-time based on your answers — stronger answers get harder follow-ups.",
    glow: "gradient-border-cyan",
    bg: "bg-cyan-500/5",
  },
  {
    icon: <Sparkles className="h-5 w-5 text-cyan-400" />,
    title: "AI Evaluation",
    desc: "Each answer is scored with strengths, weaknesses, and improvement tips powered by Gemini.",
    glow: "gradient-border-violet",
    bg: "bg-violet-500/5",
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
    <div className="min-h-[calc(100vh-4rem)] console-bg">
      <div className="container max-w-2xl py-14 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-glow-lg text-white mx-auto">
                <Brain className="h-8 w-8" />
              </div>
              <div className="absolute -inset-2 rounded-2xl bg-primary/10 animate-pulse" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-black tracking-tighter text-gradient">
            AI-Powered Interview
          </h1>
          <p className="text-muted-foreground">
            Powered by{" "}
            <span className="text-primary font-semibold">Google Gemini</span> —
            adaptive questions that evolve with your answers
          </p>
        </motion.div>

        {/* Setup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="glass-card gradient-border-blue relative overflow-hidden">
            <div className="orb orb-blue w-32 h-32 -top-8 -right-8" />
            <CardHeader className="relative">
              <CardTitle className="font-display text-lg">
                Interview Setup
              </CardTitle>
              <CardDescription>
                Configure your AI interview session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="api-key" className="flex items-center gap-1.5">
                  <Lock size={13} className="text-primary" />
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
                    className="pr-10 font-mono bg-background/40 border-white/10 focus:border-primary/50 focus:shadow-glow"
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
                  className="bg-background/40 border-white/10 focus:border-primary/50 focus:shadow-glow"
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
                        className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${d.color} ${
                          isSelected
                            ? `ring-2 ring-offset-1 ring-offset-background ${d.ring} shadow-sm`
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
                      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                        count === n
                          ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/30 shadow-glow"
                          : "border-white/15 bg-white/5 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
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
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 btn-glow font-semibold"
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
        </motion.div>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <Card
                className={`glass-card ${f.glow} hover:shadow-glow transition-all duration-300 text-center`}
              >
                <CardContent className="pt-6 pb-5 space-y-2">
                  <div className="flex justify-center">{f.icon}</div>
                  <p className="font-display font-bold text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <div className="flex items-start gap-3 glass-card gradient-border-blue rounded-xl p-4 text-sm text-muted-foreground">
          <Badge
            variant="outline"
            className="shrink-0 mt-0.5 text-xs border-primary/30 text-primary bg-primary/10"
          >
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
    </div>
  );
}
