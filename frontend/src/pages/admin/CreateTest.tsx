import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, X, GripVertical, HelpCircle } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge, getStatusVariant, getQuestionTypeLabel } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { questionApi, testApi, type QuestionResponse } from "@/services/api";
import { toast } from "sonner";

const createTestSchema = z.object({
  name: z.string().min(3, "Le nom du test doit contenir au moins 3 caractères"),
  duration_minute: z.number().min(5, "La durée doit être d'au moins 5 minutes").max(300, "La durée ne peut pas dépasser 300 minutes"),
});

type CreateTestForm = z.infer<typeof createTestSchema>;

interface SelectedQuestion extends QuestionResponse {
  position: number;
}

export default function CreateTest() {
  const navigate = useNavigate();
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTestForm>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      duration_minute: 60,
    },
  });

  const { data: allQuestions, isLoading: questionsLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await questionApi.getAll();
      return response.data;
    },
  });

  const createTestMutation = useMutation({
    mutationFn: async (data: CreateTestForm) => {
      const response = await testApi.create({
        name: data.name,
        duration_minute: data.duration_minute,
        questions: selectedQuestions.map((q) => ({
          id: q.id,
        })),
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Test créé avec succès !");
      navigate("/tests");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Échec de création du test");
    },
  });

  const onSubmit = (data: CreateTestForm) => {
    if (selectedQuestions.length === 0) {
      toast.error("Veuillez ajouter au moins une question au test");
      return;
    }
    createTestMutation.mutate(data);
  };

  const toggleQuestionSelection = (question: QuestionResponse) => {
    setSelectedQuestions((prev) => {
      const exists = prev.find((q) => q.id === question.id);
      if (exists) {
        return prev.filter((q) => q.id !== question.id).map((q, i) => ({ ...q, position: i + 1 }));
      }
      return [...prev, { ...question, position: prev.length + 1 }];
    });
  };

  const removeQuestion = (questionId: number) => {
    setSelectedQuestions((prev) =>
      prev.filter((q) => q.id !== questionId).map((q, i) => ({ ...q, position: i + 1 }))
    );
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selectedQuestions.length) return;
    
    setSelectedQuestions((prev) => {
      const newList = [...prev];
      const [removed] = newList.splice(fromIndex, 1);
      newList.splice(toIndex, 0, removed);
      return newList.map((q, i) => ({ ...q, position: i + 1 }));
    });
  };

  const filteredQuestions = allQuestions?.filter(
    (q) =>
      q.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedQuestions.find((sq) => sq.id === q.id)
  );

  const totalPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0);

  return (
    <AdminLayout>
      <PageHeader
        title="Créer un nouveau test"
        breadcrumbs={[
          { label: "Tests", path: "/tests" },
          { label: "Créer" },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        <div className="bg-card rounded-lg border p-6 space-y-6">
          {/* Test Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du test</Label>
            <Input
              id="name"
              placeholder="ex : Évaluation des fondamentaux Java"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Durée (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="60"
              {...register("duration_minute", { valueAsNumber: true })}
              className={`max-w-32 ${errors.duration_minute ? "border-destructive" : ""}`}
            />
            {errors.duration_minute && (
              <p className="text-sm text-destructive">{errors.duration_minute.message}</p>
            )}
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Questions</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedQuestions.length} questions • {totalPoints} points au total
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => setShowQuestionSelector(true)}>
                <Plus className="h-4 w-4" />
                Ajouter des questions
              </Button>
            </div>

            {selectedQuestions.length > 0 ? (
              <div className="space-y-2">
                {selectedQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 border"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, index - 1)}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, index + 1)}
                        disabled={index === selectedQuestions.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {question.position}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{question.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge variant={getStatusVariant(question.types)}>
                          {getQuestionTypeLabel(question.types)}
                        </StatusBadge>
                        <span className="text-xs text-muted-foreground">{question.points} pts</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucune question ajoutée pour le moment. Cliquez sur "Ajouter des questions" pour sélectionner depuis votre banque de questions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/tests")}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={selectedQuestions.length === 0}
            loading={createTestMutation.isPending}
          >
            Créer le test
          </Button>
        </div>
      </form>

      {/* Question Selector Dialog */}
      <Dialog open={showQuestionSelector} onOpenChange={setShowQuestionSelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Sélectionner des questions</DialogTitle>
            <DialogDescription>
              Choisissez des questions depuis votre banque de questions pour les ajouter à ce test.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Rechercher des questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
            {questionsLoading ? (
              <p className="text-center text-muted-foreground py-8">Chargement des questions...</p>
            ) : filteredQuestions && filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => {
                const isSelected = selectedQuestions.some((q) => q.id === question.id);
                return (
                  <div
                    key={question.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted/30"
                    }`}
                    onClick={() => toggleQuestionSelection(question)}
                  >
                    <Checkbox checked={isSelected} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{question.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge variant={getStatusVariant(question.types)}>
                          {getQuestionTypeLabel(question.types)}
                        </StatusBadge>
                        <span className="text-xs text-muted-foreground">{question.points} pts</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="Aucune question disponible"
                description={
                  allQuestions && allQuestions.length > 0
                    ? "Toutes les questions ont été ajoutées à ce test."
                    : "Créez d'abord des questions dans la banque de questions."
                }
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionSelector(false)}>
              Terminé ({selectedQuestions.length} sélectionnée(s))
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
