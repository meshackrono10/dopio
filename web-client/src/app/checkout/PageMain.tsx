"use client";

import { Tab } from "@headlessui/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import React, { FC, Fragment, useState, useEffect } from "react";
import visaPng from "@/images/vis.png";
import mastercardPng from "@/images/mastercard.svg";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import StartRating from "@/components/StartRating";
import NcModal from "@/shared/NcModal";
import ModalSelectDate from "@/components/ModalSelectDate";
import converSelectedDateToString from "@/utils/converSelectedDateToString";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useProperties } from "@/contexts/PropertyContext";
import { useInvoices } from "@/contexts/InvoiceContext";
import { useAuth } from "@/contexts/AuthContext";
import mpesaPng from "@/images/mpesa.png";
import { useToast } from "@/components/Toast";
import api from "@/services/api";
import { Route } from "next";

export interface CheckOutPagePageMainProps {
  className?: string;
}

const CheckOutPagePageMain: FC<CheckOutPagePageMainProps> = ({
  className = "",
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageId = searchParams.get("packageId");
  const propertyId = searchParams.get("propertyId");
  const { getPropertyById } = useProperties();
  const { payViewingRequest, createViewingRequest } = useInvoices();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [phone, setPhone] = useState(user?.phone || "");
  const [proposedLocation, setProposedLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [propertyData, setPropertyData] = useState<any>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      try {
        const response = await api.get(`/properties/${propertyId}`);
        setPropertyData(response.data);
      } catch (err) {
        console.error("Failed to fetch property details", err);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const propertyFromContext = propertyId ? getPropertyById(propertyId) : null;
  const liveProperty = propertyData || propertyFromContext;

  const selectedPackage = liveProperty?.viewingPackages?.find((p: any) => String(p.id) === packageId) ||
    liveProperty?.packages?.find((p: any) => String(p.id) === packageId);

  // Parse package properties for multi-item display
  let packageProperties: any[] = [];
  try {
    const raw = liveProperty?.packageProperties;
    if (Array.isArray(raw)) {
      packageProperties = raw;
    } else if (typeof raw === 'string') {
      packageProperties = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error parsing package properties", e);
  }

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleConfirmAndPay = async () => {
    if (loading || !liveProperty || !user || !selectedPackage) return;
    setLoading(true);
    try {
      // 1. Create viewing request with proper format
      const request = await createViewingRequest({
        propertyId: liveProperty.id,
        proposedDates: [{
          date: startDate?.toISOString() || new Date().toISOString(),
          timeSlot: selectedTime,
        }],
        packageId: selectedPackage.id,
        packageTier: selectedPackage.tier,
        proposedLocation: proposedLocation || undefined,
      });

      // 2. Initiate payment
      if (!request.id) {
        throw new Error("Failed to create viewing request");
      }

      await payViewingRequest(request.id.toString(), phone);

      showToast("success", "Payment successful! Viewing request sent to House Hunter.");
      router.push("/viewing-requests");
    } catch (err: any) {
      showToast("error", err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const renderSidebar = () => {
    return (
      <div className="w-full flex flex-col sm:rounded-2xl lg:border border-neutral-200 dark:border-neutral-700 space-y-6 px-0 sm:p-6 xl:p-8">
        <h3 className="text-xl font-semibold">Properties in this Viewing</h3>

        <div className="space-y-6">
          {/* Main Property */}
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 w-full sm:w-24">
              <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden relative">
                <Image
                  alt=""
                  fill
                  sizes="100px"
                  className="object-cover"
                  src={liveProperty?.images[0] || "https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"}
                />
              </div>
            </div>
            <div className="py-2 sm:px-4 space-y-1 flex-grow">
              <div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                  {liveProperty?.layout} in {liveProperty?.location?.generalArea}
                </span>
                <span className="text-sm font-medium block line-clamp-1">
                  {liveProperty?.title}
                </span>
              </div>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                {liveProperty?.bathrooms} baths · {liveProperty?.amenities?.length || 0} amenities
              </span>
            </div>
          </div>

          {/* Sub Properties if any */}
          {packageProperties.map((prop, idx) => {
            const images = prop.images || prop.photos || [];
            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex-shrink-0 w-full sm:w-24">
                  <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden relative">
                    <Image
                      alt=""
                      fill
                      sizes="100px"
                      className="object-cover"
                      src={images[0] || liveProperty?.images[0] || "https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"}
                    />
                  </div>
                </div>
                <div className="py-2 sm:px-4 space-y-1 flex-grow">
                  <div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                      {prop.layout || "Property"} in {prop.areaName || liveProperty?.location?.generalArea}
                    </span>
                    <span className="text-sm font-medium block line-clamp-1">
                      {prop.title || prop.propertyName || `Property #${idx + 2}`}
                    </span>
                  </div>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {prop.bathrooms || 1} baths · {prop.amenities?.length || 0} amenities
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <h3 className="text-2xl font-semibold">Price detail</h3>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
              <span>Viewing Fee ({selectedPackage?.name || "Standard"})</span>
              <span>KES {selectedPackage?.price.toLocaleString() || "0"}</span>
            </div>

            <div className="border-b border-neutral-200 dark:border-neutral-700"></div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>KES {selectedPackage?.price.toLocaleString() || "0"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMain = () => {
    return (
      <div className="w-full flex flex-col sm:rounded-2xl sm:border border-neutral-200 dark:border-neutral-700 space-y-8 px-0 sm:p-6 xl:p-8">
        <h2 className="text-3xl lg:text-4xl font-semibold">
          Confirm and payment
        </h2>
        <div className="border-b border-neutral-200 dark:border-neutral-700"></div>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-semibold">Your trip</h3>
            <NcModal
              renderTrigger={(openModal) => (
                <span
                  onClick={() => openModal()}
                  className="block lg:hidden underline  mt-1 cursor-pointer"
                >
                  View booking details
                </span>
              )}
              renderContent={renderSidebar}
              modalTitle="Booking details"
            />

            <div className="mt-6 border border-neutral-200 dark:border-neutral-700 rounded-3xl flex flex-col sm:flex-row divide-y sm:divide-x sm:divide-y-0 divide-neutral-200 dark:divide-neutral-700 overflow-hidden z-10">
              <ModalSelectDate
                renderChildren={({ openModal }) => (
                  <button
                    onClick={openModal}
                    className="text-left flex-1 p-5 flex justify-between space-x-5 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    type="button"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-neutral-400">Date</span>
                      <span className="mt-1.5 text-lg font-semibold">
                        {converSelectedDateToString([startDate, endDate])}
                      </span>
                    </div>
                    <PencilSquareIcon className="w-6 h-6 text-neutral-6000 dark:text-neutral-400" />
                  </button>
                )}
              />

              <div className="flex-1 p-5 flex justify-between space-x-5 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <div className="flex flex-col w-full">
                  <span className="text-sm text-neutral-400">Time</span>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="mt-1.5 text-lg font-semibold bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-lg font-semibold mb-3 block">Propose Meeting Location (Optional)</Label>
              <Input
                placeholder="e.g., Meet at Shell Petrol Station, Kasarani"
                value={proposedLocation}
                onChange={(e) => setProposedLocation(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-neutral-500 mt-2">
                Suggest a convenient landmark or location to meet the House Hunter.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold">Pay with</h3>
            <div className="w-14 border-b border-neutral-200 dark:border-neutral-700 my-5"></div>

            <div className="mt-6">
              <Tab.Group>
                <Tab.List className="flex my-5 gap-1">
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full flex items-center justify-center focus:outline-none ${selected
                          ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                          : "text-neutral-6000 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                      >
                        <span className="mr-2.5">M-Pesa</span>
                        <Image className="w-8" src={mpesaPng} alt="mpesa" />
                      </button>
                    )}
                  </Tab>
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`px-4 py-1.5 sm:px-6 sm:py-2.5  rounded-full flex items-center justify-center focus:outline-none  ${selected
                          ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                          : " text-neutral-6000 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                      >
                        <span className="mr-2.5">Credit card</span>
                        <Image className="w-8" src={visaPng} alt="visa" />
                        <Image
                          className="w-8"
                          src={mastercardPng}
                          alt="mastercard"
                        />
                      </button>
                    )}
                  </Tab>
                </Tab.List>

                <Tab.Panels>
                  <Tab.Panel className="space-y-5">
                    <div className="space-y-1">
                      <Label>M-Pesa Phone Number</Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="2547XXXXXXXX"
                      />
                      <span className="text-sm text-neutral-500 block">
                        Enter the phone number to receive the M-Pesa payment prompt.
                      </span>
                    </div>
                  </Tab.Panel>
                  <Tab.Panel className="space-y-5">
                    <div className="space-y-1">
                      <Label>Card number </Label>
                      <Input defaultValue="111 112 222 999" />
                    </div>
                    <div className="space-y-1">
                      <Label>Card holder </Label>
                      <Input defaultValue="JOHN DOE" />
                    </div>
                    <div className="flex space-x-5  ">
                      <div className="flex-1 space-y-1">
                        <Label>Expiration date </Label>
                        <Input type="date" defaultValue="MM/YY" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label>CVC </Label>
                        <Input />
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
              <div className="pt-8">
                <ButtonPrimary
                  onClick={handleConfirmAndPay}
                  loading={loading}
                >
                  Confirm and pay
                </ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!liveProperty) {
    return (
      <div className="container mt-11 mb-24 lg:mb-32 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-6000"></div>
      </div>
    );
  }

  return (
    <div className={`nc-CheckOutPagePageMain ${className}`}>
      <main className="container mt-11 mb-24 lg:mb-32 flex flex-col-reverse lg:flex-row">
        <div className="w-full lg:w-3/5 xl:w-2/3 lg:pr-10 ">{renderMain()}</div>
        <div className="hidden lg:block flex-grow">{renderSidebar()}</div>
      </main>
    </div>
  );
};

export default CheckOutPagePageMain;
