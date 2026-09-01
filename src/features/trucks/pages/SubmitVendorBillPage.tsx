import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { DocumentUpload } from '../components/DocumentUpload';
import { useSubmitVendorBill } from '../hooks/useTruckMutations';
import type { LoadingTruck, VendorBillFormState } from '../types';
import { dispatchGlobalToast } from '../../../app/providers/ToastProvider';


/**
 * Converts a File object into a Base64 Data URL string for backend API submission.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export function SubmitVendorBillPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id: string }>();
  const submitBillMutation = useSubmitVendorBill();

  // Extract truck info passed via location state or fallback
  const truck: LoadingTruck | undefined = location.state?.truck;
  const truckLineId = truck?.id || parseInt(params.id || '201', 10);

  // Reset scroll position and guard against already submitted bills
  useEffect(() => {
    window.scrollTo(0, 0);
    if (truck?.is_submitted) {
      alert('The vendor bill for this truck has already been submitted.');
      navigate('/trucks/loading', { replace: true });
    }
  }, [truck, navigate]);

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [form, setForm] = useState<VendorBillFormState>({
    truck_line_id: truckLineId,
    bill_number: '',
    bill_date: getTodayDateString(),
    bill_document: null,
    bill_document_name: '',
    eway_bill_attached_with_bill: false,
    eway_bill_number: '',
    eway_bill_document: null,
    eway_bill_document_name: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.bill_number.trim()) {
      newErrors.bill_number = 'Vendor Bill Number is required.';
    }

    if (!form.bill_date) {
      newErrors.bill_date = 'Bill Date is required.';
    }

    if (!form.bill_document) {
      newErrors.bill_document = 'Vendor Bill Document (PDF or Image) is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      scrollToTop();
      return;
    }

    setSubmitting(true);

    try {
      // 1. Convert uploaded vendor bill document to base64
      const billDocBase64 = await fileToBase64(form.bill_document!);

      // 2. Build backend API payload according to .agents/README.md Section 6
      const payload: any = {
        truck_line_id: form.truck_line_id,
        bill_number: form.bill_number.trim(),
        bill_date: form.bill_date,
        bill_document: billDocBase64,
        bill_document_name: form.bill_document_name || form.bill_document!.name || 'bill.pdf',
        eway_bill_attached_with_bill: form.eway_bill_attached_with_bill
      };

      // 3. Attach E-Way bill info if not already attached with bill document
      if (!form.eway_bill_attached_with_bill) {
        if (form.eway_bill_number.trim()) {
          payload.eway_bill_number = form.eway_bill_number.trim();
        }
        if (form.eway_bill_document) {
          payload.eway_bill_document = await fileToBase64(form.eway_bill_document);
          payload.eway_bill_document_name = form.eway_bill_document_name || form.eway_bill_document.name || 'eway_bill.pdf';
        }
      }

      // 4. Send API Request POST /booking/trucks/submit_vendor_bill via mutation
      await submitBillMutation.mutateAsync(payload);

      setShowSuccess(true);
      dispatchGlobalToast({
        type: 'success',
        title: 'Bill Submitted',
        message: 'Vendor bill details and documents have been recorded successfully.',
      });
      setTimeout(() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/trucks/loading', { replace: true });
        }
      }, 1500);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit vendor bill due to a network error. Please try again.');
      scrollToTop();
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircleIcon />
        </div>
        <h1 className="text-[24px] font-bold text-text-primary mb-2 tracking-tight">Vendor Bill Submitted!</h1>
        <p className="text-text-secondary text-[15px] max-w-sm">
          The bill details and attached documents have been successfully recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto flex items-center gap-4">
          <button 
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/trucks/loading', { replace: true }))}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-[22px] font-bold text-text-primary tracking-tight">Submit Vendor Bill</h1>
        </div>
      </div>

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-36">
        {/* Network / API Error Alert Banner */}
        {apiError && (
          <div className="mb-6 p-4 rounded-[18px] bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <div>
                <p className="font-bold text-red-900">Submission Error</p>
                <p className="text-xs font-medium text-red-700 mt-0.5">{apiError}</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setApiError(null)} 
              className="text-red-400 hover:text-red-700 text-sm font-bold p-1 rounded"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Truck Details Summary Header Card */}
        {truck && (
          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                <TruckIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary leading-tight">
                  {truck.truck_number_plate}
                </h3>
                <p className="text-xs text-text-secondary font-medium">
                  {truck.driver_name} • {truck.truck_type}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto">
              <span className="text-xs text-text-secondary block">Destination</span>
              <span className="text-xs font-semibold text-text-primary">{truck.delivery_address_name}</span>
            </div>
          </div>
        )}

        {/* Vendor Bill Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-text-primary tracking-tight border-b border-slate-100 pb-3">
            Bill & Invoice Details
          </h2>

          {/* Bill Number */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bill_number" className="text-sm font-semibold text-text-primary">
              Vendor Bill Number <span className="text-error">*</span>
            </label>
            <input 
              id="bill_number"
              type="text"
              placeholder="e.g. INV/2026/0001"
              value={form.bill_number}
              onChange={(e) => {
                setForm({ ...form, bill_number: e.target.value });
                if (errors.bill_number) setErrors({ ...errors, bill_number: '' });
              }}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[14px] outline-none focus:border-primary focus:bg-white transition-all text-sm font-medium"
            />
            {errors.bill_number && <p className="text-xs font-semibold text-error mt-0.5">{errors.bill_number}</p>}
          </div>

          {/* Bill Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bill_date" className="text-sm font-semibold text-text-primary">
              Bill Date <span className="text-error">*</span>
            </label>
            <input 
              id="bill_date"
              type="date"
              value={form.bill_date}
              onChange={(e) => {
                setForm({ ...form, bill_date: e.target.value });
                if (errors.bill_date) setErrors({ ...errors, bill_date: '' });
              }}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[14px] outline-none focus:border-primary focus:bg-white transition-all text-sm font-medium"
            />
            {errors.bill_date && <p className="text-xs font-semibold text-error mt-0.5">{errors.bill_date}</p>}
          </div>

          {/* Bill Document Upload (PDF or Image) */}
          <div>
            <DocumentUpload 
              id="bill_document"
              label="Vendor Bill Document"
              required={true}
              hint="PDF or Image (JPG, PNG, WEBP)"
              value={form.bill_document}
              onChange={(file, fileName) => {
                setForm({
                  ...form,
                  bill_document: file,
                  bill_document_name: fileName
                });
                if (errors.bill_document) setErrors({ ...errors, bill_document: '' });
              }}
            />
            {errors.bill_document && (
              <p className="text-xs font-semibold text-error mt-1">{errors.bill_document}</p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-2 pt-4">
            <h2 className="text-lg font-bold text-text-primary tracking-tight mb-4">
              E-Way Bill Details
            </h2>

            {/* E-Way Bill Toggle */}
            <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-[16px] border border-slate-200 cursor-pointer select-none mb-4">
              <input 
                type="checkbox"
                checked={form.eway_bill_attached_with_bill}
                onChange={(e) => setForm({ ...form, eway_bill_attached_with_bill: e.target.checked })}
                className="w-5 h-5 accent-primary rounded cursor-pointer"
              />
              <span className="text-sm font-semibold text-text-primary">
                E-Way Bill is already attached with Vendor Bill document
              </span>
            </label>

            {/* E-Way Bill Sub-fields when not attached with bill */}
            {!form.eway_bill_attached_with_bill && (
              <div className="flex flex-col gap-5 p-4 bg-blue-50/40 rounded-[20px] border border-blue-100">
                {/* E-Way Bill Number */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="eway_bill_number" className="text-sm font-semibold text-text-primary">
                    E-Way Bill Number
                  </label>
                  <input 
                    id="eway_bill_number"
                    type="text"
                    placeholder="e.g. 123456789012"
                    value={form.eway_bill_number}
                    onChange={(e) => setForm({ ...form, eway_bill_number: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-[14px] outline-none focus:border-primary transition-all text-sm font-medium"
                  />
                </div>

                {/* E-Way Bill Document Upload */}
                <DocumentUpload 
                  id="eway_bill_document"
                  label="E-Way Bill Document"
                  hint="PDF or Image (JPG, PNG, WEBP)"
                  value={form.eway_bill_document}
                  onChange={(file, fileName) => {
                    setForm({
                      ...form,
                      eway_bill_document: file,
                      eway_bill_document_name: fileName
                    });
                  }}
                />
              </div>
            )}
          </div>
        </form>
      </main>

      {/* Fixed Bottom Submit Button Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-900/5 p-4 sm:p-6 z-50">
        <div className="max-w-[800px] mx-auto">
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-4 rounded-[16px] font-bold text-[16px] flex justify-center items-center gap-2 transition-all active:scale-[0.98] ${
              submitting 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-primary text-white shadow-[0_4px_16px_rgba(10,46,99,0.2)] hover:shadow-[0_4px_20px_rgba(10,46,99,0.25)]'
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Details...
              </span>
            ) : (
              'Submit Vendor Bill'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
