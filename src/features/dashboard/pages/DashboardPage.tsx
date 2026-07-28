import React from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';

// Icons
const TruckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0">

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">

        {/* Header Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-base font-medium text-text-secondary mb-0.5">
              Good Morning,
            </h1>
            <h2 className="text-[32px] font-bold text-text-primary tracking-tight leading-tight">
              {user?.name} 👋
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              What would you like to do today?
            </p>
          </div>

          <button className="w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors active:scale-95">
            <BellIcon />
          </button>
        </div>

        {/* Security Role Content */}
        {user?.role === 'security' && (
          <div className="flex flex-col gap-4">

            <button className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-row items-center gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-primary w-full text-left active:scale-[0.98] transition-transform duration-150">
              <div className="w-12 h-12 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
                <TruckIcon className="w-6 h-6" />
              </div>

              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-text-primary group-hover:text-primary transition-colors">Trucks to warehouse</h3>
              </div>

              <div className="text-text-secondary opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ChevronRightIcon />
              </div>
            </button>

            <button className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-row items-center gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-accent w-full text-left active:scale-[0.98] transition-transform duration-150">
              <div className="w-12 h-12 flex-shrink-0 bg-accent/10 rounded-full flex items-center justify-center text-accent group-hover:bg-accent/15 transition-colors">
                <div style={{ transform: 'scaleX(-1)' }}>
                  <TruckIcon className="w-6 h-6" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-text-primary group-hover:text-accent transition-colors">Trucks from warehouse</h3>
              </div>

              <div className="text-text-secondary opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ChevronRightIcon />
              </div>
            </button>

          </div>
        )}

        {/* Manager Role Content */}
        {user?.role === 'manager' && (
          <div className="bg-white p-8 rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start max-w-2xl">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <ChartIcon />
            </div>
            <h2 className="text-[20px] font-semibold text-text-primary mb-2 tracking-tight">Manager Dashboard</h2>
            <p className="text-text-secondary text-[14px] leading-relaxed max-w-md">
              We are currently preparing your customized analytics, reports, and team management tools. Please check back later.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

