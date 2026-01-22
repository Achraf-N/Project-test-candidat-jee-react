import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { questionApi, type QuestionCreateRequest } from "@/services/api";
import { toast } from "sonner";

const questionSchema = z.object({
  label: z.string().min(10, "La question doit contenir au moins 10 caractères"),
  hint: z.string().optional(),
  points: z.number().min(1).max(100),
  questionType: z.enum(["QCM", "TRUE_OR_FALSE", "OPEN_QUESTION"]),
});

type QuestionForm = z.infer<typeof questionSchema>;

export default function CreateQuestion() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState([
    { label: "", correct: false },
    { label: "", correct: false },
  ]);
  const [correctTFAnswer, setCorrectTFAnswer] = useState<"true" | "false">(
    "true",
  );
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [keywords, setKeywords] = useState<string[]>([""]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: { questionType: "QCM", points: 10 },
  });

  const questionType = watch("questionType");

  const createMutation = useMutation({
    mutationFn: async (data: QuestionForm) => {
      const request: QuestionCreateRequest = {
        label: data.label,
        hint: data.hint,
        points: data.points,
        questionType: data.questionType,
      };

      if (data.questionType === "QCM") {
        request.answers = answers
          .filter((a) => a.label.trim())
          .map((a) => ({ label: a.label, correct: a.correct }));
      } else if (data.questionType === "TRUE_OR_FALSE") {
        request.answers = [
          { label: "True", correct: correctTFAnswer === "true" },
          { label: "False", correct: correctTFAnswer === "false" },
        ];
      } else {
        request.openAnswers = {
          expectedAnswer,
          keyWords: keywords
            .filter((k) => k.trim())
            .map((k) => ({ keyword: k })),
        };
      }

      return questionApi.create(request);
    },
    onSuccess: () => {
      toast.success("Question créée !");
      navigate("/questions");
    },
    onError: (err: any) =>
      toast.error(
        err.response?.data?.message || "Échec de création de la question",
      ),
  });

  const updateAnswer = (
    index: number,
    field: "label" | "correct",
    value: string | boolean,
  ) => {
    setAnswers((prev) =>
      prev.map((a, i) =>
        i === index
          ? {
              ...a,
              [field]: value,
              ...(field === "correct" && value ? {} : {}),
            }
          : field === "correct" && value
            ? { ...a, correct: false }
            : a,
      ),
    );
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Créer une question"
        breadcrumbs={[
          { label: "Questions", path: "/questions" },
          { label: "Créer" },
        ]}
      />

      <form
        onSubmit={handleSubmit((d) => createMutation.mutate(d))}
        className="max-w-2xl space-y-6"
      >
        <div className="bg-card rounded-lg border p-6 space-y-6">
          <div className="space-y-2">
            <Label>Type de question</Label>
            <RadioGroup
              value={questionType}
              onValueChange={(v: "QCM" | "TRUE_OR_FALSE" | "OPEN_QUESTION") => {
                setValue("questionType", v);
                // Reset state when changing question type
                if (v === "QCM") {
                  setAnswers([
                    { label: "", correct: false },
                    { label: "", correct: false },
                  ]);
                } else if (v === "TRUE_OR_FALSE") {
                  setCorrectTFAnswer("true");
                } else if (v === "OPEN_QUESTION") {
                  setExpectedAnswer("");
                  setKeywords([""]);
                }
              }}
              className="flex gap-4"
            >
              {[
                ["QCM", "Choix multiple"],
                ["TRUE_OR_FALSE", "Vrai/Faux"],
                ["OPEN_QUESTION", "Question ouverte"],
              ].map(([v, l]) => (
                <div key={v} className="flex items-center space-x-2">
                  <RadioGroupItem value={v} id={v} />
                  <Label htmlFor={v}>{l}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Question</Label>
            <Textarea
              id="label"
              placeholder="Entrez votre question..."
              {...register("label")}
              className={errors.label ? "border-destructive" : ""}
            />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hint">Indice (optionnel)</Label>
              <Input
                id="hint"
                placeholder="Fournir un indice..."
                {...register("hint")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                {...register("points", { valueAsNumber: true })}
                className="max-w-24"
              />
            </div>
          </div>

          {questionType === "QCM" && (
            <div className="space-y-3">
              <Label>Réponses (marquez-en une comme correcte)</Label>
              {answers.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={a.correct}
                    onChange={() => updateAnswer(i, "correct", true)}
                  />
                  <Input
                    value={a.label}
                    onChange={(e) => updateAnswer(i, "label", e.target.value)}
                    placeholder={`Réponse ${i + 1}`}
                    className="flex-1"
                  />
                  {answers.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setAnswers(answers.filter((_, j) => j !== i))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setAnswers([...answers, { label: "", correct: false }])
                }
              >
                <Plus className="h-4 w-4" />
                Ajouter une réponse
              </Button>
            </div>
          )}

          {questionType === "TRUE_OR_FALSE" && (
            <div className="space-y-2">
              <Label>Réponse correcte</Label>
              <RadioGroup
                value={correctTFAnswer}
                onValueChange={(v: any) => setCorrectTFAnswer(v)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">Vrai</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">Faux</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {questionType === "OPEN_QUESTION" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Réponse attendue (pour la notation IA)</Label>
                <Textarea
                  value={expectedAnswer}
                  onChange={(e) => setExpectedAnswer(e.target.value)}
                  placeholder="Entrez la réponse modèle..."
                />
              </div>
              <div className="space-y-2">
                <Label>Mots-clés</Label>
                {keywords.map((k, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={k}
                      onChange={(e) =>
                        setKeywords(
                          keywords.map((kw, j) =>
                            j === i ? e.target.value : kw,
                          ),
                        )
                      }
                      placeholder="Mot-clé"
                    />
                    {keywords.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setKeywords(keywords.filter((_, j) => j !== i))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setKeywords([...keywords, ""])}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un mot-clé
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/questions")}
          >
            Annuler
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Créer la question
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
