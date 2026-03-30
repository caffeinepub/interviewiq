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
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  ExternalLink,
  Eye,
  EyeOff,
  MessageCircle,
  Mic,
  UserCheck,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const FLOW_STEPS = [
  {
    num: "01",
    title: "Greeting",
    desc: "AI introduces itself and asks your first HR question",
  },
  {
    num: "02",
    title: "Answer",
    desc: "Respond via text or voice — take your time",
  },
  {
    num: "03",
    title: "Feedback",
    desc: "Get 1–2 line feedback on clarity, confidence, relevance",
  },
  {
    num: "04",
    title: "Adapt",
    desc: "AI adjusts difficulty based on your performance",
  },
  {
    num: "05",
    title: "Report",
    desc: "After 5–7 questions, receive an overall summary",
  },
];

const FEATURES = [
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: "One Question at a Time",
    desc: "Strict one-question flow — no overwhelming multi-part questions.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Adaptive Difficulty",
    desc: "Stronger answers unlock harder questions. Struggle? AI guides you gently.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: <Mic className="h-5 w-5" />,
    title: "Voice Mode",
    desc: "AI speaks questions aloud and listens to your spoken answers.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: "Real Interviewer Tone",
    desc: "Slightly strict, professional, and encouraging — like a real HR interview.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
];

export function AIInterviewerSetup() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("gemini-api-key") ?? "",
  );
  const [showKey, setShowKey] = useState(false);
  const [role, setRole] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const canStart = apiKey.trim().length > 0 && role.trim().length > 0;

  const handleStart = () => {
    if (!canStart) {
      toast.error("Please enter your API key and job role to continue.");
      return;
    }
    localStorage.setItem("gemini-api-key", apiKey.trim());
    localStorage.setItem(
      "ai-interviewer-config",
      JSON.stringify({ role: role.trim(), voiceMode, cameraEnabled }),
    );
    void navigate({ to: "/ai-interviewer/session" });
  };

  return (
    <div className="container max-w-2xl py-12 space-y-10">
      {/* Header */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <MessageCircle className="h-7 w-7" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-gradient">
          AI Interviewer
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          A realistic, conversational interview powered by{" "}
          <span className="text-primary font-medium">Google Gemini</span> — one
          question at a time, with instant feedback after every answer.
        </p>
      </motion.div>

      {/* Setup Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-border/60 border-glow">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Session Setup
            </CardTitle>
            <CardDescription>
              Configure your AI interview session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="ai-api-key">
                Gemini API Key{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs inline-flex items-center gap-0.5 ml-1"
                >
                  Get free key <ExternalLink className="h-3 w-3" />
                </a>
              </Label>
              <div className="relative">
                <Input
                  id="ai-api-key"
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                  data-ocid="ai_interviewer_setup.input"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="ai_interviewer_setup.toggle"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Stored locally only — never sent to our servers.
              </p>
            </div>

            {/* Job Role */}
            <div className="space-y-2">
              <Label htmlFor="ai-job-role">Job Role</Label>
              <Input
                id="ai-job-role"
                placeholder="e.g. Frontend Developer, Data Scientist, Product Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                data-ocid="ai_interviewer_setup.role_input"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-cyan-400" />
                  <div>
                    <p className="text-sm font-medium">Voice Mode</p>
                    <p className="text-xs text-muted-foreground">
                      AI speaks questions, mic captures your answers
                    </p>
                  </div>
                </div>
                <Switch
                  checked={voiceMode}
                  onCheckedChange={setVoiceMode}
                  data-ocid="ai_interviewer_setup.voice_switch"
                />
              </div>
              <div className="h-px bg-border/40" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-sm font-medium">Camera Proctoring</p>
                    <p className="text-xs text-muted-foreground">
                      Live webcam monitoring during the session
                    </p>
                  </div>
                </div>
                <Switch
                  checked={cameraEnabled}
                  onCheckedChange={setCameraEnabled}
                  data-ocid="ai_interviewer_setup.camera_switch"
                />
              </div>
            </div>

            {/* Start Button */}
            <Button
              className="w-full gap-2 shadow-glow"
              size="lg"
              disabled={!canStart}
              onClick={handleStart}
              data-ocid="ai_interviewer_setup.primary_button"
            >
              <MessageCircle className="h-4 w-4" />
              Start AI Interview
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <motion.div
        className="grid gap-3 sm:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {FEATURES.map((f) => (
          <Card key={f.title} className="border-border/50">
            <CardContent className="pt-5 pb-4 flex gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${f.bg} ${f.color}`}
              >
                {f.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Interview Flow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              How the Interview Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {FLOW_STEPS.map((step, i) => (
                <div key={step.num} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                    {step.num}
                  </span>
                  <div className="flex-1 pt-0.5">
                    <span className="text-sm font-medium">{step.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {step.desc}
                    </span>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="absolute left-[22px] mt-7 h-3 w-px bg-border/40" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Note */}
      <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-muted/30 p-4 text-sm text-muted-foreground">
        <Badge variant="outline" className="shrink-0 mt-0.5 text-xs">
          Note
        </Badge>
        <p>
          This uses the Google Gemini API directly from your browser. Get a free
          key at{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google AI Studio
          </a>
          . Free tier is sufficient.
        </p>
      </div>
    </div>
  );
}
