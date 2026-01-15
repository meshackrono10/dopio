"use client";

import React, { FC, useEffect, useState } from "react";
import { StaySearchFormFields } from "../type";
import StaySearchForm from "./(stay-search-form)/StaySearchForm";

export type SearchTab = "Properties";

export interface HeroSearchFormSmallProps {
  className?: string;
  defaultTab?: SearchTab;
  onTabChange?: (tab: SearchTab) => void;
  defaultFieldFocus?: StaySearchFormFields;
}

const HeroSearchFormSmall: FC<HeroSearchFormSmallProps> = ({
  className = "",
  defaultTab = "Properties",
  onTabChange,
  defaultFieldFocus,
}) => {
  const [tabActive, setTabActive] = useState<SearchTab>(defaultTab);

  useEffect(() => {
    setTabActive(defaultTab);
  }, [defaultTab]);

  const renderTab = () => {
    return (
      <ul className="h-[88px] flex justify-center space-x-5 sm:space-x-9">
        <li
          className="relative flex-shrink-0 flex items-center cursor-pointer text-base text-neutral-900 dark:text-neutral-200 font-medium"
        >
          <div className="relative select-none">
            <span>Rental Properties</span>
            <span className="absolute top-full mt-1 block w-full h-0.5 rounded-full bg-neutral-800 dark:bg-neutral-100 mr-2" />
          </div>
        </li>
      </ul>
    );
  };

  return (
    <div
      className={`nc-HeroSearchFormSmall ${className}`}
      data-nc-id="HeroSearchFormSmall"
    >
      {renderTab()}
      <div className="mt-2">
        <StaySearchForm defaultFieldFocus={defaultFieldFocus} />
      </div>
    </div>
  );
};

export default HeroSearchFormSmall;
