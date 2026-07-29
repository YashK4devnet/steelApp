import React from 'react';
import { ChartIcon } from './Icons';

export function ManagerDashboard() {
  return (
    <div className="bg-white p-8 rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start max-w-2xl">
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
        <ChartIcon />
      </div>
      <h2 className="text-[20px] font-semibold text-text-primary mb-2 tracking-tight">Manager Dashboard</h2>
      <p className="text-text-secondary text-[14px] leading-relaxed max-w-md">
        We are currently preparing your customized analytics, reports, and team management tools. Please check back later.
      </p>
    </div>
  );
}
