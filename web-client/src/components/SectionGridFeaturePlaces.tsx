"use client";

import React, { FC, ReactNode } from "react";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import { StayDataType } from "@/data/types";
import ButtonPrimary from "@/shared/ButtonPrimary";
import HeaderFilter from "./HeaderFilter";
import { useProperties } from "@/contexts/PropertyContext";
import StayCard from "./StayCard";
import StayCard2 from "./StayCard2";
import Skeleton from "@/shared/Skeleton";

export interface SectionGridFeaturePlacesProps {
  stayListings?: StayDataType[];
  gridClass?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
  headingIsCenter?: boolean;
  tabs?: string[];
  cardType?: "card1" | "card2";
}

const SectionGridFeaturePlaces: FC<SectionGridFeaturePlacesProps> = ({
  stayListings: stayListingsProp,
  gridClass = "",
  heading = "Featured places to stay",
  subHeading = "Popular places to stay that House Haunters recommends for you",
  headingIsCenter,
  tabs = ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
  cardType = "card2",
}) => {
  const { filteredProperties, loading, filterProperties } = useProperties();
  const [tabActive, setTabActive] = React.useState(tabs[0]);

  // Initial filter
  React.useEffect(() => {
    if (!stayListingsProp) {
      filterProperties({ location: tabActive });
    }
  }, [tabActive, stayListingsProp, filterProperties]);

  const stayListings = stayListingsProp || filteredProperties.slice(0, 8);

  const renderCard = (stay: StayDataType) => {
    let CardName = StayCard;
    switch (cardType) {
      case "card1":
        CardName = StayCard;
        break;
      case "card2":
        CardName = StayCard2;
        break;

      default:
        CardName = StayCard;
    }

    return <CardName key={stay.id} data={stay} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" />;
  };

  return (
    <div className="nc-SectionGridFeaturePlaces relative">
      <HeaderFilter
        tabActive={tabActive}
        subHeading={subHeading}
        tabs={tabs}
        heading={heading}
        onClickTab={(item) => setTabActive(item)}
      />
      <div
        className={`grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gridClass}`}
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between mt-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </div>
          ))
        ) : stayListings.length > 0 ? (
          stayListings.map((stay) => renderCard(stay))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <i className="las la-home text-4xl text-neutral-400"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              No properties found in {tabActive}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm">
              We couldn&apos;t find any properties matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
      <div className="flex mt-16 justify-center items-center">
        <ButtonPrimary loading={loading} href="/listing-stay-map">Show me more</ButtonPrimary>
      </div>
    </div>
  );
};

export default SectionGridFeaturePlaces;
