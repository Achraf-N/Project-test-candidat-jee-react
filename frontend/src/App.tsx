import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CandidateLogin from "./pages/auth/CandidateLogin";
import Dashboard from "./pages/admin/Dashboard";
import TestsList from "./pages/admin/TestsList";
import TestDetails from "./pages/admin/TestDetails";
import CreateTest from "./pages/admin/CreateTest";
import TestSessions from "./pages/admin/TestSessions";
import QuestionBank from "./pages/admin/QuestionBank";
import CreateQuestion from "./pages/admin/CreateQuestion";
import SendInvitations from "./pages/admin/SendInvitations";
import TestInfo from "./pages/candidate/TestInfo";
import TestTaking from "./pages/candidate/TestTaking";
import Results from "./pages/candidate/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route wrapper
function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: "admin" | "candidate" }) {
  const { isAuthenticated, role: userRole } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && userRole !== role) {
    return <Navigate to={userRole === "admin" ? "/dashboard" : "/candidate/test"} replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/candidate-login" element={<CandidateLogin />} />
          
          {/* Admin Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/tests" element={<ProtectedRoute role="admin"><TestsList /></ProtectedRoute>} />
          <Route path="/tests/create" element={<ProtectedRoute role="admin"><CreateTest /></ProtectedRoute>} />
          <Route path="/tests/:testId" element={<ProtectedRoute role="admin"><TestDetails /></ProtectedRoute>} />
          <Route path="/tests/:testId/sessions" element={<ProtectedRoute role="admin"><TestSessions /></ProtectedRoute>} />
          <Route path="/questions" element={<ProtectedRoute role="admin"><QuestionBank /></ProtectedRoute>} />
          <Route path="/questions/create" element={<ProtectedRoute role="admin"><CreateQuestion /></ProtectedRoute>} />
          <Route path="/invitations/send" element={<ProtectedRoute role="admin"><SendInvitations /></ProtectedRoute>} />
          
          {/* Candidate Protected Routes */}
          <Route path="/candidate/test-info" element={<ProtectedRoute role="candidate"><TestInfo /></ProtectedRoute>} />
          <Route path="/candidate/test" element={<ProtectedRoute role="candidate"><TestTaking /></ProtectedRoute>} />
          <Route path="/candidate/results" element={<ProtectedRoute role="candidate"><Results /></ProtectedRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
