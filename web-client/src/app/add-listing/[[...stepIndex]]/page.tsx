"use client";

import React from "react";
import PageAddListing1 from "./PageAddListing1";
import PageAddListing2 from "./PageAddListing2";
import PageAddListing5 from "./PageAddListing5";
import PageAddListing7 from "./PageAddListing7";
import PageAddListing8 from "./PageAddListing8";
import PageAddListing10 from "./PageAddListing10";
import PageAddListingPackages from "./PageAddListingPackages";
import PageAddListingPackageSelect from "./PageAddListingPackageSelect";
import PageAddListingManageProperties from "./PageAddListingManageProperties";


const Page = ({
  params,
  searchParams,
}: {
  params: { stepIndex: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const stepIndex = Number(params.stepIndex) || 1;
  let ContentComponent: any = PageAddListingPackageSelect;

  switch (stepIndex) {
    case 1:
      ContentComponent = PageAddListingPackageSelect;
      break;
    case 2:
      ContentComponent = PageAddListing1;
      break;
    case 3:
      ContentComponent = PageAddListing2;
      break;
    case 4:
      ContentComponent = PageAddListing5;
      break;
    case 5:
      ContentComponent = PageAddListing7;
      break;
    case 6:
      ContentComponent = PageAddListing8;
      break;
    case 7:
      ContentComponent = PageAddListingPackages;
      break;
    case 8:
      ContentComponent = PageAddListingManageProperties;
      break;
    case 9:
      ContentComponent = PageAddListing10;
      break;


    default:
      ContentComponent = PageAddListingPackageSelect;
      break;
  }

  return <ContentComponent />;
};

export default Page;
