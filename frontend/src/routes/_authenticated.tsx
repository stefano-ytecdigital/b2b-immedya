import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { useAuthStore } from '@/features/auth/store/authStore';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
