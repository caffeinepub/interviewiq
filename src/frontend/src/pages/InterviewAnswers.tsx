import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { BookOpen, Lightbulb, Search, Sparkles, Target } from "lucide-react";
import { useState } from "react";

const INTERVIEW_ANSWERS = [
  {
    id: 1,
    title: "Tell Me About Yourself",
    description: "Opening question used to set the tone and break the ice.",
    whatTheyWantToKnow:
      "They are not looking for a full life story. They want a concise, professional pitch covering your present role, past relevant experience, and why you are excited about the future.",
    modelAnswer:
      "Structure your answer in three parts: (1) Present — your current role and key responsibilities; (2) Past — 1-2 relevant experiences or achievements that led you here; (3) Future — why you are excited about this specific opportunity. Keep it under 2 minutes. Example: 'I am currently a software engineer at [Company] where I lead the frontend team. Before that, I spent 3 years at a startup building scalable React applications. I am now looking to bring that experience to a larger product team where I can grow into an engineering leadership role.'",
  },
  {
    id: 2,
    title: "Why Do You Want to Work for This Company?",
    description:
      "Tests your research and genuine interest in the organization.",
    whatTheyWantToKnow:
      "They want to see that you understand their mission, values, and product, and that you fit in with their culture. They want to know you are not just applying to any job, but that you specifically want this job.",
    modelAnswer:
      "Research the company before the interview — their mission statement, recent news, products, and culture. Structure your answer: (1) Mention something specific about the company that genuinely excites you; (2) Connect it to your own values or career goals; (3) Explain why this role is the right fit. Avoid generic answers like 'I heard it is a great company to work for.' Be specific and authentic.",
  },
  {
    id: 3,
    title: "What Are Your Strengths?",
    description:
      "An opportunity to boast professionally, but it must be tailored to the job.",
    whatTheyWantToKnow:
      "They are looking for skills listed in the job description that you can prove you possess. Sharing 2-3 specific, relevant strengths with examples is best.",
    modelAnswer:
      "Choose 2-3 strengths that directly match the job description. For each strength: (1) Name it clearly; (2) Back it up with a specific example or achievement; (3) Connect it to the value it brings to the role. Example: 'One of my strengths is breaking down complex problems. In my last role, I reduced API response times by 40% by identifying and eliminating redundant database calls — something that had gone unnoticed for months.'",
  },
  {
    id: 4,
    title: "What Is Your Greatest Weakness?",
    description: "Evaluates self-awareness and honesty.",
    whatTheyWantToKnow:
      "They want to know if you can identify areas for improvement and if you are proactively working on them. It should be a genuine, manageable weakness, not a disguised strength like 'I work too hard.'",
    modelAnswer:
      "Be honest about a real weakness, but show what you are doing to improve it. Structure: (1) State the weakness clearly; (2) Give context on how it has affected you; (3) Describe the steps you are actively taking to improve. Example: 'I sometimes struggle with delegating tasks. I used to prefer doing things myself to ensure quality. I have been working on this by setting clearer expectations with my team and scheduling regular check-ins, which has improved both my output and their growth.'",
  },
  {
    id: 5,
    title: "Why Should We Hire You?",
    description: "A chance to sell yourself directly.",
    whatTheyWantToKnow:
      "All candidates are likely qualified. This question allows you to differentiate yourself by highlighting your unique skills, experience, and the specific value you will bring to the team.",
    modelAnswer:
      "This is your elevator pitch. Cover three angles: (1) You can do the job — evidence from past experience; (2) You will deliver results — a specific example of impact; (3) You are a great fit — your values align with the company culture. Example: 'I have 5 years of experience solving exactly the problems in this job description. In my last role I reduced onboarding time by 30% by redesigning the user flow — I would bring that same outcome-focused approach here. I am also drawn to your collaborative culture, which is how I do my best work.'",
  },
  {
    id: 6,
    title: "Tell Me About a Time You Faced a Challenge or Conflict at Work",
    description:
      "A behavioral question to assess problem-solving and interpersonal skills.",
    whatTheyWantToKnow:
      "They are evaluating your emotional intelligence, ability to handle pressure, and conflict resolution style. The best approach is to use the STAR method: Situation, Task, Action, Result.",
    modelAnswer:
      "Use the STAR method: (S) Situation — briefly describe the context; (T) Task — what was your responsibility; (A) Action — what specific steps did you take; (R) Result — what was the outcome. Focus on what YOU did, not what 'we' did. Choose a story that shows growth, problem-solving, or leadership. Avoid situations where you come across as blaming others — show empathy and professionalism.",
  },
  {
    id: 7,
    title: "Why Are You Leaving Your Current Job?",
    description: "Evaluates your professionalism and motivations.",
    whatTheyWantToKnow:
      "They want to ensure you are not leaving due to a major, repetitive negative issue. Focus on looking for new opportunities, growth, or a better fit, not on bad-mouthing your previous employer.",
    modelAnswer:
      "Keep it positive and forward-looking. Avoid complaining about management, colleagues, or the company. Good reasons: seeking new challenges, wanting to grow in a specific direction, the role is not aligned with your long-term goals. Example: 'I have learned a lot in my current role, but I have reached a point where I am looking for a new challenge. I am excited about the opportunity to work on more complex distributed systems problems, which is what attracted me to this position.'",
  },
  {
    id: 8,
    title: "Where Do You See Yourself in Five Years?",
    description: "Assesses your career goals and potential loyalty.",
    whatTheyWantToKnow:
      "They are looking for realistic career ambitions that align with the company's trajectory, checking to see if this role is a good stepping stone for you, indicating longevity.",
    modelAnswer:
      "Be honest and specific, but align your answer with the company's direction. Avoid saying 'running my own company' or giving no answer at all. Good structure: (1) Where you want to grow professionally; (2) How this role helps you get there; (3) What you hope to contribute to the company along the way. Example: 'In five years I hope to be in a senior engineering role where I mentor junior developers. I see this position as the right place to deepen my backend architecture skills and grow into that leadership capacity.'",
  },
  {
    id: 9,
    title: "How Do You Prioritize Your Work?",
    description: "Evaluates organizational skills and productivity.",
    whatTheyWantToKnow:
      "They want to know your methods for handling multiple tasks, deadlines, and stress. A good answer includes specific tools and techniques to maintain high quality.",
    modelAnswer:
      "Describe your actual system, not just a vague statement like 'I make a list.' Include: (1) How you assess urgency vs importance (e.g., Eisenhower matrix); (2) Tools you use (calendar blocking, task managers like Notion, Jira); (3) How you communicate when priorities shift. Example: 'I start each morning by reviewing my task list and tagging items as urgent/important. I use time-blocking in my calendar for deep work and check Slack/email only at set times. When new priorities come in, I re-evaluate openly with my manager so we are aligned.'",
  },
  {
    id: 10,
    title: "Do You Have Any Questions for Us?",
    description: "The final opportunity to show engagement.",
    whatTheyWantToKnow:
      "This is critical. Asking thoughtful questions about the team, culture, or future projects shows you are serious, curious, and prepared. Saying 'no' can make you look uninterested.",
    modelAnswer:
      "Always prepare at least 3 questions. Good categories: (1) Role — 'What does success look like in this role in the first 90 days?'; (2) Team — 'How does the team handle disagreements on technical direction?'; (3) Growth — 'What have people in this role typically gone on to do?'; (4) Company — 'What is the biggest challenge the team is facing right now?' Avoid asking about salary, benefits, or time off in the first interview.",
  },
];

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  2: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  3: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  4: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  5: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  6: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  7: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  8: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  9: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  10: "bg-sky-500/10 text-sky-600 border-sky-500/20",
};

export function InterviewAnswers() {
  const [search, setSearch] = useState("");

  const filtered = INTERVIEW_ANSWERS.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.whatTheyWantToKnow.toLowerCase().includes(q) ||
      item.modelAnswer.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="container py-8 space-y-8 max-w-4xl"
      data-ocid="interview_answers.page"
    >
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Lightbulb size={18} />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Interview Answer Guide
          </h1>
        </div>
        <p className="text-muted-foreground text-base leading-relaxed">
          Master the 10 most common interview questions with expert strategies
          and model answers.
        </p>

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <BookOpen size={16} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            These questions are also available in the{" "}
            <Link
              to="/questions"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Question Bank
            </Link>{" "}
            under the{" "}
            <span className="font-medium text-foreground">Interview</span>{" "}
            category for practice sessions.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search questions, strategies, or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-ocid="interview_answers.search_input"
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-primary" />
          {filtered.length} of {INTERVIEW_ANSWERS.length} questions
        </span>
      </div>

      {/* Accordion */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="interview_answers.empty_state"
        >
          <Search className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-medium text-muted-foreground">
            No questions match your search.
          </p>
          <button
            type="button"
            className="mt-2 text-sm text-primary hover:underline underline-offset-2"
            onClick={() => setSearch("")}
          >
            Clear search
          </button>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {filtered.map((item) => (
            <AccordionItem
              key={item.id}
              value={`item-${item.id}`}
              data-ocid={`interview_answers.item.${item.id}`}
              className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-sm hover:border-primary/30 transition-colors"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors [&[data-state=open]]:bg-muted/40">
                <div className="flex items-center gap-3 text-left w-full mr-4">
                  {/* Number badge */}
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border",
                      DIFFICULTY_COLORS[item.id] ??
                        "bg-primary/10 text-primary border-primary/20",
                    )}
                  >
                    {item.id}
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-display font-semibold text-foreground leading-snug">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-5 pb-5 pt-1">
                <div className="space-y-4">
                  {/* What They Want to Know */}
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={14} className="text-amber-600 shrink-0" />
                      <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-500">
                        What They Want to Know
                      </h3>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {item.whatTheyWantToKnow}
                    </p>
                  </div>

                  {/* Model Answer Strategy */}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={14} className="text-primary shrink-0" />
                      <h3 className="text-sm font-semibold text-primary">
                        Model Answer Strategy
                      </h3>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                      {item.modelAnswer}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <Badge
                      variant="outline"
                      className="text-xs border-primary/20 text-primary bg-primary/5"
                    >
                      Interview
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs border-border/60 text-muted-foreground"
                    >
                      behavioral
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs border-border/60 text-muted-foreground"
                    >
                      Q{item.id} of 10
                    </Badge>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
