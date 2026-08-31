import React from 'react';
import { Accordion } from '../../../components/ui/Accordion';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { CreateBookingFormState, TruckType } from '../types';

interface TruckDetailsSectionProps {
  form: CreateBookingFormState;
  truckTypes: TruckType[];
  errors: Record<string, string>;
  isViewMode: boolean;
  onFormChange: (field: keyof CreateBookingFormState, value: unknown) => void;
  onTruckTypeChange: (truckTypeId: number) => void;
  onToggleNewTruckType: (isNew: boolean) => void;
}

export function TruckDetailsSection({
  form,
  truckTypes,
  errors,
  isViewMode,
  onFormChange,
  onTruckTypeChange,
  onToggleNewTruckType,
}: TruckDetailsSectionProps) {
  const truckOptions = [
    ...truckTypes.map((t) => ({ value: t.id.toString(), label: t.name })),
    { value: 'new_custom_type', label: '+ Enter New Custom Truck Type' },
  ];

  return (
    <Accordion title="Truck Details" defaultExpanded={true}>
      <div className="flex flex-col gap-5 pb-2">
        {form.is_new_truck_type ? (
          <div className="flex flex-col gap-2">
            <Input
              id="truck_type"
              name="truck_type"
              label="New Truck Type Name *"
              placeholder="e.g. 24 Ft Open Body, Modular Trailer"
              value={form.truck_type}
              onChange={(e) => onFormChange('truck_type', e.target.value)}
              disabled={isViewMode}
              error={errors.truck_type}
            />
            {!isViewMode && (
              <button
                type="button"
                onClick={() => onToggleNewTruckType(false)}
                className="self-start text-[13px] font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                ← Choose from existing truck types
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Select
              id="truck_type"
              name="truck_type"
              label="Truck Type *"
              placeholder="Select Truck Type"
              value={form.truck_type_id?.toString() || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'new_custom_type') {
                  onToggleNewTruckType(true);
                } else if (val) {
                  onTruckTypeChange(Number(val));
                }
              }}
              options={truckOptions}
              disabled={isViewMode}
              error={errors.truck_type}
            />
            {!isViewMode && (
              <button
                type="button"
                onClick={() => onToggleNewTruckType(true)}
                className="self-start text-[13px] font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                + Enter a new truck type
              </button>
            )}
          </div>
        )}

        <Input
          id="truck_number_plate"
          name="truck_number_plate"
          label="Truck Number Plate *"
          placeholder="e.g. MH-12-AB-1234"
          value={form.truck_number_plate}
          onChange={(e) => onFormChange('truck_number_plate', e.target.value)}
          disabled={isViewMode}
          error={errors.truck_number_plate}
        />

        <Input
          id="truck_capacity"
          name="truck_capacity"
          label="Truck Capacity (Tons)"
          type="number"
          placeholder="e.g. 25"
          value={form.truck_capacity?.toString() || ''}
          onChange={(e) => onFormChange('truck_capacity', e.target.value ? Number(e.target.value) : null)}
          disabled={isViewMode}
        />

        <Input
          id="transporter_name"
          name="transporter_name"
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
