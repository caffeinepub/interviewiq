import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Trophy,
  Upload,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// --------------- Subject Data ---------------

type StudyTerm = { term: string; definition: string };
type MCQQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};
type SubjectData = {
  studyTerms: StudyTerm[];
  guideText: string;
  guidePoints: string[];
  mcq: MCQQuestion[];
  color: string;
  icon: string;
};

const SUBJECT_DATA: Record<string, SubjectData> = {
  "Data Structures & Algorithms": {
    color: "text-emerald-500",
    icon: "🧮",
    studyTerms: [
      {
        term: "Algorithm",
        definition:
          "A step-by-step procedure for solving a problem or computation.",
      },
      {
        term: "Time Complexity",
        definition:
          "A measure of how an algorithm's running time grows relative to input size.",
      },
      {
        term: "Space Complexity",
        definition:
          "The amount of memory an algorithm uses relative to input size.",
      },
      {
        term: "Big O Notation",
        definition:
          "Asymptotic notation describing the worst-case growth rate of an algorithm.",
      },
      {
        term: "Recursion",
        definition:
          "A technique where a function calls itself to solve smaller subproblems.",
      },
    ],
    guideText:
      "Algorithms are fundamental to computer science, providing systematic approaches to solve computational problems efficiently. Key areas include sorting algorithms (QuickSort O(n log n), MergeSort), searching (Binary Search O(log n)), and data structures like arrays, linked lists, stacks, queues, trees, and graphs. Dynamic programming optimizes problems by breaking them into overlapping subproblems. Understanding time and space complexity helps choose the right algorithm for the right situation.",
    guidePoints: [
      "Sorting: QuickSort, MergeSort, HeapSort",
      "Searching: Binary Search, DFS, BFS",
      "Dynamic Programming & Memoization",
      "Graph algorithms: Dijkstra, Floyd-Warshall",
    ],
    mcq: [
      {
        question: "What is the time complexity of Binary Search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctIndex: 1,
      },
      {
        question: "Which data structure follows LIFO?",
        options: ["Queue", "Array", "Stack", "Tree"],
        correctIndex: 2,
      },
      {
        question: "Kadane's algorithm solves:",
        options: [
          "Sorting",
          "Maximum Subarray Sum",
          "Shortest Path",
          "Binary Search",
        ],
        correctIndex: 1,
      },
      {
        question: "Reverse a linked list iteratively requires:",
        options: [
          "O(n²) time",
          "O(n) time O(1) space",
          "Recursion only",
          "Extra array",
        ],
        correctIndex: 1,
      },
      {
        question: "Which sorting is O(n log n) worst case?",
        options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort"],
        correctIndex: 2,
      },
    ],
  },
  "Database Management": {
    color: "text-blue-500",
    icon: "🗄️",
    studyTerms: [
      {
        term: "DBMS",
        definition:
          "Software system for managing, storing, and retrieving structured data.",
      },
      {
        term: "SQL",
        definition:
          "Structured Query Language used for database operations and queries.",
      },
      {
        term: "Normalization",
        definition:
          "Process of organizing data to reduce redundancy and improve integrity.",
      },
      {
        term: "ACID",
        definition:
          "Properties (Atomicity, Consistency, Isolation, Durability) ensuring reliable transactions.",
      },
      {
        term: "Index",
        definition:
          "A data structure that speeds up database query operations.",
      },
    ],
    guideText:
      "Database Management Systems organize and store data efficiently for retrieval and manipulation. SQL enables operations like SELECT, INSERT, UPDATE, DELETE. Normalization (1NF, 2NF, 3NF) reduces redundancy and ensures data integrity. ACID properties guarantee reliable transactions. Indexes speed up queries but add write overhead. NoSQL databases offer flexible schemas for unstructured data.",
    guidePoints: [
      "SQL: SELECT, INSERT, UPDATE, DELETE, JOIN",
      "Normalization: 1NF, 2NF, 3NF",
      "ACID properties for transaction reliability",
      "NoSQL: MongoDB, Redis, Cassandra",
    ],
    mcq: [
      {
        question: "What does ACID stand for?",
        options: [
          "Access Control ID",
          "Atomicity Consistency Isolation Durability",
          "Algorithm Cache Index Data",
          "None of these",
        ],
        correctIndex: 1,
      },
      {
        question: "Which SQL command retrieves data?",
        options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
        correctIndex: 2,
      },
      {
        question: "Normalization removes:",
        options: ["Tables", "Indexes", "Data Redundancy", "Queries"],
        correctIndex: 2,
      },
      {
        question: "CREATE INDEX targets:",
        options: ["Row", "Database", "Column(s)", "Constraint"],
        correctIndex: 2,
      },
      {
        question: "Shared lock allows:",
        options: [
          "Only writes",
          "Multiple reads",
          "Single transaction",
          "No access",
        ],
        correctIndex: 1,
      },
    ],
  },
  "Operating Systems": {
    color: "text-purple-500",
    icon: "💻",
    studyTerms: [
      {
        term: "Process",
        definition:
          "A running instance of a program with its own memory space.",
      },
      {
        term: "Thread",
        definition:
          "A lightweight unit of execution within a process sharing its memory.",
      },
      {
        term: "Deadlock",
        definition:
          "A circular wait state where processes block indefinitely waiting for each other's resources.",
      },
      {
        term: "Semaphore",
        definition:
          "A synchronization primitive that controls access to shared resources.",
      },
      {
        term: "Virtual Memory",
        definition:
          "An abstraction that extends physical RAM using disk storage for paging.",
      },
    ],
    guideText:
      "An operating system manages hardware resources and provides services to applications. Process management handles CPU scheduling (Round Robin, Priority). Memory management uses paging and virtual memory to abstract physical storage. Deadlocks occur when four conditions hold: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Synchronization primitives like semaphores and mutexes prevent race conditions.",
    guidePoints: [
      "Process & thread lifecycle management",
      "CPU scheduling: Round Robin, Priority, FCFS",
      "Memory management: paging, segmentation",
      "Deadlock detection, prevention, avoidance",
    ],
    mcq: [
      {
        question: "Four conditions for deadlock include:",
        options: ["Hold and Wait", "Shared Access", "CPU Burst", "Paging"],
        correctIndex: 0,
      },
      {
        question: "Shared lock allows:",
        options: [
          "Write only",
          "Multiple reads",
          "Single process",
          "No access",
        ],
        correctIndex: 1,
      },
      {
        question: "Virtual memory uses:",
        options: [
          "More RAM",
          "CPU cache",
          "Disk as extended memory",
          "Network",
        ],
        correctIndex: 2,
      },
      {
        question: "Semaphore is used for:",
        options: [
          "Memory allocation",
          "Process Synchronization",
          "File system",
          "Scheduling",
        ],
        correctIndex: 1,
      },
      {
        question: "Round Robin scheduling is:",
        options: [
          "Priority-based",
          "Preemptive time-slice",
          "FIFO",
          "Shortest job first",
        ],
        correctIndex: 1,
      },
    ],
  },
  "Web Development": {
    color: "text-orange-500",
    icon: "🌐",
    studyTerms: [
      {
        term: "DOM",
        definition:
          "Document Object Model — tree representation of an HTML page that JavaScript can manipulate.",
      },
      {
        term: "API",
        definition:
          "Application Programming Interface for communication between different software systems.",
      },
      {
        term: "REST",
        definition:
          "Representational State Transfer — architectural style for designing networked applications.",
      },
      {
        term: "Component",
        definition:
          "A reusable, self-contained UI building block in frameworks like React.",
      },
      {
        term: "HTTP",
        definition:
          "Hypertext Transfer Protocol — the foundation of data communication on the web.",
      },
    ],
    guideText:
      "Web development involves building applications for browsers using HTML (structure), CSS (style), and JavaScript (behavior). React uses a component-based architecture with virtual DOM for efficient rendering. REST APIs use HTTP methods (GET/POST/PUT/DELETE) for client-server communication. TypeScript adds static typing to JavaScript. Node.js enables server-side JavaScript.",
    guidePoints: [
      "HTML/CSS/JavaScript core trio",
      "React: components, hooks, virtual DOM",
      "REST APIs: GET, POST, PUT, DELETE",
      "TypeScript, Node.js, bundlers (Vite, Webpack)",
    ],
    mcq: [
      {
        question: "React uses which rendering optimization?",
        options: ["Direct DOM", "Virtual DOM", "Server rendering", "CSS"],
        correctIndex: 1,
      },
      {
        question: "REST API uses HTTP method for data creation:",
        options: ["GET", "DELETE", "POST", "HEAD"],
        correctIndex: 2,
      },
      {
        question: "TypeScript is:",
        options: [
          "A framework",
          "Statically typed JS superset",
          "A database",
          "CSS tool",
        ],
        correctIndex: 1,
      },
      {
        question: "Component-based architecture means:",
        options: [
          "Monolithic code",
          "Reusable isolated UI pieces",
          "Database tables",
          "CSS classes",
        ],
        correctIndex: 1,
      },
      {
        question: "HTTP status 404 means:",
        options: ["Server Error", "Redirect", "Not Found", "OK"],
        correctIndex: 2,
      },
    ],
  },
  "Machine Learning": {
    color: "text-pink-500",
    icon: "🤖",
    studyTerms: [
      {
        term: "Model",
        definition:
          "A mathematical function trained on data to make predictions or decisions.",
      },
      {
        term: "Training",
        definition:
          "The process of optimizing model parameters by exposing it to labeled data.",
      },
      {
        term: "Overfitting",
        definition:
          "When a model memorizes training data but performs poorly on unseen data.",
      },
      {
        term: "Classification",
        definition:
          "A supervised learning task that predicts discrete categories or labels.",
      },
      {
        term: "Regression",
        definition:
          "A supervised learning task that predicts continuous numerical values.",
      },
    ],
    guideText:
      "Machine learning enables systems to learn from data without explicit programming. Supervised learning uses labeled data for classification and regression tasks. Unsupervised learning finds patterns in unlabeled data through clustering. Neural networks with multiple layers form deep learning models. Model evaluation uses metrics like accuracy, precision, recall, and F1 score.",
    guidePoints: [
      "Supervised: classification, regression",
      "Unsupervised: clustering, dimensionality reduction",
      "Neural networks & deep learning",
      "Evaluation: accuracy, precision, recall, F1",
    ],
    mcq: [
      {
        question: "Overfitting means:",
        options: [
          "Model is too simple",
          "Model memorizes training data",
          "Low accuracy",
          "Missing data",
        ],
        correctIndex: 1,
      },
      {
        question: "Classification predicts:",
        options: ["Continuous values", "Categories", "Clusters", "Sequences"],
        correctIndex: 1,
      },
      {
        question: "TensorFlow is a:",
        options: ["Database", "Web framework", "ML library", "CSS tool"],
        correctIndex: 2,
      },
      {
        question: "Training data is used to:",
        options: [
          "Test model",
          "Deploy model",
          "Optimize model parameters",
          "Clean data",
        ],
        correctIndex: 2,
      },
      {
        question: "Supervised learning requires:",
        options: [
          "No labels",
          "Labeled data",
          "Only test data",
          "Unsupervised input",
        ],
        correctIndex: 1,
      },
    ],
  },
  "Computer Networks": {
    color: "text-cyan-500",
    icon: "🔗",
    studyTerms: [
      {
        term: "TCP",
        definition:
          "Transmission Control Protocol — ensures reliable, ordered delivery of packets.",
      },
      {
        term: "IP",
        definition:
          "Internet Protocol — handles addressing and routing of packets across networks.",
      },
      {
        term: "DNS",
        definition:
          "Domain Name System — translates human-readable domain names to IP addresses.",
      },
      {
        term: "HTTP",
        definition:
          "Application-layer protocol for web communication between clients and servers.",
      },
      {
        term: "Firewall",
        definition:
          "A network security barrier that controls incoming and outgoing traffic.",
      },
    ],
    guideText:
      "Computer networks enable communication between devices using protocols. TCP/IP is the foundational protocol suite. DNS resolves human-readable domain names to IP addresses. HTTP/HTTPS enable web communication; HTTPS adds TLS encryption. Routers direct packets across networks. Bandwidth and latency are key performance metrics.",
    guidePoints: [
      "OSI model: 7 layers of networking",
      "TCP/IP: reliable vs UDP unreliable delivery",
      "DNS, HTTP, HTTPS, TLS/SSL protocols",
      "Routing, firewalls, bandwidth, latency",
    ],
    mcq: [
      {
        question: "DNS translates:",
        options: ["IP to MAC", "Domain to IP", "HTTP to HTTPS", "Port to IP"],
        correctIndex: 1,
      },
      {
        question: "TCP provides:",
        options: [
          "Unreliable delivery",
          "Reliable ordered delivery",
          "Fast UDP",
          "Broadcast",
        ],
        correctIndex: 1,
      },
      {
        question: "HTTPS adds to HTTP:",
        options: ["Speed", "TLS encryption", "More headers", "Compression"],
        correctIndex: 1,
      },
      {
        question: "Router's purpose:",
        options: [
          "Store files",
          "Direct network packets",
          "Run apps",
          "Display web",
        ],
        correctIndex: 1,
      },
      {
        question: "Firewall controls:",
        options: ["CPU usage", "Memory", "Network traffic", "Disk I/O"],
        correctIndex: 2,
      },
    ],
  },
  "System Design": {
    color: "text-yellow-500",
    icon: "🏗️",
    studyTerms: [
      {
        term: "Scalability",
        definition:
          "The ability of a system to handle increased load by adding resources.",
      },
      {
        term: "Load Balancer",
        definition:
          "A component that distributes incoming traffic across multiple servers.",
      },
      {
        term: "Cache",
        definition:
          "Fast temporary storage that reduces database load for frequently accessed data.",
      },
      {
        term: "Microservices",
        definition:
          "An architecture splitting an application into independently deployable services.",
      },
      {
        term: "CDN",
        definition:
          "Content Delivery Network — geographically distributed servers for faster content delivery.",
      },
    ],
    guideText:
      "System design involves architecting large-scale distributed systems. Horizontal scaling adds more servers; vertical scaling adds resources to one server. Load balancers distribute requests and improve availability. Caching (Redis, Memcached) reduces database load. Microservices allow independent deployment and scaling. CAP theorem states distributed systems can only guarantee 2 of: Consistency, Availability, Partition tolerance.",
    guidePoints: [
      "Horizontal vs vertical scaling",
      "Load balancing, caching, CDN",
      "Microservices vs monolith",
      "CAP theorem: consistency, availability, partition",
    ],
    mcq: [
      {
        question: "CAP theorem stands for:",
        options: [
          "Cache, API, Protocol",
          "Consistency, Availability, Partition tolerance",
          "CPU, Architecture, Performance",
          "None",
        ],
        correctIndex: 1,
      },
      {
        question: "Load balancer purpose:",
        options: [
          "Store data",
          "Distribute traffic",
          "Encrypt data",
          "Cache responses",
        ],
        correctIndex: 1,
      },
      {
        question: "CDN improves:",
        options: [
          "Database queries",
          "Content delivery speed",
          "Security only",
          "Code quality",
        ],
        correctIndex: 1,
      },
      {
        question: "Horizontal scaling means:",
        options: [
          "Upgrade one server",
          "Add more servers",
          "Remove servers",
          "Cache data",
        ],
        correctIndex: 1,
      },
      {
        question: "Microservices are:",
        options: [
          "Monolithic",
          "Independent deployable services",
          "Databases",
          "Frontend components",
        ],
        correctIndex: 1,
      },
    ],
  },
  "Object Oriented Programming": {
    color: "text-indigo-500",
    icon: "🧩",
    studyTerms: [
      {
        term: "Class",
        definition:
          "A blueprint for creating objects, defining their properties and behaviors.",
      },
      {
        term: "Inheritance",
        definition:
          "A mechanism where a subclass acquires properties and methods of a parent class.",
      },
      {
        term: "Polymorphism",
        definition:
          "The ability for the same interface to represent different underlying implementations.",
      },
      {
        term: "Encapsulation",
        definition:
          "Bundling data and methods while hiding internal state via access modifiers.",
      },
      {
        term: "Abstraction",
        definition:
          "Hiding complexity and exposing only the essential features of an object.",
      },
    ],
    guideText:
      "OOP organizes code around objects that bundle data and behavior. Inheritance enables code reuse by extending existing classes. Polymorphism allows treating different types uniformly. Encapsulation protects object state through access modifiers (public/private/protected). Design patterns like Singleton, Factory, and Observer solve common problems. Java and C++ are popular OOP languages.",
    guidePoints: [
      "Four pillars: encapsulation, inheritance, polymorphism, abstraction",
      "Design patterns: Singleton, Factory, Observer",
      "SOLID principles for clean OOP",
      "Java, C++, Python OOP examples",
    ],
    mcq: [
      {
        question: "Inheritance enables:",
        options: [
          "Data hiding",
          "Code reuse",
          "Memory management",
          "Type checking",
        ],
        correctIndex: 1,
      },
      {
        question: "Encapsulation hides:",
        options: [
          "Inheritance",
          "Internal state",
          "Method names",
          "Class names",
        ],
        correctIndex: 1,
      },
      {
        question: "Polymorphism allows:",
        options: [
          "Multiple databases",
          "Same interface different implementations",
          "Faster loops",
          "Memory pools",
        ],
        correctIndex: 1,
      },
      {
        question: "Abstract class:",
        options: [
          "Can be instantiated",
          "Cannot be instantiated",
          "Has no methods",
          "Is same as interface",
        ],
        correctIndex: 1,
      },
      {
        question: "Singleton pattern ensures:",
        options: [
          "Multiple instances",
          "One instance",
          "Fast creation",
          "Inheritance chain",
        ],
        correctIndex: 1,
      },
    ],
  },
  "Cloud Computing": {
    color: "text-sky-500",
    icon: "☁️",
    studyTerms: [
      {
        term: "Container",
        definition:
          "A lightweight, isolated runtime environment packaging an app with its dependencies.",
      },
      {
        term: "Kubernetes",
        definition:
          "An open-source platform for automating container deployment and orchestration.",
      },
      {
        term: "CI/CD",
        definition:
          "Continuous Integration/Delivery — pipeline automating code testing and deployment.",
      },
      {
        term: "IaaS",
        definition:
          "Infrastructure as a Service — cloud model providing raw computing infrastructure.",
      },
      {
        term: "DevOps",
        definition:
          "A culture combining development and operations for faster, more reliable software delivery.",
      },
    ],
    guideText:
      "Cloud computing delivers computing resources over the internet. IaaS provides raw infrastructure (AWS EC2), PaaS provides platforms (Heroku), SaaS provides applications (Gmail). Docker containers package applications with dependencies. Kubernetes orchestrates containers at scale. CI/CD pipelines automate testing and deployment. Major providers include AWS, Azure, and GCP.",
    guidePoints: [
      "IaaS, PaaS, SaaS service models",
      "Docker: containerization fundamentals",
      "Kubernetes: orchestration at scale",
      "CI/CD pipelines: GitHub Actions, Jenkins",
    ],
    mcq: [
      {
        question: "Docker containers provide:",
        options: [
          "Database storage",
          "Isolated runtime environments",
          "Network routing",
          "UI components",
        ],
        correctIndex: 1,
      },
      {
        question: "Kubernetes is used for:",
        options: [
          "Web design",
          "Container orchestration",
          "Database queries",
          "CSS styling",
        ],
        correctIndex: 1,
      },
      {
        question: "CI/CD automates:",
        options: [
          "UI design",
          "Testing and deployment",
          "Database backup",
          "Security audits",
        ],
        correctIndex: 1,
      },
      {
        question: "IaaS provides:",
        options: [
          "Ready-made apps",
          "Raw infrastructure",
          "Platform tools",
          "Software licenses",
        ],
        correctIndex: 1,
      },
      {
        question: "AWS stands for:",
        options: [
          "Advanced Web Server",
          "Amazon Web Services",
          "Automated Web System",
          "Application Web Stack",
        ],
        correctIndex: 1,
      },
    ],
  },
  Cybersecurity: {
    color: "text-red-500",
    icon: "🔒",
    studyTerms: [
      {
        term: "Encryption",
        definition:
          "Converting data into an unreadable format to prevent unauthorized access.",
      },
      {
        term: "Authentication",
        definition:
          "The process of verifying the identity of a user or system.",
      },
      {
        term: "Vulnerability",
        definition:
          "A weakness in a system that can be exploited by attackers.",
      },
      {
        term: "SSL/TLS",
        definition:
          "Protocols providing secure, encrypted communication over a network.",
      },
      {
        term: "Hashing",
        definition:
          "A one-way function mapping data to a fixed-size digest for secure storage.",
      },
    ],
    guideText:
      "Cybersecurity protects systems from digital attacks. Encryption (AES, RSA) secures data at rest and in transit. Authentication verifies identity via passwords, MFA, or certificates. Penetration testing identifies vulnerabilities before attackers do. SSL/TLS encrypts web traffic (HTTPS). Hashing (SHA-256) stores passwords securely — never store plaintext passwords.",
    guidePoints: [
      "Encryption: symmetric (AES) and asymmetric (RSA)",
      "Authentication: MFA, OAuth, JWT",
      "Common vulnerabilities: SQLi, XSS, CSRF",
      "SSL/TLS, HTTPS, certificate authorities",
    ],
    mcq: [
      {
        question: "SSL/TLS is used for:",
        options: [
          "Database queries",
          "Secure network communication",
          "File storage",
          "CPU management",
        ],
        correctIndex: 1,
      },
      {
        question: "Hashing is:",
        options: [
          "Two-way encryption",
          "One-way function",
          "Compression",
          "Sorting",
        ],
        correctIndex: 1,
      },
      {
        question: "Authentication verifies:",
        options: ["Data integrity", "Identity", "Network speed", "File size"],
        correctIndex: 1,
      },
      {
        question: "Penetration testing:",
        options: [
          "Tests UI",
          "Finds security vulnerabilities",
          "Optimizes DB",
          "Deploys apps",
        ],
        correctIndex: 1,
      },
      {
        question: "AES is a type of:",
        options: ["Protocol", "Encryption algorithm", "Database", "Framework"],
        correctIndex: 1,
      },
    ],
  },
};

const SUBJECT_KEYWORDS: Record<string, string[]> = {
  "Data Structures & Algorithms": [
    "algorithm",
    "array",
    "linked list",
    "stack",
    "queue",
    "tree",
    "graph",
    "sorting",
    "searching",
    "dynamic programming",
    "recursion",
    "binary",
    "hash",
    "complexity",
    "o(n)",
  ],
  "Database Management": [
    "sql",
    "database",
    "dbms",
    "query",
    "table",
    "join",
    "index",
    "normalization",
    "transaction",
    "schema",
    "mongodb",
    "postgresql",
    "mysql",
    "nosql",
  ],
  "Operating Systems": [
    "os",
    "process",
    "thread",
    "deadlock",
    "memory",
    "scheduler",
    "semaphore",
    "mutex",
    "paging",
    "virtual memory",
    "kernel",
    "cpu",
    "concurrency",
  ],
  "Web Development": [
    "html",
    "css",
    "javascript",
    "react",
    "nodejs",
    "api",
    "rest",
    "http",
    "frontend",
    "backend",
    "typescript",
    "framework",
    "component",
  ],
  "Machine Learning": [
    "machine learning",
    "ml",
    "model",
    "neural",
    "deep learning",
    "training",
    "dataset",
    "accuracy",
    "classification",
    "regression",
    "tensorflow",
    "pytorch",
    "ai",
  ],
  "Computer Networks": [
    "network",
    "tcp",
    "ip",
    "http",
    "dns",
    "protocol",
    "packet",
    "router",
    "bandwidth",
    "latency",
    "socket",
    "firewall",
  ],
  "System Design": [
    "scalability",
    "microservices",
    "load balancer",
    "cache",
    "cdn",
    "architecture",
    "distributed",
    "availability",
    "consistency",
    "system design",
  ],
  "Object Oriented Programming": [
    "oop",
    "class",
    "object",
    "inheritance",
    "polymorphism",
    "encapsulation",
    "abstraction",
    "interface",
    "java",
    "c++",
    "design pattern",
  ],
  "Cloud Computing": [
    "cloud",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "devops",
    "ci/cd",
    "containerization",
    "deployment",
  ],
  Cybersecurity: [
    "security",
    "encryption",
    "authentication",
    "vulnerability",
    "firewall",
    "ssl",
    "tls",
    "hashing",
    "penetration",
  ],
};

function detectSubjects(text: string): string[] {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    scores[subject] = keywords.filter((kw) => lower.includes(kw)).length;
  }
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([s]) => s)
    .filter((_, i) => {
      const vals = Object.values(scores).sort((a, b) => b - a);
      return vals[i] > 0;
    });
}

// --------------- MCQ Quiz Component ---------------

function MCQQuiz({ subject }: { subject: string }) {
  const data = SUBJECT_DATA[subject];
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(data.mcq.length).fill(null),
  );
  const [checked, setChecked] = useState<boolean[]>(
    Array(data.mcq.length).fill(false),
  );

  const score = answers.filter(
    (a, i) => checked[i] && a === data.mcq[i].correctIndex,
  ).length;
  const checkedCount = checked.filter(Boolean).length;

  useEffect(() => {
    if (checkedCount === data.mcq.length) {
      const total = data.mcq.length;
      const key = "interviewiq_mcq_results";
      try {
        const existing: {
          subject: string;
          score: number;
          total: number;
          completedAt: number;
        }[] = JSON.parse(localStorage.getItem(key) || "[]");
        const filtered = existing.filter((r) => r.subject !== subject);
        filtered.push({ subject, score, total, completedAt: Date.now() });
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch {
        // ignore
      }
    }
  }, [checkedCount, subject, score, data.mcq.length]);

  return (
    <div className="space-y-5">
      {checkedCount > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Trophy size={16} className="text-primary" />
          <span className="text-sm font-medium">
            Score:{" "}
            <span className="text-primary font-bold">
              {score}/{checkedCount}
            </span>{" "}
            answered correctly
          </span>
          <Progress
            value={(score / Math.max(checkedCount, 1)) * 100}
            className="flex-1 h-2"
          />
        </div>
      )}
      {data.mcq.map((q, qi) => (
        <div
          key={q.question}
          className="space-y-2"
          data-ocid={`quiz.question.${qi + 1}`}
        >
          <p className="text-sm font-medium">
            <span className="text-muted-foreground mr-2">{qi + 1}.</span>
            {q.question}
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi;
              const isChecked = checked[qi];
              const isCorrect = oi === q.correctIndex;
              let optClass =
                "flex items-center gap-2.5 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ";
              if (!isChecked) {
                optClass += isSelected
                  ? "border-primary/60 bg-primary/8 text-foreground"
                  : "border-border/60 hover:border-primary/30 hover:bg-accent/50";
              } else {
                if (isCorrect)
                  optClass += "border-success/60 bg-success/10 text-foreground";
                else if (isSelected && !isCorrect)
                  optClass +=
                    "border-destructive/60 bg-destructive/10 text-foreground";
                else optClass += "border-border/40 text-muted-foreground";
              }
              return (
                <label
                  key={opt}
                  className={optClass}
                  data-ocid={`quiz.option.${qi + 1}`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name={`q-${subject}-${qi}`}
                    disabled={isChecked}
                    checked={isSelected}
                    onChange={() => {
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                    }}
                  />
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                      isChecked && isCorrect
                        ? "border-success bg-success/20 text-success"
                        : isChecked && isSelected && !isCorrect
                          ? "border-destructive bg-destructive/20 text-destructive"
                          : isSelected
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border text-muted-foreground"
                    }`}
                  >
                    {["A", "B", "C", "D"][oi]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isChecked && isCorrect && (
                    <CheckCircle2 size={14} className="text-success shrink-0" />
                  )}
                  {isChecked && isSelected && !isCorrect && (
                    <XCircle size={14} className="text-destructive shrink-0" />
                  )}
                </label>
              );
            })}
          </div>
          {!checked[qi] && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 mt-1 border-border/60"
              disabled={answers[qi] === null}
              onClick={() => {
                const next = [...checked];
                next[qi] = true;
                setChecked(next);
              }}
              data-ocid={`quiz.check_button.${qi + 1}`}
            >
              Check Answer
            </Button>
          )}
          {checked[qi] && answers[qi] !== q.correctIndex && (
            <p className="text-xs text-success mt-1">
              ✓ Correct answer: <strong>{q.options[q.correctIndex]}</strong>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// --------------- Main Component ---------------

export function StudentDashboard() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();

  const [resumeText, setResumeText] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [detectedSubjects, setDetectedSubjects] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing skills on mount
  useEffect(() => {
    if (!actor || isFetching || !identity) {
      setLoadingExisting(false);
      return;
    }
    const principal = identity.getPrincipal();
    actor
      .getResumeSkills(principal)
      .then((result) => {
        if (result?.skills && result.skills.length > 0) {
          setDetectedSubjects(result.skills);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, [actor, isFetching, identity]);

  const processFile = useCallback(async (file: File) => {
    setIsExtracting(true);
    setFileName(file.name);
    try {
      // Try reading as text (works for text-based PDFs and txt)
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) ?? "");
        reader.onerror = reject;
        reader.readAsText(file);
      });
      if (text && text.trim().length > 50) {
        setResumeText(text);
        setPasteText("");
        setShowPaste(false);
      } else {
        // Fallback: show paste area
        setShowPaste(true);
        toast.info(
          "Could not extract text automatically. Please paste your resume text below.",
        );
      }
    } catch {
      setShowPaste(true);
      toast.info("Could not read file. Please paste your resume text below.");
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const effectiveText = resumeText || pasteText;

  const handleAnalyze = useCallback(async () => {
    if (!effectiveText.trim()) {
      toast.error("Please upload a resume or paste your resume text first.");
      return;
    }
    const subjects = detectSubjects(effectiveText);
    if (subjects.length === 0) {
      toast.error(
        "Could not detect any technical subjects. Try adding more technical content.",
      );
      return;
    }
    setIsSaving(true);
    try {
      if (actor && !isFetching) {
        await actor.saveResumeSkills(subjects, effectiveText.slice(0, 5000));
      }
      setDetectedSubjects(subjects);
      toast.success(
        `Detected ${subjects.length} subjects: ${subjects.join(", ")}`,
      );
    } catch {
      // Still show dashboard even if save fails
      setDetectedSubjects(subjects);
      toast.warning("Dashboard generated. Sign in to save your results.");
    } finally {
      setIsSaving(false);
    }
  }, [effectiveText, actor, isFetching]);

  const handleReupload = () => {
    setDetectedSubjects([]);
    setResumeText("");
    setPasteText("");
    setFileName("");
    setShowPaste(false);
  };

  if (!identity && !loadingExisting) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <Card className="border-border/60 max-w-md w-full text-center">
          <CardContent className="pt-10 pb-8">
            <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">
              Sign In Required
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Sign in to upload your resume and access your personalized
              learning dashboard.
            </p>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingExisting) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Student <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume to get personalized study notes, guides, and
            skill assessments.
          </p>
        </div>
        {detectedSubjects.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReupload}
            className="gap-2 border-border/60 self-start sm:self-auto"
            data-ocid="student.reupload_button"
          >
            <RefreshCw size={14} />
            Re-upload Resume
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {detectedSubjects.length === 0 ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Upload Card */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Upload size={18} className="text-primary" />
                  Upload Your Resume
                </CardTitle>
                <CardDescription>
                  Upload a PDF or Word document. We'll detect your top 3
                  technical subjects.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drop Zone */}
                <button
                  type="button"
                  className={`relative flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:border-primary/40 hover:bg-accent/30"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="student.dropzone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="sr-only"
                    onChange={handleFileChange}
                    data-ocid="student.upload_button"
                  />
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                      <p className="text-sm font-medium">
                        Extracting resume text...
                      </p>
                    </>
                  ) : fileName ? (
                    <>
                      <FileText className="h-10 w-10 text-primary mb-3" />
                      <p className="text-sm font-medium text-primary">
                        {fileName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        File loaded. Click Analyze below.
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="font-medium text-sm">
                        Drop your resume here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, DOCX, TXT supported
                      </p>
                    </>
                  )}
                </button>

                {/* Toggle Paste */}
                <button
                  type="button"
                  onClick={() => setShowPaste((v) => !v)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="student.toggle_paste_button"
                >
                  {showPaste ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                  Or paste resume text directly
                </button>

                {showPaste && (
                  <Textarea
                    placeholder="Paste your resume content here — skills, projects, education..."
                    className="min-h-[160px] font-mono text-xs resize-none border-border/60"
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    data-ocid="student.textarea"
                  />
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={!effectiveText.trim() || isSaving}
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="student.analyze_button"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {isSaving
                    ? "Analyzing..."
                    : "Analyze Resume & Generate Dashboard"}
                </Button>
              </CardContent>
            </Card>

            {/* How it works */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: "📄",
                  title: "Upload Resume",
                  desc: "PDF or paste text — we extract your technical skills",
                },
                {
                  icon: "🔍",
                  title: "AI Detection",
                  desc: "We identify your top 3 technical subject areas",
                },
                {
                  icon: "📚",
                  title: "Personalized Content",
                  desc: "Study notes, guides, and MCQ tests just for you",
                },
              ].map((step) => (
                <Card key={step.title} className="border-border/60 text-center">
                  <CardContent className="pt-5 pb-5">
                    <div className="text-2xl mb-2">{step.icon}</div>
                    <p className="font-display font-semibold text-sm">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Detected Subjects Banner */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex flex-wrap items-center gap-3 py-4">
                <Sparkles size={16} className="text-primary shrink-0" />
                <span className="text-sm font-medium">
                  Detected subjects from your resume:
                </span>
                {detectedSubjects.map((s) => (
                  <Badge
                    key={s}
                    className="gap-1.5 bg-primary/10 text-primary border-primary/30"
                    variant="outline"
                  >
                    <span>{SUBJECT_DATA[s]?.icon}</span>
                    {s}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="notes" data-ocid="student.tab">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger
                  value="notes"
                  className="gap-2"
                  data-ocid="student.notes_tab"
                >
                  <BookOpen size={14} />
                  Study Notes
                </TabsTrigger>
                <TabsTrigger
                  value="guide"
                  className="gap-2"
                  data-ocid="student.guide_tab"
                >
                  <Brain size={14} />
                  Subject Guide
                </TabsTrigger>
                <TabsTrigger
                  value="assessment"
                  className="gap-2"
                  data-ocid="student.assessment_tab"
                >
                  <Trophy size={14} />
                  Skill Assessment
                </TabsTrigger>
              </TabsList>

              {/* Study Notes Tab */}
              <TabsContent value="notes">
                <div className="grid gap-5 lg:grid-cols-3">
                  {detectedSubjects.map((subject, si) => {
                    const data = SUBJECT_DATA[subject];
                    if (!data) return null;
                    return (
                      <motion.div
                        key={subject}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: si * 0.1 }}
                      >
                        <Card className="border-border/60 h-full">
                          <CardHeader className="pb-3">
                            <CardTitle className="font-display text-base flex items-center gap-2">
                              <span className="text-xl">{data.icon}</span>
                              <span className={data.color}>{subject}</span>
                            </CardTitle>
                            <CardDescription>
                              Key definitions & terms
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {data.studyTerms.map((t, ti) => (
                                <li
                                  key={t.term}
                                  className="text-sm leading-relaxed"
                                  data-ocid={`notes.item.${ti + 1}`}
                                >
                                  <span className="font-semibold">
                                    {t.term}:
                                  </span>{" "}
                                  <span className="text-muted-foreground">
                                    {t.definition}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Subject Guide Tab */}
              <TabsContent value="guide">
                <div className="grid gap-5 lg:grid-cols-3">
                  {detectedSubjects.map((subject, si) => {
                    const data = SUBJECT_DATA[subject];
                    if (!data) return null;
                    return (
                      <motion.div
                        key={subject}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: si * 0.1 }}
                      >
                        <Card className="border-border/60 h-full">
                          <CardHeader className="pb-3">
                            <CardTitle className="font-display text-base flex items-center gap-2">
                              <span className="text-xl">{data.icon}</span>
                              <span className={data.color}>{subject}</span>
                            </CardTitle>
                            <CardDescription>
                              Core concepts overview
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {data.guideText}
                            </p>
                            <ul className="space-y-1.5">
                              {data.guidePoints.map((pt, pi) => (
                                <li
                                  key={pt}
                                  className="flex items-start gap-2 text-sm"
                                  data-ocid={`guide.item.${pi + 1}`}
                                >
                                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                  {pt}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Skill Assessment Tab */}
              <TabsContent value="assessment">
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Select an answer and click "Check Answer" for each
                      question. Your score appears after each check.
                    </p>
                  </div>
                </div>
                <div className="grid gap-5 lg:grid-cols-3">
                  {detectedSubjects.map((subject, si) => {
                    const data = SUBJECT_DATA[subject];
                    if (!data) return null;
                    return (
                      <motion.div
                        key={subject}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: si * 0.1 }}
                      >
                        <Card className="border-border/60">
                          <CardHeader className="pb-3">
                            <CardTitle className="font-display text-base flex items-center gap-2">
                              <span className="text-xl">{data.icon}</span>
                              <span className={data.color}>{subject}</span>
                            </CardTitle>
                            <CardDescription>
                              5-question knowledge check
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <MCQQuiz subject={subject} />
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
