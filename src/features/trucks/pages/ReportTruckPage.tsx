import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ImageUpload } from '../components/ImageUpload';
import { apiRequest } from '../../../lib/api';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export function ReportTruckPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Reset scroll on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Helper to get local ISO string for datetime-local input
  const getLocalISOTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(Date.now() - offset).toISOString().slice(0, 16);
  };

  const [reportingDateTime, setReportingDateTime] = useState(getLocalISOTime());
  const [note, setNote] = useState('');
  const [image1, setImage1] = useState<string | undefined>();
  const [image2, setImage2] = useState<string | undefined>();
  const [image3, setImage3] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // In a real app, you would fetch truck details by ID from state or API.
  // For now, we just mock the display.
  const truckPlate = `Truck #${id}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image1) {
      alert('At least one image is required.');
      return;
    }
    if (!id) return;

    setIsSubmitting(true);

    try {
      const formattedTime = reportingDateTime.replace('T', ' ') + ':00';
      
      const payload: any = {
        truck_line_id: parseInt(id, 10),
        reporting_datetime: formattedTime,
        note: note,
        image_1: image1
      };
      if (image2) payload.image_2 = image2;
      if (image3) payload.image_3 = image3;

      await apiRequest('POST', '/booking/trucks/report', payload);
      
      setShowSuccess(true);
      setTimeout(() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/trucks/loaded', { replace: true });
        }
      }, 1500);
    } catch (error: any) {
      alert(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon />
        </div>
        <h1 className="text-[24px] font-bold text-text-primary mb-2 tracking-tight">Report Submitted</h1>
        <p className="text-text-secondary text-[15px]">The truck arrival has been successfully reported.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ArrowLeftIcon />
          </button>
          <div>
            <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-none">Report Arrival</h1>
            <p className="text-[14px] text-text-secondary font-medium mt-1">{truckPlate}</p>
          </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-32">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-4">
            <label className="text-[14px] font-semibold text-text-primary">
              Reporting Date & Time <span className="text-accent">*</span>
            </label>
            <input 
              type="datetime-local"
              value={reportingDateTime}
              onChange={(e) => setReportingDateTime(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-[16px] border border-slate-300 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-[15px]"
              required
            />
          </div>
          
          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-5">
            <h2 className="text-[18px] font-semibold text-text-primary">Photos</h2>
            
            <ImageUpload 
              label="Primary Image" 
              required={true}
              onImageSelected={setImage1} 
            />
            
            <div className="grid grid-cols-2 gap-4">
              <ImageUpload 
                label="Image 2 (Optional)" 
                onImageSelected={setImage2} 
              />
              <ImageUpload 
                label="Image 3 (Optional)" 
                onImageSelected={setImage3} 
              />
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-4">
            <label className="text-[14px] font-semibold text-text-primary">Notes (Optional)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any specific observations or notes here..."
              className="w-full min-h-[120px] p-4 bg-gray-50 rounded-[16px] border border-slate-300 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none text-[15px]"
            />
          </div>

          {/* Fixed Bottom Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-900/5 p-4 sm:p-6 z-50">
            <div className="max-w-[1200px] mx-auto">
              <button 
                type="submit"
                disabled={isSubmitting || !image1}
                className={`w-full py-4 rounded-[16px] font-bold text-[16px] shadow-[0_4px_12px_rgba(10,46,99,0.15)] flex justify-center items-center transition-transform active:scale-[0.98] ${
                  isSubmitting || !image1 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                    : 'bg-primary text-white hover:shadow-[0_4px_16px_rgba(10,46,99,0.2)]'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

    </div>
  );
}
