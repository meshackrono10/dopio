"use client";

import React, { FC, useState } from "react";
import StaySearchForm from "./(stay-search-form)/StaySearchForm";

export type SearchTab = "Properties";

export interface HeroSearchFormProps {
  className?: string;
  currentTab?: SearchTab;
  currentPage?: "Properties";
}

const HeroSearchForm: FC<HeroSearchFormProps> = ({
  className = "",
  currentTab = "Properties",
  currentPage,
}) => {
  const [tabActive, setTabActive] = useState<SearchTab>(currentTab);

  const renderForm = () => {
    return <StaySearchForm />;
  };

  return (
    <div
      className={`nc-HeroSearchForm w-full max-w-6xl py-5 lg:py-0 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Search for Properties
        </h3>
      </div>
      {renderForm()}
    </div>
  );
};

export default HeroSearchForm;

