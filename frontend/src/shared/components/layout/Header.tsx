import { useAuthStore } from '@/features/auth/store/authStore';
import { Badge } from '@/shared/components/ui/badge';

export function Header() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">
          {/* Dynamic title based on route (can be enhanced with route metadata) */}
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email}
              </p>
              {user.company && (
                <p className="text-xs text-muted-foreground">
                  {user.company}
                </p>
              )}
            </div>
            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
              {user.role}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}
