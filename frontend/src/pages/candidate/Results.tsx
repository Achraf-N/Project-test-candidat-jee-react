import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Trophy, Clock, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { candidateApi, authApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CardSkeleton } from "@/components/common/SkeletonLoader";

export default function Results() {
  const navigate = useNavigate();
  const { candidateSession, isAuthenticated, role, logout } = useAuthStore();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const { data: results, isLoading } = useQuery({
    queryKey: ["candidateResults"],
    queryFn: async () => {
      const response = await candidateApi.getResults();
      return response.data;
    },
    retry: 1,
  });

  useEffect(() => {
    if (!isAuthenticated || role !== "candidate") {
      navigate("/candidate-login");
      return;
    }
  }, [isAuthenticated, role, navigate]);

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore errors
    }
    logout();
    toast.success("Logged out successfully");
    navigate("/candidate-login");
  };

  if (isLoading) {
    return (
      <CandidateLayout testName={candidateSession?.testName}>
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </CandidateLayout>
    );
  }

  if (!results) {
    return (
      <CandidateLayout testName={candidateSession?.testName}>
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-card rounded-lg border p-12 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Results Available</h2>
            <p className="text-muted-foreground mb-6">
              Please complete the test first to view your results.
            </p>
            <Button onClick={() => navigate("/candidate/test")}>Go to Test</Button>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  const scorePercentage = results.scorePercentage || 0;
  const isPassed = scorePercentage >= 60; // Assuming 60% is passing

  return (
    <CandidateLayout testName={candidateSession?.testName}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-background rounded-lg border p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <Trophy
              className={cn(
                "h-16 w-16 mx-auto mb-4",
                isPassed ? "text-success" : "text-muted-foreground"
              )}
            />
            <h1 className="text-3xl font-bold mb-2">Your Test Results</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Test Completed</span>
            </div>

            <div className="max-w-md mx-auto bg-card rounded-lg border p-6 shadow-lg">
              <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {scorePercentage.toFixed(1)}%
              </div>
              <div className="text-lg text-muted-foreground mb-4">
                {results.totalScoreFraction || `${results.totalScore}/${results.totalPossiblePoints}`}
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                  isPassed
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-warning/10 text-warning border border-warning/20"
                )}
              >
                {isPassed ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Passed
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Needs Improvement
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Questions</div>
            <div className="text-2xl font-bold">{results.totalQuestions}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground mb-1">Answered</div>
            <div className="text-2xl font-bold">{results.answeredQuestions}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground mb-1">Points Earned</div>
            <div className="text-2xl font-bold">
              {results.totalScore.toFixed(1)} / {results.totalPossiblePoints.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Question Results */}
        <div className="bg-card rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Question-by-Question Breakdown</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Review your answers and see where you can improve
            </p>
          </div>

          <div className="divide-y">
            {results.questionResults?.map((result, index) => {
              const isExpanded = expandedQuestions.has(result.questionId);
              const isCorrect = result.isCorrect !== false; // For open questions, isCorrect can be null

              return (
                <div key={result.questionId} className="p-6">
                  <button
                    onClick={() => toggleQuestion(result.questionId)}
                    className="w-full flex items-start gap-4 text-left group"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                        isCorrect
                          ? "bg-success/10 text-success group-hover:bg-success/20"
                          : "bg-destructive/10 text-destructive group-hover:bg-destructive/20"
                      )}
                    >
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="font-medium mb-1">
                            Question {index + 1}: {result.questionLabel}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted">
                              {result.questionType}
                            </span>
                            <span className="font-medium">{result.scoreFraction}</span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 ml-14 space-y-3">
                      {result.candidateAnswer && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            Your Answer:
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            {result.candidateAnswer}
                          </div>
                        </div>
                      )}

                      {result.correctAnswer && result.questionType !== "OPEN_QUESTION" && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            Correct Answer:
                          </div>
                          <div className="bg-success/5 border border-success/20 rounded-lg p-3 text-success">
                            {result.correctAnswer}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">Points Earned: </span>
                          <span className="font-medium">
                            {result.pointsEarned.toFixed(1)} / {result.maxPoints.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </CandidateLayout>
  );
}
