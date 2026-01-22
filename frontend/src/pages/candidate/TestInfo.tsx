import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useTestStore } from "@/store/testStore";
import { authApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Clock, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TestInfo() {
  const navigate = useNavigate();
  const { candidateSession, logout } = useAuthStore();
  const { setQuestions, startTest } = useTestStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!candidateSession) {
      navigate("/candidate/login");
    }
  }, [candidateSession, navigate]);

  if (!candidateSession) {
    return null;
  }

  const handleStartTest = async () => {
    setIsLoading(true);
    try {
      // Fetch test questions using testId from session
      const questionsResponse = await authApi.getTestQuestionsForCandidate(candidateSession.testId);
      setQuestions(questionsResponse.data);
      
      // Start test with duration from session
      startTest(candidateSession.duration);
      
      toast.success("Test commencé ! Bonne chance !");
      navigate("/candidate/test");
    } catch (error: any) {
      const message = error.response?.data?.message || "Échec de chargement des questions du test.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Informations du test"
          description="Lisez attentivement les détails du test avant de commencer"
        />

        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-2xl font-bold">
                {candidateSession.testName}
              </CardTitle>
              <CardDescription className="text-blue-100">
                Veuillez lire attentivement les informations ci-dessous avant de commencer
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="grid gap-6">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <FileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Total des questions</h3>
                    <p className="text-gray-700">
                      Ce test contient <span className="font-bold text-blue-600">{candidateSession.totalQuestions}</span> questions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Clock className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Limite de temps</h3>
                    <p className="text-gray-700">
                      Vous avez <span className="font-bold text-amber-600">{candidateSession.duration} minutes</span> pour compléter ce test
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Le chronomètre démarrera immédiatement lorsque vous commencerez le test
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <AlertCircle className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Notes importantes</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">•</span>
                        <span>Votre progression est automatiquement enregistrée</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">•</span>
                        <span>Le test sera soumis automatiquement à la fin du temps</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">•</span>
                        <span>Vous pouvez naviguer librement entre les questions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">•</span>
                        <span>Assurez-vous d'avoir une connexion Internet stable</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Button
                  onClick={handleStartTest}
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Chargement du test...
                    </>
                  ) : (
                    "Commencer le test maintenant"
                  )}
                </Button>

                <Button
                  onClick={logout}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  Annuler et se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
