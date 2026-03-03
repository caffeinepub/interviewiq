import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminPage } from "./pages/AdminPage";
import { AdmissionsPortal } from "./pages/AdmissionsPortal";
import { AssessmentPage } from "./pages/AssessmentPage";
import { AssessmentReport } from "./pages/AssessmentReport";
import { AssessmentResults } from "./pages/AssessmentResults";
import { CandidateDashboard } from "./pages/CandidateDashboard";
import { EvaluatorDashboard } from "./pages/EvaluatorDashboard";
import { InterviewAnswers } from "./pages/InterviewAnswers";
import { InterviewSession } from "./pages/InterviewSession";
import { LandingPage } from "./pages/LandingPage";
import { MockInterviewSetup } from "./pages/MockInterviewSetup";
import { OnboardingPage } from "./pages/OnboardingPage";
import { QuestionBank } from "./pages/QuestionBank";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

// Routes
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
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

// Router
const routeTree = rootRoute.addChildren([
  landingRoute,
  onboardingRoute,
  candidateRoute,
  mockInterviewNewRoute,
  sessionRoute,
  sessionReportRoute,
  evaluatorRoute,
  questionsRoute,
  interviewAnswersRoute,
  adminRoute,
  adminDashboardRoute,
  admissionsRoute,
  assessmentRoute,
  assessmentResultsRoute,
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
