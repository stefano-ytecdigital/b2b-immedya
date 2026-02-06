import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { queryClient } from '@/shared/api/queryClient';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  // Get current location for AnimatePresence key
  const router = useRouterState();
  const location = router.location;

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait" initial={false}>
        <Outlet key={location.pathname} />
      </AnimatePresence>
    </QueryClientProvider>
  );
}
