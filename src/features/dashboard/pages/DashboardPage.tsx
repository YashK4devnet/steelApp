import React from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';

// Inline SVG for Truck icon to avoid lucide-react dependency issues for now
const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-[800px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Welcome, {user?.name}</h1>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>

        {user?.role === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-24 flex flex-col items-center justify-center gap-2 text-lg">
              <TruckIcon />
              Trucks to warehouse
            </Button>
            <Button className="h-24 flex flex-col items-center justify-center gap-2 text-lg">
              <TruckIcon />
              Trucks from warehouse
            </Button>
          </div>
        )}
        
        {user?.role === 'manager' && (
          <div className="bg-surface p-6 rounded-2xl shadow-sm text-center">
            <p className="text-text-secondary text-lg">Manager dashboard coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
