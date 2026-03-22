import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Camera,
  CheckCircle2,
  Lock,
  Mic,
  Shield,
  Sparkles,
  TrendingUp,
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
  },
  {
    icon: <Camera className="h-5 w-5" />,
    title: "Computer Proctoring",
    description:
      "Live webcam monitoring, screen share tracking, and tab-switch detection ensure a fair, secure assessment environment throughout.",
    color: "text-cyan-400",
    bg: "bg-cyan/10",
    border: "border-cyan/20",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Blockchain-Secured",
    description:
      "All session data, scores, and reports are stored on the Internet Computer blockchain — tamper-proof, decentralized, zero server costs.",
    color: "text-violet-400",
    bg: "bg-violet/10",
    border: "border-violet/20",
  },
  {
    icon: <Mic className="h-5 w-5" />,
    title: "Verbal Mode",
    description:
      "Enable speech-to-text answering and text-to-speech question reading. Evaluate communication skills in a multi-format assessment.",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
];

const stats = [
  { value: "19+", label: "Curated Questions", icon: <BookOpen size={16} /> },
  { value: "AI", label: "Adaptive Engine", icon: <BrainCircuit size={16} /> },
  { value: "0", label: "Server Costs", icon: <Zap size={16} /> },
  { value: "100%", label: "On-Chain", icon: <Lock size={16} /> },
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
    desc: "Standard or AI-adaptive assessment",
  },
  {
    num: "03",
    title: "Take the Test",
    desc: "30-min timed session with proctoring",
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
      <section className="relative overflow-hidden gradient-hero min-h-[88vh] flex items-center">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.35 0.05 263 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(0.35 0.05 263 / 0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container relative py-24 md:py-32">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="mb-6 border-primary/40 bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium"
              >
                <Sparkles size={12} className="mr-1.5" />
                AI-Powered · Blockchain-Secured · Decentralized
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl font-extrabold tracking-tight leading-[1.1] md:text-7xl lg:text-8xl mb-6"
            >
              Interview
              <span className="text-gradient">IQ</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10 md:text-2xl"
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
                  className="h-12 px-8 text-base font-bold shadow-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
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
                  className="h-12 px-8 text-base font-semibold border-border/60 gap-2"
                  data-ocid="landing.admissions_button"
                >
                  View Admissions
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
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                data-ocid="landing.admin_link"
              >
                Admin Portal →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/40 bg-card/50">
        <div className="container py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center gap-1 text-center"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  {stat.icon}
                  <span className="text-xs uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
                <span className="font-display text-3xl font-bold text-gradient">
                  {stat.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/8 text-primary"
          >
            Core Features
          </Badge>
          <h2 className="font-display text-4xl font-bold tracking-tight mb-4 md:text-5xl">
            Everything you need for
            <br />
            <span className="text-gradient">fair, modern interviews</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built on decentralized infrastructure with AI at its core. No
            servers, no bias, no compromises.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`h-full border ${feat.border} hover:shadow-glow transition-all duration-300 bg-card/80`}
              >
                <CardContent className="pt-6 pb-6">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${feat.bg} ${feat.color} mb-4`}
                  >
                    {feat.icon}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">
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

      {/* How it works */}
      <section className="border-y border-border/40 bg-card/30 py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold tracking-tight mb-4">
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
                  <div className="absolute top-6 left-full hidden lg:block w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="font-display text-5xl font-black text-primary/20 mb-3">
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
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-primary/5 p-12 text-center shadow-glow"
        >
          <div className="pointer-events-none absolute inset-0 gradient-hero opacity-60" />
          <div className="relative">
            <CheckCircle2 className="mx-auto mb-6 h-12 w-12 text-primary" />
            <h2 className="font-display text-4xl font-bold tracking-tight mb-4 md:text-5xl">
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
                  className="h-12 px-8 text-base font-bold shadow-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
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
                  className="h-12 px-8 text-base"
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
