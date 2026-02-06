import { Outlet } from '@tanstack/react-router';
import { TopNav } from './TopNav';
import { AnimatedBackground } from '@/shared/animations/components/AnimatedBackground';

/**
 * Main application layout - E-commerce style
 * Top navigation bar with full-width content area for maximum visual impact
 */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-transparent relative">
      <AnimatedBackground />

      {/* Top navigation */}
      <TopNav />

      {/* Main content area - no max-width constraint for hero sections */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
