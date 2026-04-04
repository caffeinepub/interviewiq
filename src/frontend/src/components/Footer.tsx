import { Link } from "@tanstack/react-router";
import { BrainCircuit, Globe, Heart, Zap } from "lucide-react";

const footerLinks = {
  Assessments: [
    { label: "Standard Assessment", to: "/assessment" },
    { label: "Adaptive Mode", to: "/adaptive-assessment" },
    { label: "Gemini AI Interview", to: "/gemini-interview" },
    { label: "Voice Interview", to: "/voice-interview" },
    { label: "AI Interviewer", to: "/ai-interviewer" },
    { label: "Panel Interview", to: "/panel-interview" },
  ],
  Resources: [
    { label: "Answer Guide", to: "/interview-answers" },
    { label: "Student Dashboard", to: "/student-dashboard" },
    { label: "Admissions Portal", to: "/admissions" },
    { label: "Mock Interview", to: "/mock-interview/new" },
  ],
  Platform: [
    { label: "Admin Portal", to: "/admin" },
    { label: "Evaluator", to: "/evaluator" },
    { label: "Question Bank", to: "/questions" },
    { label: "Privacy Settings", to: "/privacy-settings" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="mt-auto">
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="bg-card/50 backdrop-blur-sm">
        <div className="container py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-glow">
                  <BrainCircuit size={16} className="text-white" />
                </div>
                <span className="font-display text-lg font-black tracking-tight">
                  Interview<span className="text-gradient">IQ</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                AI-powered, blockchain-secured interview platform for fair,
                structured, and bias-free assessments.
              </p>
              {/* Built on ICP badge */}
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary font-medium w-fit">
                  <Globe size={11} />
                  Built on Internet Computer
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 font-medium w-fit">
                  <Zap size={11} />
                  Powered by Google Gemini
                </div>
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                  {group}
                </h3>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="container flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
            <p className="text-xs text-muted-foreground/60">
              © {year}{" "}
              <span className="text-gradient font-semibold">InterviewIQ</span>.
              Decentralized on Internet Computer.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Built with{" "}
              <Heart
                size={11}
                className="inline text-destructive fill-destructive mx-0.5"
              />{" "}
              using{" "}
              <a
                href={caffeineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
