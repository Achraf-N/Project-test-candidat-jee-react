import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const candidateLoginSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse e-mail valide"),
  accessCode: z.string().length(6, "Le code d'accès doit contenir exactement 6 caractères").toUpperCase(),
});

type CandidateLoginForm = z.infer<typeof candidateLoginSchema>;

export default function CandidateLogin() {
  const navigate = useNavigate();
  const { setCandidateAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateLoginForm>({
    resolver: zodResolver(candidateLoginSchema),
  });

  const onSubmit = async (data: CandidateLoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.candidateLogin(data.email, data.accessCode.toUpperCase());
      const session = response.data;
      
      // Store session info
      setCandidateAuth(session);
      
      toast.success("Connexion réussie ! Veuillez consulter les informations du test.");
      navigate("/candidate/test-info");
    } catch (error: any) {
      const message = error.response?.data?.message || "Identifiants invalides ou code d'accès expiré.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">SkillTest Pro</span>
          </Link>
          <h1 className="text-2xl font-bold">Passer votre test</h1>
          <p className="text-muted-foreground mt-2">
            Entrez vos identifiants pour commencer l'évaluation
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Entrez votre e-mail"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessCode">Code d'accès</Label>
              <Input
                id="accessCode"
                placeholder="Entrez le code à 6 caractères"
                maxLength={6}
                {...register("accessCode")}
                className={`font-mono-code uppercase tracking-widest text-center text-lg ${errors.accessCode ? "border-destructive" : ""}`}
              />
              {errors.accessCode && (
                <p className="text-sm text-destructive">{errors.accessCode.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Vous devriez avoir reçu ce code par e-mail
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              {isLoading ? "Vérification..." : "Commencer le test"}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Vous êtes administrateur ?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Connexion Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
