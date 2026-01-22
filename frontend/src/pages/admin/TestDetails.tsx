import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock, HelpCircle, Send, Users, ChevronDown, ChevronUp } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge, getStatusVariant, getQuestionTypeLabel } from "@/components/common/StatusBadge";
import { CardSkeleton, TableSkeleton } from "@/components/common/SkeletonLoader";
import { EmptyState } from "@/components/common/EmptyState";
import { testApi } from "@/services/api";
import { useState } from "react";

export default function TestDetails() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const response = await testApi.getAll();
      return response.data;
    },
  });

  const test = tests?.find((t) => t.id === Number(testId));

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["testQuestions", testId],
    queryFn: async () => {
      const response = await testApi.getQuestions(Number(testId));
      return response.data;
    },
    enabled: !!testId,
  });

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

  const totalPoints = questions?.reduce((sum, q) => sum + q.points, 0) || 0;

  if (testsLoading) {
    return (
      <AdminLayout>
        <CardSkeleton />
      </AdminLayout>
    );
  }

  if (!test) {
    return (
      <AdminLayout>
        <EmptyState
          title="Test not found"
          description="The test you're looking for doesn't exist or has been deleted."
          actionLabel="Back to Tests"
          onAction={() => navigate("/tests")}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader
        title={test.name}
        breadcrumbs={[
          { label: "Tests", path: "/tests" },
          { label: test.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/tests/${testId}/sessions`)}>
              <Users className="h-4 w-4" />
              View Sessions
            </Button>
            <Button onClick={() => navigate(`/invitations/send?testId=${testId}`)}>
              <Send className="h-4 w-4" />
              Send Invitations
            </Button>
          </div>
        }
      />

      {/* Test Info Card */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="flex items-center gap-2 font-medium mt-1">
              <Clock className="h-4 w-4 text-primary" />
              {test.durationMinute} minutes
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Questions</p>
            <p className="flex items-center gap-2 font-medium mt-1">
              <HelpCircle className="h-4 w-4 text-primary" />
              {questions?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="font-medium mt-1">{totalPoints}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-1 flex gap-2">
              <StatusBadge variant={test.isActive ? "success" : "default"}>
                {test.isActive ? "Active" : "Inactive"}
              </StatusBadge>
              <StatusBadge variant={test.isPublic ? "info" : "default"}>
                {test.isPublic ? "Public" : "Private"}
              </StatusBadge>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Questions ({questions?.length || 0})
        </h2>

        {questionsLoading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : questions && questions.length > 0 ? (
          <div className="space-y-3">
            {questions
              .sort((a, b) => a.position - b.position)
              .map((question) => {
                const isExpanded = expandedQuestions.has(question.id);
                return (
                  <div
                    key={question.id}
                    className="bg-card rounded-lg border overflow-hidden"
                  >
                    <button
                      onClick={() => toggleQuestion(question.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {question.position}
                        </span>
                        <div>
                          <p className="font-medium line-clamp-1">{question.label}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge variant={getStatusVariant(question.types)}>
                              {getQuestionTypeLabel(question.types)}
                            </StatusBadge>
                            <span className="text-sm text-muted-foreground">
                              {question.points} pts
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && question.answers && (
                      <div className="border-t p-4 bg-muted/20">
                        {question.hint && (
                          <p className="text-sm text-muted-foreground mb-3">
                            💡 Hint: {question.hint}
                          </p>
                        )}
                        <p className="text-sm font-medium mb-2">Answers:</p>
                        <ul className="space-y-2">
                          {question.answers.map((answer) => (
                            <li
                              key={answer.id}
                              className={`flex items-center gap-2 text-sm ${
                                answer.correct
                                  ? "text-success font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {answer.correct ? "✓" : "○"} {answer.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <EmptyState
            icon={<HelpCircle className="h-12 w-12" />}
            title="No questions in this test"
            description="Add questions to this test to start assessing candidates."
          />
        )}
      </div>
    </AdminLayout>
  );
}
