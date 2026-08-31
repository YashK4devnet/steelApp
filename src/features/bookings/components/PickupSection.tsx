import React from 'react';
import { Accordion } from '../../../components/ui/Accordion';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import type { Warehouse, CreateBookingFormState } from '../types';

interface PickupSectionProps {
  form: CreateBookingFormState;
  warehouses: Warehouse[];
  errors: Record<string, string>;
  isViewMode: boolean;
  onWarehouseChange: (warehouseId: number) => void;
}

export function PickupSection({
  form,
  warehouses,
  errors,
  isViewMode,
  onWarehouseChange,
}: PickupSectionProps) {
  return (
    <Accordion title="Pickup Details" defaultExpanded={true}>
      <div className="flex flex-col gap-5 pb-2">
        <Select
          id="pickup_warehouse_id"
          name="pickup_warehouse_id"
          label="Pickup Warehouse *"
          placeholder="Select Warehouse"
          value={form.pickup_warehouse_id || ''}
          onChange={(e) => onWarehouseChange(Number(e.target.value))}
          options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          disabled={isViewMode}
          error={errors.pickup_warehouse_id}
        />

        <Input
          label="Warehouse Address"
          value={form.warehouse_address_name}
          readOnly
          disabled
          placeholder="Auto-populated from warehouse"
          className="bg-slate-100 text-slate-500"
        />
      </div>
    </Accordion>
  );
}
