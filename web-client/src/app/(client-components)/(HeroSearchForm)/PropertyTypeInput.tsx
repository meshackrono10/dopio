"use client";

import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import React, { FC, Fragment, useState } from "react";
import { UserPlusIcon } from "@heroicons/react/24/outline";

export interface PropertyTypeInputProps {
    defaultValue?: string;
    onChange?: (value: string) => void;
    className?: string;
    buttonSubmitHref?: string;
    hasButtonSubmit?: boolean;
}

const PropertyTypeInput: FC<PropertyTypeInputProps> = ({
    defaultValue = "",
    onChange,
    className = "flex-1",
    hasButtonSubmit = true,
}) => {
    const [propertyType, setPropertyType] = useState(defaultValue);

    const propertyTypes = [
        { value: "any", label: "Any Property Type" },
        { value: "single-room", label: "Single Room" },
        { value: "bedsitter", label: "Bedsitter" },
        { value: "studio", label: "Studio" },
        { value: "1-bedroom", label: "1 Bedroom" },
        { value: "2-bedroom", label: "2 Bedroom" },
        { value: "3-bedroom", label: "3 Bedroom" },
        { value: "4-bedroom", label: "4+ Bedroom" },
        { value: "maisonette", label: "Maisonette" },
        { value: "bungalow", label: "Bungalow" },
    ];

    const handleSelect = (value: string, label: string) => {
        setPropertyType(label);
        onChange?.(value);
    };

    return (
        <Popover className={`flex relative ${className}`}>
            {({ open, close }) => (
                <>
                    <div
                        className={`flex-1 flex items-center focus:outline-none cursor-pointer ${open ? "nc-hero-field-focused" : ""
                            }`}
                    >
                        <Popover.Button
                            className={`relative z-10 flex-1 flex text-left items-center focus:outline-none`}
                            onClickCapture={() => document.querySelector("html")?.click()}
                        >
                            <div className="text-neutral-300 dark:text-neutral-400">
                                <UserPlusIcon className="w-5 h-5 lg:w-7 lg:h-7" />
                            </div>
                            <div className="flex-grow">
                                <span className="block xl:text-lg font-semibold">
                                    {propertyType || "Any"}
                                </span>
                                <span className="block mt-1 text-sm text-neutral-400 leading-none font-light">
                                    {propertyType ? "Property Type" : "Select property type"}
                                </span>
                            </div>
                            {!!propertyType && open && (
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setPropertyType("");
                                        onChange?.("");
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )}
                        </Popover.Button>

                        {/* BUTTON SUBMIT OF FORM */}
                        {hasButtonSubmit && (
                            <div className="pr-2 xl:pr-4">
                                <button
                                    type="button"
                                    className="h-14 md:h-16 w-full md:w-16 rounded-full bg-primary-6000 hover:bg-primary-700 flex items-center justify-center text-neutral-50 focus:outline-none"
                                >
                                    <span className="mr-3 md:hidden">Search</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute right-0 z-10 w-full sm:min-w-[340px] max-w-sm bg-white dark:bg-neutral-800 top-full mt-3 py-5 sm:py-6 px-4 sm:px-8 rounded-3xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    {propertyTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => {
                                                handleSelect(type.value, type.label);
                                                close();
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${propertyType === type.label
                                                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                }`}
                                        >
                                            <div className="font-medium">{type.label}</div>
                                            {type.value === "single-room" && (
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                    Shared bathroom & kitchen
                                                </div>
                                            )}
                                            {type.value === "bedsitter" && (
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                    Self-contained with private bathroom
                                                </div>
                                            )}
                                            {type.value === "studio" && (
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                    Open plan with separate kitchen
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
};

export default PropertyTypeInput;
