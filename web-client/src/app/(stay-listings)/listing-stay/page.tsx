"use client";

import React, { FC } from "react";
import SectionGridFilterCard from "../SectionGridFilterCard";
import { useProperties } from "@/contexts/PropertyContext";

export interface ListingStayPageProps { }

const ListingStayPage: FC<ListingStayPageProps> = () => {
  // Reset filters on mount to ensure all properties are shown
  const { filterProperties, refreshProperties } = useProperties();

  React.useEffect(() => {
    refreshProperties();
    filterProperties({});
  }, [filterProperties, refreshProperties]);

  return <SectionGridFilterCard className="container pb-24 lg:pb-28" />;
};

export default ListingStayPage;
