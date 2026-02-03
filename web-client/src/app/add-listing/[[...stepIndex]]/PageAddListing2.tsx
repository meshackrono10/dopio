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

  const isLocked = formData.packageProperties && formData.packageProperties.length > 0;

  return (
    <>
      <h2 className="text-2xl font-semibold">Property Location</h2>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

      {isLocked && (
        <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30 flex items-start space-x-3">
          <div className="text-primary-600 mt-0.5 text-xl">
            <i className="las la-info-circle"></i>
          </div>
          <div className="text-sm text-primary-800 dark:text-primary-200">
            <p className="font-semibold mb-1">Fixed Location</p>
            <p>This property is part of a {formData.selectedPackage} package. All properties in this package must be located in <strong>{formData.areaName}, {formData.county}</strong>.</p>
          </div>
        </div>
      )}

      {/* FORM */}
      <div className="space-y-8">
        {!isLocked && (
          <ButtonSecondary>
            <MapPinIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            <span className="ml-3">Use current location</span>
          </ButtonSecondary>
        )}

        {/* ITEM */}
        <FormItem label="County">
          <Select
            value={formData.county}
            onChange={handleCountyChange}
            disabled={isLocked}
            className={isLocked ? "bg-neutral-100 dark:bg-neutral-800 opacity-70 cursor-not-allowed" : ""}
          >
            <option value="Nairobi">Nairobi County</option>
            <option value="Kiambu">Kiambu County</option>
            <option value="Machakos">Machakos County</option>
            <option value="Kajiado">Kajiado County</option>
          </Select>
        </FormItem>

        <FormItem
          label="Area/Neighborhood"
          desc={isLocked ? "Area is locked for package consistency" : "Type to search for your specific area (e.g., Gate A Juja, Mathare North, Area 4)"}
        >
          <div className={isLocked ? "pointer-events-none opacity-70" : ""}>
            <LocationAutocomplete
              onLocationSelect={handleLocationSelect}
              defaultValue={formData.areaName}
            />
          </div>
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
            <div className={`aspect-w-5 aspect-h-5 sm:aspect-h-3 ${isLocked ? "grayscale-[50%] opacity-80" : ""}`}>
              <div className="rounded-xl overflow-hidden">
                <GoogleMapReact
                  bootstrapURLKeys={{
                    key: "AIzaSyAGVJfZMAKYfZ71nzL_v5i3LjTTWnCYwTY",
                  }}
                  yesIWantToUseGoogleMapApiInternals
                  defaultZoom={13}
                  center={mapCenter}
                  options={{
                    draggable: !isLocked,
                    zoomControl: !isLocked,
                    scrollwheel: !isLocked,
                    disableDefaultUI: isLocked,
                  }}
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
