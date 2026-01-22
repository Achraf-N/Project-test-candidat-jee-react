import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  HelpCircle, 
  Users, 
  CheckCircle, 
  Plus, 
  Send,
  ArrowRight,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { StatusBadge, getStatusVariant } from "@/components/common/StatusBadge";
import { StatCardSkeleton, TableSkeleton } from "@/components/common/SkeletonLoader";
import { EmptyState } from "@/components/common/EmptyState";
import { testApi } from "@/services/api";
import type { TestResponse, TestSessionResponse } from "@/services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const response = await testApi.getAll();
      return response.data;
    },
  });

  // Fetch sessions for recent activity
  const { data: allSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["allSessions", tests],
    queryFn: async () => {
      if (!tests || tests.length === 0) return [];
      
      const sessionsPromises = tests.slice(0, 5).map((test) =>
        testApi.getSessions(test.id).then((res) => res.data)
      );
      
      const sessions = await Promise.all(sessionsPromises);
      return sessions.flat().sort((a, b) => {
        const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return dateB - dateA;
      }).slice(0, 10);
    },
    enabled: !!tests && tests.length > 0,
  });

  // Calculate stats
  const totalTests = tests?.length || 0;
  const activeTests = tests?.filter((t) => t.isActive).length || 0;
  const totalSessions = allSessions?.length || 0;
  const completedSessions = allSessions?.filter((s) => s.status === "FINISHED").length || 0;

  return (
    <AdminLayout>
      <PageHeader
        title="Tableau de bord"
        description="Aperçu de vos activités de gestion de tests"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {testsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total des tests"
              value={totalTests}
              icon={FileText}
              accentColor="primary"
            />
            <StatCard
              title="Tests actifs"
              value={activeTests}
              icon={CheckCircle}
              accentColor="success"
            />
            <StatCard
              title="Total des invitations"
              value={totalSessions}
              icon={Users}
              accentColor="info"
            />
            <StatCard
              title="Sessions terminées"
              value={completedSessions}
              icon={CheckCircle}
              accentColor="success"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 card-hover"
            onClick={() => navigate("/tests/create")}
          >
            <Plus className="h-6 w-6 text-primary" />
            <span>Créer un nouveau test</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 card-hover"
            onClick={() => navigate("/questions/create")}
          >
            <HelpCircle className="h-6 w-6 text-primary" />
            <span>Créer une question</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 card-hover"
            onClick={() => navigate("/invitations/send")}
          >
            <Send className="h-6 w-6 text-primary" />
            <span>Envoyer des invitations</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Activité récente</h2>
          {tests && tests.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/tests")}>
              Voir tous les tests
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {sessionsLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : allSessions && allSessions.length > 0 ? (
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Candidat
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Test
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Score
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allSessions.map((session) => (
                  <tr
                    key={session.sessionId}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm">{session.candidateEmail}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{session.testName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge variant={getStatusVariant(session.status)}>
                        {session.status}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-4">
                      {session.status === "FINISHED" && session.score !== undefined ? (
                        <span className="text-sm font-medium">
                          {session.score.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/tests/${session.testId}/sessions`)}
                      >
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="Aucune activité pour le moment"
            description="Commencez par créer un test et inviter des candidats pour voir leur activité ici."
            actionLabel="Créer votre premier test"
            onAction={() => navigate("/tests/create")}
          />
        )}
      </div>
    </AdminLayout>
  );
}
