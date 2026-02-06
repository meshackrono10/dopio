"use client";

import React, { FC } from "react";
import Input from "@/shared/Input";
import Select from "@/shared/Select";
import FormItem from "../FormItem";
import { usePropertyForm } from "@/contexts/PropertyFormContext";

export interface PageAddListing1Props { }

const PageAddListing1: FC<PageAddListing1Props> = () => {
  const { formData, updateFormData, setPropertyType, shouldSkipSizeDetails } = usePropertyForm();
  const isSharedAccommodation = formData.rentalArrangement === 'Shared accommodation';

  const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPropertyType(e.target.value as any);
  };

  const handlePropertyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('propertyName', e.target.value);
  };

  const handleRentalArrangementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData('rentalArrangement', e.target.value);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Property Details</h2>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
      {/* FORM */}
      <div className="space-y-8">
        {/* ITEM */}
        <FormItem
          label="Type of Place"
          desc="Select the specific type of accommodation you're listing"
        >
          <Select
            onChange={handlePropertyTypeChange}
            value={formData.propertyType || ''}
          >
            <option value="">Select property type</option>
            <option value="Single Room">Single Room - Shared bathroom & kitchen</option>
            <option value="Bedsitter">Bedsitter - Self-contained with private bathroom</option>
            <option value="Studio">Studio - Open plan with separate kitchen</option>
            <option value="1 Bedroom">1-bedroom - Standalone or apartment bedroom</option>
            <option value="2 Bedroom">2-bedroom - Standalone or apartment 2 bedrooms</option>
            <option value="3 Bedroom">3-bedroom - Standalone or apartment 3 bedrooms</option>
            <option value="4+ Bedroom">4+ Bedroom - Standalone or apartment</option>
          </Select>
        </FormItem>

        <FormItem
          label="Neighborhood Type"
          desc="What type of neighborhood is this property in?"
        >
          <Select
            value={formData.neighborhoodType || ''}
            onChange={(e) => updateFormData('neighborhoodType', e.target.value)}
          >
            <option value="">Select neighborhood type</option>
            <option value="Court">Court - Secured court with gated entrance</option>
            <option value="Estate">Estate - Large residential estate</option>
            <option value="Apartment Block">Apartment Block - Multi-story residential building</option>
            <option value="Standalone">Standalone - Individual house with private compound</option>
            <option value="Gated Community">Gated Community - High-end secured community</option>
          </Select>
        </FormItem>

        {formData.propertyType && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start">
              <i className="las la-info-circle text-xl text-blue-600 dark:text-blue-400 mr-2 mt-0.5"></i>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                {formData.propertyType === 'Single Room' && (
                  "Single room with shared bathroom and kitchen facilities. Perfect for students or single professionals."
                )}
                {formData.propertyType === 'Bedsitter' && (
                  "Self-contained single room with private bathroom. Kitchen area included in the room."
                )}
                {formData.propertyType === 'Studio' && (
                  "Open-plan apartment with separate kitchen area and private bathroom."
                )}
                {formData.propertyType === '1 Bedroom' && (
                  "One bedroom unit, can be in an apartment building or standalone house."
                )}
                {formData.propertyType === '2 Bedroom' && (
                  "Two bedroom unit, can be in an apartment building or standalone house."
                )}
                {formData.propertyType === '3 Bedroom' && (
                  "Three bedroom unit, can be in an apartment building or standalone house."
                )}
              </div>
            </div>
          </div>
        )}

        <FormItem
          label="Property name"
          desc="Give your property a descriptive name (e.g., 'Modern 2BR in Kasarani')"
        >
          <Input
            placeholder="Property name"
            value={formData.propertyName}
            onChange={handlePropertyNameChange}
          />
        </FormItem>

        {/* MERGED SIZE & LAYOUT FIELDS */}
        {formData.propertyCategory && (
          <div className="space-y-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
            {/* Hide floor level for independent houses as it's less relevant */}
            {formData.propertyCategory !== 'Independent House / Standalone' && formData.propertyCategory !== 'House in an Estate' && (
              <FormItem label="Floor Level (for apartments)">
                <Select
                  value={formData.floorLevel}
                  onChange={(e) => updateFormData('floorLevel', e.target.value)}
                >
                  <option value="">Select floor level</option>
                  <option value="ground">Ground Floor</option>
                  <option value="1">1st Floor</option>
                  <option value="2">2nd Floor</option>
                  <option value="3">3rd Floor</option>
                  <option value="4">4th Floor</option>
                  <option value="5+">5th Floor & Above</option>
                </Select>
              </FormItem>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PageAddListing1;
