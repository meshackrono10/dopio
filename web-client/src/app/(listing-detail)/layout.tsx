"use client";

import BackgroundSection from "@/components/BackgroundSection";
import ListingImageGallery from "@/components/listing-image-gallery/ListingImageGallery";
import SectionSliderNewCategories from "@/components/SectionSliderNewCategories";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import MobileFooterSticky from "./(components)/MobileFooterSticky";
import { Route } from "next";
import api from "@/services/api";

const DetailtLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const thisPathname = usePathname();
  const searchParams = useSearchParams();
  const modal = searchParams?.get("modal");
  const [propertyImages, setPropertyImages] = useState<any[]>([]);

  // Extract property ID from pathname
  const propertyId = thisPathname?.split("/").pop();

  useEffect(() => {
    const fetchPropertyImages = async () => {
      if (propertyId && thisPathname?.includes("/listing-stay-detail")) {
        try {
          const response = await api.get(`/properties/${propertyId}`);
          const images = response.data.images || [];
          const formattedImages = images.map((url: string, index: number) => ({
            id: index,
            url: url,
          }));
          setPropertyImages(formattedImages);
        } catch (error) {
          console.error("Failed to fetch property images:", error);
          setPropertyImages([]);
        }
      }
    };

    fetchPropertyImages();
  }, [propertyId, thisPathname]);

  const handleCloseModalImageGallery = () => {
    let params = new URLSearchParams(document.location.search);
    params.delete("modal");
    router.push(`${thisPathname}/?${params.toString()}` as Route);
  };

  return (
    <div className="ListingDetailPage">
      <ListingImageGallery
        isShowModal={modal === "PHOTO_TOUR_SCROLLABLE"}
        onClose={handleCloseModalImageGallery}
        images={propertyImages}
        propertyId={propertyId}
      />

      <div className="container ListingDetailPage__content">{children}</div>

      {/* STICKY FOOTER MOBILE */}
      <MobileFooterSticky />
    </div>
  );
};

export default DetailtLayout;
