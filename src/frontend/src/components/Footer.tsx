import { Link } from "@tanstack/react-router";
import { BrainCircuit, Heart } from "lucide-react";

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
    <footer className="mt-auto border-t border-border/60 bg-background/80">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BrainCircuit size={14} />
              </div>
              <span className="font-display text-base font-bold">
                Interview<span className="text-primary">IQ</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              AI-powered, blockchain-secured interview platform for fair,
              structured assessments.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Built on Internet Computer Protocol
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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

      {/* Bottom Bar */}
      <div className="border-t border-border/40">
        <div className="container flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} InterviewIQ. Built on the Internet Computer blockchain.
          </p>
          <p className="text-xs text-muted-foreground">
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
    </footer>
  );
}
