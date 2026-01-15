"use client";

import React, { FC } from "react";
import NcInputNumber from "@/components/NcInputNumber";
import FormItem from "../FormItem";
import Select from "@/shared/Select";
import { usePropertyForm } from "@/contexts/PropertyFormContext";

export interface PageAddListing3Props { }

const PageAddListing3: FC<PageAddListing3Props> = () => {
  const { formData, propertyType, shouldSkipSizeDetails, getBedroomCount, getBathroomCount } = usePropertyForm();
  const isSharedAccommodation = formData.rentalArrangement === 'Shared accommodation';

  // Simplified form for Single Room/Bedsitter/Studio
  if (shouldSkipSizeDetails()) {
    const getPropertyDescription = () => {
      if (propertyType === 'Single Room') {
        return {
          bedrooms: '1 (Shared facilities)',
          bathrooms: '0 (Shared bathroom)',
          description: 'Single room properties have shared bathroom and kitchen facilities with other tenants.'
        };
      } else if (propertyType === 'Bedsitter') {
        return {
          bedrooms: '0 (One main room)',
          bathrooms: '1 (Private bathroom)',
          description: 'Bedsitter is a self-contained single room with a private bathroom and kitchen area within the room.'
        };
      } else {
        return {
          bedrooms: '1',
          bathrooms: '1',
          description: 'Studio apartment with open-plan living and separate kitchen area.'
        };
      }
    };

    const config = getPropertyDescription();

    return (
      <>
        <h2 className="text-2xl font-semibold">Property Size & Layout</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />

        <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
          <div className="flex items-start">
            <i className="las la-info-circle text-2xl text-primary-600 mr-3 mt-1"></i>
            <div>
              <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-1">
                {propertyType} Property Configuration
              </h3>
              <p className="text-sm text-primary-800 dark:text-primary-200">
                {config.description}
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="space-y-8">
          {/* Configuration details removed as per user request */}

          {!isSharedAccommodation && (
            <NcInputNumber
              label="Maximum Occupants"
              desc="How many people can comfortably live here?"
              defaultValue={formData.maxOccupants}
            />
          )}

          <FormItem label="Floor Level">
            <Select>
              <option value="">Select floor level</option>
              <option value="ground">Ground Floor</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
              <option value="4">4th Floor</option>
              <option value="5+">5th Floor & Above</option>
            </Select>
          </FormItem>

          <FormItem label="Does the property have a balcony/terrace?">
            <Select>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </FormItem>
        </div>
      </>
    );
  }

  // Full form for 1+ bedroom properties
  return (
    <>
      <h2 className="text-2xl font-semibold">Property Size & Layout</h2>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />
      {/* FORM */}
      <div className="space-y-8">
        {/* ITEM */}
        <FormItem label="Number of Bedrooms">
          <Select>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4 Bedrooms</option>
            <option value="5+">5+ Bedrooms</option>
          </Select>
        </FormItem>

        <FormItem label="Number of Bathrooms">
          <Select>
            <option value="1">1 Bathroom</option>
            <option value="2">2 Bathrooms</option>
            <option value="3">3 Bathrooms</option>
            <option value="4+">4+ Bathrooms</option>
          </Select>
        </FormItem>

        <FormItem label="Ensuite Master Bedroom?">
          <Select>
            <option value="yes">Yes - Master has private bathroom</option>
            <option value="no">No - Shared bathrooms only</option>
          </Select>
        </FormItem>

        {!isSharedAccommodation && (
          <NcInputNumber label="Maximum Occupants" defaultValue={4} />
        )}

        <FormItem label="Floor Level (for apartments)">
          <Select>
            <option value="">Select floor level</option>
            <option value="ground">Ground Floor</option>
            <option value="1">1st Floor</option>
            <option value="2">2nd Floor</option>
            <option value="3">3rd Floor</option>
            <option value="4">4th Floor</option>
            <option value="5+">5th Floor & Above</option>
          </Select>
        </FormItem>

        <FormItem label="Does the property have a balcony/terrace?">
          <Select>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </FormItem>
      </div>
    </>
  );
};

export default PageAddListing3;
