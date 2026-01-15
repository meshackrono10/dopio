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
          label="Property Category"
          desc="Is this an apartment, in a court, or a standalone house?"
        >
          <Select
            value={formData.propertyCategory}
            onChange={(e) => updateFormData('propertyCategory', e.target.value)}
          >
            <option value="Apartment / Flat">Apartment / Flat</option>
            <option value="Apartment in a Court">Apartment in a Court (Gated community)</option>
            <option value="House in an Estate">House in an Estate (e.g., Nyayo, Buruburu)</option>
            <option value="Independent House / Standalone">Independent House / Standalone</option>
            <option value="Shared Accommodation">Shared Accommodation (Roommate / Hostel)</option>
          </Select>
        </FormItem>

        <FormItem
          label="Choose a property type"
          desc="Select the specific type of unit you're listing"
        >
          <Select
            onChange={handlePropertyTypeChange}
            value={formData.propertyType || ''}
          >
            <option value="">Select property type</option>
            {formData.propertyCategory === 'Apartment / Flat' ||
              formData.propertyCategory === 'Apartment in a Court' ||
              formData.propertyCategory === 'Shared Accommodation' ? (
              <>
                <option value="Single Room">Single Room (Shared bathroom & kitchen)</option>
                <option value="Bedsitter">Bedsitter (Room with private bathroom)</option>
                <option value="Studio">Studio Apartment (Open plan with kitchen)</option>
                <option value="1 Bedroom">1 Bedroom Apartment</option>
                <option value="2 Bedroom">2 Bedroom Apartment</option>
                <option value="3 Bedroom">3 Bedroom Apartment</option>
                <option value="4+ Bedroom">4+ Bedroom Apartment</option>
                <option value="Servant Quarter">Servant Quarter (SQ)</option>
              </>
            ) : (
              <>
                <option value="1 Bedroom">1 Bedroom House</option>
                <option value="2 Bedroom">2 Bedroom House</option>
                <option value="3 Bedroom">3 Bedroom House</option>
                <option value="4+ Bedroom">4+ Bedroom House</option>
                <option value="Maisonette">Maisonette</option>
                <option value="Bungalow">Bungalow</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Servant Quarter">Servant Quarter (SQ)</option>
              </>
            )}
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
            {/* Show bedroom count only if not already specified in type */}
            {!shouldSkipSizeDetails() && !['1 Bedroom', '2 Bedroom', '3 Bedroom', '4+ Bedroom'].includes(formData.propertyType || '') && (
              <FormItem label="Number of Bedrooms">
                <Select
                  value={formData.bedrooms}
                  onChange={(e) => updateFormData('bedrooms', Number(e.target.value))}
                >
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5+">5+ Bedrooms</option>
                </Select>
              </FormItem>
            )}

            {!shouldSkipSizeDetails() && (
              <FormItem label="Ensuite Master Bedroom?">
                <Select
                  value={formData.ensuite ? 'yes' : 'no'}
                  onChange={(e) => updateFormData('ensuite', e.target.value === 'yes')}
                >
                  <option value="yes">Yes - Master has private bathroom</option>
                  <option value="no">No - Shared bathrooms only</option>
                </Select>
              </FormItem>
            )}

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
