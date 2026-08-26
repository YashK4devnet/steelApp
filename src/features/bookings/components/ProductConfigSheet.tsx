import React, { useState, useEffect } from 'react';
import type { DIAProduct, SelectedProduct, UOM } from '../types';
import { DIA_OPTIONS, SHAPE_OPTIONS, WEIGHT_TYPE_OPTIONS } from '../constants';
import { getUOMs } from '../services/bookingApi';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Toggle';

interface ProductConfigSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: DIAProduct | null;
  initialData?: SelectedProduct | null;
  onSave: (data: SelectedProduct) => void;
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function ProductConfigSheet({ isOpen, onClose, product, initialData, onSave }: ProductConfigSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  
  // Master data UOMs
  const [masterUOMs, setMasterUOMs] = useState<UOM[]>([]);

  // Toggle for bundle vs custom weight
  const [useBundle, setUseBundle] = useState<boolean>(true);
  
  // New configuration dropdown states
  const [dia, setDia] = useState<string>('12');
  const [shape, setShape] = useState<string>('U');
  const [weightOption, setWeightOption] = useState<string>('BIS');
  
  // Normal form state
  const [weight, setWeight] = useState<string>('');
  const [uom, setUom] = useState<string>('');
  const [uomId, setUomId] = useState<number | undefined>(undefined);
  
  // Bundle form state
  const [selectedBundleId, setSelectedBundleId] = useState<number | null>(null);
  const [bundleQuantity, setBundleQuantity] = useState<number>(1);
  
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && product) {
      const loadUOMs = async () => {
        try {
          const list = await getUOMs();
          setMasterUOMs(list);
        } catch (e) {
          console.error('Failed to load UOMs', e);
        }
      };

      loadUOMs();

      const defaultUomName = (product.uom_options && product.uom_options.length > 0)
        ? product.uom_options[0]
        : 'TON';

      if (initialData) {
        setWeight(initialData.weight && initialData.weight > 0 ? initialData.weight.toString() : '');
        setUom(initialData.uom || defaultUomName);
        setUomId(initialData.uom_id);
        setSelectedBundleId(initialData.selected_bundle_id || product.bundles?.[0]?.id || null);
        setBundleQuantity(initialData.bundle_quantity || 1);
        setUseBundle(product.has_bundles && initialData.order_type === 'bundle');
        setDia(initialData.dia || '12');
        setShape(initialData.shape || 'U');
        setWeightOption(initialData.weight_option || 'BIS');
      } else {
        setWeight('');
        setUom(defaultUomName);
        setUomId(undefined);
        setSelectedBundleId(product.bundles?.[0]?.id || null);
        setBundleQuantity(1);
        setUseBundle(product.has_bundles);
        setDia('12');
        setShape('U');
        setWeightOption('BIS');
      }
      setError('');
    }
  }, [isOpen, product, initialData]);

  if (!isOpen && !isClosing) return null;
  if (!product) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 220);
  };

  const uomSelectOptions = masterUOMs.length > 0
    ? masterUOMs.map((u) => ({ value: u.name, label: u.name.toUpperCase() }))
    : (product.uom_options && product.uom_options.length > 0 ? product.uom_options : ['TON', 'KG']).map((opt) => ({ value: opt, label: opt }));

  const handleSave = () => {
    setError('');
    
    if (!dia) {
      setError('Please select DIA');
      return;
    }
    if (!shape) {
      setError('Please select Shape');
      return;
    }
    if (!weightOption) {
      setError('Please select Weight');
      return;
    }

    if (useBundle) {
      if (!selectedBundleId) {
        setError('Please select a bundle');
        return;
      }
      if (bundleQuantity <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }
      
      const selectedBundle = product.bundles?.find(b => b.id === selectedBundleId);
      const calculatedWeight = selectedBundle ? selectedBundle.preset_weight_kg * bundleQuantity : 0;
      
      onSave({
        local_id: initialData?.local_id || Date.now().toString(),
        product,
        dia,
        shape,
        weight_option: weightOption,
        order_type: 'bundle',
        selected_bundle_id: selectedBundleId,
        bundle_quantity: bundleQuantity,
        calculated_weight: calculatedWeight
      });
      
    } else {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        setError('Please enter a valid weight');
        return;
      }
      if (!uom) {
        setError('Please select a UOM');
        return;
      }

      const matchedMaster = masterUOMs.find((m) => m.name.toLowerCase() === uom.toLowerCase());
      
      onSave({
        local_id: initialData?.local_id || Date.now().toString(),
        product,
        dia,
        shape,
        weight_option: weightOption,
        order_type: 'weight',
        weight: weightNum,
        uom,
        uom_id: matchedMaster ? matchedMaster.id : uomId,
      });
    }
    
    handleClose();
  };

  const activeBundle = product.bundles?.find(b => b.id === selectedBundleId);
  const calculatedWeight = activeBundle ? activeBundle.preset_weight_kg * bundleQuantity : 0;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-t-[32px] sm:rounded-[24px] shadow-[0_20px_50px_rgba(15,23,42,0.22)] border border-slate-900/10 p-6 sm:p-7 max-w-md w-full relative overflow-hidden flex flex-col max-h-[90vh] ${
          isClosing ? 'animate-slide-down-bottom' : 'animate-slide-up-bottom'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[20px] font-bold text-text-primary tracking-tight leading-tight">
              {product.name}
            </h3>
            <p className="text-[13px] font-medium text-text-secondary mt-1">
              Configure parameters and quantities
            </p>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
          <div className="flex flex-col gap-5">
            {/* Redesigned Dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Select DIA"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                options={DIA_OPTIONS.map((val) => ({ value: val, label: val }))}
              />
              <Select 
                label="Select Shape"
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                options={SHAPE_OPTIONS.map((val) => ({ value: val, label: val }))}
              />
            </div>

            <Select 
              label="Select Weight Type"
              value={weightOption}
              onChange={(e) => setWeightOption(e.target.value)}
              options={WEIGHT_TYPE_OPTIONS.map((val) => ({ value: val, label: val }))}
            />

            <Toggle 
              label="Use Predefined Bundle"
              description="Select preset bundle rather than custom weight"
              checked={useBundle}
              onChange={setUseBundle}
            />

            {useBundle ? (
              <>
                <Select 
                  label="Select Bundle"
                  value={selectedBundleId || ''}
                  onChange={(e) => setSelectedBundleId(Number(e.target.value))}
                  options={product.bundles?.map(b => ({ value: b.id, label: b.name })) || []}
                />
                
                {activeBundle && (
                  <div className="bg-slate-50 rounded-[16px] p-4 border border-slate-900/5">
                    <p className="text-[12px] font-semibold text-text-secondary mb-2 uppercase tracking-wider">Bundle Includes</p>
                    <ul className="list-disc pl-4 text-[14px] text-text-primary font-medium space-y-1">
                      {activeBundle.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <p className="text-[13px] text-text-secondary mt-3">
                      Preset Weight: <span className="font-bold text-text-primary">{activeBundle.preset_weight_kg} KG</span>
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-[13px] font-bold text-text-primary mb-1.5 ml-1">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setBundleQuantity(Math.max(1, bundleQuantity - 1))}
                      className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-[16px] text-xl font-bold text-slate-600 active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center font-bold text-[20px] text-text-primary">
                      {bundleQuantity}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setBundleQuantity(bundleQuantity + 1)}
                      className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-[16px] text-xl font-bold text-slate-600 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-[16px] p-4 flex justify-between items-center border border-primary/10">
                  <span className="text-[14px] font-semibold text-primary">Total Weight</span>
                  <span className="text-[18px] font-bold text-primary">{calculatedWeight.toLocaleString()} KG</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-4">
                  <div className="flex-[2]">
                    <Input 
                      label="Weight"
                      type="number"
                      placeholder="Enter weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Select 
                      label="UOM"
                      value={uom}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        setUom(selectedVal);
                        const matched = masterUOMs.find((m) => m.name.toLowerCase() === selectedVal.toLowerCase());
                        if (matched) setUomId(matched.id);
                      }}
                      options={uomSelectOptions}
                    />
                  </div>
                </div>
              </>
            )}
            
            {error && (
              <p className="text-red-500 text-sm font-medium mt-1">{error}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-4 rounded-[16px] bg-primary text-white font-bold text-[15px] shadow-[0_4px_14px_rgba(10,46,99,0.25)] hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {initialData ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
