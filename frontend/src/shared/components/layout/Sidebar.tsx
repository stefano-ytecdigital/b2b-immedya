import { Link } from '@tanstack/react-router';
import { LayoutGrid, Sliders, FileText, LogOut } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLogout } from '@/features/auth/api/useLogout';

interface NavItem {
  to: string;
  icon: typeof LayoutGrid;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/catalog/kits', icon: LayoutGrid, label: 'Catalogo' },
  { to: '/configurator/standard', icon: Sliders, label: 'Configuratore' },
  { to: '/dashboard/quotes', icon: FileText, label: 'Preventivi' },
];

export function Sidebar() {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">
          IMMEDYA
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          LEDWall B2B Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              '[&.active]:bg-primary/10 [&.active]:text-primary'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'hover:bg-destructive/10 hover:text-destructive',
            'disabled:opacity-50'
          )}
        >
          <LogOut className="h-5 w-5" />
          Esci
        </button>
      </div>
    </aside>
  );
}
