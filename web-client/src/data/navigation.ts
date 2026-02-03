import { MegamenuItem, NavItemType } from "@/shared/Navigation/NavigationItem";
import ncNanoId from "@/utils/ncNanoId";
import { Route } from "@/routers/types";

// Agents Navigation - Focused on Property Rentals Only

export const NAVIGATION_DEMO: NavItemType[] = [
  // Navigation links removed per user request
];


export const NAVIGATION_DEMO_2: NavItemType[] = [
  {
    id: ncNanoId(),
    href: "/",
    name: "Home",
  },
  {
    id: ncNanoId(),
    href: "/listing-stay-map",
    name: "Properties",
    children: [
      { id: ncNanoId(), href: "/listing-stay", name: "Browse All" },
      {
        id: ncNanoId(),
        href: "/listing-stay-map",
        name: "Map Search",
      },
    ],
  },
  {
    id: ncNanoId(),
    href: "/about",
    name: "About",
  },
  {
    id: ncNanoId(),
    href: "/contact",
    name: "Contact",
  },
];
