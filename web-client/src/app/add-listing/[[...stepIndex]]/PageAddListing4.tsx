"use client";
import React, { FC } from "react";
import Checkbox from "@/shared/Checkbox";
import { usePropertyForm } from "@/contexts/PropertyFormContext";

export interface PageAddListing4Props { }

const PageAddListing4: FC<PageAddListing4Props> = () => {
  const { formData, updateFormData } = usePropertyForm();
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold">Property Amenities</h2>
        <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
          Select all amenities available in your property
        </span>
      </div>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
      {/* FORM */}
      <div className="space-y-8">
        {/* SECURITY */}
        <div>
          <label className="text-lg font-semibold" htmlFor="">
            Security Features
          </label>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Checkbox label="Gated Community" name="gated" defaultChecked />
            <Checkbox label="24/7 Security Guards" name="security_guards" defaultChecked />
            <Checkbox label="CCTV Surveillance" name="cctv" defaultChecked />
            <Checkbox label="Electric Fence" name="electric_fence" />
            <Checkbox label="Secure Parking" name="secure_parking" defaultChecked />
            <Checkbox label="Perimeter Wall" name="perimeter_wall" />
            <Checkbox label="Intercom System" name="intercom" />
          </div>
        </div>

        {/* KITCHEN & STORAGE */}
        <div>
          <label className="text-lg font-semibold" htmlFor="">
            Kitchen & Storage
          </label>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Checkbox label="Modern Kitchen" name="modern_kitchen" defaultChecked />
            <Checkbox label="Built-in Cabinets" name="cabinets" defaultChecked />
            <Checkbox label="Granite Countertops" name="granite" />
            <Checkbox label="Built-in Wardrobes" name="wardrobes" defaultChecked />
            <Checkbox label="Pantry/Store Room" name="pantry" />
            <Checkbox label="Gas Cooker" name="gas_cooker" />
            <Checkbox label="Fridge" name="fridge" />
            <Checkbox label="Microwave" name="microwave" />
          </div>
        </div>

        {/* COMFORT & CONVENIENCE */}
        <div>
          <label className="text-lg font-semibold" htmlFor="">
            Comfort & Convenience
          </label>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Checkbox label="Parking Slot" name="parking" defaultChecked />
            <Checkbox
              label="Balcony/Terrace"
              name="balcony"
              defaultChecked={formData.hasBalcony}
              onChange={(checked) => updateFormData('hasBalcony', checked)}
            />
            <Checkbox label="Spacious" name="spacious" defaultChecked />
            <Checkbox label="Tiled Floors" name="tiled" defaultChecked />
            <Checkbox label="Ample Natural Light" name="natural_light" />
            <Checkbox label="Good Ventilation" name="ventilation" defaultChecked />
            <Checkbox label="Ensuite Master Bedroom" name="ensuite" />
            <Checkbox label="Laundry Area" name="laundry" />
            <Checkbox label="Servant Quarter (SQ)" name="sq" />
            <Checkbox label="Pet Friendly" name="pet_friendly" />
          </div>
        </div>

        {/* PREMIUM AMENITIES */}
        <div>
          <label className="text-lg font-semibold" htmlFor="">
            Premium Amenities
          </label>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Checkbox label="Swimming Pool" name="pool" />
            <Checkbox label="Gym/Fitness Center" name="gym" />
            <Checkbox label="Children's Play Area" name="play_area" />
            <Checkbox label="Rooftop Lounge" name="rooftop" />
            <Checkbox label="Clubhouse" name="clubhouse" />
            <Checkbox label="Elevator/Lift" name="elevator" />
            <Checkbox label="Backup Generator" name="backup_generator" />
            <Checkbox label="Garbage Disposal" name="garbage" defaultChecked />
          </div>
        </div>
      </div>
    </>
  );
};

export default PageAddListing4;
