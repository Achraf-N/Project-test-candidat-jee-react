import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, Clock, Mail, Key } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge, getStatusVariant } from "@/components/common/StatusBadge";
import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton, StatCardSkeleton } from "@/components/common/SkeletonLoader";
import { EmptyState } from "@/components/common/EmptyState";
import { testApi } from "@/services/api";
import { format } from "date-fns";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TestSessions() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tests } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const response = await testApi.getAll();
      return response.data;
    },
  });

  const test = tests?.find((t) => t.id === Number(testId));

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["testSessions", testId],
    queryFn: async () => {
      const response = await testApi.getSessions(Number(testId));
      return response.data;
    },
    enabled: !!testId,
  });

  const filteredSessions = sessions?.filter((session) => {
    if (statusFilter === "all") return true;
    return session.status.toLowerCase() === statusFilter;
  });

  // Calculate stats
  const totalInvitations = sessions?.length || 0;
  const completedCount = sessions?.filter((s) => s.status === "FINISHED").length || 0;
  const pendingCount = sessions?.filter((s) => s.status === "PLANNED" || s.status === "SCHEDULED").length || 0;
  const averageScore =
    sessions
      ?.filter((s) => s.status === "FINISHED" && s.score !== undefined)
      .reduce((sum, s, _, arr) => sum + (s.score || 0) / arr.length, 0) || 0;

  return (
    <AdminLayout>
      <PageHeader
        title={test ? `${test.name} - Sessions` : "Test Sessions"}
        breadcrumbs={[
          { label: "Tests", path: "/tests" },
          { label: test?.name || "Loading...", path: `/tests/${testId}` },
          { label: "Sessions" },
        ]}
        actions={
          <Button onClick={() => navigate(`/invitations/send?testId=${testId}`)}>
            <Mail className="h-4 w-4" />
            Send More Invitations
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Invitations"
              value={totalInvitations}
              icon={Users}
              accentColor="primary"
            />
            <StatCard
              title="Completed"
              value={completedCount}
              icon={Clock}
              accentColor="success"
            />
            <StatCard
              title="Pending"
              value={pendingCount}
              icon={Clock}
              accentColor="warning"
            />
            <StatCard
              title="Average Score"
              value={`${averageScore.toFixed(1)}%`}
              accentColor="info"
            />
          </>
        )}
      </div>

      {/* Filter */}
      <div className="flex justify-end mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="finished">Finished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions Table */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : filteredSessions && filteredSessions.length > 0 ? (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Candidate Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Access Code
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Start Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Expiration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr
                    key={session.sessionId}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{session.candidateEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code text-sm bg-muted px-2 py-1 rounded">
                        {session.accessCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge variant={getStatusVariant(session.status)}>
                        {session.status}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-4">
                      {session.startTime ? (
                        <span className="text-sm">
                          {format(new Date(session.startTime), "MMM d, yyyy HH:mm")}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {format(new Date(session.expirationTime), "MMM d, yyyy HH:mm")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {session.status === "FINISHED" && session.score !== undefined ? (
                        <span
                          className={`text-sm font-medium ${
                            session.score >= 70 ? "text-success" : session.score >= 50 ? "text-warning" : "text-destructive"
                          }`}
                        >
                          {session.score.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No sessions yet"
          description="Invite candidates to take this test to see their sessions here."
          actionLabel="Send Invitations"
          onAction={() => navigate(`/invitations/send?testId=${testId}`)}
        />
      )}
    </AdminLayout>
  );
}
