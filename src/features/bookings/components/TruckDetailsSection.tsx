import React from 'react';
import { Accordion } from '../../../components/ui/Accordion';
import { Input } from '../../../components/ui/Input';
import type { CreateBookingFormState } from '../types';

interface TruckDetailsSectionProps {
  form: CreateBookingFormState;
  errors: Record<string, string>;
  isViewMode: boolean;
  onFormChange: (field: keyof CreateBookingFormState, value: unknown) => void;
}

export function TruckDetailsSection({
  form,
  errors,
  isViewMode,
  onFormChange,
}: TruckDetailsSectionProps) {
  return (
    <Accordion title="Truck Details" defaultExpanded={true}>
      <div className="flex flex-col gap-5 pb-2">
        <Input
          label="Truck Type *"
          placeholder="e.g. 10-Wheeler, Trailer"
          value={form.truck_type}
          onChange={(e) => onFormChange('truck_type', e.target.value)}
          disabled={isViewMode}
          error={errors.truck_type}
        />

        <Input
          label="Truck Number Plate *"
          placeholder="e.g. MH-12-AB-1234"
          value={form.truck_number_plate}
          onChange={(e) => onFormChange('truck_number_plate', e.target.value)}
          disabled={isViewMode}
          error={errors.truck_number_plate}
        />

        <Input
          label="Truck Capacity (Tons)"
          type="number"
          placeholder="e.g. 25"
          value={form.truck_capacity?.toString() || ''}
          onChange={(e) => onFormChange('truck_capacity', e.target.value ? Number(e.target.value) : null)}
          disabled={isViewMode}
        />

        <Input
          label="Transporter Name *"
          placeholder="Enter transporter name"
          value={form.transporter_name}
          onChange={(e) => onFormChange('transporter_name', e.target.value)}
          disabled={isViewMode}
          error={errors.transporter_name}
        />

        <Input
          label="Transporter Contact"
          type="tel"
          placeholder="Enter phone number"
          value={form.transporter_contact}
          onChange={(e) => onFormChange('transporter_contact', e.target.value)}
          disabled={isViewMode}
        />
      </div>
    </Accordion>
  );
}
