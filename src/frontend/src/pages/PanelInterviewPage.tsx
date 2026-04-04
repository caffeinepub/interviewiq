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
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mic,
  User,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const interviewers = [
  {
    role: "HR Interviewer",
    icon: User,
    color: "text-primary",
    bg: "bg-primary/10",
    glow: "gradient-border-blue",
    tone: "Friendly & Conversational",
    focus: "Communication skills, cultural fit, behavioral competencies",
    sampleQuestions: [
      "Tell me about yourself",
      "Why are you interested in this role?",
      "Describe a challenge you overcame",
    ],
  },
  {
    role: "Technical Interviewer",
    icon: BrainCircuit,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    glow: "gradient-border-cyan",
    tone: "Precise & Analytical",
    focus: "Technical skills, problem-solving, project architecture",
    sampleQuestions: [
      "Explain your tech stack",
      "Walk me through a complex algorithm",
      "How would you optimize this system?",
    ],
  },
  {
    role: "Hiring Manager",
    icon: Briefcase,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    glow: "gradient-border-violet",
    tone: "Direct & Strategic",
    focus: "Leadership potential, decision-making, business impact",
    sampleQuestions: [
      "Where do you see yourself in 5 years?",
      "How do you handle tight deadlines?",
      "What's your biggest professional failure?",
    ],
  },
];

const panelFeatures = [
  { icon: Users, text: "3-interviewer rotation (HR → Technical → Manager)" },
  { icon: Mic, text: "Resume-based personalized questions" },
  { icon: Zap, text: "Smart follow-ups based on your answers" },
  {
    icon: CheckCircle2,
    text: "Real-time speech feedback (clarity, confidence)",
  },
  { icon: ArrowRight, text: "Final strengths & weaknesses summary" },
];

export function PanelInterviewPage() {
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
      toast.error("Please enter the job role for this panel interview.");
      return;
    }
    localStorage.setItem("gemini_api_key", apiKey.trim());
    localStorage.setItem("gemini_job_role", jobRole.trim());
    localStorage.setItem("gemini_panel_mode", "true");
    void navigate({ to: "/gemini-interview/session" });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero border-b border-white/5 py-20">
        <div className="orb orb-violet w-80 h-80 -top-20 -right-20" />
        <div
          className="orb orb-blue w-64 h-64 bottom-0 left-0"
          style={{ animationDelay: "2s" }}
        />
        <div className="container max-w-3xl text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-6 relative w-fit">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-glow-violet mx-auto">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -inset-3 rounded-2xl bg-violet-500/10 animate-pulse" />
            </div>
            <Badge
              variant="outline"
              className="mb-4 border-violet-500/40 bg-violet-500/10 text-violet-400 px-4 py-1.5 text-sm backdrop-blur-sm"
            >
              HR · Technical · Manager
            </Badge>
            <h1 className="font-display text-5xl font-black tracking-tighter mb-4 md:text-6xl">
              Panel <span className="text-gradient">Interview</span>
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed">
              Experience a realistic multi-interviewer panel. Three AI
              interviewers take turns asking questions based on your resume and
              target role.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-14 space-y-14">
        {/* Panel Features */}
        <section>
          <div className="flex flex-wrap gap-3">
            {panelFeatures.map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-2 rounded-full glass-card gradient-border-blue px-4 py-2 text-sm"
              >
                <f.icon size={14} className="text-primary" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Meet the Interviewers */}
        <section>
          <h2 className="font-display text-2xl font-black mb-2">
            Meet Your Panel
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Three distinct interviewer personas — each with a different focus
            and communication style.
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            {interviewers.map((iv, i) => (
              <motion.div
                key={iv.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className={`h-full glass-card ${iv.glow} hover:shadow-glow transition-all duration-300`}
                >
                  <CardContent className="p-5">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${iv.bg} ${iv.color} mb-4 ring-1 ring-current/20`}
                    >
                      <iv.icon size={20} />
                    </div>
                    <div className="mb-3">
                      <p className="font-display font-bold text-sm">
                        {iv.role}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-1.5 text-xs ${iv.color} border-current/30 bg-current/10`}
                      >
                        {iv.tone}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {iv.focus}
                    </p>
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Sample questions:
                      </p>
                      {iv.sampleQuestions.map((q) => (
                        <div
                          key={q}
                          className="flex items-start gap-1.5 text-xs text-muted-foreground"
                        >
                          <span className={`${iv.color} mt-0.5`}>›</span>
                          {q}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Setup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            className="glass-card gradient-border-violet max-w-lg mx-auto relative overflow-hidden"
            data-ocid="panel.setup_card"
          >
            <div className="orb orb-violet w-32 h-32 -top-8 -right-8" />
            <CardHeader className="relative">
              <CardTitle className="font-display text-xl">
                Start Panel Interview
              </CardTitle>
              <CardDescription>
                Enter your details to begin a realistic multi-interviewer
                session powered by Google Gemini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 relative">
              {/* API Key */}
              <div className="space-y-2">
                <Label
                  htmlFor="panel-api-key"
                  className="flex items-center gap-1.5"
                >
                  <Lock size={13} className="text-primary" />
                  Gemini API Key <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="panel-api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="AIza..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 font-mono text-sm bg-background/40 border-white/10 focus:border-primary/50 focus:shadow-glow"
                    data-ocid="panel.api_key_input"
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
                  Get a free key at{" "}
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
                <Label htmlFor="panel-job-role">
                  Target Job Role <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="panel-job-role"
                  placeholder="e.g. Software Engineer, Product Manager..."
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="bg-background/40 border-white/10 focus:border-primary/50 focus:shadow-glow"
                  data-ocid="panel.job_role_input"
                />
              </div>

              {/* Interview Flow Preview */}
              <div className="rounded-xl bg-background/30 border border-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold mb-3 text-foreground/80">
                  Interview Flow:
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  {interviewers.map((iv, i) => (
                    <div key={iv.role} className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${iv.bg} ${iv.color} ring-1 ring-current/20`}
                      >
                        <iv.icon size={13} />
                      </div>
                      <span className="font-medium">
                        {iv.role.split(" ")[0]}
                      </span>
                      {i < interviewers.length - 1 && (
                        <ArrowRight
                          size={12}
                          className="text-muted-foreground/40"
                        />
                      )}
                    </div>
                  ))}
                  <span className="text-muted-foreground/50">→ Repeat</span>
                </div>
              </div>

              {/* CTA */}
              {!identity ? (
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 btn-glow h-11 font-semibold"
                  data-ocid="panel.login_button"
                >
                  Sign In to Start
                </Button>
              ) : (
                <Button
                  onClick={handleStart}
                  disabled={!apiKey.trim() || !jobRole.trim()}
                  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 btn-glow h-11 font-semibold"
                  data-ocid="panel.start_button"
                >
                  <Users size={16} />
                  Begin Panel Interview
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Other Modes */}
        <section>
          <h2 className="font-display text-xl font-bold mb-5">
            Other Interview Modes
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Voice Interview",
                desc: "Talk with AI via microphone",
                to: "/voice-interview",
                icon: Mic,
                color: "text-primary",
                bg: "bg-primary/10",
                glow: "gradient-border-blue",
              },
              {
                label: "AI Interviewer",
                desc: "Strict one-question-at-a-time",
                to: "/ai-interviewer",
                icon: BrainCircuit,
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
                glow: "gradient-border-cyan",
              },
              {
                label: "Gemini Interview",
                desc: "Fully adaptive AI questions",
                to: "/gemini-interview",
                icon: Zap,
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
