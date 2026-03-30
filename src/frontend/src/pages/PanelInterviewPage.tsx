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
    border: "border-primary/20",
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
    border: "border-cyan-500/20",
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
    border: "border-violet-500/20",
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
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <Badge
              variant="outline"
              className="mb-4 border-primary/40 bg-primary/5 text-primary px-3 py-1 text-xs"
            >
              HR · Technical · Manager
            </Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight mb-3 md:text-5xl">
              Panel <span className="text-primary">Interview</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Experience a realistic multi-interviewer panel. Three AI
              interviewers take turns asking questions based on your resume and
              target role.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-12">
        {/* Panel Features */}
        <section>
          <div className="flex flex-wrap gap-3">
            {panelFeatures.map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm"
              >
                <f.icon size={14} className="text-primary" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Meet the Interviewers */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-2">
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
              >
                <Card
                  className={`h-full border ${iv.border} hover:shadow-md transition-all`}
                >
                  <CardContent className="p-5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${iv.bg} ${iv.color} mb-4`}
                    >
                      <iv.icon size={20} />
                    </div>
                    <div className="mb-3">
                      <p className="font-display font-bold text-sm">
                        {iv.role}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${iv.color} border-current/20 bg-current/5`}
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
            className="border-border/60 max-w-lg mx-auto"
            data-ocid="panel.setup_card"
          >
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Start Panel Interview
              </CardTitle>
              <CardDescription>
                Enter your details to begin a realistic multi-interviewer
                session powered by Google Gemini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="panel-api-key">
                  Gemini API Key <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="panel-api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="AIza..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 font-mono text-sm border-border/60"
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
                  className="border-border/60"
                  data-ocid="panel.job_role_input"
                />
              </div>

              {/* Interview Flow Preview */}
              <div className="rounded-lg bg-muted/40 border border-border/60 p-4">
                <p className="text-xs font-semibold mb-2">Interview Flow:</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  {interviewers.map((iv, i) => (
                    <div key={iv.role} className="flex items-center gap-2">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${iv.bg} ${iv.color}`}
                      >
                        <iv.icon size={12} />
                      </div>
                      <span>{iv.role.split(" ")[0]}</span>
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
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                  data-ocid="panel.login_button"
                >
                  Sign In to Start
                </Button>
              ) : (
                <Button
                  onClick={handleStart}
                  disabled={!apiKey.trim() || !jobRole.trim()}
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
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
          <h2 className="font-display text-xl font-bold mb-4">
            Other Interview Modes
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Voice Interview",
                desc: "Talk with AI via microphone",
                to: "/voice-interview",
                icon: Mic,
              },
              {
                label: "AI Interviewer",
                desc: "Strict one-question-at-a-time",
                to: "/ai-interviewer",
                icon: BrainCircuit,
              },
              {
                label: "Gemini Interview",
                desc: "Fully adaptive AI questions",
                to: "/gemini-interview",
                icon: Zap,
              },
            ].map((mode) => (
              <Link key={mode.label} to={mode.to}>
                <Card className="border-border/60 hover:border-primary/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
