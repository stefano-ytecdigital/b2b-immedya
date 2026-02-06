import { Link } from '@tanstack/react-router';
import { LayoutGrid, Sliders, FileText, User, LogOut } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLogout } from '@/features/auth/api/useLogout';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  to: string;
  icon: typeof LayoutGrid;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/catalog/kits', icon: LayoutGrid, label: 'Catalogo' },
  { to: '/configurator/standard', icon: Sliders, label: 'Configuratore' },
  { to: '/dashboard/quotes', icon: FileText, label: 'I Miei Preventivi' },
];

/**
 * TopNav - E-commerce style horizontal navigation
 * Replaces dashboard Sidebar for more open, product-focused layout
 */
export function TopNav() {
  const logoutMutation = useLogout();
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'Account';

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-full px-6">
        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="text-left">IMMEDYA</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
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
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          to="/catalog/kits"
          className="flex items-center space-x-2 transition-opacity hover:opacity-80"
        >
          <h1 className="text-2xl font-bold text-primary">IMMEDYA</h1>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            LEDWall B2B
          </span>
        </Link>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md',
                'hover:bg-accent hover:text-accent-foreground',
                '[&.active]:bg-primary/10 [&.active]:text-primary'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">
                  {userName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Esci</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
