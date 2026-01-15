import CardCategoryBox1 from "@/components/CardCategoryBox1";
import Heading from "@/shared/Heading";
import { TaxonomyType } from "@/data/types";
import React from "react";

export interface SectionGridCategoryBoxProps {
  categories?: TaxonomyType[];
  headingCenter?: boolean;
  categoryCardType?: "card1";
  className?: string;
  gridClassName?: string;
}

const DEMO_CATS: TaxonomyType[] = [
  {
    id: "1",
    href: "/listing-stay-map",
    name: "Westlands",
    taxonomy: "category",
    count: 1882,
    thumbnail:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
  },
  {
    id: "2",
    href: "/listing-stay-map",
    name: "Kilimani",
    taxonomy: "category",
    count: 8288,
    thumbnail:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "3",
    href: "/listing-stay-map",
    name: "Karen",
    taxonomy: "category",
    count: 1288,
    thumbnail:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "4",
    href: "/listing-stay-map",
    name: "Roysambu",
    taxonomy: "category",
    count: 112,
    thumbnail:
      "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
  },
  {
    id: "5",
    href: "/listing-stay-map",
    name: "Kileleshwa",
    taxonomy: "category",
    count: 323,
    thumbnail:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
  },
  {
    id: "6",
    href: "/listing-stay-map",
    name: "Lavington",
    taxonomy: "category",
    count: 2223,
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "7",
    href: "/listing-stay-map",
    name: "South B",
    taxonomy: "category",
    count: 1775,
    thumbnail:
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
  },
  {
    id: "8",
    href: "/listing-stay-map",
    name: "Langata",
    taxonomy: "category",
    count: 1288,
    thumbnail:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
];

const SectionGridCategoryBox: React.FC<SectionGridCategoryBoxProps> = ({
  categories = DEMO_CATS,
  categoryCardType = "card1",
  headingCenter = true,
  className = "",
  gridClassName = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}) => {
  let CardComponentName = CardCategoryBox1;
  switch (categoryCardType) {
    case "card1":
      CardComponentName = CardCategoryBox1;
      break;

    default:
      CardComponentName = CardCategoryBox1;
  }

  return (
    <div className={`nc-SectionGridCategoryBox relative ${className}`}>
      <Heading
        desc="Discover great places near where you live"
        isCenter={headingCenter}
      >
        Explore nearby
      </Heading>
      <div className={`grid ${gridClassName} gap-5 sm:gap-6 md:gap-8`}>
        {categories.map((item, i) => (
          <CardComponentName key={i} taxonomy={item} />
        ))}
      </div>
    </div>
  );
};

export default SectionGridCategoryBox;
