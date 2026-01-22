import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Plus, Search } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, getStatusVariant, getQuestionTypeLabel } from "@/components/common/StatusBadge";
import { CardSkeleton } from "@/components/common/SkeletonLoader";
import { EmptyState } from "@/components/common/EmptyState";
import { questionApi } from "@/services/api";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QuestionBank() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await questionApi.getAll();
      return response.data;
    },
  });

  const filteredQuestions = questions?.filter((q) => {
    const matchesSearch = q.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || q.types.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Banque de questions"
        description="Gérer votre bibliothèque de questions"
        breadcrumbs={[{ label: "Questions" }]}
        actions={
          <Button onClick={() => navigate("/questions/create")}>
            <Plus className="h-4 w-4" />
            Créer une question
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher des questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="qcm">Choix multiple</SelectItem>
            <SelectItem value="true">Vrai/Faux</SelectItem>
            <SelectItem value="open">Question ouverte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (<CardSkeleton key={i} />))}
        </div>
      ) : filteredQuestions && filteredQuestions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="bg-card rounded-lg border p-4 card-hover">
              <div className="flex items-start justify-between mb-3">
                <StatusBadge variant={getStatusVariant(question.types)}>{getQuestionTypeLabel(question.types)}</StatusBadge>
                <span className="text-sm font-medium text-primary">{question.points} pts</span>
              </div>
              <p className="text-sm font-medium line-clamp-2 mb-2">{question.label}</p>
              {question.hint && <p className="text-xs text-muted-foreground line-clamp-1">💡 {question.hint}</p>}
              {question.answers && (
                <p className="text-xs text-muted-foreground mt-2">{question.answers.length} réponses</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<HelpCircle className="h-12 w-12" />} title="Aucune question pour le moment" description="Créez des questions pour construire votre banque de questions." actionLabel="Créer votre première question" onAction={() => navigate("/questions/create")} />
      )}
    </AdminLayout>
  );
}
