import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { enterpriseApi, type Domain, type LoginResponse } from "@/services/api";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const registerSchema = z.object({
  enterpriseName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  domainId: z.string().min(1, "Veuillez sélectionner un domaine"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<LoginResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCreateDomain, setShowCreateDomain] = useState(false);
  const [newDomainName, setNewDomainName] = useState("");
  const [isCreatingDomain, setIsCreatingDomain] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const selectedDomainId = watch("domainId");

  const { data: domains, refetch: refetchDomains } = useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const response = await enterpriseApi.getAllDomains();
      return response.data;
    },
  });

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateDomain = async () => {
    if (!newDomainName.trim()) {
      toast.error("Veuillez entrer un nom de domaine");
      return;
    }

    setIsCreatingDomain(true);
    try {
      const response = await enterpriseApi.createDomain({ name: newDomainName.trim() });
      await refetchDomains();
      setValue("domainId", response.data.id?.toString() || "");
      setShowCreateDomain(false);
      setNewDomainName("");
      toast.success("Domaine créé avec succès !");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Échec de création du domaine");
    } finally {
      setIsCreatingDomain(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    const selectedDomain = domains?.find((d) => d.id?.toString() === data.domainId);
    if (!selectedDomain) {
      toast.error("Veuillez sélectionner un domaine valide");
      return;
    }

    setIsLoading(true);
    try {
      const response = await enterpriseApi.create({
        name: data.enterpriseName,
        domain: selectedDomain,
      });

      setCredentials(response.data);
      setShowCredentials(true);
      toast.success("Entreprise créée avec succès !");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Échec de création de l'entreprise");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-8">
        <div className="max-w-md text-center text-sidebar-foreground">
          <h2 className="text-3xl font-bold mb-4">Commencez votre parcours</h2>
          <p className="text-sidebar-foreground/70">
            Créez votre compte d'entreprise pour commencer à créer des évaluations, 
            inviter des candidats et tirer parti de la notation alimentée par IA.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">SkillTest Pro</span>
            </Link>
            <h1 className="text-2xl font-bold">Créer votre entreprise</h1>
            <p className="text-muted-foreground mt-2">
              Configurez votre organisation pour commencer à gérer les tests
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="enterpriseName">Nom de l'entreprise</Label>
              <Input
                id="enterpriseName"
                placeholder="Entrez le nom de votre entreprise"
                {...register("enterpriseName")}
                className={errors.enterpriseName ? "border-destructive" : ""}
              />
              {errors.enterpriseName && (
                <p className="text-sm text-destructive">{errors.enterpriseName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Domaine</Label>
              <Select value={selectedDomainId} onValueChange={(value) => setValue("domainId", value)}>
                <SelectTrigger className={errors.domainId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionnez un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {domains?.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id?.toString() || ""}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.domainId && (
                <p className="text-sm text-destructive">{errors.domainId.message}</p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => setShowCreateDomain(true)}
              >
                + Créer un nouveau domaine
              </Button>
            </div>

            <Button type="submit" className="w-full" loading={isLoading}>
              {isLoading ? "Création..." : "Créer l'entreprise"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Connexion Admin
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Create Domain Dialog */}
      <Dialog open={showCreateDomain} onOpenChange={setShowCreateDomain}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau domaine</DialogTitle>
            <DialogDescription>
              Entrez un nom pour la nouvelle catégorie de domaine.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="domainName">Nom du domaine</Label>
            <Input
              id="domainName"
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
              placeholder="ex : Technologie, Santé, Finance"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDomain(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateDomain} loading={isCreatingDomain}>
              Créer le domaine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" />
              Entreprise créée avec succès !
            </DialogTitle>
            <DialogDescription>
              Veuillez enregistrer ces identifiants en toute sécurité. Vous en aurez besoin pour vous connecter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nom d'utilisateur</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={credentials?.username || ""}
                  readOnly
                  className="font-mono-code"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.username || "", "username")}
                >
                  {copiedField === "username" ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Mot de passe</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={credentials?.password || ""}
                  readOnly
                  className="font-mono-code"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials?.password || "", "password")}
                >
                  {copiedField === "password" ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-warning/10 border border-warning/20 rounded-md p-3 text-sm text-warning">
              ⚠️ Assurez-vous d'enregistrer ces identifiants ! Ils ne pourront pas être récupérés ultérieurement.
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => navigate("/login")} className="w-full">
              Aller à la connexion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
