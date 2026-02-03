"use client";

import React, { FC, useEffect, useState } from "react";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import { StayDataType } from "@/data/types";
import StartRating from "@/components/StartRating";
import BtnLikeIcon from "@/components/BtnLikeIcon";
import SaleOffBadge from "@/components/SaleOffBadge";
import Badge from "@/shared/Badge";
import Link from "next/link";
import { Route } from "@/routers/types";
import GallerySlider from "./GallerySlider";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useToast } from "@/components/Toast";

export interface StayCardProps {
  className?: string;
  data?: StayDataType;
  size?: "default" | "small";
  sizes?: string;
}

const StayCard: FC<StayCardProps> = ({
  size = "default",
  className = "",
  data,
  sizes = "(max-width: 1025px) 100vw, 300px",
}) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && data?.id) {
        try {
          const response = await api.get("/users/saved-properties");
          const savedProps = response.data;
          const isPropertySaved = savedProps.some((p: any) => p.propertyId === data.id);
          setIsLiked(isPropertySaved);
        } catch (error) {
          console.error("Failed to check saved status", error);
        }
      }
    };
    checkSavedStatus();
  }, [isAuthenticated, data?.id]);

  if (!data) return null;

  const {
    images: galleryImgs = [],
    title,
    layout,
    id,
    rent: price,
    location,
    averageRating: reviewStart = 4.5,
    reviewCount = 10,
  } = data;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      const response = await api.post(`/users/saved-properties/${id}`);
      setIsLiked(response.data.isSaved);
      showToast("success", response.data.message);
    } catch (error: any) {
      console.error("Failed to toggle save:", error);
      showToast("error", "Failed to update saved status");
    }
  };

  const address = location?.generalArea || "Unknown Location";
  const bedrooms = layout === "bedsitter" || layout === "studio" ? 0 : parseInt(layout?.split("-")[0] || "0");

  // Clean ID for fallback navigation (remove _sub_ index if present)
  const cleanId = id?.toString().split('_sub_')[0];
  const href = data.href || (`/listing-stay-detail/${cleanId}` as Route);


  const saleOff = null;
  const isAds = false;
  const listingCategory = { name: layout || "Apartment" };

  const renderSliderGallery = () => {
    return (
      <div className="relative w-full">
        <GallerySlider
          uniqueID={`StayCard_${id}`}
          ratioClass="aspect-w-4 aspect-h-3 "
          galleryImgs={galleryImgs}
          href={href}
          galleryClass={size === "default" ? undefined : ""}
          sizes={sizes}
        />
        <BtnLikeIcon isLiked={isLiked} className="absolute right-3 top-3 z-[1]" onClick={handleLike} />
        {saleOff && <SaleOffBadge className="absolute left-3 top-3" />}
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className={size === "default" ? "p-4 space-y-4" : "p-3 space-y-1"}>
        <div className={size === "default" ? "space-y-2" : "space-y-1"}>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {listingCategory.name} · {bedrooms} beds
          </span>
          <div className="flex items-center space-x-2">
            {isAds && <Badge name="ADS" color="green" />}
            <h2
              className={`font-semibold capitalize text-neutral-900 dark:text-white ${size === "default" ? "text-base" : "text-base"
                }`}
            >
              <span className="line-clamp-1">{title}</span>
            </h2>
          </div>
          <div className="flex items-center text-neutral-500 dark:text-neutral-400 text-sm space-x-1.5">
            {size === "default" && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
            <span className="">{address}</span>
          </div>
        </div>
        <div className="w-14 border-b border-neutral-100 dark:border-neutral-800"></div>
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">
            KES {price?.toLocaleString()}
            {` `}
            {size === "default" && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400 font-normal">
                /month
              </span>
            )}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`nc-StayCard group relative bg-white dark:bg-neutral-900 ${size === "default"
        ? "border border-neutral-100 dark:border-neutral-800 "
        : ""
        } rounded-2xl overflow-hidden hover:shadow-xl transition-shadow ${className}`}
      data-nc-id="StayCard"
    >
      {renderSliderGallery()}
      <Link
        href={href}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        {renderContent()}
      </Link>

    </div>
  );
};

export default StayCard;
