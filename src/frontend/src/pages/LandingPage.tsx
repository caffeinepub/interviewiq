import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  BrainCircuit,
  Camera,
  CheckCircle2,
  Lock,
  MessageCircle,
  Mic,
  Mic2,
  Shield,
  Sparkles,
  TrendingUp,
  Users2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Adaptive AI Engine",
    description:
      "Questions dynamically adjust based on your performance in real-time. Score high and face harder challenges; struggle and get supportive difficulty.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "gradient-border-blue",
  },
  {
    icon: <Camera className="h-5 w-5" />,
    title: "Computer Proctoring",
    description:
      "Live webcam monitoring, screen share tracking, and tab-switch detection ensure a fair, secure assessment environment throughout.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "gradient-border-cyan",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Blockchain-Secured",
    description:
      "All session data, scores, and reports are stored on the Internet Computer blockchain — tamper-proof, decentralized, zero server costs.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "gradient-border-violet",
  },
  {
    icon: <Mic className="h-5 w-5" />,
    title: "Verbal Mode",
    description:
      "Enable speech-to-text answering and text-to-speech question reading. Evaluate communication skills in a multi-format assessment.",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    glow: "gradient-border-emerald",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Gemini AI Interview",
    description:
      "Dynamic adaptive questions generated in real-time by Google Gemini AI. Each session is unique with follow-ups tailored to your answers.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "gradient-border-blue",
  },
  {
    icon: <Mic2 className="h-5 w-5" />,
    title: "Voice Interview",
    description:
      "Speak naturally with AI. Questions are read aloud and your voice responses are transcribed and evaluated in real-time.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "gradient-border-cyan",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: "AI Interviewer",
    description:
      "One question at a time, strict professional AI interviewer that adapts difficulty and gives instant feedback on every answer.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "gradient-border-violet",
  },
  {
    icon: <Users2 className="h-5 w-5" />,
    title: "Panel Interview",
    description:
      "Realistic HR, Technical, and Manager interview rotation. Resume-based personalized questions with real-time speech feedback.",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    glow: "gradient-border-emerald",
  },
];

const stats = [
  { value: "19+", label: "Curated Questions", icon: <BookOpen size={16} /> },
  { value: "AI", label: "Adaptive Engine", icon: <BrainCircuit size={16} /> },
  { value: "0", label: "Server Costs", icon: <Zap size={16} /> },
  { value: "100%", label: "On-Chain", icon: <Lock size={16} /> },
];

const interviewModes = [
  {
    title: "Standard Assessment",
    description: "5 auto-selected questions, 30 min timed, instant results.",
    to: "/assessment",
    icon: <Brain className="h-6 w-6" />,
    cta: "Start Now",
    badge: "Classic",
    color: "text-primary",
    bg: "bg-gradient-to-br from-primary/20 to-primary/5",
    border: "border-primary/30",
    glow: "gradient-border-blue",
  },
  {
    title: "AI Adaptive",
    description: "Difficulty adjusts in real-time based on your performance.",
    to: "/adaptive-assessment",
    icon: <Sparkles className="h-6 w-6" />,
    cta: "Try Adaptive",
    badge: "Smart",
    color: "text-violet-400",
    bg: "bg-gradient-to-br from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/30",
    glow: "gradient-border-violet",
  },
  {
    title: "Gemini AI",
    description: "Generative questions unique to your role, powered by Gemini.",
    to: "/gemini-interview",
    icon: <Sparkles className="h-6 w-6" />,
    cta: "Try Gemini",
    badge: "Generative",
    color: "text-cyan-400",
    bg: "bg-gradient-to-br from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
    glow: "gradient-border-cyan",
  },
  {
    title: "Voice Interview",
    description: "Speak your answers. AI evaluates clarity and confidence.",
    to: "/voice-interview",
    icon: <Mic2 className="h-6 w-6" />,
    cta: "Try Voice",
    badge: "Spoken",
    color: "text-success",
    bg: "bg-gradient-to-br from-success/20 to-success/5",
    border: "border-success/30",
    glow: "gradient-border-emerald",
  },
];

const steps = [
  {
    num: "01",
    title: "Sign In",
    desc: "Passwordless login via Internet Identity",
  },
  {
    num: "02",
    title: "Choose Mode",
    desc: "Standard, AI adaptive, Gemini, voice, or panel",
  },
  {
    num: "03",
    title: "Take the Test",
    desc: "Timed session with proctoring and AI evaluation",
  },
  {
    num: "04",
    title: "View Report",
    desc: "Instant scores with detailed feedback",
  },
];

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero min-h-[90vh] flex items-center">
        {/* Floating orbs */}
        <div className="orb orb-blue w-96 h-96 -top-20 -left-20" />
        <div
          className="orb orb-cyan w-80 h-80 top-40 right-0"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="orb orb-violet w-64 h-64 bottom-0 left-1/3"
          style={{ animationDelay: "4s" }}
        />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.35 0.05 263 / 0.05) 1px, transparent 1px), linear-gradient(90deg, oklch(0.35 0.05 263 / 0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container relative py-28 md:py-36">
          <div className="max-w-4xl">
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                AI-Powered · Blockchain-Secured · Decentralized
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-6xl font-black tracking-tighter leading-[1.05] md:text-8xl mb-6"
            >
              Interview
              <span className="text-gradient">IQ</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/70 leading-relaxed max-w-2xl mb-10 md:text-2xl"
            >
              The decentralized AI-powered interview platform that standardizes
              technical and behavioral assessments. Fair, secure, and instant.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link to="/assessment">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 btn-glow gap-2"
                  data-ocid="landing.start_button"
                >
                  Start Assessment
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/admissions">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-semibold border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 backdrop-blur-sm gap-2"
                  data-ocid="landing.admissions_button"
                >
                  View Admissions
                </Button>
              </Link>
              <Link to="/ai-interviewer">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-semibold border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 gap-2"
                  data-ocid="landing.ai_interviewer_button"
                >
                  <MessageCircle size={18} />
                  AI Interviewer
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-5"
            >
              <Link
                to="/admin"
                className="text-xs text-white/30 hover:text-white/50 transition-colors"
                data-ocid="landing.admin_link"
              >
                Admin Portal →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5">
        <div className="glass-card">
          <div className="container py-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    {stat.icon}
                    <span className="text-xs uppercase tracking-widest">
                      {stat.label}
                    </span>
                  </div>
                  <span className="font-display text-4xl font-black text-gradient">
                    {stat.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/10 text-primary backdrop-blur-sm"
          >
            Core Features
          </Badge>
          <h2 className="font-display text-4xl font-black tracking-tighter mb-4 md:text-5xl">
            Everything you need for
            <br />
            <span className="text-gradient">fair, modern interviews</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built on decentralized infrastructure with AI at its core. No
            servers, no bias, no compromises.
          </p>
        </motion.div>

        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {features.map((feat, i) => (
            <motion.div
              key={
                feat.title === "Adaptive AI Engine"
                  ? "feat-adaptive"
                  : feat.title === "Voice Interview"
                    ? "feat-voice"
                    : feat.title
              }
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className={`h-full glass-card ${feat.glow} hover:shadow-glow transition-all duration-300`}
              >
                <CardContent className="pt-6 pb-6">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${feat.bg} ${feat.color} mb-4 ring-1 ring-current/20`}
                  >
                    {feat.icon}
                  </div>
                  <h3 className="font-display font-bold text-base mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interview Modes Section */}
      <section className="border-y border-white/5 py-28">
        <div className="glass-card py-1">
          <div className="container py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 bg-primary/10 text-primary"
              >
                Interview Formats
              </Badge>
              <h2 className="font-display text-4xl font-black tracking-tighter mb-4">
                Multiple Interview Formats
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Choose the format that matches your preparation goal — from
                quick standard tests to fully conversational AI sessions.
              </p>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {interviewModes.map((mode, i) => (
                <motion.div
                  key={mode.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card
                    className={`h-full ${mode.bg} ${mode.glow} hover:shadow-glow transition-all duration-300`}
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-background/30 backdrop-blur-sm ${mode.color} mb-4 ring-1 ring-current/20`}
                      >
                        {mode.icon}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-bold text-base">
                          {mode.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${mode.color} border-current/30 bg-current/10`}
                        >
                          {mode.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                        {mode.description}
                      </p>
                      <Link to={mode.to}>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`w-full gap-1.5 border-current/30 ${mode.color} hover:bg-current/10 backdrop-blur-sm`}
                          data-ocid={`landing.mode_${i + 1}_button`}
                        >
                          {mode.cta}
                          <ArrowRight size={13} />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-black tracking-tighter mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg">
            From sign-in to report in under 35 minutes.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {i < steps.length - 1 && (
                <div className="absolute top-8 left-full hidden lg:block w-full h-px bg-gradient-to-r from-primary/30 to-transparent z-0" />
              )}
              <div className="relative z-10">
                <div className="font-display text-7xl font-black text-gradient opacity-40 mb-3">
                  {step.num}
                </div>
                <h3 className="font-display font-bold text-xl mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security section */}
      <section className="border-y border-white/5 py-20">
        <div className="glass-card py-1">
          <div className="container py-16">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <Badge
                  variant="outline"
                  className="mb-4 border-primary/30 bg-primary/10 text-primary"
                >
                  Security &amp; Privacy
                </Badge>
                <h2 className="font-display text-3xl font-black tracking-tight mb-4">
                  Built for trust, transparency,
                  <br />
                  <span className="text-gradient">and integrity.</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Every score, every answer, every result is stored on the
                  Internet Computer blockchain. No admin can alter your scores.
                  No server can be hacked. Your data is yours.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 grid grid-cols-2 gap-4"
              >
                {[
                  {
                    icon: Shield,
                    label: "Role-Based Access",
                    desc: "Admin, Evaluator, Candidate",
                    color: "text-primary",
                    bg: "bg-primary/10",
                  },
                  {
                    icon: Lock,
                    label: "On-Chain Storage",
                    desc: "Tamper-proof, immutable",
                    color: "text-violet-400",
                    bg: "bg-violet-500/10",
                  },
                  {
                    icon: Camera,
                    label: "Live Proctoring",
                    desc: "Camera + screen monitoring",
                    color: "text-cyan-400",
                    bg: "bg-cyan-500/10",
                  },
                  {
                    icon: CheckCircle2,
                    label: "Instant Reports",
                    desc: "Automated scoring + feedback",
                    color: "text-success",
                    bg: "bg-success/10",
                  },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ y: -2 }}
                    className="flex items-start gap-3 rounded-2xl glass-card gradient-border-blue p-4 transition-all duration-300 hover:shadow-glow"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
                    >
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl glass-card gradient-border-blue p-14 text-center shadow-glow"
        >
          {/* Inner orbs */}
          <div className="orb orb-blue w-64 h-64 -top-16 -left-16 opacity-60" />
          <div
            className="orb orb-cyan w-48 h-48 -bottom-8 -right-8 opacity-50"
            style={{ animationDelay: "3s" }}
          />
          <div className="pointer-events-none absolute inset-0 gradient-hero opacity-50" />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-glow-lg">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-display text-4xl font-black tracking-tighter mb-4 md:text-5xl">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Join thousands of candidates and organizations using InterviewIQ
              for fair, structured, blockchain-secured assessments.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/assessment">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 btn-glow gap-2"
                  data-ocid="landing.cta_button"
                >
                  Start Free Assessment
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/interview-answers">
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 px-8 text-base hover:bg-white/10"
                  data-ocid="landing.guide_button"
                >
                  <TrendingUp size={16} className="mr-2" />
                  View Answer Guide
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
