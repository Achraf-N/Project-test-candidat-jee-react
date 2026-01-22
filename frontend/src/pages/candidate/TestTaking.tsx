import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, AlertTriangle, CheckCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { useTestStore } from "@/store/testStore";
import { candidateApi } from "@/services/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function TestTaking() {
  const navigate = useNavigate();
  const { candidateSession, isAuthenticated, role } = useAuthStore();
  const {
    questions,
    currentQuestionIndex,
    answers,
    timeRemaining,
    isSubmitting,
    setCurrentQuestion,
    setAnswer,
    decrementTime,
    setSubmitting,
    getAnswersArray,
    isQuestionAnswered,
    getAnsweredCount,
  } = useTestStore();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || role !== "candidate") {
      navigate("/candidate-login");
      return;
    }

    if (!questions || questions.length === 0) {
      navigate("/candidate-login");
      return;
    }
  }, [isAuthenticated, role, questions, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const interval = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, decrementTime]);

  // Show warning at 5 minutes
  useEffect(() => {
    if (timeRemaining === 300 && !showTimeWarning) {
      setShowTimeWarning(true);
      toast.warning("5 minutes remaining!");
    }
  }, [timeRemaining, showTimeWarning]);

  // Auto-save to localStorage
  useEffect(() => {
    const savedAnswers = Array.from(answers.entries());
    localStorage.setItem("testAnswers", JSON.stringify(savedAnswers));
  }, [answers]);

  // Prevent page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined;

  // Debug logging to help identify question type issues
  useEffect(() => {
    if (currentQuestion) {
      console.log('Current Question:', {
        id: currentQuestion.id,
        type: currentQuestion.questionType,
        hasAnswers: !!currentQuestion.answers,
        answersCount: currentQuestion.answers?.length || 0
      });
    }
  }, [currentQuestion]);

  // Keyboard navigation
  useEffect(() => {
    if (!currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with text input
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      // Arrow keys for navigation
      if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight" && currentQuestionIndex < questions.length - 1) {
        e.preventDefault();
        handleNext();
      }

      // Number keys to select answers (1-4) - but only for non-open questions
      const isOpenQuestion = currentQuestion.questionType?.toUpperCase() === "OPEN_QUESTION" ||
                            currentQuestion.questionType?.toUpperCase().includes("OPEN") ||
                            (!currentQuestion.answers || currentQuestion.answers.length === 0);

      if (!isOpenQuestion) {
        const numKey = parseInt(e.key);
        if (numKey >= 1 && numKey <= (currentQuestion.answers?.length || 0)) {
          e.preventDefault();
          const answer = currentQuestion.answers?.[numKey - 1];
          if (answer) {
            handleAnswerChange(answer.id.toString());
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestionIndex, currentQuestion, questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = useCallback(
    (value: string) => {
      if (!currentQuestion) return;

      // Check if it's an open question (case-insensitive and fallback to checking if no answers array)
      const isOpenQuestion = currentQuestion.questionType?.toUpperCase() === "OPEN_QUESTION" ||
                            currentQuestion.questionType?.toUpperCase().includes("OPEN") ||
                            (!currentQuestion.answers || currentQuestion.answers.length === 0);

      if (isOpenQuestion) {
        setAnswer(currentQuestion.id, {
          questionId: currentQuestion.id,
          selectedAnswerId: null,
          openAnswerText: value,
        });
      } else {
        setAnswer(currentQuestion.id, {
          questionId: currentQuestion.id,
          selectedAnswerId: parseInt(value),
          openAnswerText: null,
        });
      }
    },
    [currentQuestion, setAnswer]
  );

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
    }
  };

  const handleAutoSubmit = async () => {
    toast.error("Time's up! Submitting your test...");
    await submitTest();
  };

  const handleSubmitClick = () => {
    const answeredCount = getAnsweredCount();
    if (answeredCount < questions.length) {
      toast.warning(
        `You have ${questions.length - answeredCount} unanswered questions. Are you sure you want to submit?`
      );
    }
    setShowSubmitDialog(true);
  };

  const submitTest = async () => {
    setSubmitting(true);
    try {
      const answersArray = getAnswersArray();
      await candidateApi.submitTest({ answers: answersArray });
      
      toast.success("Test submitted successfully!");
      localStorage.removeItem("testAnswers");
      navigate("/candidate/results");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to submit test. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  const progressPercentage = (getAnsweredCount() / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <CandidateLayout testName={candidateSession?.testName}>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]" role="main" aria-label="Test taking interface">
        {/* Header */}
        <div className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground" aria-live="polite">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden"
                aria-label="Toggle questions sidebar"
              >
                Questions
              </Button>
              <div
                className={cn(
                  "flex items-center gap-2 font-mono text-lg font-bold",
                  timeRemaining < 300 && "text-destructive"
                )}
                role="timer"
                aria-live="polite"
                aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
              >
                <Clock className="h-5 w-5" aria-hidden="true" />
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              {/* Question */}
              <div className="bg-card rounded-lg border p-6 shadow-sm" role="article" aria-labelledby="question-title">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-full",
                        (currentQuestion.questionType?.toUpperCase() === "OPEN_QUESTION" ||
                         currentQuestion.questionType?.toUpperCase().includes("OPEN") ||
                         (!currentQuestion.answers || currentQuestion.answers.length === 0))
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : currentQuestion.questionType?.toUpperCase().includes("TRUE") || currentQuestion.questionType?.toUpperCase().includes("FALSE")
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      )}>
                        {(currentQuestion.questionType?.toUpperCase() === "OPEN_QUESTION" ||
                          currentQuestion.questionType?.toUpperCase().includes("OPEN") ||
                          (!currentQuestion.answers || currentQuestion.answers.length === 0))
                          ? "Open Question"
                          : currentQuestion.questionType?.toUpperCase().includes("TRUE") || currentQuestion.questionType?.toUpperCase().includes("FALSE")
                          ? "True/False"
                          : "Multiple Choice"}
                      </span>
                    </div>
                    <h2 id="question-title" className="text-xl font-semibold">{currentQuestion.label}</h2>
                  </div>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap ml-4" aria-label={`${currentQuestion.points} points`}>
                    {currentQuestion.points} pts
                  </span>
                </div>

                {currentQuestion.hint && (
                  <details className="mb-6">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      💡 Show hint
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground pl-4 border-l-2 border-muted">
                      {currentQuestion.hint}
                    </p>
                  </details>
                )}

                {/* Answer Options */}
                <div className="mt-6">
                  {(currentQuestion.questionType?.toUpperCase() === "OPEN_QUESTION" ||
                    currentQuestion.questionType?.toUpperCase().includes("OPEN") ||
                    (!currentQuestion.answers || currentQuestion.answers.length === 0)) ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="openAnswer" className="text-base font-medium">
                          Your Answer:
                        </Label>
                        <span className="text-xs text-muted-foreground" aria-live="polite">
                          {currentAnswer?.openAnswerText?.length || 0} characters
                        </span>
                      </div>
                      <div className="relative">
                        <Textarea
                          id="openAnswer"
                          placeholder="Type your detailed answer here... Be clear and concise."
                          value={currentAnswer?.openAnswerText || ""}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          rows={12}
                          className="resize-y min-h-[200px] max-h-[500px] focus:ring-2 focus:ring-primary/20 border-2"
                          aria-label="Open answer text area"
                          aria-required="true"
                          aria-describedby="answer-help"
                        />
                      </div>
                      <p id="answer-help" className="text-sm text-muted-foreground">
                        💡 Tip: Include key concepts and explain your reasoning clearly.
                      </p>
                      {currentAnswer?.openAnswerText && currentAnswer.openAnswerText.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-success">
                          <CheckCircle className="h-4 w-4" />
                          <span>Answer saved</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <RadioGroup
                      value={currentAnswer?.selectedAnswerId?.toString() || ""}
                      onValueChange={handleAnswerChange}
                      aria-label="Answer choices"
                      aria-required="true"
                    >
                      <div className="space-y-3" role="radiogroup">
                        {currentQuestion.answers?.map((answer, index) => (
                          <div
                            key={answer.id}
                            className={cn(
                              "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                              currentAnswer?.selectedAnswerId === answer.id
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            )}
                          >
                            <RadioGroupItem 
                              value={answer.id.toString()} 
                              id={`answer-${answer.id}`}
                              aria-label={`Option ${index + 1}: ${answer.label}`}
                            />
                            <Label
                              htmlFor={`answer-${answer.id}`}
                              className="flex-1 cursor-pointer font-normal"
                            >
                              {answer.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Questions Navigator */}
          <div
            className={cn(
              "lg:block border-l bg-muted/30 w-64 overflow-y-auto",
              showSidebar ? "block absolute right-0 top-0 bottom-0 z-10 shadow-lg" : "hidden"
            )}
            role="navigation"
            aria-label="Question navigation"
          >
            <div className="p-4 sticky top-0 bg-background border-b">
              <h3 className="font-semibold mb-2">All Questions</h3>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {getAnsweredCount()} / {questions.length} answered
              </p>
            </div>
            <div className="p-4 space-y-2">
              {questions.map((q, index) => {
                const answered = isQuestionAnswered(q.id);
                const isCurrent = index === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestion(index);
                      setShowSidebar(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : answered
                        ? "bg-success/10 hover:bg-success/20"
                        : "bg-muted hover:bg-muted/80"
                    )}
                    aria-label={`Go to question ${index + 1}, ${answered ? "answered" : "not answered"}`}
                    aria-current={isCurrent ? "true" : "false"}
                  >
                    {answered ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">Question {index + 1}</div>
                      <div className="text-xs opacity-80 truncate">{q.questionType}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer - Navigation & Progress */}
        <div className="bg-card border-t px-6 py-4" role="navigation" aria-label="Test navigation">
          <div className="max-w-5xl mx-auto">
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                <span>Progress</span>
                <span aria-live="polite">{Math.round(progressPercentage)}% complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" aria-label={`Progress: ${Math.round(progressPercentage)}% complete`} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                aria-label="Go to previous question"
              >
                <ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Previous
              </Button>

              <div className="flex gap-2">
                {isLastQuestion || getAnsweredCount() === questions.length ? (
                  <Button 
                    onClick={handleSubmitClick} 
                    disabled={isSubmitting} 
                    className="min-w-32"
                    aria-label="Submit test"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Test"}
                  </Button>
                ) : (
                  <Button onClick={handleNext} variant="default" aria-label="Go to next question">
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? You cannot change your answers after
              submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitTest} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Warning Dialog */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Time Warning
            </DialogTitle>
            <DialogDescription>
              You have 5 minutes remaining to complete your test!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowTimeWarning(false)}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CandidateLayout>
  );
}
