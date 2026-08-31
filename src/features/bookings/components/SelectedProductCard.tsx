import React from 'react';
import type { SelectedProduct } from '../types';

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

interface SelectedProductCardProps {
  item: SelectedProduct;
  index: number;
  isViewMode: boolean;
  onEdit: (item: SelectedProduct) => void;
  onDelete: (localId: string) => void;
}

export function SelectedProductCard({
  item,
  index,
  isViewMode,
  onEdit,
  onDelete,
}: SelectedProductCardProps) {
  const bundle = item.product.bundles?.find((b) => b.id === item.selected_bundle_id);
  const isConfigured =
    item.order_type === 'weight'
      ? item.weight && item.weight > 0
      : item.selected_bundle_id && item.bundle_quantity && item.bundle_quantity > 0;

  return (
    <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_16px_rgba(15,23,42,0.03)] border border-slate-900/5 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {index + 1}
            </span>
            <h3 className="font-bold text-text-primary text-[15px] leading-tight">
              {item.product.name}
            </h3>
            {!isConfigured && !isViewMode && (
              <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100 animate-pulse">
                Requires Config
              </span>
            )}
          </div>
          <p className="text-[12px] font-medium text-text-secondary ml-7">
            DIA: <span className="font-semibold text-text-primary">{item.dia}</span> • Shape:{' '}
            <span className="font-semibold text-text-primary">{item.shape}</span> • Weight:{' '}
            <span className="font-semibold text-text-primary">{item.weight_option}</span>
          </p>
        </div>

        {!isViewMode && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label="Edit product"
              className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.local_id)}
              aria-label="Delete product"
              className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>

      {isConfigured && (
        <div className="ml-7 bg-slate-50 rounded-[12px] p-3 border border-slate-900/5">
          {item.order_type === 'bundle' ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-text-secondary font-medium">Ordering Mode:</span>
                <span className="font-bold text-text-primary">Predefined Bundle</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-text-secondary font-medium">Bundle:</span>
                <span className="font-bold text-text-primary">{bundle?.name || 'Standard Bundle'}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-text-secondary font-medium">Quantity:</span>
                <span className="font-bold text-text-primary">{item.bundle_quantity} Bundles</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-text-secondary font-medium">Ordering Mode:</span>
                <span className="font-bold text-text-primary">Custom Weight</span>
              </div>
              <div className="flex justify-between items-center text-[13px] mt-1.5">
                <span className="text-text-secondary font-medium">Weight:</span>
                <span className="font-bold text-text-primary">
                  {item.weight?.toLocaleString()} {item.uom}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
