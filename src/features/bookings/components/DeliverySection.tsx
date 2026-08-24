import React from 'react';
import { Accordion } from '../../../components/ui/Accordion';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import type { Address, CreateBookingFormState } from '../types';

interface DeliverySectionProps {
  form: CreateBookingFormState;
  addresses: Address[];
  errors: Record<string, string>;
  isViewMode: boolean;
  onFormChange: (field: keyof CreateBookingFormState, value: unknown) => void;
}

export function DeliverySection({
  form,
  addresses,
  errors,
  isViewMode,
  onFormChange,
}: DeliverySectionProps) {
  return (
    <Accordion title="Delivery Details" defaultExpanded={true}>
      <div className="flex flex-col gap-5 pb-2">
        <Input
          label="Customer"
          value={form.customer_name}
          readOnly
          disabled
          className="bg-slate-100 text-slate-500"
        />

        <Select
          label="Ship To Address *"
          placeholder="Select Ship To Address"
          value={form.ship_to_address_id || ''}
          onChange={(e) => {
            const val = Number(e.target.value);
            onFormChange('ship_to_address_id', val);
            if (form.bill_to_same_as_ship_to) {
              onFormChange('bill_to_address_id', val);
            }
          }}
          options={addresses.map((a) => ({ value: a.id, label: a.name }))}
          disabled={isViewMode}
          error={errors.ship_to_address_id}
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="bill_to_same_as_ship_to"
            checked={form.bill_to_same_as_ship_to}
            onChange={(e) => {
              const isChecked = e.target.checked;
              onFormChange('bill_to_same_as_ship_to', isChecked);
              if (isChecked) {
                onFormChange('bill_to_address_id', form.ship_to_address_id);
              }
            }}
            disabled={isViewMode}
            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary disabled:opacity-50 cursor-pointer"
          />
          <label htmlFor="bill_to_same_as_ship_to" className="text-[13px] font-semibold text-text-primary cursor-pointer">
            Bill To address same as Ship To
          </label>
        </div>

        {!form.bill_to_same_as_ship_to && (
          <Select
            label="Bill To Address *"
            placeholder="Select Bill To Address"
            value={form.bill_to_address_id || ''}
            onChange={(e) => onFormChange('bill_to_address_id', Number(e.target.value))}
            options={addresses.map((a) => ({ value: a.id, label: a.name }))}
            disabled={isViewMode}
            error={errors.bill_to_address_id}
          />
        )}
      </div>
    </Accordion>
  );
}
