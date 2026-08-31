import React, { useState } from 'react';

export interface DateFilterCalendarProps {
  selectedDate: string | null; // 'YYYY-MM-DD'
  onSelectDate: (date: string | null) => void;
  availableDates?: string[]; // list of dates (YYYY-MM-DD) that have items/records
  onClose: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DateFilterCalendar({
  selectedDate,
  onSelectDate,
  availableDates = [],
  onClose,
}: DateFilterCalendarProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const initialYear = selectedDate ? parseInt(selectedDate.split('-')[0], 10) : today.getFullYear();
  const initialMonth = selectedDate ? parseInt(selectedDate.split('-')[1], 10) - 1 : today.getMonth();

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    onSelectDate(todayStr);
  };

  const setYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    setCurrentYear(yesterday.getFullYear());
    setCurrentMonth(yesterday.getMonth());
    onSelectDate(yStr);
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Create formatted date string for comparison
  const getDateString = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const availableDateSet = new Set(availableDates);

  return (
    <div className="bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-900/5 animate-fade-in flex flex-col gap-3.5">
      {/* Month & Year Header with Navigation */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-baseline gap-2">
          <h4 className="text-base font-bold text-text-primary">
            {MONTH_NAMES[currentMonth]}
          </h4>
          <span className="text-sm font-semibold text-text-secondary">
            {currentYear}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-primary hover:bg-slate-100 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-primary hover:bg-slate-100 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS_OF_WEEK.map((d, i) => (
          <span key={d} className={`text-[11px] font-bold py-1 ${i === 0 ? 'text-accent' : 'text-text-secondary'}`}>
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty slots */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9 w-full" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = getDateString(day);
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;
          const hasBookings = availableDateSet.has(dateStr);

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`h-9 w-full rounded-full text-xs font-semibold flex flex-col items-center justify-center relative transition-all active:scale-90 ${
                isSelected
                  ? 'bg-primary text-white shadow-sm font-bold scale-105'
                  : isToday
                  ? 'border border-primary/40 text-primary font-bold hover:bg-primary/5'
                  : 'text-text-primary hover:bg-slate-100'
              }`}
            >
              <span>{day}</span>
              {hasBookings && (
                <span
                  className={`w-1 h-1 rounded-full absolute bottom-1 ${
                    isSelected ? 'bg-white' : 'bg-accent'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick selection chips & actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 mt-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goToToday}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
              selectedDate === todayStr
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={setYesterday}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
          >
            Yesterday
          </button>
          {selectedDate && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold text-red-600 hover:bg-red-50 transition-all"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-all ml-auto"
        >
          Done
        </button>
      </div>
    </div>
  );
}
