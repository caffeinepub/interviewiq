import { Link } from "@tanstack/react-router";
import { BrainCircuit, Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="mt-auto border-t border-border/60 bg-background/80">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BrainCircuit size={13} />
          </div>
          <span className="font-display text-sm font-semibold">
            Interview<span className="text-primary">IQ</span>
          </span>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          © {year}. Built with{" "}
          <Heart
            size={12}
            className="inline text-destructive fill-destructive"
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

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link
            to="/candidate"
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
