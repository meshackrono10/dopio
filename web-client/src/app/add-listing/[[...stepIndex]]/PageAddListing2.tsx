"use client";

import { MapPinIcon } from "@heroicons/react/24/solid";
import LocationMarker from "@/components/AnyReactComponent/LocationMarker";
import Label from "@/components/Label";
import GoogleMapReact from "google-map-react";
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
          <Select>
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

        <FormItem label="Building/Court/Estate Name (Optional)">
          <Input
            placeholder="e.g., Seasons Apartments, Garden Heights"
            value={formData.buildingName}
            onChange={handleBuildingNameChange}
          />
        </FormItem>

        <FormItem label="House/Unit Number">
          <Input
            placeholder="e.g., A4, B12, House 5"
            value={formData.unitNumber}
            onChange={handleUnitNumberChange}
          />
        </FormItem>

        <FormItem
          label="Proximity to Public Transport"
          desc="How many minutes walk to the nearest stage/bus stop?"
        >
          <div className="relative">
            <Input
              type="number"
              placeholder="e.g., 5"
              className="!pr-16"
              value={formData.transportProximity}
              onChange={(e) => updateFormData('transportProximity', e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500">minutes</span>
            </div>
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
