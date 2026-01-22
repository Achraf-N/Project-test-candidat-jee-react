import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, X, Mail, Calendar, Check, Send } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { testApi } from "@/services/api";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

const invitationSchema = z.object({
  testId: z.string().min(1, "Veuillez sélectionner un test"),
  expirationDate: z.string().min(1, "Veuillez définir une date d'expiration"),
});

type InvitationForm = z.infer<typeof invitationSchema>;

export default function SendInvitations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTestId = searchParams.get("testId");

  const [emails, setEmails] = useState<string[]>([""]);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkEmails, setBulkEmails] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvitationForm>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      testId: preselectedTestId || "",
      expirationDate: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const selectedTestId = watch("testId");

  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const response = await testApi.getAll();
      return response.data;
    },
  });

  const selectedTest = tests?.find((t) => t.id.toString() === selectedTestId);

  const sendInvitationsMutation = useMutation({
    mutationFn: async (data: InvitationForm) => {
      const emailList = bulkMode
        ? bulkEmails.split(/[,\n]/).map((e) => e.trim()).filter((e) => e)
        : emails.filter((e) => e.trim());

      if (emailList.length === 0) {
        throw new Error("Veuillez ajouter au moins une adresse e-mail");
      }

      const response = await testApi.sendInvitations({
        testId: Number(data.testId),
        emailCandidate: emailList,
        dateExpiration: new Date(data.expirationDate).toISOString(),
      });
      return { count: emailList.length };
    },
    onSuccess: (data) => {
      setSentCount(data.count);
      setShowSuccess(true);
    },
    onError: (error: any) => {
      toast.error(error.message || error.response?.data?.message || "Échec d'envoi des invitations");
    },
  });

  const onSubmit = (data: InvitationForm) => {
    sendInvitationsMutation.mutate(data);
  };

  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const validEmailCount = bulkMode
    ? bulkEmails.split(/[,\n]/).map((e) => e.trim()).filter((e) => e && e.includes("@")).length
    : emails.filter((e) => e.trim() && e.includes("@")).length;

  return (
    <AdminLayout>
      <PageHeader
        title="Envoyer des invitations de test"
        description="Invitez des candidats à passer un test par e-mail"
        breadcrumbs={[
          { label: "Invitations", path: "/invitations/send" },
          { label: "Envoyer" },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="bg-card rounded-lg border p-6 space-y-6">
          {/* Test Selection */}
          <div className="space-y-2">
            <Label>Sélectionner un test</Label>
            <Select
              value={selectedTestId}
              onValueChange={(value) => setValue("testId", value)}
            >
              <SelectTrigger className={errors.testId ? "border-destructive" : ""}>
                <SelectValue placeholder="Choisir un test" />
              </SelectTrigger>
              <SelectContent>
                {tests?.map((test) => (
                  <SelectItem key={test.id} value={test.id.toString()}>
                    {test.name} ({test.durationMinute} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.testId && (
              <p className="text-sm text-destructive">{errors.testId.message}</p>
            )}
            {selectedTest && (
              <p className="text-sm text-muted-foreground">
                Durée : {selectedTest.durationMinute} minutes •{" "}
                {selectedTest.isActive ? "Actif" : "Inactif"}
              </p>
            )}
          </div>

          {/* Email Addresses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>E-mails des candidats</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setBulkMode(!bulkMode)}
              >
                {bulkMode ? "Saisie individuelle" : "Saisie en masse"}
              </Button>
            </div>

            {bulkMode ? (
              <div className="space-y-2">
                <Textarea
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="Entrez les adresses e-mail séparées par des virgules ou des sauts de ligne&#10;exemple1@email.com&#10;exemple2@email.com, exemple3@email.com"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Séparez les e-mails par des virgules ou des sauts de ligne
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        placeholder="candidate@email.com"
                        className="pl-9"
                      />
                    </div>
                    {emails.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmailField(index)}
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
                  onClick={addEmailField}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un autre e-mail
                </Button>
              </div>
            )}
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Date d'expiration</Label>
            <div className="relative max-w-sm">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="expirationDate"
                type="datetime-local"
                {...register("expirationDate")}
                className="pl-9"
              />
            </div>
            {errors.expirationDate && (
              <p className="text-sm text-destructive">{errors.expirationDate.message}</p>
            )}
          </div>

          {/* Preview */}
          {validEmailCount > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Aperçu</h3>
              <p className="text-sm text-muted-foreground">
                <strong>{validEmailCount}</strong> invitation
                {validEmailCount > 1 ? "s" : ""} ser{validEmailCount > 1 ? "ont" : "a"} envoyée{validEmailCount > 1 ? "s" : ""} pour passer{" "}
                <strong>{selectedTest?.name || "le test sélectionné"}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={validEmailCount === 0 || !selectedTestId}
            loading={sendInvitationsMutation.isPending}
          >
            <Send className="h-4 w-4" />
            Envoyer {validEmailCount > 0 ? `${validEmailCount} ` : ""}invitation
            {validEmailCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" />
              Invitations envoyées avec succès !
            </DialogTitle>
            <DialogDescription>
              {sentCount} invitation{sentCount !== 1 ? "s ont" : " a"} été envoyée{sentCount !== 1 ? "s" : ""}.
              Les candidats recevront un e-mail avec leur code d'accès unique.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/tests")}>
              Retour aux tests
            </Button>
            <Button onClick={() => navigate(`/tests/${selectedTestId}/sessions`)}>
              Voir les sessions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
