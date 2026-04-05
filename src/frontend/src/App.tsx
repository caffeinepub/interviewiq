import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { useInactivityLogout } from "./hooks/useInactivityLogout";
import { AIInterviewerSession } from "./pages/AIInterviewerSession";
import { AIInterviewerSetup } from "./pages/AIInterviewerSetup";
import { AdaptiveAssessmentPage } from "./pages/AdaptiveAssessmentPage";
import { AdaptiveSession } from "./pages/AdaptiveSession";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminPage } from "./pages/AdminPage";
import { AdmissionsPortal } from "./pages/AdmissionsPortal";
import { AssessmentPage } from "./pages/AssessmentPage";
import { AssessmentReport } from "./pages/AssessmentReport";
import { AssessmentResults } from "./pages/AssessmentResults";
import { AuthPage } from "./pages/AuthPage";
import { CandidateDashboard } from "./pages/CandidateDashboard";
import { CandidateReport } from "./pages/CandidateReport";
import { EvaluatorDashboard } from "./pages/EvaluatorDashboard";
import { FAQPage } from "./pages/FAQPage";
import { GeminiInterviewResults } from "./pages/GeminiInterviewResults";
import { GeminiInterviewSession } from "./pages/GeminiInterviewSession";
import { GeminiInterviewSetup } from "./pages/GeminiInterviewSetup";
import { InterviewAnswers } from "./pages/InterviewAnswers";
import { InterviewSession } from "./pages/InterviewSession";
import { LandingPage } from "./pages/LandingPage";
import { MockInterviewSetup } from "./pages/MockInterviewSetup";
import { OnboardingPage } from "./pages/OnboardingPage";
import { PanelInterviewPage } from "./pages/PanelInterviewPage";
import { PrivacySettingsPage } from "./pages/PrivacySettingsPage";
import { QuestionBank } from "./pages/QuestionBank";
import { RecruiterDashboard } from "./pages/RecruiterDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { VoiceInterviewPage } from "./pages/VoiceInterviewPage";

// Root layout
function RootLayout() {
  useInactivityLogout();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

// Routes
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
});

const candidateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidate",
  component: CandidateDashboard,
});

const mockInterviewNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mock-interview/new",
  component: MockInterviewSetup,
});

const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/session/$id",
  component: InterviewSession,
});

const sessionReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/session/$id/report",
  component: AssessmentReport,
});

const evaluatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/evaluator",
  component: EvaluatorDashboard,
});

const recruiterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recruiter",
  component: RecruiterDashboard,
});

const questionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/questions",
  component: QuestionBank,
});

const interviewAnswersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/interview-answers",
  component: InterviewAnswers,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: AdminDashboard,
});

const admissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admissions",
  component: AdmissionsPortal,
});

const assessmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assessment",
  component: AssessmentPage,
});

const assessmentResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assessment/results/$id",
  component: AssessmentResults,
});

const adaptiveAssessmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/adaptive-assessment",
  component: AdaptiveAssessmentPage,
});

const adaptiveSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/adaptive-session/$id",
  component: AdaptiveSession,
});

const candidateReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidate/report/$id",
  component: CandidateReport,
});

const studentDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student-dashboard",
  component: StudentDashboard,
});

const privacySettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy-settings",
  component: PrivacySettingsPage,
});

const geminiInterviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gemini-interview",
  component: GeminiInterviewSetup,
});

const geminiInterviewSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gemini-interview/session",
  component: GeminiInterviewSession,
});

const geminiInterviewResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gemini-interview/results",
  component: GeminiInterviewResults,
});

const voiceInterviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/voice-interview",
  component: VoiceInterviewPage,
});

const panelInterviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/panel-interview",
  component: PanelInterviewPage,
});

const aiInterviewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-interviewer",
  component: AIInterviewerSetup,
});

const aiInterviewerSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-interviewer/session",
  component: AIInterviewerSession,
});

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faq",
  component: FAQPage,
});

// Router
const routeTree = rootRoute.addChildren([
  landingRoute,
  authRoute,
  onboardingRoute,
  candidateRoute,
  mockInterviewNewRoute,
  sessionRoute,
  sessionReportRoute,
  evaluatorRoute,
  recruiterRoute,
  questionsRoute,
  interviewAnswersRoute,
  adminRoute,
  adminDashboardRoute,
  admissionsRoute,
  assessmentRoute,
  assessmentResultsRoute,
  adaptiveAssessmentRoute,
  adaptiveSessionRoute,
  candidateReportRoute,
  studentDashboardRoute,
  privacySettingsRoute,
  geminiInterviewRoute,
  geminiInterviewSessionRoute,
  geminiInterviewResultsRoute,
  voiceInterviewRoute,
  panelInterviewRoute,
  aiInterviewerRoute,
  aiInterviewerSessionRoute,
  faqRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
