"use client";

import React from "react";
import { FC } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { Route } from "@/routers/types";
import { PropertyFormProvider } from "@/contexts/PropertyFormContext";
import { useProperties } from "@/contexts/PropertyContext";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

export interface CommonLayoutProps {
  children: React.ReactNode;
  params: {
    stepIndex: string;
  };
}

const AddListingContent: FC<CommonLayoutProps> = ({ children, params }) => {
  const index = Number(params.stepIndex) || 1;
  const router = useRouter();
  const { addProperty, updateProperty } = useProperties();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { formData, clearFormData } = usePropertyForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login" as Route);
      return;
    }

    // Check if user is a hunter and verification status
    if (!authLoading && isAuthenticated && user) {
      if (user.role !== "HUNTER") {
        toast.error("Only verified House Haunters can add listings.");
        router.push("/" as Route);
        return;
      }

      // Check verification status
      if (user.verificationStatus !== "APPROVED") {
        if (user.verificationStatus === "PENDING") {
          toast.warning("Your hunter account is pending admin approval. You'll be able to add listings once approved.");
          router.push("/haunter-dashboard" as Route);
        } else if (user.verificationStatus === "REJECTED") {
          toast.error("Your hunter verification was rejected. Please contact support.");
          router.push("/haunter-dashboard" as Route);
        } else {
          toast.warning("Please complete your hunter verification before adding listings.");
          router.push("/haunter-dashboard" as Route);
        }
        return;
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!isAuthenticated || !user || user.role !== "HUNTER" || user.verificationStatus !== "APPROVED") {
    return null;
  }

  const nextHref = (
    index < 7 ? `/add-listing/${index + 1}` : `/add-listing/${1}`
  ) as Route;
  const backtHref = (
    index > 1 ? `/add-listing/${index - 1}` : `/add-listing/${1}`
  ) as Route;
  const nextBtnText = index === 6 ? "Publish listing" : "Continue";

  const handlePublish = async () => {
    // Packages are now optional - no validation needed

    setLoading(true);
    try {
      const isEditing = !!formData.propertyId;

      console.log('[Layout] handlePublish called:', {
        isEditing,
        propertyId: formData.propertyId,
        formDataKeys: Object.keys(formData)
      });

      // Map formData to backend format
      const propertyData = {
        title: formData.propertyName,
        description: formData.description || `A beautiful ${formData.propertyType} in ${formData.areaName}`,
        rent: Number(formData.monthlyRent) || 25000,
        deposit: Number(formData.deposit) || 25000,
        layout: formData.propertyType,
        bathrooms: formData.bathrooms,
        location: {
          address: formData.buildingName,
          generalArea: formData.areaName,
          county: formData.county,
          lat: formData.coordinates?.[1] || 0,  // Correct: lat is second element
          lng: formData.coordinates?.[0] || 0,  // Correct: lng is first element
        },
        amenities: formData.amenities,
        images: formData.photos,
        videos: formData.videos,
        packages: formData.viewingPackages || [],
        utilities: {
          waterIncluded: formData.waterBilling === 'included',
          electricityType: formData.electricityBilling || 'prepaid',
        }
      };

      if (isEditing && formData.propertyId) {
        console.log('[Layout] Updating property:', formData.propertyId, propertyData);
        await updateProperty(formData.propertyId, propertyData);
        toast.success("Property updated successfully!");
      } else {
        console.log('[Layout] Creating new property:', propertyData);
        await addProperty(propertyData as any);
        toast.success("Property published successfully!");
      }

      clearFormData();
      router.push("/add-listing/7" as Route);
    } catch (err: any) {
      console.error('[Layout] Publish error:', err);
      toast.error(err.message || "Failed to publish property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`nc-PageAddListing1 px-4 max-w-3xl mx-auto pb-24 pt-14 sm:py-24 lg:pb-32`}
    >
      <div className="space-y-11">
        <div>
          <span className="text-4xl font-semibold">{index}</span>{" "}
          <span className="text-lg text-neutral-500 dark:text-neutral-400">
            / 7
          </span>
        </div>

        {/* --------------------- */}
        <div className="listingSection__wrap ">{children}</div>

        {/* --------------------- */}
        <div className="flex justify-end space-x-5">
          <ButtonSecondary href={backtHref}>Go back</ButtonSecondary>
          {index === 6 ? (
            <ButtonPrimary onClick={handlePublish} loading={loading}>
              Publish listing
            </ButtonPrimary>
          ) : index === 7 ? (
            <ButtonPrimary href={"/haunter-dashboard?tab=listings" as Route}>
              Go to Dashboard
            </ButtonPrimary>
          ) : (
            <ButtonPrimary
              onClick={() => {
                // Step 1: Property Type & Name
                if (index === 1) {
                  if (!formData.propertyType) {
                    toast.warning("Please select a property type to continue.");
                    return;
                  }
                  if (!formData.propertyName || formData.propertyName.trim().length < 3) {
                    toast.warning("Please provide a property name (minimum 3 characters).");
                    return;
                  }
                }

                // Step 2: Location
                if (index === 2) {
                  if (!formData.county) {
                    toast.warning("Please select a county.");
                    return;
                  }
                  if (!formData.areaName || formData.areaName.trim().length < 2) {
                    toast.warning("Please provide an area name.");
                    return;
                  }
                  if (!formData.coordinates || formData.coordinates.length !== 2) {
                    toast.warning("Please set the property location on the map.");
                    return;
                  }
                }

                // Step 3: Utilities - validate billing amounts
                if (index === 3) {
                  if (formData.waterBilling === 'separate' && (!formData.waterBillingAmount || Number(formData.waterBillingAmount) <= 0)) {
                    toast.warning("Please enter the water billing amount.");
                    return;
                  }
                  if (formData.garbageBilling === 'separate' && (!formData.garbageBillingAmount || Number(formData.garbageBillingAmount) <= 0)) {
                    toast.warning("Please enter the garbage collection amount.");
                    return;
                  }
                  if (formData.securityBilling === 'separate' && (!formData.securityBillingAmount || Number(formData.securityBillingAmount) <= 0)) {
                    toast.warning("Please enter the security fee amount.");
                    return;
                  }
                }


                // Step 4: Photos & Videos
                if (index === 4) {
                  const isEditing = !!formData.propertyId;
                  if (!isEditing && formData.photos.length < 4) {
                    toast.warning("Please upload at least 4 photos of the property to continue.");
                    return;
                  }
                  if (!isEditing && formData.videos.length < 1) {
                    toast.warning("Please upload at least 1 video of the property to continue.");
                    return;
                  }
                  // For editing, just ensure there is at least one photo if they were already there
                  if (isEditing && formData.photos.length === 0) {
                    toast.warning("Property must have at least one photo.");
                    return;
                  }
                }

                // Step 5: Price & Description
                if (index === 5) {
                  if (!formData.monthlyRent || Number(formData.monthlyRent) <= 0) {
                    toast.warning("Please enter a valid monthly rent amount.");
                    return;
                  }
                  if (!formData.description || formData.description.trim().length < 20) {
                    toast.warning("Please provide a description of at least 20 characters.");
                    return;
                  }
                }

                // Step 6: Viewing Packages - now optional, no validation needed

                router.push(nextHref);
              }}
            >
              Continue
            </ButtonPrimary>
          )}
        </div>
      </div>
    </div>
  );
};

const CommonLayout: FC<CommonLayoutProps> = (props) => {
  return (
    <PropertyFormProvider>
      <AddListingContent {...props} />
    </PropertyFormProvider>
  );
};

export default CommonLayout;
