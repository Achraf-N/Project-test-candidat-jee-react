import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Brain,
  Users,
  FileText,
  Clock,
  Shield,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Création de tests facile",
    description: "Créez des questions à choix multiples, vrai/faux et ouvertes avec une interface intuitive.",
  },
  {
    icon: Brain,
    title: "Notation alimentée par IA",
    description: "Utilisez Groq AI pour noter automatiquement les questions ouvertes avec des retours intelligents.",
  },
  {
    icon: Users,
    title: "Gestion des candidats",
    description: "Invitez des candidats par e-mail avec des codes d'accès uniques et suivez leur progression.",
  },
  {
    icon: Clock,
    title: "Évaluations chronométrées",
    description: "Définissez des limites de temps pour les tests avec soumission automatique à l'expiration.",
  },
  {
    icon: Shield,
    title: "Sécurité d'entreprise",
    description: "Authentification sécurisée et protection des données pour votre organisation.",
  },
  {
    icon: CheckCircle2,
    title: "Analyses détaillées",
    description: "Consultez les résultats complets avec des détails question par question et les scores.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SkillTest Pro</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Comment ça marche
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Connexion Admin</Button>
            </Link>
            <Link to="/register">
              <Button>Commencer</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Gestion de tests alimentée par IA
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Créez, Gérez et Notez les tests
              <span className="text-primary block mt-2">Sans effort</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Une plateforme complète de gestion de tests pour les entreprises. Créez des évaluations, 
              invitez des candidats et laissez l'IA gérer la notation. Commencez en quelques minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Créer votre entreprise
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/candidate-login">
                <Button variant="outline" size="xl">
                  Passer un test
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des fonctionnalités puissantes conçues pour rationaliser votre processus d'évaluation de la création aux résultats.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-lg border p-6 card-hover"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comment ça marche</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Commencez en trois étapes simples
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, title: "Créer l'entreprise", description: "Inscrivez votre organisation et configurez votre compte administrateur" },
              { step: 2, title: "Créer des tests", description: "Créez des questions et assemblez-les en tests complets" },
              { step: 3, title: "Inviter et évaluer", description: "Envoyez des invitations aux candidats et consultez les résultats notés par IA" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-sidebar-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-sidebar-foreground/70 mb-8 max-w-xl mx-auto">
            Rejoignez les entreprises qui utilisent déjà SkillTest Pro pour rationaliser leur processus d'évaluation.
          </p>
          <Link to="/register">
            <Button size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Créez votre entreprise gratuitement
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold">SkillTest Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SkillTest Pro. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Connexion Admin
              </Link>
              <Link to="/candidate-login" className="text-sm text-muted-foreground hover:text-foreground">
                Connexion Candidat
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
