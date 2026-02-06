import { createFileRoute, Link } from '@tanstack/react-router';
import { AnimatedPage, StatCounter, FloatingBadge } from '@/shared/animations';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ArrowRight, Layers, Sliders, Zap, Shield, Award } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';

export const Route = createFileRoute('/_authenticated/')({
  component: HeroPage,
});

function HeroPage() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name?.split(' ')[0] || 'Partner';

  return (
    <AnimatedPage>
      {/* Hero Section - Full Width */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        {/* Floating Badges - Decorative */}
        <FloatingBadge
          className="absolute top-20 left-10 hidden lg:block"
          delay={0}
        >
          <Award className="h-6 w-6 text-primary" />
        </FloatingBadge>
        <FloatingBadge
          className="absolute top-40 right-20 hidden lg:block"
          delay={0.5}
        >
          <Shield className="h-6 w-6 text-accent" />
        </FloatingBadge>
        <FloatingBadge
          className="absolute bottom-40 left-20 hidden lg:block"
          delay={1}
        >
          <Zap className="h-6 w-6 text-primary" />
        </FloatingBadge>

        <div className="container mx-auto px-6 py-20 max-w-7xl">
          <div className="text-center space-y-8">
            {/* Welcome Text */}
            <div className="space-y-4">
              <p className="text-primary font-medium tracking-wider uppercase text-sm">
                Benvenuto, {firstName}
              </p>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Configura il tuo
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  LEDWall Perfetto
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Configuratore intelligente per soluzioni LEDWall professionali.
                Preventivi in tempo reale, prezzi trasparenti, supporto dedicato.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="group">
                <Link to="/catalog/kits">
                  Esplora il Catalogo
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/configurator/standard">
                  <Sliders className="mr-2 h-5 w-5" />
                  Inizia Configurazione
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Contained */}
      <section className="py-16 bg-card/50 border-y border-border">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatCard
              value={250}
              label="Prodotti"
              suffix="+"
              icon={<Layers className="h-6 w-6" />}
            />
            <StatCard
              value={50}
              label="Moduli LED"
              suffix="+"
              icon={<Layers className="h-6 w-6" />}
            />
            <StatCard
              value={24}
              label="Supporto"
              suffix="h/7"
              icon={<Shield className="h-6 w-6" />}
            />
            <StatCard
              value={99}
              label="Affidabilità"
              suffix="%"
              icon={<Award className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Features Section - Contained */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perché scegliere IMMEDYA
            </h2>
            <p className="text-muted-foreground text-lg">
              Tecnologia, qualità e supporto per i tuoi progetti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary" />}
              title="Configurazione Rapida"
              description="Ottieni preventivi accurati in pochi minuti con il nostro configuratore intelligente."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Prezzi Trasparenti"
              description="Nessuna sorpresa. Prezzi chiari e dettagliati per ogni componente."
            />
            <FeatureCard
              icon={<Award className="h-8 w-8 text-primary" />}
              title="Qualità Garantita"
              description="Prodotti certificati e testati. Garanzia estesa su tutti i componenti."
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Full Width Accent */}
      <section className="py-20 bg-primary/5 border-t border-border">
        <div className="container mx-auto px-6 max-w-4xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Pronto a iniziare?
          </h2>
          <p className="text-lg text-muted-foreground">
            Configura il tuo LEDWall o esplora il nostro catalogo completo
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/configurator/standard">
                Configura Ora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/catalog/kits">Sfoglia Catalogo</Link>
            </Button>
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}

// Stat Card Component
interface StatCardProps {
  value: number;
  label: string;
  suffix?: string;
  icon: React.ReactNode;
}

function StatCard({ value, label, suffix = '', icon }: StatCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="pt-6 text-center space-y-2">
        <div className="flex justify-center mb-2 text-muted-foreground">
          {icon}
        </div>
        <div className="flex items-baseline justify-center gap-1">
          <StatCounter
            end={value}
            duration={2000}
            className="text-4xl font-bold text-foreground"
          />
          {suffix && (
            <span className="text-2xl font-semibold text-primary">
              {suffix}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </CardContent>
    </Card>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border-border/50 hover:border-primary/40 transition-colors">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-center">{icon}</div>
        <h3 className="text-xl font-semibold text-center">{title}</h3>
        <p className="text-muted-foreground text-center leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
