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
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Camera,
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Volume2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: Volume2,
    title: "AI Speaks Questions",
    description:
      "Each interview question is spoken aloud using text-to-speech, making it feel like a real conversation.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Mic,
    title: "Voice Recognition",
    description:
      "Your spoken answers are transcribed in real-time. Just talk naturally — no typing required.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Camera,
    title: "Camera Proctoring",
    description:
      "Optional webcam monitoring keeps the session professional and secure throughout.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Bot,
    title: "Gemini AI Evaluation",
    description:
      "Each answer is evaluated by Gemini AI for clarity, depth, and relevance — with instant feedback.",
    color: "text-success",
    bg: "bg-success/10",
  },
];

export function VoiceInterviewPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("gemini_api_key") ?? "",
  );
  const [jobRole, setJobRole] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleStart = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Gemini API key to continue.");
      return;
    }
    if (!jobRole.trim()) {
      toast.error("Please enter the job role you want to practice for.");
      return;
    }
    localStorage.setItem("gemini_api_key", apiKey.trim());
    localStorage.setItem("gemini_job_role", jobRole.trim());
    localStorage.setItem("gemini_voice_mode", "true");
    void navigate({ to: "/gemini-interview/session" });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <Badge
              variant="outline"
              className="mb-4 border-primary/40 bg-primary/5 text-primary px-3 py-1 text-xs"
            >
              Gemini Powered · Speech Recognition
            </Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight mb-3 md:text-5xl">
              Voice <span className="text-primary">Interview</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Experience a fully conversational AI interview. The AI speaks
              questions aloud, you answer by voice, and Gemini evaluates your
              responses in real-time.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-4xl py-12 space-y-10">
        {/* Feature Cards */}
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full border-border/60 hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${feat.bg} ${feat.color} mb-4`}
                    >
                      <feat.icon size={20} />
                    </div>
                    <h3 className="font-display font-semibold text-sm mb-1.5">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Setup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card
            className="border-border/60 max-w-lg mx-auto"
            data-ocid="voice.setup_card"
          >
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Set Up Your Voice Interview
              </CardTitle>
              <CardDescription>
                Configure your session before starting. A Gemini API key is
                required for AI question generation and evaluation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="voice-api-key">
                  Gemini API Key <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="voice-api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="AIza..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 font-mono text-sm border-border/60"
                    data-ocid="voice.api_key_input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowKey((v) => !v)}
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your free key at{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    aistudio.google.com
                  </a>
                </p>
              </div>

              {/* Job Role */}
              <div className="space-y-2">
                <Label htmlFor="voice-job-role">
                  Job Role <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="voice-job-role"
                  placeholder="e.g. Frontend Developer, Data Scientist..."
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="border-border/60"
                  data-ocid="voice.job_role_input"
                />
                <p className="text-xs text-muted-foreground">
                  Questions will be tailored to this role.
                </p>
              </div>

              {/* Tips */}
              <div className="rounded-lg bg-muted/40 border border-border/60 p-4 space-y-2">
                <p className="text-xs font-semibold">Before you start:</p>
                <ul className="space-y-1.5">
                  {[
                    {
                      icon: Mic,
                      text: "Allow microphone access when prompted",
                    },
                    {
                      icon: Volume2,
                      text: "Enable speakers/headphones for AI voice",
                    },
                    {
                      icon: Camera,
                      text: "Allow camera for proctoring (optional)",
                    },
                    {
                      icon: MicOff,
                      text: "Speak clearly — avoid background noise",
                    },
                  ].map((tip) => (
                    <li
                      key={tip.text}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <tip.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      {tip.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              {!identity ? (
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                  data-ocid="voice.login_button"
                >
                  Sign In to Start
                </Button>
              ) : (
                <Button
                  onClick={handleStart}
                  disabled={!apiKey.trim() || !jobRole.trim()}
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
                  data-ocid="voice.start_button"
                >
                  <Zap size={16} />
                  Start Voice Interview
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Other Interview Modes */}
        <section>
          <h2 className="font-display text-xl font-bold mb-4">
            Other Interview Modes
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "AI Interviewer",
                desc: "Strict one-question-at-a-time",
                to: "/ai-interviewer",
                icon: Bot,
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
              },
              {
                label: "Gemini Interview",
                desc: "Fully adaptive AI questions",
                to: "/gemini-interview",
                icon: Zap,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: "Panel Interview",
                desc: "HR + Technical + Manager rotation",
                to: "/panel-interview",
                icon: ArrowRight,
                color: "text-violet-400",
                bg: "bg-violet-500/10",
              },
            ].map((mode) => (
              <Link key={mode.label} to={mode.to}>
                <Card className="border-border/60 hover:border-primary/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode.bg} ${mode.color}`}
                    >
                      <mode.icon size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{mode.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {mode.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
