import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus, Search, Eye, Users, Send } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/SkeletonLoader";
import { EmptyState } from "@/components/common/EmptyState";
import { testApi } from "@/services/api";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TestsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tests, isLoading } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const response = await testApi.getAll();
      return response.data;
    },
  });

  const filteredTests = tests?.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && test.isActive) ||
      (statusFilter === "inactive" && !test.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Mes tests"
        description="Voir et gérer tous vos tests"
        breadcrumbs={[{ label: "Tests" }]}
        actions={
          <Button onClick={() => navigate("/tests/create")}>
            <Plus className="h-4 w-4" />
            Créer un nouveau test
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les tests</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tests Table */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : filteredTests && filteredTests.length > 0 ? (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Nom du test
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Durée
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Statut
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Visibilité
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr
                  key={test.id}
                  className="border-t hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{test.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{test.durationMinute} min</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge variant={test.isActive ? "success" : "default"}>
                      {test.isActive ? "Actif" : "Inactif"}
                    </StatusBadge>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge variant={test.isPublic ? "info" : "default"}>
                      {test.isPublic ? "Public" : "Privé"}
                    </StatusBadge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/tests/${test.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/tests/${test.id}/sessions`)}
                      >
                        <Users className="h-4 w-4" />
                        Sessions
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/invitations/send?testId=${test.id}`)}
                      >
                        <Send className="h-4 w-4" />
                        Inviter
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Aucun test créé pour le moment"
          description="Créez votre premier test pour commencer à évaluer les candidats."
          actionLabel="Créer votre premier test"
          onAction={() => navigate("/tests/create")}
        />
      )}
    </AdminLayout>
  );
}
