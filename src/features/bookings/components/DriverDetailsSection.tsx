import React from 'react';
import { Accordion } from '../../../components/ui/Accordion';
import { Input } from '../../../components/ui/Input';
import type { CreateBookingFormState } from '../types';

interface DriverDetailsSectionProps {
  form: CreateBookingFormState;
  errors: Record<string, string>;
  isViewMode: boolean;
  onFormChange: (field: keyof CreateBookingFormState, value: unknown) => void;
}

export function DriverDetailsSection({
  form,
  errors,
  isViewMode,
  onFormChange,
}: DriverDetailsSectionProps) {
  return (
    <Accordion title="Driver Details" defaultExpanded={true}>
      <div className="flex flex-col gap-5 pb-2">
        <Input
          id="driver_name"
          name="driver_name"
          label="Driver Name *"
          placeholder="Enter driver name"
          value={form.driver_name}
          onChange={(e) => onFormChange('driver_name', e.target.value)}
          disabled={isViewMode}
          error={errors.driver_name}
        />

        <Input
          id="driver_contact"
          name="driver_contact"
          label="Driver Contact Number *"
          type="tel"
          placeholder="Enter phone number"
          value={form.driver_contact}
          onChange={(e) => onFormChange('driver_contact', e.target.value)}
          disabled={isViewMode}
          error={errors.driver_contact}
        />

        <Input
          id="driver_license_number"
          name="driver_license_number"
          label="Driver License Number"
          placeholder="Enter license number"
          value={form.driver_license_number}
          onChange={(e) => onFormChange('driver_license_number', e.target.value)}
          disabled={isViewMode}
        />
      </div>
    </Accordion>
  );
}
