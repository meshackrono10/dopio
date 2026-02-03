"use client";

import { MapPinIcon } from "@heroicons/react/24/solid";
import LocationMarker from "@/components/AnyReactComponent/LocationMarker";
import Label from "@/components/Label";
import dynamic from "next/dynamic";
const GoogleMapReact = dynamic(() => import("google-map-react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});
import React, { FC, useState, useEffect } from "react";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Input from "@/shared/Input";
import Select from "@/shared/Select";
import FormItem from "../FormItem";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { usePropertyForm } from "@/contexts/PropertyFormContext";

export interface PageAddListing2Props { }

const PageAddListing2: FC<PageAddListing2Props> = () => {
  const { formData, updateFormData } = usePropertyForm();

  const [mapCenter, setMapCenter] = useState({
    lat: formData.coordinates?.[1] || -1.2194,
    lng: formData.coordinates?.[0] || 36.8951,
  });

  const handleLocationSelect = (location: { name: string; coordinates: [number, number] }) => {
    updateFormData('areaName', location.name);
    updateFormData('coordinates', location.coordinates);
    setMapCenter({
      lng: location.coordinates[0],
      lat: location.coordinates[1],
    });
  };

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData('county', e.target.value);
  };

  const handleBuildingNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('buildingName', e.target.value);
  };

  const handleUnitNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('unitNumber', e.target.value);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Property Location</h2>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
      {/* FORM */}
      <div className="space-y-8">
        <ButtonSecondary>
          <MapPinIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          <span className="ml-3">Use current location</span>
        </ButtonSecondary>

        {/* ITEM */}
        <FormItem label="County">
          <Select
            value={formData.county}
            onChange={handleCountyChange}
          >
            <option value="Nairobi">Nairobi County</option>
            <option value="Kiambu">Kiambu County</option>
            <option value="Machakos">Machakos County</option>
            <option value="Kajiado">Kajiado County</option>
          </Select>
        </FormItem>

        <FormItem
          label="Area/Neighborhood"
          desc="Type to search for your specific area (e.g., Gate A Juja, Mathare North, Area 4)"
        >
          <LocationAutocomplete
            onLocationSelect={handleLocationSelect}
            defaultValue={formData.areaName}
          />
        </FormItem>

        <div>
          <Label>Map Location</Label>
          <span className="block mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {formData.areaName
              ? `Selected: ${formData.areaName}`
              : "Search and select your location above to update the map"
            }
          </span>
          <div className="mt-4">
            <div className="aspect-w-5 aspect-h-5 sm:aspect-h-3">
              <div className="rounded-xl overflow-hidden">
                <GoogleMapReact
                  bootstrapURLKeys={{
                    key: "AIzaSyAGVJfZMAKYfZ71nzL_v5i3LjTTWnCYwTY",
                  }}
                  yesIWantToUseGoogleMapApiInternals
                  defaultZoom={13}
                  center={mapCenter}
                >
                  <LocationMarker lat={mapCenter.lat} lng={mapCenter.lng} />
                </GoogleMapReact>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageAddListing2;
