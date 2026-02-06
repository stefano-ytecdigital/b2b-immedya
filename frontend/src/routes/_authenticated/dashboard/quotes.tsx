import { createFileRoute } from '@tanstack/react-router';
import { AnimatedPage } from '@/shared/animations';

export const Route = createFileRoute('/_authenticated/dashboard/quotes')({
  component: QuotesPage,
});

function QuotesPage() {
  return (
    <AnimatedPage>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">I Miei Preventivi</h1>
          </div>

          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Dashboard Preventivi</h2>
            <p className="text-muted-foreground">
              Implementazione della tabella preventivi in arrivo (Fase 5)
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
