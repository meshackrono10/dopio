"use client";
import React, { FC } from "react";
import Select from "@/shared/Select";
import FormItem from "../FormItem";
import Checkbox from "@/shared/Checkbox";
import Input from "@/shared/Input";
import { usePropertyForm } from "@/contexts/PropertyFormContext";

export interface PageAddListing9Props { }

const PageAddListing9: FC<PageAddListing9Props> = () => {
  const { formData, updateFormData } = usePropertyForm();
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold">Rental Terms & Conditions</h2>
        <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
          Specify your rental requirements and terms. Be clear to avoid misunderstandings.
        </span>
      </div>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

      {/* FORM */}
      <div className="space-y-8">

        {/* FURNISHING STATUS */}
        <FormItem
          label="Furnishing Status"
          desc="What is included with the property?"
        >
          <Select>
            <option value="unfurnished">Unfurnished (Empty property)</option>
            <option value="semi_furnished">Semi-Furnished (Kitchen cabinets, wardrobes)</option>
            <option value="fully_furnished">Fully Furnished (Ready to move in with furniture)</option>
          </Select>
        </FormItem>

        {/* ADVANCE PAYMENT */}
        <FormItem
          label="Advance Rent Required"
          desc="How many months' rent required upfront?"
        >
          <Select>
            <option value="1">1 month advance</option>
            <option value="2">2 months advance</option>
            <option value="3">3 months advance</option>
            <option value="6">6 months advance</option>
            <option value="12">12 months advance (1 year)</option>
          </Select>
        </FormItem>

        {/* WHO PAYS AGENT FEE */}
        <FormItem
          label="Agent/Finder's Fee"
          desc="If using an agent, who pays?"
        >
          <Select>
            <option value="no_agent">No agent fee (Direct from landlord)</option>
            <option value="tenant">Tenant pays agent fee</option>
            <option value="landlord">Landlord pays agent fee</option>
            <option value="shared">Split between landlord and tenant</option>
          </Select>
        </FormItem>

        {/* PETS POLICY */}
        <FormItem label="Pets Policy">
          <Select>
            <option value="no_pets">No pets allowed</option>
            <option value="pets_allowed">Pets allowed</option>
            <option value="pets_negotiable">Pets negotiable (case by case)</option>
          </Select>
        </FormItem>

        {/* SUBLETTING */}
        <FormItem label="Subletting Policy">
          <Select>
            <option value="no_sublet">Subletting not allowed</option>
            <option value="with_permission">Allowed with landlord permission</option>
            <option value="allowed">Subletting allowed</option>
          </Select>
        </FormItem>

        {/* GENDER PREFERENCE */}
        <FormItem label="Tenant Gender Preference" desc="Optional - for shared accommodation">
          <Select>
            <option value="any">No preference</option>
            <option value="female">Female tenants only</option>
            <option value="male">Male tenants only</option>
            <option value="family">Families only</option>
            <option value="professionals">Working professionals</option>
          </Select>
        </FormItem>

        {/* MAINTENANCE RESPONSIBILITY */}
        <div>
          <label className="text-lg font-semibold">
            Maintenance Responsibility
          </label>
          <div className="mt-6 space-y-5">
            <Checkbox
              label="Landlord handles all major repairs"
              name="landlord_repairs"
              subLabel="Plumbing, electrical, structural issues"
              defaultChecked
            />
            <Checkbox
              label="Tenant responsible for minor repairs"
              name="tenant_minor_repairs"
              subLabel="Light bulbs, drain cleaning, etc."
            />
            <Checkbox
              label="Property has on-site caretaker/manager"
              name="has_caretaker"
              subLabel="For quick maintenance support"
            />
          </div>
        </div>

        {/* VIEWING ARRANGEMENT */}
        <FormItem
          label="Property Viewing Arrangement"
          desc="How can interested tenants view the property?"
        >
          <Select>
            <option value="by_appointment">By appointment only</option>
            <option value="open_viewing">Regular open viewing times</option>
            <option value="anytime">Available anytime (call first)</option>
            <option value="virtual_first">Virtual tour first, then physical viewing</option>
          </Select>
        </FormItem>

        {/* MOVE-IN DATE */}
        <FormItem
          label="Availability/Move-in Date"
          desc="When can tenant move in?"
        >
          <Select>
            <option value="immediate">Immediately available</option>
            <option value="1_week">Available in 1 week</option>
            <option value="2_weeks">Available in 2 weeks</option>
            <option value="1_month">Available in 1 month</option>
            <option value="specific">Specific date (specify in description)</option>
          </Select>
        </FormItem>

        {/* LEASE AGREEMENT */}
        <div>
          <label className="text-lg font-semibold">
            Lease Agreement
          </label>
          <div className="mt-6 space-y-5">
            <Checkbox
              label="Written tenancy agreement provided"
              name="written_agreement"
              subLabel="Legally binding rental contract"
              defaultChecked
            />
            <Checkbox
              label="Landlord has proof of ownership"
              name="proof_ownership"
              subLabel="Title deed available for verification"
              defaultChecked
            />
          </div>
        </div>

        {/* TENANT REQUIREMENTS */}
        <div>
          <label className="text-lg font-semibold">
            Tenant Requirements
          </label>
          <p className="text-sm text-neutral-500 mt-2 mb-6">What do you require from prospective tenants?</p>
          <div className="space-y-5">
            <Checkbox
              label="Proof of income/employment"
              name="proof_income"
              subLabel="Payslip or employment letter"
            />
            <Checkbox
              label="Valid ID (National ID or Passport)"
              name="valid_id"
              subLabel="For verification purposes"
              defaultChecked
            />
            <Checkbox
              label="References from previous landlord"
              name="references"
              subLabel="Character or rental references"
            />
            <Checkbox
              label="Good conduct certificate"
              name="good_conduct"
              subLabel="Police clearance certificate"
            />
          </div>
        </div>

        {/* NOISE LEVEL */}
        <FormItem
          label="Neighborhood Noise Level"
          desc="How quiet is the area? (Important for tenants)"
        >
          <Select
            value={formData.noiseLevel}
            onChange={(e) => updateFormData('noiseLevel', e.target.value)}
          >
            <option value="Quiet">Quiet (Residential, away from main roads)</option>
            <option value="Moderate">Moderate (Normal neighborhood sounds)</option>
            <option value="High">High (Near main road, clubs, or churches)</option>
          </Select>
        </FormItem>

        {/* SOCIAL AMENITIES */}
        <div>
          <label className="text-lg font-semibold">
            Proximity to Social Amenities
          </label>
          <p className="text-sm text-neutral-500 mt-2 mb-6">What is nearby? (Within 10-15 mins walk/drive)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Checkbox label="Schools/Kindergartens" name="amenity_schools" />
            <Checkbox label="Hospitals/Clinics" name="amenity_hospitals" />
            <Checkbox label="Shopping Malls/Supermarkets" name="amenity_malls" />
            <Checkbox label="Religious Centers (Church/Mosque)" name="amenity_religious" />
            <Checkbox label="Police Station/Post" name="amenity_police" />
            <Checkbox label="Parks/Recreational Areas" name="amenity_parks" />
          </div>
        </div>

        {/* ADDITIONAL RULES */}
        <FormItem
          label="Additional House Rules"
          desc="Any other rules tenants should know? (Optional)"
        >
          <Input placeholder="e.g., Quiet hours after 10pm, No smoking in bedrooms, etc." />
        </FormItem>

      </div>
    </>
  );
};

export default PageAddListing9;
