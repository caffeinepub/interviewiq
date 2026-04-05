import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  ExternalLink,
  HelpCircle,
  Instagram,
  Lock,
  Mail,
  MessageCircle,
  Mic2,
  Monitor,
  PlayCircle,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Users2,
  Video,
  Zap,
} from "lucide-react";
import { useState } from "react";

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const FAQ_ITEMS: FAQItem[] = [
  // Getting Started
  {
    id: "gs-1",
    category: "Getting Started",
    question: "How do I create an account?",
    answer:
      'InterviewIQ uses Internet Identity — a cryptographic, passwordless login system built on the Internet Computer blockchain. Simply visit the sign-in page, click "Sign In", and authenticate via your device\'s biometrics or security key. No password needed, no data breach risk.',
  },
  {
    id: "gs-2",
    category: "Getting Started",
    question: "How do I become an Admin?",
    answer:
      "Navigate to /admin and sign in with Internet Identity. If no admin has been claimed yet, you'll see a \"Become Admin\" button — this is a one-click, first-come-first-served process. Once you're admin, head to /admin/dashboard to seed questions and manage users.",
  },
  {
    id: "gs-3",
    category: "Getting Started",
    question: "What roles are available on the platform?",
    answer:
      "InterviewIQ has four roles: Guest (browse only), Candidate/User (attend interviews, view results, manage data), Evaluator/Recruiter (create questions, view candidate responses, access analytics), and Admin (full platform control including user management, analytics, and system settings).",
  },
  {
    id: "gs-4",
    category: "Getting Started",
    question: "How do I save my profile?",
    answer:
      'Go to /onboarding after signing in. Fill in your details — name, email, target role, and experience level — then click "Complete Setup". The system registers your account, saves your profile, and creates your candidate profile in three sequential steps with a clear progress indicator.',
  },
  {
    id: "gs-5",
    category: "Getting Started",
    question: "How do I request a role upgrade?",
    answer:
      'From your Candidate Dashboard (/candidate), scroll to the "Request Role Upgrade" card. Select the role you want (Evaluator or Recruiter), write a brief reason, and submit. An Admin will review and approve or deny your request. You\'ll see live status updates on the same card.',
  },
  // Assessments
  {
    id: "as-1",
    category: "Assessments",
    question: "How does the standard assessment work?",
    answer:
      "The standard assessment at /assessment auto-selects 5 questions (mixed difficulty) from the live on-chain question bank — 1 easy, 2 medium, 2 hard. You have 30 minutes to complete all questions. Answers are auto-scored immediately after submission based on answer quality and keyword relevance.",
  },
  {
    id: "as-2",
    category: "Assessments",
    question: "What is Adaptive Assessment?",
    answer:
      "The Adaptive Assessment (/adaptive-assessment) uses an AI engine to adjust question difficulty in real time based on your performance. If you score well on a question, the next one is harder; if you struggle, it becomes easier. Each session is unique and personalized to your skill level.",
  },
  {
    id: "as-3",
    category: "Assessments",
    question: "How are answers scored?",
    answer:
      "Answers are scored using two factors: keyword intelligence (60% weight) — detecting domain-specific terms, STAR method usage, technical vocabulary — and answer length (40% weight). Scores range from 0 to 100. Brief answers score around 20, adequate around 50, good around 70, and excellent around 90.",
  },
  {
    id: "as-4",
    category: "Assessments",
    question: "Can I retake an assessment?",
    answer:
      "Yes. Each assessment session is completely independent. You can start a new session at any time from the Assessment page. All past sessions and results remain accessible in your Candidate Dashboard and Candidate Report, so you can track improvement over time.",
  },
  {
    id: "as-5",
    category: "Assessments",
    question: "Where can I view my results?",
    answer:
      "Immediate results appear at /assessment/results/:id right after submission, showing your score, performance tier, and per-question breakdown. A full structured Candidate Report is available at /candidate/report/:id — this includes a score gauge, answer quality chart, camera integrity score, proctoring timeline, and MCQ skill assessment results.",
  },
  // AI Features
  {
    id: "ai-1",
    category: "AI Features",
    question: "What is the Gemini AI Interview?",
    answer:
      "The Gemini AI Interview (/gemini-interview) is a fully generative adaptive interview powered by Google's Gemini API. You provide your API key, choose a job role and difficulty, and Gemini generates conceptual, practical, and scenario-based questions. After each answer, it evaluates your response, gives specific feedback, and generates an adaptive follow-up question.",
  },
  {
    id: "ai-2",
    category: "AI Features",
    question: "How does Voice Interview work?",
    answer:
      "Voice Interview (/voice-interview) creates a fully spoken interview experience. Gemini generates questions which are read aloud via the browser's SpeechSynthesis API. You respond using your microphone — speech is captured via SpeechRecognition and converted to text in real time. Camera proctoring runs throughout, and a full results report is generated at the end.",
  },
  {
    id: "ai-3",
    category: "AI Features",
    question: "What is the Panel Interview?",
    answer:
      "The Panel Interview (/panel-interview) simulates a multi-interviewer session with three personas rotating: HR (friendly, communication-focused), Technical (precise, skills-focused), and Hiring Manager (challenging, pressure questions). Each interviewer uses their own tone and generates resume-based questions with smart follow-ups.",
  },
  {
    id: "ai-4",
    category: "AI Features",
    question: "Do I need a Gemini API key?",
    answer:
      "Yes, for Gemini-powered features (Gemini Interview, Voice Interview, AI Interviewer, Panel Interview) you need a free Google Gemini API key. Get yours at https://aistudio.google.com/app/apikey — it's free and takes less than a minute. Your key is stored only in your browser's localStorage and never sent to our servers.",
  },
  // Proctoring
  {
    id: "pr-1",
    category: "Proctoring",
    question: "How does camera proctoring work?",
    answer:
      "When you enable camera before an assessment, your webcam stream is monitored throughout the session. A live preview panel shows your camera feed. The system captures still-frame snapshots every 60 seconds and logs all proctoring events (camera on/off, violations). All snapshot data stays local in your session.",
  },
  {
    id: "pr-2",
    category: "Proctoring",
    question: "What happens if I switch tabs during an assessment?",
    answer:
      "Each tab switch is detected and logged as a violation. A warning counter appears in real time. At 5 violations, your assessment is automatically submitted — whatever answers you've completed are scored. This protects assessment integrity while giving you fair warning before auto-submission.",
  },
  {
    id: "pr-3",
    category: "Proctoring",
    question: "Is my webcam video stored permanently?",
    answer:
      "No. Webcam snapshots are stored locally in your browser session memory only and are not persisted to the blockchain or any server. They are lost when you close the tab. Only proctoring event metadata (timestamps of camera on/off, violation counts) is stored in the session on-chain.",
  },
  // Account & Privacy
  {
    id: "ap-1",
    category: "Account & Privacy",
    question: "How and where is my data stored?",
    answer:
      "All persistent data — profiles, sessions, scores, roles, and proctoring logs — is stored on the Internet Computer (ICP) blockchain in Motoko canisters. This means your data is decentralized, tamper-proof, and not controlled by any single server. No traditional databases or cloud services are used.",
  },
  {
    id: "ap-2",
    category: "Account & Privacy",
    question: "Can I delete my account and data?",
    answer:
      'Yes. Go to Privacy Settings (/privacy-settings) and use the "Delete Account" option in the Danger Zone section. This permanently removes all your data from the blockchain — profile, sessions, scores, roles, and any uploaded resume data. This action is irreversible.',
  },
  {
    id: "ap-3",
    category: "Account & Privacy",
    question: "Is my data encrypted and secure?",
    answer:
      "Yes. Authentication uses Internet Identity — a W3C WebAuthn standard with cryptographic key pairs. Your identity is never stored on servers. All on-chain data benefits from ICP's cryptographic consensus. The platform also simulates end-to-end encryption for sensitive data and offers configurable auto-delete after a set period.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: <HelpCircle size={14} /> },
  {
    id: "Getting Started",
    label: "Getting Started",
    icon: <PlayCircle size={14} />,
  },
  { id: "Assessments", label: "Assessments", icon: <BookOpen size={14} /> },
  { id: "AI Features", label: "AI Features", icon: <Sparkles size={14} /> },
  { id: "Proctoring", label: "Proctoring", icon: <Video size={14} /> },
  {
    id: "Account & Privacy",
    label: "Account & Privacy",
    icon: <Lock size={14} />,
  },
];

const POPULAR_ARTICLES = [
  {
    label: "Standard Assessment Guide",
    to: "/assessment",
    icon: <BookOpen size={13} />,
  },
  {
    label: "Gemini AI Interview",
    to: "/gemini-interview",
    icon: <Sparkles size={13} />,
  },
  {
    label: "Voice Interview Setup",
    to: "/voice-interview",
    icon: <Mic2 size={13} />,
  },
  {
    label: "Panel Interview Simulation",
    to: "/panel-interview",
    icon: <Users2 size={13} />,
  },
  {
    label: "AI Interviewer Mode",
    to: "/ai-interviewer",
    icon: <Bot size={13} />,
  },
];

const QUICK_LINKS = [
  { label: "Profile Setup", to: "/onboarding", icon: <User size={13} /> },
  { label: "Admin Portal", to: "/admin", icon: <Shield size={13} /> },
  {
    label: "Student Dashboard",
    to: "/student-dashboard",
    icon: <TrendingUp size={13} />,
  },
  {
    label: "Candidate Dashboard",
    to: "/candidate",
    icon: <Monitor size={13} />,
  },
  {
    label: "Privacy Settings",
    to: "/privacy-settings",
    icon: <Lock size={13} />,
  },
];

// ─────────────────────────────────────────────
// FAQ Page
// ─────────────────────────────────────────────

export function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      search.trim() === "" ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group by category for sidebar count
  const categoryCounts = FAQ_ITEMS.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden py-20 text-center"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.97 0.015 340 / 1) 0%, oklch(0.95 0.02 300 / 1) 30%, oklch(0.94 0.018 240 / 1) 70%, oklch(0.96 0.012 220 / 1) 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, oklch(0.85 0.08 330), transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, oklch(0.82 0.06 260), transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative mx-auto max-w-3xl px-6">
          <Badge
            className="mb-5 border-0 bg-white/60 px-4 py-1.5 text-xs font-semibold tracking-wide shadow-sm backdrop-blur-sm"
            style={{ color: "oklch(0.4 0.12 280)" }}
          >
            Help Center
          </Badge>

          <h1
            className="mb-4 text-5xl font-black tracking-tight sm:text-6xl"
            style={{ color: "oklch(0.17 0.05 270)" }}
          >
            How can we help?
          </h1>
          <p
            className="mb-10 text-lg"
            style={{ color: "oklch(0.42 0.04 270)" }}
          >
            Find answers to frequently asked questions about InterviewIQ
          </p>

          {/* Search bar */}
          <div
            className="relative mx-auto flex max-w-xl items-center gap-0 overflow-hidden rounded-2xl shadow-lg"
            style={{
              background: "white",
              border: "1.5px solid oklch(0.88 0.025 270)",
            }}
            data-ocid="faq.search_input"
          >
            <Search
              className="ml-4 shrink-0"
              size={18}
              style={{ color: "oklch(0.58 0.06 270)" }}
            />
            <Input
              placeholder="Search for answers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border-0 bg-transparent px-3 py-3 text-base shadow-none focus-visible:ring-0"
              style={{ color: "oklch(0.2 0.04 270)" }}
              aria-label="Search FAQ"
            />
            <Button
              size="sm"
              className="m-1.5 shrink-0 rounded-xl px-5"
              style={{
                background: "oklch(0.17 0.05 270)",
                color: "white",
              }}
              onClick={() => {}}
              data-ocid="faq.search_button"
            >
              Search
            </Button>
          </div>

          {/* Category pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-ocid={`faq.${cat.id.toLowerCase().replace(/ &/g, "").replace(/ /g, "_")}.tab`}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  activeCategory === cat.id ? "shadow-md" : "hover:shadow-sm",
                )}
                style={{
                  background:
                    activeCategory === cat.id
                      ? "oklch(0.17 0.05 270)"
                      : "white",
                  color:
                    activeCategory === cat.id
                      ? "white"
                      : "oklch(0.38 0.06 270)",
                  borderColor:
                    activeCategory === cat.id
                      ? "oklch(0.17 0.05 270)"
                      : "oklch(0.88 0.025 270)",
                }}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-Column Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* ── Left Sidebar ── */}
          <aside className="lg:col-span-1" aria-label="Browse by topic">
            <div
              className="sticky top-24 rounded-2xl border p-5"
              style={{
                background: "white",
                borderColor: "oklch(0.9 0.015 270)",
                boxShadow: "0 2px 16px oklch(0.3 0.05 270 / 0.07)",
              }}
            >
              <p
                className="mb-4 text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.55 0.06 270)" }}
              >
                Browse by Topic
              </p>

              <ul className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const count =
                    cat.id === "all"
                      ? FAQ_ITEMS.length
                      : (categoryCounts[cat.id] ?? 0);
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        data-ocid={`faq.sidebar_${cat.id.toLowerCase().replace(/ &/g, "").replace(/ /g, "_")}.button`}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                          activeCategory === cat.id
                            ? "text-white"
                            : "hover:opacity-80",
                        )}
                        style={{
                          background:
                            activeCategory === cat.id
                              ? "oklch(0.17 0.05 270)"
                              : "transparent",
                          color:
                            activeCategory === cat.id
                              ? "white"
                              : "oklch(0.35 0.05 270)",
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {cat.icon}
                          {cat.label}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            background:
                              activeCategory === cat.id
                                ? "white/20"
                                : "oklch(0.93 0.012 270)",
                            color:
                              activeCategory === cat.id
                                ? "white"
                                : "oklch(0.5 0.06 270)",
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* ── Center Column ── */}
          <main className="lg:col-span-2" data-ocid="faq.list">
            <div className="mb-6 flex items-center justify-between">
              <h2
                className="text-2xl font-bold"
                style={{ color: "oklch(0.17 0.05 270)" }}
              >
                Frequently Asked Questions
              </h2>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: "oklch(0.93 0.012 270)",
                  color: "oklch(0.45 0.08 270)",
                }}
              >
                {filteredItems.length} result
                {filteredItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div
                className="rounded-2xl border p-12 text-center"
                style={{
                  background: "white",
                  borderColor: "oklch(0.9 0.015 270)",
                }}
                data-ocid="faq.empty_state"
              >
                <HelpCircle
                  className="mx-auto mb-3"
                  size={32}
                  style={{ color: "oklch(0.7 0.04 270)" }}
                />
                <p
                  className="font-semibold"
                  style={{ color: "oklch(0.3 0.05 270)" }}
                >
                  No results found
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "oklch(0.55 0.04 270)" }}
                >
                  Try a different search term or browse by category.
                </p>
              </div>
            ) : (
              <Accordion
                type="single"
                collapsible
                defaultValue="gs-1"
                className="space-y-3"
              >
                {filteredItems.map((item, idx) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    data-ocid={`faq.item.${idx + 1}`}
                    className="overflow-hidden rounded-2xl border"
                    style={{
                      background: "white",
                      borderColor: "oklch(0.9 0.015 270)",
                      boxShadow: "0 1px 8px oklch(0.3 0.04 270 / 0.06)",
                    }}
                  >
                    <AccordionTrigger
                      className="px-6 py-4 text-left text-sm font-semibold hover:no-underline"
                      style={{ color: "oklch(0.17 0.05 270)" }}
                    >
                      <span className="flex items-start gap-3">
                        <Badge
                          variant="outline"
                          className="mt-0.5 shrink-0 rounded-full border-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            background: categoryColor(item.category).bg,
                            color: categoryColor(item.category).text,
                          }}
                        >
                          {item.category}
                        </Badge>
                        <span>{item.question}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent
                      className="px-6 pb-5 pt-1 text-sm leading-relaxed"
                      style={{ color: "oklch(0.42 0.04 270)" }}
                    >
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </main>

          {/* ── Right Sidebar ── */}
          <aside className="lg:col-span-1" aria-label="Quick navigation">
            <div className="space-y-6">
              {/* Popular Articles */}
              <div
                className="rounded-2xl border p-5"
                style={{
                  background: "white",
                  borderColor: "oklch(0.9 0.015 270)",
                  boxShadow: "0 2px 16px oklch(0.3 0.05 270 / 0.07)",
                }}
              >
                <p
                  className="mb-4 text-xs font-bold uppercase tracking-widest"
                  style={{ color: "oklch(0.55 0.06 270)" }}
                >
                  Popular Articles
                </p>
                <ul className="space-y-2">
                  {POPULAR_ARTICLES.map((article) => (
                    <li key={article.to}>
                      <Link
                        to={article.to}
                        className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all"
                        data-ocid={`faq.popular_${article.to.replace(/\//g, "")}.link`}
                        style={{ color: "oklch(0.35 0.08 270)" }}
                      >
                        <span
                          className="shrink-0 transition-colors"
                          style={{ color: "oklch(0.55 0.1 280)" }}
                        >
                          {article.icon}
                        </span>
                        <span className="flex-1 group-hover:underline">
                          {article.label}
                        </span>
                        <ExternalLink
                          size={11}
                          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Links */}
              <div
                className="rounded-2xl border p-5"
                style={{
                  background: "white",
                  borderColor: "oklch(0.9 0.015 270)",
                  boxShadow: "0 2px 16px oklch(0.3 0.05 270 / 0.07)",
                }}
              >
                <p
                  className="mb-4 text-xs font-bold uppercase tracking-widest"
                  style={{ color: "oklch(0.55 0.06 270)" }}
                >
                  Quick Links
                </p>
                <ul className="space-y-2">
                  {QUICK_LINKS.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all"
                        data-ocid={`faq.quicklink_${link.to.replace(/\//g, "")}.link`}
                        style={{ color: "oklch(0.35 0.08 270)" }}
                      >
                        <span
                          className="shrink-0"
                          style={{ color: "oklch(0.55 0.1 280)" }}
                        >
                          {link.icon}
                        </span>
                        <span className="flex-1 group-hover:underline">
                          {link.label}
                        </span>
                        <ExternalLink
                          size={11}
                          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Zap promo */}
              <div
                className="rounded-2xl border p-5"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.96 0.018 280) 0%, oklch(0.95 0.02 210) 100%)",
                  borderColor: "oklch(0.88 0.025 270)",
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Zap size={16} style={{ color: "oklch(0.5 0.15 280)" }} />
                  <p
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "oklch(0.4 0.1 280)" }}
                  >
                    Pro Tip
                  </p>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.35 0.06 270)" }}
                >
                  Start with the{" "}
                  <Link
                    to="/adaptive-assessment"
                    className="font-semibold underline"
                    style={{ color: "oklch(0.45 0.12 280)" }}
                  >
                    Adaptive Assessment
                  </Link>{" "}
                  to get a personalized difficulty level from day one.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Contact / Support CTA Band ── */}
      <section
        className="mx-4 mb-10 rounded-3xl px-8 py-12 sm:mx-8 lg:mx-auto lg:max-w-7xl"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.17 0.05 270) 0%, oklch(0.2 0.06 285) 50%, oklch(0.18 0.04 260) 100%)",
        }}
        data-ocid="faq.support.section"
      >
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          {/* Left copy */}
          <div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              Still need help?
            </h2>
            <p style={{ color: "oklch(0.75 0.04 260)" }}>
              Our support team is ready to assist you anytime.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Email Support */}
            <a
              href="mailto:support@interviewiq.ai"
              data-ocid="faq.email_support.button"
              className="flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:opacity-90"
              style={{
                background: "white",
                color: "oklch(0.17 0.05 270)",
                boxShadow: "0 4px 16px oklch(0 0 0 / 0.2)",
              }}
            >
              <Mail size={16} />
              Email Support
            </a>

            {/* X (Twitter) */}
            <a
              href="https://x.com/interviewiq"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="faq.twitter.button"
              className="flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "oklch(0.22 0.015 270)",
                border: "1px solid oklch(0.4 0.04 270)",
                boxShadow: "0 4px 16px oklch(0 0 0 / 0.2)",
              }}
            >
              {/* X logo SVG */}
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.245 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Follow on X
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/interviewiq"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="faq.instagram.button"
              className="flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 30) 0%, oklch(0.58 0.22 330) 50%, oklch(0.55 0.2 280) 100%)",
                boxShadow: "0 4px 16px oklch(0 0 0 / 0.2)",
              }}
            >
              <Instagram size={16} />
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ── Social Connect Band ── */}
      <section className="pb-16 text-center">
        <p
          className="mb-5 text-sm font-semibold uppercase tracking-widest"
          style={{ color: "oklch(0.55 0.05 270)" }}
        >
          Connect with us
        </p>
        <div className="flex items-center justify-center gap-4">
          {/* X icon */}
          <a
            href="https://x.com/interviewiq"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow InterviewIQ on X"
            data-ocid="faq.footer_twitter.button"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{
              background: "white",
              borderColor: "oklch(0.88 0.02 270)",
              color: "oklch(0.2 0.04 270)",
              boxShadow: "0 2px 10px oklch(0.3 0.04 270 / 0.08)",
            }}
          >
            <span className="sr-only">Follow InterviewIQ on X</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.245 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Instagram icon */}
          <a
            href="https://instagram.com/interviewiq"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow InterviewIQ on Instagram"
            data-ocid="faq.footer_instagram.button"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 30), oklch(0.58 0.22 330), oklch(0.55 0.2 280))",
              borderColor: "transparent",
              color: "white",
              boxShadow: "0 2px 10px oklch(0.6 0.18 330 / 0.25)",
            }}
          >
            <Instagram size={18} aria-hidden="true" />
          </a>

          {/* Email icon */}
          <a
            href="mailto:support@interviewiq.ai"
            aria-label="Email InterviewIQ support"
            data-ocid="faq.footer_email.button"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{
              background: "oklch(0.17 0.05 270)",
              borderColor: "transparent",
              color: "white",
              boxShadow: "0 2px 10px oklch(0.3 0.06 270 / 0.25)",
            }}
          >
            <Mail size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function categoryColor(category: string): { bg: string; text: string } {
  switch (category) {
    case "Getting Started":
      return { bg: "oklch(0.93 0.06 145 / 0.3)", text: "oklch(0.35 0.12 145)" };
    case "Assessments":
      return { bg: "oklch(0.93 0.06 220 / 0.3)", text: "oklch(0.35 0.12 220)" };
    case "AI Features":
      return { bg: "oklch(0.93 0.06 280 / 0.3)", text: "oklch(0.35 0.12 280)" };
    case "Proctoring":
      return { bg: "oklch(0.93 0.06 40 / 0.3)", text: "oklch(0.42 0.12 40)" };
    case "Account & Privacy":
      return { bg: "oklch(0.93 0.06 330 / 0.3)", text: "oklch(0.42 0.12 330)" };
    default:
      return { bg: "oklch(0.93 0.02 270 / 0.4)", text: "oklch(0.4 0.06 270)" };
  }
}
