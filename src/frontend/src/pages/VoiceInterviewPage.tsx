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
  Lock,
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
    glow: "gradient-border-blue",
  },
  {
    icon: Mic,
    title: "Voice Recognition",
    description:
      "Your spoken answers are transcribed in real-time. Just talk naturally — no typing required.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    glow: "gradient-border-cyan",
  },
  {
    icon: Camera,
    title: "Camera Proctoring",
    description:
      "Optional webcam monitoring keeps the session professional and secure throughout.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    glow: "gradient-border-violet",
  },
  {
    icon: Bot,
    title: "Gemini AI Evaluation",
    description:
      "Each answer is evaluated by Gemini AI for clarity, depth, and relevance — with instant feedback.",
    color: "text-success",
    bg: "bg-success/10",
    glow: "gradient-border-emerald",
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
      <section className="relative overflow-hidden gradient-hero border-b border-white/5 py-20">
        <div className="orb orb-blue w-80 h-80 -top-20 -left-20" />
        <div
          className="orb orb-cyan w-64 h-64 top-10 right-0"
          style={{ animationDelay: "3s" }}
        />
        <div className="container max-w-3xl text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-6 relative w-fit">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-glow-lg mx-auto">
                <Mic className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -inset-3 rounded-2xl bg-primary/10 animate-pulse" />
            </div>
            <Badge
              variant="outline"
              className="mb-4 border-primary/40 bg-primary/10 text-primary px-4 py-1.5 text-sm backdrop-blur-sm"
            >
              Gemini Powered · Speech Recognition
            </Badge>
            <h1 className="font-display text-5xl font-black tracking-tighter mb-4 md:text-6xl">
              Voice <span className="text-gradient">Interview</span>
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed">
              Experience a fully conversational AI interview. The AI speaks
              questions aloud, you answer by voice, and Gemini evaluates your
              responses in real-time.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-4xl py-14 space-y-12">
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
                whileHover={{ y: -3 }}
              >
                <Card
                  className={`h-full glass-card ${feat.glow} hover:shadow-glow transition-all duration-300`}
                >
                  <CardContent className="p-5">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${feat.bg} ${feat.color} mb-4 ring-1 ring-current/20`}
                    >
                      <feat.icon size={20} />
                    </div>
                    <h3 className="font-display font-bold text-sm mb-1.5">
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
            className="glass-card gradient-border-blue max-w-lg mx-auto relative overflow-hidden"
            data-ocid="voice.setup_card"
          >
            <div className="orb orb-blue w-32 h-32 -top-8 -right-8" />
            <CardHeader className="relative">
              <CardTitle className="font-display text-xl">
                Set Up Your Voice Interview
              </CardTitle>
              <CardDescription>
                Configure your session before starting. A Gemini API key is
                required for AI question generation and evaluation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 relative">
              {/* API Key */}
              <div className="space-y-2">
                <Label
                  htmlFor="voice-api-key"
                  className="flex items-center gap-1.5"
                >
                  <Lock size={13} className="text-primary" />
                  Gemini API Key <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="voice-api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="AIza..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 font-mono text-sm bg-background/40 border-white/10 focus:border-primary/50 focus:shadow-glow"
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
                  className="bg-background/40 border-white/10 focus:border-primary/50 focus:shadow-glow"
                  data-ocid="voice.job_role_input"
                />
                <p className="text-xs text-muted-foreground">
                  Questions will be tailored to this role.
                </p>
              </div>

              {/* Tips */}
              <div className="rounded-xl bg-background/30 border border-white/10 p-4 space-y-2 backdrop-blur-sm">
                <p className="text-xs font-semibold text-foreground/80">
                  Before you start:
                </p>
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
                      <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <tip.icon className="h-3 w-3 text-primary" />
                      </div>
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
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 btn-glow h-11 font-semibold"
                  data-ocid="voice.login_button"
                >
                  Sign In to Start
                </Button>
              ) : (
                <Button
                  onClick={handleStart}
                  disabled={!apiKey.trim() || !jobRole.trim()}
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 btn-glow h-11 font-semibold"
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
          <h2 className="font-display text-xl font-bold mb-5">
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
                glow: "gradient-border-cyan",
              },
              {
                label: "Gemini Interview",
                desc: "Fully adaptive AI questions",
                to: "/gemini-interview",
                icon: Zap,
                color: "text-primary",
                bg: "bg-primary/10",
                glow: "gradient-border-blue",
              },
              {
                label: "Panel Interview",
                desc: "HR + Technical + Manager rotation",
                to: "/panel-interview",
                icon: ArrowRight,
                color: "text-violet-400",
                bg: "bg-violet-500/10",
                glow: "gradient-border-violet",
              },
            ].map((mode) => (
              <motion.div key={mode.label} whileHover={{ y: -2 }}>
                <Link to={mode.to}>
                  <Card
                    className={`glass-card ${mode.glow} hover:shadow-glow transition-all duration-300 cursor-pointer h-full`}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${mode.bg} ${mode.color} ring-1 ring-current/20`}
                      >
                        <mode.icon size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{mode.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {mode.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
