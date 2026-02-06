import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AnimatedPage, FloatingBadge } from '@/shared/animations';
import { Layers, Zap, Shield, Award } from 'lucide-react';

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    // If already authenticated, redirect to home
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <AnimatedPage className="min-h-screen">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Hero/Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent p-12">
          {/* Floating Decorations */}
          <FloatingBadge
            className="absolute top-20 left-20"
            delay={0}
          >
            <Layers className="h-8 w-8 text-primary-foreground/80" />
          </FloatingBadge>
          <FloatingBadge
            className="absolute top-40 right-20"
            delay={0.5}
          >
            <Shield className="h-8 w-8 text-primary-foreground/80" />
          </FloatingBadge>
          <FloatingBadge
            className="absolute bottom-40 left-32"
            delay={1}
          >
            <Zap className="h-8 w-8 text-primary-foreground/80" />
          </FloatingBadge>
          <FloatingBadge
            className="absolute bottom-20 right-32"
            delay={1.5}
          >
            <Award className="h-8 w-8 text-primary-foreground/80" />
          </FloatingBadge>

          {/* Content */}
          <div className="relative z-10 max-w-md text-center space-y-6 text-primary-foreground">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold tracking-tight">IMMEDYA</h1>
              <p className="text-xl text-primary-foreground/90 font-medium">
                LEDWall B2B Platform
              </p>
            </div>

            <div className="h-1 w-20 mx-auto bg-primary-foreground/40 rounded-full" />

            <div className="space-y-4 text-primary-foreground/80">
              <p className="text-lg leading-relaxed">
                Configuratore intelligente per soluzioni LEDWall professionali
              </p>
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">250+</div>
                  <div className="text-sm">Prodotti</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm">Moduli LED</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm">Supporto</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">99%</div>
                  <div className="text-sm">Affidabilità</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center items-center p-8 lg:p-12 bg-background">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center space-y-2">
              <h1 className="text-4xl font-bold text-primary">IMMEDYA</h1>
              <p className="text-sm text-muted-foreground">LEDWall B2B Platform</p>
            </div>

            {/* Welcome Text */}
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight">
                Bentornato
              </h2>
              <p className="text-muted-foreground">
                Accedi per continuare nella piattaforma
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground pt-6">
              <p>
                Problemi di accesso?{' '}
                <a href="mailto:support@immedya.com" className="text-primary hover:underline">
                  Contatta il supporto
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
