import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, cancelBooking } from '../services/bookingApi';
import type { Booking } from '../types';

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

export function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadBookings();
  }, []);

  const handleCancel = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await cancelBooking(id);
        if (response.success) {
          alert('Booking cancelled successfully');
          loadBookings();
        }
      } catch (err) {
        alert('Failed to cancel booking');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-32">
      
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
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
            onClick={() => navigate('/bookings/new')}
            className="w-10 h-10 shrink-0 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(10,46,99,0.2)] hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-32">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5">
            <p className="text-text-secondary font-medium">No bookings found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-3 relative overflow-hidden"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-text-primary text-[16px]">{booking.reference}</h3>
                    <p className="text-xs font-semibold text-text-secondary mt-0.5">{booking.created_date}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                    booking.status === 'Cancelled'
                      ? 'bg-red-50 text-red-700'
                      : booking.is_truck_loaded 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {booking.status === 'Cancelled' ? 'Cancelled' : booking.is_truck_loaded ? 'Read-Only' : 'Editable'}
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary w-16">Customer:</span>
                    <span className="text-sm font-semibold text-text-primary">{booking.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary w-16">Pickup:</span>
                    <span className="text-sm font-semibold text-text-primary">{booking.pickup_warehouse_name}</span>
                  </div>
                </div>

                {booking.is_truck_loaded || booking.status === 'Cancelled' ? (
                  <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-slate-900/5">
                    <button
                      onClick={() => navigate(`/bookings/view/${booking.id}`)}
                      className="px-4 py-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 active:scale-95 text-xs font-bold shadow-sm transition-all"
                    >
                      View Details
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-slate-900/5">
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 text-xs font-bold transition-all"
                    >
                      Cancel Booking
                    </button>
                    <button
                      onClick={() => navigate(`/bookings/edit/${booking.id}`)}
                      className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/95 active:scale-95 text-xs font-bold shadow-sm transition-all"
                    >
                      Edit Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>


    </div>
  );
}
