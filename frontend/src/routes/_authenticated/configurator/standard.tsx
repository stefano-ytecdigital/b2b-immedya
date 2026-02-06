import { createFileRoute } from '@tanstack/react-router';
import { AnimatedPage } from '@/shared/animations';

export const Route = createFileRoute('/_authenticated/configurator/standard')({
  component: ConfiguratorPage,
});

function ConfiguratorPage() {
  return (
    <AnimatedPage>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Configuratore Standard</h1>
          </div>

          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Wizard Configurazione</h2>
            <p className="text-muted-foreground">
              Implementazione del wizard 5-step in arrivo (Fase 4)
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
