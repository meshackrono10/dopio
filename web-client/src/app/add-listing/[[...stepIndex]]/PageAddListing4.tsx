"use client";
import React, { FC } from "react";
import Checkbox from "@/shared/Checkbox";
import { usePropertyForm } from "@/contexts/PropertyFormContext";

export interface PageAddListing4Props { }

const PageAddListing4: FC<PageAddListing4Props> = () => {
  const { formData, updateFormData } = usePropertyForm();

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    updateFormData("amenities", newAmenities);
  };

  const isChecked = (amenity: string) => (formData.amenities || []).includes(amenity);

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
            <Checkbox label="Gated Community" name="gated" checked={isChecked("Gated Community")} onChange={() => handleAmenityToggle("Gated Community")} />
            <Checkbox label="24/7 Security Guards" name="security_guards" checked={isChecked("24/7 Security Guards")} onChange={() => handleAmenityToggle("24/7 Security Guards")} />
            <Checkbox label="CCTV Surveillance" name="cctv" checked={isChecked("CCTV Surveillance")} onChange={() => handleAmenityToggle("CCTV Surveillance")} />
            <Checkbox label="Electric Fence" name="electric_fence" checked={isChecked("Electric Fence")} onChange={() => handleAmenityToggle("Electric Fence")} />
            <Checkbox label="Secure Parking" name="secure_parking" checked={isChecked("Secure Parking")} onChange={() => handleAmenityToggle("Secure Parking")} />
            <Checkbox label="Perimeter Wall" name="perimeter_wall" checked={isChecked("Perimeter Wall")} onChange={() => handleAmenityToggle("Perimeter Wall")} />
            <Checkbox label="Intercom System" name="intercom" checked={isChecked("Intercom System")} onChange={() => handleAmenityToggle("Intercom System")} />
          </div>
        </div>

        {/* KITCHEN & STORAGE */}
        <div>
          <label className="text-lg font-semibold" htmlFor="">
            Kitchen & Storage
          </label>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Checkbox label="Modern Kitchen" name="modern_kitchen" checked={isChecked("Modern Kitchen")} onChange={() => handleAmenityToggle("Modern Kitchen")} />
            <Checkbox label="Built-in Cabinets" name="cabinets" checked={isChecked("Built-in Cabinets")} onChange={() => handleAmenityToggle("Built-in Cabinets")} />
            <Checkbox label="Granite Countertops" name="granite" checked={isChecked("Granite Countertops")} onChange={() => handleAmenityToggle("Granite Countertops")} />
            <Checkbox label="Built-in Wardrobes" name="wardrobes" checked={isChecked("Built-in Wardrobes")} onChange={() => handleAmenityToggle("Built-in Wardrobes")} />
            <Checkbox label="Pantry/Store Room" name="pantry" checked={isChecked("Pantry/Store Room")} onChange={() => handleAmenityToggle("Pantry/Store Room")} />
            <Checkbox label="Gas Cooker" name="gas_cooker" checked={isChecked("Gas Cooker")} onChange={() => handleAmenityToggle("Gas Cooker")} />
            <Checkbox label="Fridge" name="fridge" checked={isChecked("Fridge")} onChange={() => handleAmenityToggle("Fridge")} />
            <Checkbox label="Microwave" name="microwave" checked={isChecked("Microwave")} onChange={() => handleAmenityToggle("Microwave")} />
          </div>
        </div>

        {/* COMFORT & CONVENIENCE */}
        <div>
          <label className="text-lg font-semibold" htmlFor="">
            Comfort & Convenience
          </label>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Checkbox label="Parking Slot" name="parking" checked={isChecked("Parking Slot")} onChange={() => handleAmenityToggle("Parking Slot")} />
            <Checkbox
              label="Balcony/Terrace"
              name="balcony"
              checked={formData.hasBalcony}
              onChange={(checked) => updateFormData('hasBalcony', checked)}
            />
            <Checkbox label="Spacious" name="spacious" checked={isChecked("Spacious")} onChange={() => handleAmenityToggle("Spacious")} />
            <Checkbox label="Tiled Floors" name="tiled" checked={isChecked("Tiled Floors")} onChange={() => handleAmenityToggle("Tiled Floors")} />
            <Checkbox label="Ample Natural Light" name="natural_light" checked={isChecked("Ample Natural Light")} onChange={() => handleAmenityToggle("Ample Natural Light")} />
            <Checkbox label="Good Ventilation" name="ventilation" checked={isChecked("Good Ventilation")} onChange={() => handleAmenityToggle("Good Ventilation")} />
            <Checkbox label="Ensuite Master Bedroom" name="ensuite" checked={isChecked("Ensuite Master Bedroom")} onChange={() => handleAmenityToggle("Ensuite Master Bedroom")} />
            <Checkbox label="Laundry Area" name="laundry" checked={isChecked("Laundry Area")} onChange={() => handleAmenityToggle("Laundry Area")} />
            <Checkbox label="Servant Quarter (SQ)" name="sq" checked={isChecked("Servant Quarter (SQ)")} onChange={() => handleAmenityToggle("Servant Quarter (SQ)")} />
            <Checkbox label="Pet Friendly" name="pet_friendly" checked={isChecked("Pet Friendly")} onChange={() => handleAmenityToggle("Pet Friendly")} />
          </div>
        </div>

        {/* PREMIUM AMENITIES */}
        <div>
          <label className="text-lg font-semibold" htmlFor="">
            Premium Amenities
          </label>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Checkbox label="Swimming Pool" name="pool" checked={isChecked("Swimming Pool")} onChange={() => handleAmenityToggle("Swimming Pool")} />
            <Checkbox label="Gym/Fitness Center" name="gym" checked={isChecked("Gym/Fitness Center")} onChange={() => handleAmenityToggle("Gym/Fitness Center")} />
            <Checkbox label="Children's Play Area" name="play_area" checked={isChecked("Children's Play Area")} onChange={() => handleAmenityToggle("Children's Play Area")} />
            <Checkbox label="Rooftop Lounge" name="rooftop" checked={isChecked("Rooftop Lounge")} onChange={() => handleAmenityToggle("Rooftop Lounge")} />
            <Checkbox label="Clubhouse" name="clubhouse" checked={isChecked("Clubhouse")} onChange={() => handleAmenityToggle("Clubhouse")} />
            <Checkbox label="Elevator/Lift" name="elevator" checked={isChecked("Elevator/Lift")} onChange={() => handleAmenityToggle("Elevator/Lift")} />
            <Checkbox label="Backup Generator" name="backup_generator" checked={isChecked("Backup Generator")} onChange={() => handleAmenityToggle("Backup Generator")} />
            <Checkbox label="Garbage Disposal" name="garbage" checked={isChecked("Garbage Disposal")} onChange={() => handleAmenityToggle("Garbage Disposal")} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PageAddListing4;
