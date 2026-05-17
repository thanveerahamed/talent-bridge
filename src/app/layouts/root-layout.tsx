import { Outlet } from 'react-router';
import { Toaster } from '@/components/ui/sonner';

export function RootLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground transition-colors duration-200">
      <Outlet />
      <Toaster richColors position="top-right" />
    </div>
  );
}
