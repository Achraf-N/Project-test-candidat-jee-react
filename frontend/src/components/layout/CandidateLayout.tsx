import { cn } from "@/lib/utils";

interface CandidateLayoutProps {
  children: React.ReactNode;
  testName?: string;
  className?: string;
}

export function CandidateLayout({ children, testName, className }: CandidateLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="h-14 border-b bg-card flex items-center px-6">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-primary">TestMaster</span>
          {testName && (
            <>
              <span className="text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">{testName}</span>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("min-h-[calc(100vh-3.5rem)]", className)}>
        {children}
      </main>
    </div>
  );
}
