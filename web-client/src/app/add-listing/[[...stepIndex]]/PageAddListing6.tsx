"use client";
import React, { FC } from "react";
import Textarea from "@/shared/Textarea";

export interface PageAddListing6Props { }

const PageAddListing6: FC<PageAddListing6Props> = () => {
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold">
          Property Description
        </h2>
        <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
          Describe your property&apos;s best features, amenities like water backup, security, parking, and what makes the neighborhood desirable for tenants.
        </span>
      </div>

      <Textarea
        placeholder="e.g., Modern 2-bedroom apartment in the heart of Kasarani. Features spacious living areas, reliable water supply with backup tanks, prepaid electricity, 24/7 security with CCTV, secure parking, and is located near shopping centers and public transport..."
        rows={14}
      />
    </>
  );
};

export default PageAddListing6;
