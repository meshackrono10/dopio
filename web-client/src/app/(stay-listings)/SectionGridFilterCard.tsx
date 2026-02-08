"use client";

import React, { FC } from "react";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import { StayDataType } from "@/data/types";
import Pagination from "@/shared/Pagination";
import TabFilters from "./TabFilters";
import Heading2 from "@/shared/Heading2";
import StayCard2 from "@/components/StayCard2";

import { useProperties } from "@/contexts/PropertyContext";

export interface SectionGridFilterCardProps {
  className?: string;
  data?: StayDataType[];
}

const SectionGridFilterCard: FC<SectionGridFilterCardProps> = ({
  className = "",
  data: dataProp,
}) => {
  const { filteredProperties, loading, pagination, setPage } = useProperties();
  const data = dataProp || filteredProperties;

  return (
    <div
      className={`nc-SectionGridFilterCard ${className}`}
      data-nc-id="SectionGridFilterCard"
    >
      <Heading2 />

      <div className="mb-8 lg:mb-11">
        <TabFilters />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-6000"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.length > 0 ? (
              data.map((stay) => (
                <StayCard2 key={stay.id} data={stay} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <i className="las la-search text-4xl text-neutral-400"></i>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  No properties found
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm">
                  We couldn&apos;t find any properties matching your criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
          <div className="flex mt-16 justify-center items-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SectionGridFilterCard;
