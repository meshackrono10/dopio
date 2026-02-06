"use client";

import React, { FC, Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Squares2X2Icon, PlayCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
const ListingMap = dynamic(() => import("@/components/ListingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading map...</p>
      </div>
    </div>
  )
});
import StartRating from "@/components/StartRating";
import Avatar from "@/shared/Avatar";
import Badge from "@/shared/Badge";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import LikeSaveBtns from "@/components/LikeSaveBtns";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Route } from "@/routers/types";
import ComparisonButton from "@/components/ComparisonButton";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import SectionVideos, { VideoType } from "@/components/SectionVideos";
import StayCard from "@/components/StayCard";
import { StayDataType } from "@/data/types";
import GoldPackageCard from "@/components/GoldPackageCard";


// LocationCircle removed in favor of Leaflet Circle in ListingMap component

// Amenity icon mapping
const getAmenityIcon = (amenity: string) => {
  const icons: Record<string, string> = {
    "Parking": "la-parking",
    "WiFi": "la-wifi",
    "Security": "la-shield-alt",
    "CCTV": "la-video",
    "Water": "la-tint",
    "Backup Generator": "la-bolt",
    "Gym": "la-dumbbell",
    "Swimming Pool": "la-swimming-pool",
    "Balcony": "la-building",
    "Garden": "la-leaf",
    "Pet Friendly": "la-paw",
    "Furnished": "la-couch",
    "Kitchen": "la-utensils",
    "Laundry": "la-tshirt",
    "Air Conditioning": "la-snowflake",
    "Heating": "la-fire",
    "Elevator": "la-arrow-up",
    "Wheelchair Accessible": "la-wheelchair",
    "Fireplace": "la-fire-alt",
    "Dishwasher": "la-sink",
    "Iron": "la-tshirt",
    "TV": "la-tv",
    "Workspace": "la-laptop",
  };

  return icons[amenity] || "la-check-circle";
};

// Get package tier color
const getTierColor = (tier: string) => {
  switch (tier?.toUpperCase()) {
    case "BRONZE":
      return "from-orange-400 to-orange-600";
    case "SILVER":
      return "from-gray-300 to-gray-500";
    case "GOLD":
      return "from-yellow-400 to-yellow-600";
    default:
      return "from-primary-500 to-primary-700";
  }
};

export interface ListingStayDetailPageProps {
  params: {
    id: string;
  };
}

const ListingStayDetailPage: FC<ListingStayDetailPageProps> = ({ params }) => {
  const { id } = params;
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [packageMembers, setPackageMembers] = useState<any[]>([]);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);


  const thisPathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/properties/${id}`);
        console.log("Property data:", response.data);
        console.log("Packages:", response.data.packages);
        console.log("ViewingPackages:", response.data.viewingPackages);

        setProperty(response.data);

        // Auto-select first package if available (check both field names)
        const packages = response.data.packages || response.data.viewingPackages || [];
        console.log("Final packages array:", packages);

        if (packages && packages.length > 0) {
          setSelectedPackage(packages[0]);
        }

        // Fetch package members if this is a Gold package
        if (response.data.packageGroupId) {
          fetchPackageMembers(response.data.id);
        }
      } catch (err: any) {
        console.error("Error fetching property:", err);
        setError(err.response?.data?.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    const fetchPackageMembers = async (propertyId: string) => {
      try {
        setIsLoadingPackage(true);
        const response = await api.get(`/packages/properties/${propertyId}/package-members`);
        console.log("Package members:", response.data);
        setPackageMembers(response.data.properties || []);
      } catch (err: any) {
        console.error("Error fetching package members:", err);
      } finally {
        setIsLoadingPackage(false);
      }
    };

    fetchProperty();
  }, [id]);


  if (loading) {
    return (
      <div className="container py-24 flex justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container py-24 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          {error || 'Property not found'}
        </h2>
        <ButtonPrimary href="/" className="mt-4">Go back home</ButtonPrimary>
      </div>
    );
  }

  const {
    title,
    description,
    rent,
    location,
    amenities: rawAmenities,
    images: rawImages,
    videos: rawVideos,
    hunter,
  } = property;

  // Ensure images, videos, and amenities are arrays with error handling
  let images: string[] = [];
  let videos: string[] = [];
  let amenities: string[] = [];

  try {
    if (Array.isArray(rawImages)) {
      images = rawImages;
    } else if (typeof rawImages === 'string') {
      images = JSON.parse(rawImages);
    }
  } catch (error) {
    console.error('[ListingDetail] Error parsing images:', error, rawImages);
    images = [];
  }

  try {
    if (Array.isArray(rawVideos)) {
      videos = rawVideos;
    } else if (typeof rawVideos === 'string') {
      videos = JSON.parse(rawVideos);
    }
  } catch (error) {
    console.error('[ListingDetail] Error parsing videos:', error, rawVideos);
    videos = [];
  }

  try {
    if (Array.isArray(rawAmenities)) {
      amenities = rawAmenities;
    } else if (typeof rawAmenities === 'string') {
      amenities = JSON.parse(rawAmenities);
    }
  } catch (error) {
    console.error('[ListingDetail] Error parsing amenities:', error, rawAmenities);
    amenities = [];
  }

  console.log('[ListingDetail] Parsed data:', {
    imagesType: typeof rawImages,
    imagesLength: images?.length,
    videosType: typeof rawVideos,
    videosLength: videos?.length,
    amenitiesType: typeof rawAmenities,
    amenitiesLength: amenities?.length
  });

  // Handle both possible field names for packages and parse features
  const rawPackages = property.packages || property.viewingPackages || [];
  const packages = rawPackages.map((pkg: any) => {
    let features: string[] = [];

    try {
      if (Array.isArray(pkg.features)) {
        features = pkg.features;
      } else if (typeof pkg.features === 'string') {
        features = JSON.parse(pkg.features);
      }
    } catch (error) {
      console.error('[ListingDetail] Error parsing package features:', error, pkg.features);
      features = [];
    }

    return {
      ...pkg,
      features
    };
  });

  const handleOpenModalImageGallery = () => {
    router.push(`${thisPathname}/?modal=PHOTO_TOUR_SCROLLABLE` as Route);
  };

  const renderVideoModal = () => {
    if (!videos || videos.length === 0) return null;

    return (
      <Transition appear show={showVideoModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowVideoModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title className="text-xl font-semibold">
                      Video Tour
                    </Dialog.Title>
                    <button
                      onClick={() => setShowVideoModal(false)}
                      className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="aspect-video w-full">
                    <video
                      controls
                      className="w-full h-full rounded-xl"
                      src={videos[0]}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  };

  const renderSection1 = () => {
    return (
      <div className="listingSection__wrap !space-y-6">
        <div className="flex justify-between items-center">
          <Badge name={property.layout || "Property"} />
          <LikeSaveBtns propertyId={property.id} />
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
          {title}
        </h2>

        <div className="flex items-center space-x-4">
          <span>
            <i className="las la-map-marker-alt"></i>
            <span className="ml-1">{location?.generalArea}</span>
          </span>
        </div>

        <div
          className="flex items-center cursor-pointer group"
          onClick={() => router.push(`/haunter/${hunter?.id}` as Route)}
        >
          <Avatar
            imgUrl={hunter?.avatarUrl}
            hasChecked={hunter?.isVerified}
            sizeClass="h-10 w-10"
            radius="rounded-full"
          />
          <span className="ml-2.5 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
            Listed by Haunter{" "}
            <span className="text-neutral-900 dark:text-neutral-200 font-medium group-hover:underline">
              {hunter?.name}
            </span>
          </span>
        </div>

        <div className="w-full border-b border-neutral-100 dark:border-neutral-700" />

        <div className="flex items-center justify-between xl:justify-start space-x-8 xl:space-x-12 text-sm text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center space-x-3">
            <i className="las la-bed text-2xl"></i>
            <span>
              {property.layout?.includes("bedroom") ? property.layout.split("-")[0] : "Studio"}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <i className="las la-bath text-2xl"></i>
            <span>{property.bathrooms || 1} bathrooms</span>
          </div>
          <div className="flex items-center space-x-3">
            <i className="las la-car text-2xl"></i>
            <span>{amenities?.includes("Parking") ? "1" : "0"} parking</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSection2 = () => {
    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">Property Information</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div className="text-neutral-6000 dark:text-neutral-300">
          <p className="whitespace-pre-line">{description}</p>
        </div>
      </div>
    );
  };

  const renderSection3 = () => {
    return (
      <div className="listingSection__wrap">
        <div>
          <h2 className="text-2xl font-semibold">Amenities</h2>
          <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
            About the property&apos;s amenities and services
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-sm text-neutral-700 dark:text-neutral-300">
          {amenities?.map((item: string) => (
            <div key={item} className="flex items-center space-x-3">
              <i className={`text-3xl las ${getAmenityIcon(item)}`}></i>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionPackages = () => {
    if (!packages || packages.length === 0) {
      return (
        <div className="listingSection__wrap">
          <h2 className="text-2xl font-semibold">Viewing Packages</h2>
          <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
          <div className="text-center py-8 text-neutral-500">
            No viewing packages available for this property.
          </div>
        </div>
      );
    }

    return (
      <div className="listingSection__wrap">
        <div>
          <h2 className="text-2xl font-semibold">Viewing Packages</h2>
          <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
            Select a package to book a viewing
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg: any, index: number) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPackage?.id === pkg.id
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10 shadow-lg"
                : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              {/* Tier Badge */}
              <div
                className={`absolute -top-3 left-6 px-4 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                  pkg.tier
                )} text-white text-xs font-bold shadow-md`}
              >
                {pkg.tier}
              </div>

              {/* Most Popular Badge */}
              {index === 1 && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow-md">
                  MOST POPULAR
                </div>
              )}

              <div className="flex-1 mt-2">
                <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-primary-600">
                    KSh {pkg.price.toLocaleString()}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {pkg.propertiesIncluded} {pkg.propertiesIncluded === 1 ? "viewing" : "viewings"} included
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    KSh {Math.round(pkg.price / pkg.propertiesIncluded).toLocaleString()} per viewing
                  </p>
                </div>

                {/* Features */}
                {pkg.features && pkg.features.length > 0 && (
                  <ul className="space-y-2">
                    {pkg.features.map((feature: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start text-sm text-neutral-600 dark:text-neutral-400"
                      >
                        <i className="las la-check-circle text-primary-600 mr-2 mt-0.5"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedPackage?.id === pkg.id && (
                <div className="absolute top-3 right-3 text-primary-500">
                  <i className="las la-check-circle text-2xl"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionUtilities = () => {
    const utils = property.utilities || {};
    const bills = [
      { name: "Water", included: utils.waterIncluded, cost: utils.waterCost, icon: "la-tint" },
      { name: "Garbage", included: utils.garbageIncluded, cost: utils.garbageCost, icon: "la-trash" },
      { name: "Security", included: utils.securityIncluded, cost: utils.securityCost, icon: "la-shield-alt" },
      { name: "Electricity", type: utils.electricityType, cost: utils.electricityCost, icon: "la-bolt" },
    ];

    const hasBills = bills.some(b => !b.included || b.cost);

    if (!hasBills) return null;

    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">Utilities & Bills</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bills.map((bill) => (
            <div key={bill.name} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
              <div className="flex items-center space-x-3">
                <i className={`text-2xl las ${bill.icon} text-primary-600`}></i>
                <div>
                  <span className="block font-medium">{bill.name}</span>
                  <span className="text-xs text-neutral-500">
                    {bill.name === "Electricity" ? (bill.type || "Prepaid") : (bill.included ? "Included in rent" : "Charged separately")}
                  </span>
                </div>
              </div>
              {bill.cost && (
                <div className="text-right">
                  <span className="block font-semibold text-primary-600">KSh {bill.cost}</span>
                  <span className="text-[10px] text-neutral-400 uppercase">per month</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionVideos = () => {
    if (!videos || videos.length === 0) return null;

    const videoData: VideoType[] = videos.map((url: string, index: number) => ({
      id: url,
      title: `${title} - Video Tour ${videos.length > 1 ? index + 1 : ""}`,
      thumbnail: images[0] || "",
    }));

    return (
      <div className="listingSection__wrap">
        <SectionVideos videos={videoData} />
      </div>
    );
  };

  const renderSection7 = () => {
    const lat = location?.lat || -1.2921;
    const lng = location?.lng || 36.8219;

    return (
      <div className="listingSection__wrap">
        <div>
          <h2 className="text-2xl font-semibold">Location</h2>
          <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
            {location?.generalArea}, {location?.county}
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />

        <div className="ring-1 ring-black/10 rounded-xl z-0 overflow-hidden h-[400px]">
          <ListingMap
            lat={lat}
            lng={lng}
            isExact={property.isExactLocation}
          />
        </div>
      </div>
    );
  };

  const renderSectionIncludedProperties = () => {
    // Only for packages (Silver/Gold)
    const listingPackage = property.listingPackage;
    if (!listingPackage || (listingPackage !== 'SILVER' && listingPackage !== 'GOLD')) {
      return null;
    }

    let packageProperties: any[] = [];
    try {
      const raw = property.packageProperties;
      if (Array.isArray(raw)) {
        packageProperties = raw;
      } else if (typeof raw === 'string') {
        packageProperties = JSON.parse(raw);
      }
    } catch (e) {
      console.error("Error parsing package properties", e);
    }

    if (packageProperties.length === 0) return null;

    // Mapper to convert PropertyFormData/BackendModel to StayDataType
    const mapToStayData = (prop: any, index: number): StayDataType => {
      // Determine layout string
      let layoutStr = "1-bedroom";
      if (prop.layout) layoutStr = prop.layout;
      else if (prop.propertyType) {
        if (prop.propertyType === 'Single Room') layoutStr = "bedsitter"; // Approximation
        else if (prop.propertyType === 'Studio') layoutStr = "studio";
        else layoutStr = prop.propertyType.toLowerCase().replace(' ', '-');
      }

      // Determine images
      const images = prop.images || prop.photos || [];

      return {
        id: prop.id || `${property.id}_sub_${index}`,
        title: prop.title || prop.propertyName || `Package Property #${index + 1}`,
        description: prop.description || "",
        rent: Number(prop.rent || prop.monthlyRent || 0),
        deposit: Number(prop.deposit || 0),
        layout: layoutStr as any,
        bathrooms: Number(prop.bathrooms || 1),
        location: {
          generalArea: prop.areaName || prop.location?.generalArea || property.location?.generalArea || "",
          county: prop.county || prop.location?.county || property.location?.county || "",
          directions: ""
        },
        amenities: prop.amenities || [],
        utilities: prop.utilities || (prop.waterBilling ? {
          waterIncluded: prop.waterBilling === 'included',
          electricityType: prop.electricityBilling || 'prepaid'
        } : {}),
        images: images.length > 0 ? images : property.images || [], // Fallback to main images if none
        videoUrl: "",
        agent: property.agent,
        viewingPackages: [],
        status: "available",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
        bookingCount: 0,
        href: (prop.id ? `/listing-stay-detail/${prop.id}` : `/listing-stay-detail/${property.id}`) as Route,

        averageRating: 0, // No ratings yet
        reviewCount: 0
      } as StayDataType;
    };

    return (
      <div className="listingSection__wrap">
        <div>
          <h2 className="text-2xl font-semibold">Included in this {listingPackage} Package</h2>
          <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
            This listing includes {packageProperties.length} additional properties
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packageProperties.map((prop, idx) => (
            <StayCard key={idx} data={mapToStayData(prop, idx)} />
          ))}
        </div>
      </div>
    );
  };

  const renderGoldPackageSection = () => {
    // Only show if this is a Gold package with package members
    if (!property?.packageGroupId || packageMembers.length === 0) {
      return null;
    }

    return (
      <div className="listingSection__wrap">
        <div className="mb-6">
          <GoldPackageCard
            masterProperty={packageMembers.find((p: any) => p.packagePosition === 1) || property}
            packageMembers={packageMembers}
          />
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
      </div>
    );
  };


  const renderSidebar = () => {
    return (
      <div className="listingSectionSidebar__wrap shadow-xl">
        <div className="flex justify-between">
          <span className="text-3xl font-semibold">
            KSh {rent?.toLocaleString()}
            <span className="ml-1 text-base font-normal text-neutral-500 dark:text-neutral-400">
              /month
            </span>
          </span>
        </div>

        {selectedPackage && (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{selectedPackage.name}</span>
              <span className="text-sm px-2 py-1 rounded-full bg-primary-600 text-white">
                {selectedPackage.tier}
              </span>
            </div>
            <div className="text-2xl font-bold text-primary-600">
              KSh {selectedPackage.price.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {selectedPackage.propertiesIncluded} viewing(s) included
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
            <span>Monthly Rent</span>
            <span>KSh {rent?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
            <span>Security Deposit</span>
            <span>KSh {rent?.toLocaleString()}</span>
          </div>
          {selectedPackage && (
            <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
              <span>Viewing Fee</span>
              <span>KSh {selectedPackage.price.toLocaleString()}</span>
            </div>
          )}
        </div>

        <ButtonPrimary
          disabled={!selectedPackage}
          onClick={() => {
            if (!isAuthenticated) {
              router.push("/login" as Route);
            } else if (selectedPackage) {
              router.push(`/checkout?propertyId=${id}&packageId=${selectedPackage.id}` as Route);
            }
          }}
        >
          {selectedPackage ? "Book Viewing" : "Select a Package"}
        </ButtonPrimary>

        <ComparisonButton property={property} className="w-full" />
        <ButtonSecondary href={`/tenant-dashboard?tab=messages&partnerId=${hunter?.id}` as Route}>
          Message Haunter
        </ButtonSecondary>
      </div>
    );
  };

  return (
    <div className="nc-ListingStayDetailPage">
      {renderVideoModal()}

      <header className="rounded-md sm:rounded-xl">
        <div className="relative grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2">
          <div
            className="col-span-2 row-span-3 sm:row-span-2 relative rounded-md sm:rounded-xl overflow-hidden cursor-pointer"
            onClick={handleOpenModalImageGallery}
          >
            {images && images[0] && (
              <Image
                fill
                className="object-cover rounded-md sm:rounded-xl"
                src={images[0]}
                alt={title}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
              />
            )}
            <div className="absolute inset-0 bg-neutral-900 bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity"></div>
          </div>

          {images?.slice(1, 5).map((item: string, index: number) => (
            <div
              key={index}
              className={`relative rounded-md sm:rounded-xl overflow-hidden ${index >= 3 ? "hidden sm:block" : ""
                }`}
            >
              <div className="aspect-w-4 aspect-h-3 sm:aspect-w-6 sm:aspect-h-5">
                <Image
                  fill
                  className="object-cover rounded-md sm:rounded-xl"
                  src={item}
                  alt=""
                  sizes="400px"
                />
              </div>
              <div
                className="absolute inset-0 bg-neutral-900 bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleOpenModalImageGallery}
              />
            </div>
          ))}

          <button
            className="absolute hidden md:flex md:items-center md:justify-center left-3 bottom-3 px-4 py-2 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 z-10"
            onClick={handleOpenModalImageGallery}
          >
            <Squares2X2Icon className="w-5 h-5" />
            <span className="ml-2 text-neutral-800 text-sm font-medium">
              Show all photos
            </span>
          </button>

        </div>
      </header>

      <main className="relative z-10 mt-11 flex flex-col lg:flex-row">
        <div className="w-full lg:w-3/5 xl:w-2/3 space-y-8 lg:space-y-10 lg:pr-10">
          {renderGoldPackageSection()}
          {renderSection1()}
          {renderSection7()}
          {renderSection2()}
          {renderSectionUtilities()}
          {renderSection3()}
          {renderSectionPackages()}
          {renderSectionIncludedProperties()}
          {renderSectionVideos()}
        </div>


        <div className="hidden lg:block flex-grow mt-14 lg:mt-0">
          <div className="sticky top-28">{renderSidebar()}</div>
        </div>
      </main>
    </div>
  );
};

export default ListingStayDetailPage;
