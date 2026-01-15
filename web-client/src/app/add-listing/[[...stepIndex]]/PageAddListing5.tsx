"use client";

import React, { FC } from "react";
import Checkbox from "@/shared/Checkbox";
import FormItem from "../FormItem";
import Select from "@/shared/Select";
import Input from "@/shared/Input";
import { usePropertyForm } from "@/contexts/PropertyFormContext";

export interface PageAddListing5Props { }

const PageAddListing5: FC<PageAddListing5Props> = () => {
  const { formData, updateFormData } = usePropertyForm();
  const isSharedAccommodation = formData.rentalArrangement === 'Shared accommodation';

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    updateFormData("amenities", newAmenities);
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold">
          Utilities & What&apos;s Included in Rent
        </h2>
        <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
          Clearly specify what utilities and services are included in the monthly rent. This is crucial information for tenants!
        </span>
      </div>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

      {/* FORM */}
      <div className="space-y-8">

        {/* WATER */}
        <div>
          <label className="text-lg font-semibold">
            Water Supply
          </label>
          <div className="mt-6 space-y-4">
            <div className="flex items-start">
              <input
                type="radio"
                id="water_included"
                name="water_billing"
                value="included"
                defaultChecked
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="water_included" className="ml-3 flex-1">
                <span className="block font-medium">Water is included in monthly rent</span>
                <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                  Tenant does not pay separately for water
                </span>
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="radio"
                id="water_separate"
                name="water_billing"
                value="separate"
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="water_separate" className="ml-3 flex-1">
                <span className="block font-medium">Water charged separately</span>
                <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                  Tenant pays for water consumption
                </span>
              </label>
            </div>

            <FormItem label="If charged separately, how?" desc="Optional">
              <Input placeholder="e.g., KSh 500 per month, Metered usage, etc." />
            </FormItem>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <label className="text-base font-medium mb-4 block">Water Features</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Checkbox
                  label="Reliable Water Supply"
                  name="water_supply"
                  checked={formData.amenities.includes("Reliable Water Supply")}
                  onChange={() => handleAmenityToggle("Reliable Water Supply")}
                />
                <Checkbox
                  label="Water Backup/Tanks"
                  name="water_backup"
                  checked={formData.amenities.includes("Water Backup/Tanks")}
                  onChange={() => handleAmenityToggle("Water Backup/Tanks")}
                />
                <Checkbox
                  label="Borehole Water"
                  name="borehole"
                  checked={formData.amenities.includes("Borehole Water")}
                  onChange={() => handleAmenityToggle("Borehole Water")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* GARBAGE COLLECTION */}
        <div>
          <label className="text-lg font-semibold">
            Garbage Collection
          </label>
          <div className="mt-6 space-y-4">
            <div className="flex items-start">
              <input
                type="radio"
                id="garbage_included"
                name="garbage_billing"
                value="included"
                defaultChecked
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="garbage_included" className="ml-3 flex-1">
                <span className="block font-medium">Garbage collection included in rent</span>
                <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                  No separate charge for waste disposal
                </span>
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="radio"
                id="garbage_separate"
                name="garbage_billing"
                value="separate"
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="garbage_separate" className="ml-3 flex-1">
                <span className="block font-medium">Garbage collection charged separately</span>
                <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                  Tenant pays for waste management service
                </span>
              </label>
            </div>

            <FormItem label="If charged separately, how much?" desc="Optional">
              <Input placeholder="e.g., KSh 300 per month" />
            </FormItem>
          </div>
        </div>

        {/* ELECTRICITY */}
        <div>
          <label className="text-lg font-semibold">
            Electricity
          </label>
          <div className="mt-6 space-y-5">
            <FormItem label="Electricity billing method" desc="Required">
              <Select>
                <option value="prepaid">Prepaid Meter (Tenant buys tokens)</option>
                <option value="postpaid">Postpaid Meter (Monthly bill)</option>
                <option value="included">Included in rent (Flat rate)</option>
                <option value="shared">Shared meter (Split among tenants)</option>
              </Select>
            </FormItem>
            <Checkbox
              label="Generator backup available"
              name="generator_backup"
              subLabel="Property has backup power"
              checked={formData.amenities.includes("Generator Backup")}
              onChange={() => handleAmenityToggle("Generator Backup")}
            />
            <FormItem label="Generator fuel cost (if applicable)" desc="Optional">
              <Input placeholder="e.g., KSh 50 per hour, Included, Tenant pays, etc." />
            </FormItem>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
              <Checkbox
                label="Individual KPLC Token Meter"
                name="hasTokenMeter"
                subLabel="Tenant has direct control over their electricity tokens"
                defaultChecked={formData.hasTokenMeter}
                onChange={(checked) => updateFormData('hasTokenMeter', checked)}
              />
              <Checkbox
                label="Solar Power Available"
                name="solar_power"
                subLabel="Property has solar water heating or backup"
                checked={formData.amenities.includes("Solar Power")}
                onChange={() => handleAmenityToggle("Solar Power")}
              />
            </div>
          </div>
        </div>

        {/* SECURITY */}
        <div>
          <label className="text-lg font-semibold">
            Security Services
          </label>
          <div className="mt-6 space-y-4">
            <div className="flex items-start">
              <input
                type="radio"
                id="security_included"
                name="security_billing"
                value="included"
                defaultChecked
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="security_included" className="ml-3 flex-1">
                <span className="block font-medium">Security fee included in rent</span>
                <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                  24/7 guards, CCTV, etc. at no extra cost
                </span>
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="radio"
                id="security_separate"
                name="security_billing"
                value="separate"
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="security_separate" className="ml-3 flex-1">
                <span className="block font-medium">Security charged separately</span>
                <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                  Tenant pays monthly security fee
                </span>
              </label>
            </div>

            <FormItem label="If charged separately, how much?" desc="Optional">
              <Input placeholder="e.g., KSh 1,000 per month" />
            </FormItem>
          </div>
        </div>

        {/* INTERNET */}
        <div>
          <label className="text-lg font-semibold">
            Internet/Wi-Fi
          </label>
          <div className="mt-6 space-y-5">
            <Checkbox
              label="Wi-Fi included in rent"
              name="wifi_included"
              subLabel="Free internet access provided"
              checked={formData.amenities.includes("Wi-Fi Included")}
              onChange={() => handleAmenityToggle("Wi-Fi Included")}
            />
            <Checkbox
              label="Wi-Fi ready (not included)"
              name="wifi_ready"
              subLabel="Property wired for internet, tenant arranges own connection"
              checked={formData.amenities.includes("Wi-Fi Ready")}
              onChange={() => handleAmenityToggle("Wi-Fi Ready")}
            />
            <Checkbox
              label="Fiber internet available"
              name="fiber_available"
              subLabel="Property has fiber connectivity"
              checked={formData.amenities.includes("Fiber Internet")}
              onChange={() => handleAmenityToggle("Fiber Internet")}
            />
          </div>
        </div>


      </div>
    </>
  );
};

export default PageAddListing5;
