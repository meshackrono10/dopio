"use client";

import Logo from "@/shared/Logo";
import SocialsList1 from "@/shared/SocialsList1";
import { CustomLink } from "@/data/types";
import React from "react";
import FooterNav from "./FooterNav";

export interface WidgetFooterMenu {
  id: string;
  title: string;
  menus: CustomLink[];
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: "5",
    title: "Company",
    menus: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
      { href: "/how-it-works", label: "How it Works" },
      { href: "#", label: "Trust & Safety" },
      { href: "#", label: "Terms of Service" },
    ],
  },
  {
    id: "1",
    title: "Services",
    menus: [
      { href: "/listing-stay", label: "Browse Properties" },
      { href: "/listing-stay-map", label: "Map Search" },
      { href: "/add-listing", label: "List a Property" },
      { href: "#", label: "Agent Verification" },
      { href: "#", label: "Premium Packages" },
    ],
  },
  {
    id: "2",
    title: "Support",
    menus: [
      { href: "#", label: "Help Center" },
      { href: "#", label: "Report an Issue" },
      { href: "#", label: "Safety Tips" },
      { href: "#", label: "FAQs" },
      { href: "#", label: "Refund Policy" },
    ],
  },
  {
    id: "4",
    title: "Community",
    menus: [
      { href: "#", label: "Discussion Forums" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Newsletter" },
      { href: "#", label: "Social Impact" },
      { href: "#", label: "Dapio Community" },
    ],
  },
];

const Footer: React.FC = () => {
  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">
          {menu.title}
        </h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, index) => (
            <li key={index}>
              <a
                key={index}
                className="text-neutral-6000 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const [year, setYear] = React.useState<number>(2024);

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <>
      <FooterNav />

      <div className="nc-Footer relative py-24 lg:py-28 border-t border-neutral-200 dark:border-neutral-700">
        <div className="container grid grid-cols-2 gap-y-10 gap-x-5 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10 ">
          <div className="grid grid-cols-4 gap-5 col-span-2 md:col-span-4 lg:md:col-span-1 lg:flex lg:flex-col">
            <div className="col-span-2 md:col-span-1">
              <Logo />
            </div>
            <div className="col-span-2 flex items-center md:col-span-3">
              <SocialsList1 className="flex items-center space-x-3 lg:space-x-0 lg:flex-col lg:space-y-2.5 lg:items-start" />
            </div>
          </div>
          {widgetMenus.map(renderWidgetMenuItem)}
        </div>
        <div className="container mt-10 border-t border-neutral-200 dark:border-neutral-700 pt-8">
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            © {year} Dapio. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default Footer;
