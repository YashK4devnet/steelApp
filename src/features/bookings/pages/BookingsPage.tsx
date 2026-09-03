import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { BOOKING_STATUS } from '../constants';
import { DateFilterCalendar } from '../components/DateFilterCalendar';
import { QueryErrorState } from '../../../components/ui/QueryErrorState';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CalendarIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

function formatDateBadge(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[monthIdx]} ${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function BookingsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const {
    bookings,
    loading,
    isError,
    error,
    isFetching,
    cancelModalBooking,
    setCancelModalBooking,
    isCancelling,
    handleCancel,
    refreshBookings,
  } = useBookings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const availableDates = useMemo(() => {
    return Array.from(new Set(bookings.map((b) => b.created_date).filter(Boolean)));
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Date filter matching
      if (selectedDate && b.created_date !== selectedDate) {
        return false;
      }

      // Search query matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRef = b.reference.toLowerCase().includes(q);
        const matchCustomer = b.customer_name.toLowerCase().includes(q);
        const matchPickup = (b.pickup_warehouse_address || b.pickup_warehouse_name).toLowerCase().includes(q);
        const matchPlate = b.truck_number_plate?.toLowerCase().includes(q);
        const matchType = b.truck_type?.toLowerCase().includes(q);
        const matchState = b.state_label?.toLowerCase().includes(q);
        return matchRef || matchCustomer || matchPickup || matchPlate || matchType || matchState;
      }

      return true;
    });
  }, [bookings, selectedDate, searchQuery]);

  const isFiltering = Boolean(selectedDate || searchQuery.trim());

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-32">
      {/* Sticky Header with Title and Search/Date Filter */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              aria-label="Back to dashboard"
              className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-none h-10 flex items-center">
                Bookings
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/bookings/new')}
            aria-label="Create new booking"
            className="w-10 h-10 shrink-0 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(10,46,99,0.2)] hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Search Bar & Date Filter Button Row */}
        <div className="max-w-[1200px] mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search reference, warehouse, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-9 bg-white rounded-[14px] border border-slate-900/5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] outline-none focus:border-primary transition-all text-sm font-medium placeholder:text-slate-400 placeholder:font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search text"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Calendar Expand Button */}
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              aria-label="Filter by date"
              aria-expanded={isCalendarOpen}
              className={`h-11 px-3 sm:px-3.5 rounded-[14px] flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-[0_4px_16px_rgba(15,23,42,0.04)] border shrink-0 ${
                selectedDate
                  ? 'bg-primary text-white border-primary shadow-primary/20'
                  : isCalendarOpen
                  ? 'bg-slate-100 text-primary border-primary/20'
                  : 'bg-white text-slate-600 hover:text-primary border-slate-900/5 hover:bg-slate-50 active:scale-95'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              {selectedDate ? (
                <span className="hidden sm:inline font-bold">
                  {formatDateBadge(selectedDate)}
                </span>
              ) : null}
            </button>
          </div>

          {/* Active Filter Chips */}
          {isFiltering && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {selectedDate && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/15 animate-fade-in">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Date: {formatDateBadge(selectedDate)}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="hover:bg-primary/20 rounded-full p-0.5 ml-0.5 text-primary transition-colors"
                    aria-label="Clear date filter"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {searchQuery && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold border border-slate-200 animate-fade-in">
                  <span>Search: "{searchQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:bg-slate-200 rounded-full p-0.5 ml-0.5 transition-colors"
                    aria-label="Clear search filter"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(null);
                  setSearchQuery('');
                }}
                className="text-xs text-text-secondary hover:text-red-600 font-semibold underline underline-offset-2 ml-1 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Expandable Calendar Dropdown */}
          {isCalendarOpen && (
            <div className="pt-1">
              <DateFilterCalendar
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
                availableDates={availableDates}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-32">
        {loading ? (
          <div className="flex justify-center p-10">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : isError ? (
          <QueryErrorState
            title="Unable to Load Bookings"
            message={error || 'A connection or server issue occurred while loading bookings. Please try again.'}
            onRetry={refreshBookings}
            isRetrying={isFetching}
          />
        ) : bookings.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5">
            <p className="text-text-secondary font-medium">No bookings found.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <SearchIcon />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">No Matching Bookings</h3>
              <p className="text-xs text-text-secondary mt-1">
                No bookings match your current search and date filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-primary/10 text-primary font-bold text-xs rounded-full hover:bg-primary/20 transition-all mt-1"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredBookings.map((booking) => {
              const isCancelled = booking.status === BOOKING_STATUS.CANCELLED || booking.state_label?.toLowerCase() === 'cancelled';
              const isCancellable = (booking.can_cancel ?? (!booking.is_truck_loaded && !isCancelled)) && !isCancelled;
              const canEdit = (booking.can_edit ?? isCancellable) && !isCancelled;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-text-primary text-[16px]">{booking.reference}</h3>
                      <p className="text-xs font-semibold text-text-secondary mt-0.5">{booking.created_date}</p>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                        isCancelled
                          ? 'bg-red-50 text-red-700'
                          : !canEdit
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {booking.state_label || (isCancelled ? 'Cancelled' : !canEdit ? 'Read-Only' : 'Editable')}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-secondary w-16 shrink-0">Customer:</span>
                      <span className="text-sm font-semibold text-text-primary">{booking.customer_name}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-text-secondary w-16 shrink-0 pt-0.5">Pickup:</span>
                      <span className="text-sm font-semibold text-text-primary leading-snug">
                        {booking.pickup_warehouse_address || booking.pickup_warehouse_name}
                      </span>
                    </div>
                    {booking.truck_number_plate && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-secondary w-16 shrink-0">Truck:</span>
                        <span className="text-sm font-semibold text-text-primary">{booking.truck_number_plate} {booking.truck_type ? `(${booking.truck_type})` : ''}</span>
                      </div>
                    )}
                    {booking.rejected_reason && (
                      <div className="flex flex-col gap-0.5 mt-1 p-2.5 bg-red-50/70 rounded-[12px] border border-red-100">
                        <span className="text-[11px] font-bold text-red-700 uppercase tracking-wide">Reject Reason</span>
                        <span className="text-xs font-medium text-red-800">{booking.rejected_reason}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-slate-900/5">
                    {isCancellable && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => setCancelModalBooking(booking)}
                        className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 text-xs font-bold transition-all"
                      >
                        Cancel Booking
                      </button>
                    )}
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/bookings/edit/${booking.id}`)}
                        className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/95 active:scale-95 text-xs font-bold shadow-sm transition-all"
                      >
                        Edit Booking
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/bookings/view/${booking.id}`)}
                        className="px-4 py-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 active:scale-95 text-xs font-bold shadow-sm transition-all"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-slate-900/5 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-text-primary">Cancel Booking?</h3>
            <p className="text-sm text-text-secondary font-medium">
              Are you sure you want to cancel booking <span className="font-bold text-text-primary">{cancelModalBooking.reference}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-4 py-2.5 rounded-full bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

