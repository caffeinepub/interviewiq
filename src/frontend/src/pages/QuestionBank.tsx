import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Database,
  Edit2,
  Filter,
  Loader2,
  LogIn,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Difficulty } from "../backend.d";
import type { Question } from "../backend.d";
import { DifficultyBadge } from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddQuestion,
  useDeleteQuestion,
  useGetAllQuestions,
  useIsCallerAdmin,
  useUpdateQuestion,
} from "../hooks/useQueries";

export interface SeedQuestion {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
}

// Seed questions sourced from the Answer Guide — these are the 10 classic interview questions
// with full descriptions, what-they-want-to-know context, and model answer strategies.
export const SEED_QUESTIONS: SeedQuestion[] = [
  {
    title: "Tell Me About Yourself",
    description:
      "Opening question used to set the tone and break the ice. They want a concise, professional pitch covering your present role, past relevant experience, and why you are excited about the future.\n\nWhat they want to know: Not a full life story — keep it under 2 minutes. Structure: (1) Present role and key responsibilities; (2) 1-2 relevant past experiences; (3) Why you are excited about this opportunity.\n\nModel Answer Strategy: 'I am currently a [role] at [Company] where I [key responsibility]. Before that, I [relevant past experience]. I am now looking to [future goal relevant to this role].'",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "introduction", "pitch", "answer-guide"],
  },
  {
    title: "Why Do You Want to Work for This Company?",
    description:
      "Tests your research and genuine interest in the organization. They want to see you understand their mission, values, and product.\n\nWhat they want to know: They want to know you want THIS job, not just any job. Research their mission statement, recent news, products, and culture before the interview.\n\nModel Answer Strategy: (1) Mention something specific about the company that genuinely excites you; (2) Connect it to your own values or career goals; (3) Explain why this role is the right fit. Avoid generic answers like 'I heard it is a great place to work.'",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "research", "motivation", "answer-guide"],
  },
  {
    title: "What Are Your Strengths?",
    description:
      "An opportunity to boast professionally, but it must be tailored to the job. They are looking for skills listed in the job description.\n\nWhat they want to know: Share 2-3 specific, relevant strengths with concrete examples that prove you possess them.\n\nModel Answer Strategy: For each strength: (1) Name it clearly; (2) Back it with a specific example or achievement; (3) Connect it to the value it brings to the role. Example: 'One of my strengths is breaking down complex problems. In my last role, I reduced API response times by 40% by identifying redundant database calls.'",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "strengths", "self-awareness", "answer-guide"],
  },
  {
    title: "What Is Your Greatest Weakness?",
    description:
      "Evaluates self-awareness and honesty. They want to know if you can identify areas for improvement and are proactively working on them.\n\nWhat they want to know: Avoid disguised strengths like 'I work too hard.' Share a genuine, manageable weakness with a plan to improve.\n\nModel Answer Strategy: (1) State the weakness clearly; (2) Give context on how it has affected you; (3) Describe the steps you are actively taking to improve. Example: 'I sometimes struggle with delegating tasks. I have been working on this by setting clearer expectations with my team and scheduling regular check-ins.'",
    category: "Interview",
    difficulty: Difficulty.medium,
    tags: [
      "behavioral",
      "weakness",
      "self-awareness",
      "growth",
      "answer-guide",
    ],
  },
  {
    title: "Why Should We Hire You?",
    description:
      "A chance to sell yourself directly. All candidates are likely qualified — this is your opportunity to differentiate yourself.\n\nWhat they want to know: Highlight your unique skills, experience, and the specific value you will bring to the team.\n\nModel Answer Strategy: Cover three angles: (1) You can do the job — evidence from past experience; (2) You will deliver results — a specific example of impact; (3) You are a great fit — your values align with the company culture. Example: 'I have 5 years of experience solving exactly the problems in this job description. In my last role I reduced onboarding time by 30% by redesigning the user flow.'",
    category: "Interview",
    difficulty: Difficulty.medium,
    tags: [
      "behavioral",
      "value-proposition",
      "differentiation",
      "answer-guide",
    ],
  },
  {
    title: "Tell Me About a Time You Faced a Challenge or Conflict at Work",
    description:
      "A behavioral question to assess problem-solving and interpersonal skills using the STAR method.\n\nWhat they want to know: They are evaluating your emotional intelligence, ability to handle pressure, and conflict resolution style.\n\nModel Answer Strategy: Use STAR — (S) Situation: briefly describe the context; (T) Task: your responsibility; (A) Action: specific steps you took; (R) Result: the outcome. Focus on what YOU did. Choose a story showing growth, problem-solving, or leadership. Avoid blaming others.",
    category: "Interview",
    difficulty: Difficulty.medium,
    tags: [
      "behavioral",
      "STAR",
      "conflict-resolution",
      "problem-solving",
      "answer-guide",
    ],
  },
  {
    title: "Why Are You Leaving Your Current Job?",
    description:
      "Evaluates your professionalism and motivations for leaving your current employer.\n\nWhat they want to know: They want to ensure you are not leaving due to a major, repetitive negative issue. Never bad-mouth your previous employer.\n\nModel Answer Strategy: Keep it positive and forward-looking. Good reasons: seeking new challenges, wanting to grow in a specific direction, the role is not aligned with your long-term goals. Example: 'I have learned a lot in my current role, but I am now looking for a new challenge — specifically the opportunity to work on more complex distributed systems problems.'",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: [
      "behavioral",
      "professionalism",
      "motivation",
      "career",
      "answer-guide",
    ],
  },
  {
    title: "Where Do You See Yourself in Five Years?",
    description:
      "Assesses your career goals and potential loyalty to the organization.\n\nWhat they want to know: They are looking for realistic career ambitions that align with the company's trajectory and indicate longevity.\n\nModel Answer Strategy: Be honest and specific, but align your answer with the company's direction. Avoid saying 'running my own company.' Structure: (1) Where you want to grow professionally; (2) How this role helps you get there; (3) What you hope to contribute to the company. Example: 'In five years I hope to be in a senior engineering role where I mentor junior developers.'",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "career-goals", "ambition", "loyalty", "answer-guide"],
  },
  {
    title: "How Do You Prioritize Your Work?",
    description:
      "Evaluates organizational skills and productivity when handling multiple tasks and deadlines.\n\nWhat they want to know: They want your actual system, not just 'I make a list.' Include specific tools and techniques.\n\nModel Answer Strategy: Include: (1) How you assess urgency vs importance (e.g. Eisenhower matrix); (2) Tools you use (calendar blocking, Notion, Jira); (3) How you communicate when priorities shift. Example: 'I start each morning reviewing my task list and tagging items as urgent/important. I use time-blocking for deep work and check messages only at set times.'",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: [
      "behavioral",
      "organization",
      "productivity",
      "time-management",
      "answer-guide",
    ],
  },
  {
    title: "Do You Have Any Questions for Us?",
    description:
      "The final opportunity to show engagement and genuine interest in the role and company.\n\nWhat they want to know: Thoughtful questions show you are serious, curious, and prepared. Saying 'no' can make you look uninterested.\n\nModel Answer Strategy: Always prepare at least 3 questions. Categories: (1) Role — 'What does success look like in the first 90 days?'; (2) Team — 'How does the team handle disagreements on technical direction?'; (3) Growth — 'What have people in this role typically gone on to do?'; (4) Company — 'What is the biggest challenge the team faces right now?' Avoid asking about salary in the first interview.",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: [
      "behavioral",
      "engagement",
      "curiosity",
      "preparation",
      "answer-guide",
    ],
  },
  // ── DSA Questions ──────────────────────────────────────────────
  {
    title: "Reverse a Linked List",
    description:
      "Reverse the order of nodes in a singly linked list. This problem tests your understanding of pointers and iterative/recursive thinking.\n\nAnswer: An iterative approach involves traversing the list and changing the next pointer of each node to point to its previous node. Use three pointers — prev, current, and next — updating them in each iteration.\n\nCode Example (C++):\nvoid reverseList(Node** head) {\n    Node *prev = NULL, *current = *head, *next = NULL;\n    while (current) {\n        next = current->next;\n        current->next = prev;\n        prev = current;\n        current = next;\n    }\n    *head = prev;\n}\n\nTime Complexity: O(n). Space Complexity: O(1). You can also solve this recursively but iterative is preferred for interviews due to O(1) space.",
    category: "Data Structures",
    difficulty: Difficulty.easy,
    tags: ["linked-list", "pointers", "iterative", "DSA"],
  },
  {
    title: "Implement a Stack Using an Array",
    description:
      "Design a stack data structure using a fixed-size array, implementing push and pop operations.\n\nAnswer: A stack is a LIFO (Last In, First Out) structure. An array implementation uses a 'top' variable to track the index of the last inserted element (initialized to -1 for empty).\n\nCode Example (Java):\npublic class Stack {\n    private int[] arr;\n    private int top;\n    public Stack(int size) {\n        arr = new int[size];\n        top = -1;\n    }\n    public void push(int val) { arr[++top] = val; }\n    public int pop() { return arr[top--]; }\n    public boolean isEmpty() { return top == -1; }\n}\n\nKey points: push increments top then inserts; pop reads then decrements top. Always check for overflow (push on full stack) and underflow (pop on empty stack) in your implementation.",
    category: "Data Structures",
    difficulty: Difficulty.easy,
    tags: ["stack", "array", "LIFO", "DSA"],
  },
  {
    title: "Find the Maximum Subarray Sum (Kadane's Algorithm)",
    description:
      "Find the contiguous subarray within an array that has the largest sum.\n\nAnswer: Kadane's algorithm efficiently finds the maximum subarray sum in O(n) time by keeping track of the maximum sum ending at the current position.\n\nCode Example (Python):\ndef maxSubarraySum(arr):\n    max_so_far = arr[0]\n    current_max = arr[0]\n    for i in range(1, len(arr)):\n        current_max = max(arr[i], current_max + arr[i])\n        max_so_far = max(max_so_far, current_max)\n    return max_so_far\n\nKey insight: At each element, decide whether to extend the existing subarray or start a new one. current_max = max(arr[i], current_max + arr[i]). Time Complexity: O(n). Space Complexity: O(1).",
    category: "Algorithms",
    difficulty: Difficulty.medium,
    tags: ["dynamic-programming", "array", "Kadane", "DSA"],
  },
  // ── Process Synchronization Questions ─────────────────────────
  {
    title: "What is a Deadlock?",
    description:
      "Explain the concept of a deadlock in an operating system.\n\nAnswer: A deadlock is a state where two or more processes are blocked indefinitely, each waiting for a resource held by another process. None of the processes can proceed because each is waiting for the other to release its resource.\n\nExample: Process A holds Resource 1 and waits for Resource 2. Process B holds Resource 2 and waits for Resource 1. Neither can continue — this is a deadlock.\n\nDeadlock prevention strategies: (1) Remove one of the four necessary conditions; (2) Use resource ordering to prevent circular wait; (3) Use Banker's Algorithm for deadlock avoidance.",
    category: "Operating Systems",
    difficulty: Difficulty.easy,
    tags: ["deadlock", "process-synchronization", "OS", "concurrency"],
  },
  {
    title: "What Are the Four Conditions for a Deadlock?",
    description:
      "List and explain the four necessary conditions for a deadlock to occur.\n\nAnswer: All four conditions must hold simultaneously for a deadlock to occur:\n\n1. Mutual Exclusion: At least one resource must be held in a non-sharable mode — only one process can use it at a time.\n\n2. Hold and Wait: A process holding at least one resource is waiting to acquire additional resources held by other processes.\n\n3. No Preemption: Resources cannot be forcibly taken from a process — they can only be released voluntarily by the holding process.\n\n4. Circular Wait: A set of processes {P1, P2, ..., Pn} exists such that P1 waits for P2, P2 waits for P3, ..., and Pn waits for P1.\n\nRemoving any one of these conditions prevents deadlock.",
    category: "Operating Systems",
    difficulty: Difficulty.medium,
    tags: [
      "deadlock",
      "mutual-exclusion",
      "circular-wait",
      "process-synchronization",
      "OS",
    ],
  },
  {
    title: "Differentiate Between an Exclusive Lock and a Shared Lock",
    description:
      "Explain the difference between shared locks and exclusive locks in database and OS concurrency.\n\nAnswer:\n\nShared Lock (S-lock / Read Lock):\n- Multiple transactions or processes can hold a shared lock on the same resource simultaneously.\n- Allows concurrent reads but prevents writes.\n- Used when a process only needs to read data.\n\nExclusive Lock (X-lock / Write Lock):\n- Only one transaction or process can hold an exclusive lock on a resource at a time.\n- Blocks both reads and writes from other processes.\n- Used when a process needs to read and write (modify) data.\n\nCompatibility: Two shared locks are compatible (both can be granted). A shared lock and an exclusive lock, or two exclusive locks, are incompatible.",
    category: "Operating Systems",
    difficulty: Difficulty.medium,
    tags: ["locks", "shared-lock", "exclusive-lock", "concurrency", "DBMS"],
  },
  // ── DBMS Questions ─────────────────────────────────────────────
  {
    title: "What is Normalization in DBMS?",
    description:
      "Explain the purpose and concept of database normalization.\n\nAnswer: Normalization is the process of organizing a relational database to reduce redundancy and improve data integrity. It involves decomposing tables into smaller, well-structured tables and defining relationships between them.\n\nNormal Forms:\n- 1NF (First Normal Form): Eliminate repeating groups; each column must have atomic values.\n- 2NF: Remove partial dependencies; all non-key attributes must depend on the full primary key.\n- 3NF: Remove transitive dependencies; non-key attributes must depend only on the primary key.\n- BCNF (Boyce-Codd Normal Form): A stricter version of 3NF.\n\nBenefits: Reduces data redundancy, minimizes update anomalies (insert, update, delete anomalies), and improves data consistency.",
    category: "Database",
    difficulty: Difficulty.medium,
    tags: ["normalization", "DBMS", "database-design", "1NF", "3NF"],
  },
  {
    title: "What Are the ACID Properties?",
    description:
      "Define the ACID properties for database transaction processing.\n\nAnswer: ACID stands for Atomicity, Consistency, Isolation, and Durability — four properties that guarantee reliable database transactions:\n\n1. Atomicity: A transaction is treated as a single unit — either all operations succeed or none do. If any part fails, the entire transaction is rolled back.\n\n2. Consistency: A transaction brings the database from one valid state to another. All data integrity rules and constraints must be satisfied before and after the transaction.\n\n3. Isolation: Concurrent transactions execute as if they were serial — the intermediate state of a transaction is not visible to other transactions. Prevents dirty reads, phantom reads, and non-repeatable reads.\n\n4. Durability: Once a transaction is committed, it remains committed even in the event of system failure. Changes are persisted to non-volatile storage.\n\nThese properties are essential for maintaining data integrity in multi-user database environments.",
    category: "Database",
    difficulty: Difficulty.medium,
    tags: ["ACID", "transactions", "DBMS", "atomicity", "consistency"],
  },
  {
    title: "How Do You Create an Index on a Table in SQL?",
    description:
      "Explain what a database index is and provide the SQL syntax to create one.\n\nAnswer: An index is a database object that speeds up data retrieval by creating a separate data structure (typically a B-tree) that allows faster lookups on specific columns — similar to a book's index.\n\nSQL Syntax:\nCREATE INDEX index_name\nON table_name (column1, column2, ...);\n\nExample:\nCREATE INDEX idx_employee_lastname\nON employees (last_name);\n\nUnique Index:\nCREATE UNIQUE INDEX idx_email ON users (email);\n\nTrade-offs:\n- Pros: Significantly speeds up SELECT queries, WHERE filters, and JOIN conditions on indexed columns.\n- Cons: Slows down INSERT, UPDATE, and DELETE operations (index must be updated); uses additional storage space.\n\nBest practice: Index columns that are frequently used in WHERE clauses, JOIN conditions, or ORDER BY expressions.",
    category: "Database",
    difficulty: Difficulty.easy,
    tags: ["SQL", "index", "DBMS", "performance", "B-tree"],
  },
];

interface QuestionFormData {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  tags: string;
}

const defaultForm: QuestionFormData = {
  title: "",
  description: "",
  category: "",
  difficulty: Difficulty.medium,
  tags: "",
};

const sampleCategories = [
  "Algorithms",
  "Data Structures",
  "System Design",
  "Behavioral",
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Security",
  "Interview",
];

function QuestionForm({
  initial,
  onSubmit,
  isPending,
  error,
}: {
  initial?: QuestionFormData;
  onSubmit: (data: QuestionFormData) => void;
  isPending: boolean;
  error?: string;
}) {
  const [form, setForm] = useState<QuestionFormData>(initial ?? defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title required";
    if (!form.description.trim()) errs.description = "Description required";
    if (!form.category.trim()) errs.category = "Category required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Question Title</Label>
        <Input
          id="title"
          placeholder="e.g. Implement a binary search algorithm"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Detailed description of the question, requirements, and constraints..."
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          className={`min-h-[100px] ${errors.description ? "border-destructive" : ""}`}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
          >
            <SelectTrigger
              id="category"
              className={errors.category ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {sampleCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={form.difficulty}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, difficulty: v as Difficulty }))
            }
          >
            <SelectTrigger id="difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Difficulty.easy}>Easy</SelectItem>
              <SelectItem value={Difficulty.medium}>Medium</SelectItem>
              <SelectItem value={Difficulty.hard}>Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          placeholder="e.g. arrays, sorting, time-complexity"
          value={form.tags}
          onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
        />
        <p className="text-xs text-muted-foreground">
          Separate tags with commas
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DialogFooter>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Question"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function QuestionBank() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: questions, isLoading } = useGetAllQuestions();
  const { data: isAdmin } = useIsCallerAdmin();
  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [addOpen, setAddOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedQuestions = async () => {
    setIsSeeding(true);
    let seeded = 0;
    try {
      for (const q of SEED_QUESTIONS) {
        await addQuestion.mutateAsync({
          title: q.title,
          description: q.description,
          category: q.category,
          difficulty: q.difficulty,
          tags: q.tags,
        });
        seeded++;
      }
      toast.success(`Question bank seeded with ${seeded} questions!`);
    } catch (err) {
      toast.error(
        `Seeding stopped after ${seeded} questions — please try again.`,
      );
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const categories = [
    ...new Set((questions ?? []).map((q) => q.category)),
  ].sort();

  const filtered = (questions ?? []).filter((q) => {
    const matchSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;
    const matchCat = filterCategory === "all" || q.category === filterCategory;
    return matchSearch && matchDiff && matchCat;
  });

  const handleAdd = async (data: QuestionFormData) => {
    const tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await addQuestion.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        tags,
      });
      setAddOpen(false);
      toast.success("Question added!");
    } catch (err) {
      toast.error("Failed to add question.");
      console.error(err);
    }
  };

  const handleUpdate = async (data: QuestionFormData) => {
    if (!editQuestion) return;
    const tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await updateQuestion.mutateAsync({
        id: editQuestion.id,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        tags,
      });
      setEditQuestion(null);
      toast.success("Question updated!");
    } catch (err) {
      toast.error("Failed to update question.");
      console.error(err);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteQuestion.mutateAsync(id);
      toast.success("Question deleted.");
    } catch (err) {
      toast.error("Failed to delete question.");
      console.error(err);
    }
  };

  // Show sign-in prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-16">
        <Card
          className="border-border/60 max-w-md w-full text-center shadow-sm"
          data-ocid="questions.signin_card"
        >
          <CardContent className="pt-10 pb-8 px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20 mx-auto mb-5">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Question Bank
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Sign in to browse, search, and manage interview questions. Admins
              can also add, edit, and seed questions from the Answer Guide.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="questions.signin_button"
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {isLoggingIn ? "Connecting..." : "Sign In to View Questions"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading
              ? "Loading..."
              : `${questions?.length ?? 0} questions in the bank`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && !isLoading && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleSeedQuestions}
              disabled={isSeeding}
              data-ocid="questions.seed_button"
            >
              {isSeeding ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Database size={16} />
              )}
              {isSeeding ? "Seeding…" : "Seed Questions"}
            </Button>
          )}

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="questions.add_button"
              >
                <Plus size={16} />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-xl"
              data-ocid="questions.add_dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">Add Question</DialogTitle>
                <DialogDescription>
                  Add a new question to the interview question bank.
                </DialogDescription>
              </DialogHeader>
              <QuestionForm
                onSubmit={handleAdd}
                isPending={addQuestion.isPending}
                error={
                  addQuestion.isError ? "Failed to add question." : undefined
                }
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card gradient-border-blue">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-ocid="questions.search_input"
              />
            </div>
            <Select
              value={filterDifficulty}
              onValueChange={setFilterDifficulty}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter size={13} className="mr-1.5" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value={Difficulty.easy}>Easy</SelectItem>
                <SelectItem value={Difficulty.medium}>Medium</SelectItem>
                <SelectItem value={Difficulty.hard}>Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
            <Skeleton key={k} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="questions.empty_state"
        >
          <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-medium text-muted-foreground">
            {search || filterDifficulty !== "all" || filterCategory !== "all"
              ? "No questions match your filters."
              : "No questions in the bank yet."}
          </p>
          {!search &&
            filterDifficulty === "all" &&
            filterCategory === "all" && (
              <Button
                size="sm"
                className="mt-4 bg-primary text-primary-foreground"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={13} className="mr-1.5" />
                Add first question
              </Button>
            )}
        </div>
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-ocid="questions.list"
        >
          {filtered.map((question, idx) => (
            <Card
              key={question.id.toString()}
              className="border-border/60 hover:border-primary/30 transition-colors group"
              data-ocid={`questions.item.${idx + 1}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-display text-sm leading-snug flex-1">
                    {question.title}
                  </CardTitle>
                  <div className="flex gap-1.5 shrink-0">
                    {/* Edit */}
                    <Dialog
                      open={editQuestion?.id === question.id}
                      onOpenChange={(open) => {
                        if (!open) setEditQuestion(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setEditQuestion(question)}
                          data-ocid={`questions.edit_button.${idx + 1}`}
                        >
                          <Edit2 size={12} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="max-w-xl"
                        data-ocid="questions.edit_dialog"
                      >
                        <DialogHeader>
                          <DialogTitle className="font-display">
                            Edit Question
                          </DialogTitle>
                          <DialogDescription>
                            Update question details.
                          </DialogDescription>
                        </DialogHeader>
                        {editQuestion && (
                          <QuestionForm
                            initial={{
                              title: editQuestion.title,
                              description: editQuestion.description,
                              category: editQuestion.category,
                              difficulty: editQuestion.difficulty,
                              tags: editQuestion.tags.join(", "),
                            }}
                            onSubmit={handleUpdate}
                            isPending={updateQuestion.isPending}
                            error={
                              updateQuestion.isError
                                ? "Failed to update."
                                : undefined
                            }
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          data-ocid={`questions.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="questions.delete_dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{question.title}".
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="questions.delete_cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(question.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-ocid="questions.delete_confirm_button"
                          >
                            {deleteQuestion.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <DifficultyBadge difficulty={question.difficulty} />
                  <Badge variant="outline" className="text-xs border-border/60">
                    {question.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {question.description}
                </p>

                {question.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <Tag size={11} className="text-muted-foreground shrink-0" />
                    {question.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{question.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
