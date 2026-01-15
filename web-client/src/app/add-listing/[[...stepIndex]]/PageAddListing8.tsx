"use client";
import React, { FC } from "react";
import Input from "@/shared/Input";
import Select from "@/shared/Select";
import FormItem from "../FormItem";
import Textarea from "@/shared/Textarea";
import { usePropertyForm } from "@/contexts/PropertyFormContext";

export interface PageAddListing8Props { }

const PageAddListing8: FC<PageAddListing8Props> = () => {
  const { formData, updateFormData } = usePropertyForm();
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold">Price & Description</h2>
        <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
          Set your rental terms and provide a detailed description. You can include details about utilities, amenities, and neighborhood features here.
        </span>
      </div>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
      {/* FORM */}
      <div className="space-y-8">
        {/* ITEM */}
        <FormItem label="Currency">
          <Select>
            <option value="KES">KES (Kenyan Shillings)</option>
          </Select>
        </FormItem>
        <FormItem label="Monthly Rent" desc="Standard monthly rent for this property">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">KSh</span>
            </div>
            <Input
              className="!pl-12 !pr-16"
              placeholder="45,000"
              value={formData.monthlyRent}
              onChange={(e) => updateFormData('monthlyRent', e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500">/month</span>
            </div>
          </div>
        </FormItem>
        {/* ----- */}
        <FormItem label="Security Deposit" desc="Refundable deposit (typically 1-2 months rent)">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">KSh</span>
            </div>
            <Input
              className="!pl-12 !pr-10"
              placeholder="45,000"
              value={formData.deposit}
              onChange={(e) => updateFormData('deposit', e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500">KES</span>
            </div>
          </div>
        </FormItem>



        <FormItem
          label="Property Description"
          desc="Include details about utilities (water, electricity), amenities, and neighborhood rules here. (Minimum 20 characters)"
        >
          <Textarea
            placeholder="e.g., Modern 2-bedroom apartment in the heart of Kasarani. Features spacious living areas, reliable water supply with backup tanks, prepaid electricity, 24/7 security with CCTV, secure parking, and is located near shopping centers and public transport..."
            rows={10}
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
          />
          <p className={`text-xs mt-1 ${formData.description.length < 20 ? 'text-red-500' : 'text-green-500'}`}>
            {formData.description.length} / 20 characters minimum
          </p>
        </FormItem>
      </div>
    </>
  );
};

export default PageAddListing8;
