import React from "react";
import SectionHero from "@/app/(server-components)/SectionHero";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import { TaxonomyType } from "@/data/types";
import SectionSliderNewCategories from "@/components/SectionSliderNewCategories";
import SectionOurFeatures from "@/components/SectionOurFeatures";
import BackgroundSection from "@/components/BackgroundSection";
import SectionGridFeaturePlaces from "@/components/SectionGridFeaturePlaces";
import SectionHowItWork from "@/components/SectionHowItWork";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import SectionGridAuthorBox from "@/components/SectionGridAuthorBox";
import SectionGridCategoryBox from "@/components/SectionGridCategoryBox";
import SectionBecomeAnAuthor from "@/components/SectionBecomeAnAuthor";
import SectionVideos from "@/components/SectionVideos";
import SectionClientSay from "@/components/SectionClientSay";

const DEMO_CATS: TaxonomyType[] = [
  {
    id: "1",
    href: "/listing-stay-map",
    name: "Nairobi",
    taxonomy: "category",
    count: 15420,
    thumbnail:
      "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
  },
  {
    id: "2",
    href: "/listing-stay-map",
    name: "Mombasa",
    taxonomy: "category",
    count: 8750,
    thumbnail:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "3",
    href: "/listing-stay-map",
    name: "Kisumu",
    taxonomy: "category",
    count: 4320,
    thumbnail:
      "https://images.unsplash.com/photo-1632575238211-8da9ecf3e2fd?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "4",
    href: "/listing-stay-map",
    name: "Nakuru",
    taxonomy: "category",
    count: 3210,
    thumbnail:
      "https://images.unsplash.com/photo-1621951753409-7c8f9d39dbcd?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
  },
  {
    id: "5",
    href: "/listing-stay-map",
    name: "Eldoret",
    taxonomy: "category",
    count: 2890,
    thumbnail:
      "https://images.unsplash.com/photo-1633505457291-f21cf13c7ee8?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
  },
  {
    id: "6",
    href: "/listing-stay-map",
    name: "Kilifi",
    taxonomy: "category",
    count: 1850,
    thumbnail:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "7",
    href: "/listing-stay-map",
    name: "Nyeri",
    taxonomy: "category",
    count: 1620,
    thumbnail:
      "https://images.unsplash.com/photo-1584132915807-5b7e8c2f9bbe?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
];

const DEMO_CATS_2: TaxonomyType[] = [
  {
    id: "1",
    href: "/listing-stay-map",
    name: "Bedsitters & Studios",
    taxonomy: "category",
    count: 8420,
    thumbnail:
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
  },
  {
    id: "2",
    href: "/listing-stay-map",
    name: "1-Bedroom Apartments",
    taxonomy: "category",
    count: 12350,
    thumbnail:
      "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "3",
    href: "/listing-stay-map",
    name: "2-Bedroom Apartments",
    taxonomy: "category",
    count: 9840,
    thumbnail:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "4",
    href: "/listing-stay-map",
    name: "3-Bedroom Homes",
    taxonomy: "category",
    count: 5670,
    thumbnail:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "5",
    href: "/listing-stay-map",
    name: "Furnished Apartments",
    taxonomy: "category",
    count: 4320,
    thumbnail:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "6",
    href: "/listing-stay-map",
    name: "Shared Accommodation",
    taxonomy: "category",
    count: 3120,
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=compress&cs=tinysrgb&w=1600&lazy=load",
  },
  {
    id: "7",
    href: "/listing-stay-map",
    name: "Luxury Apartments",
    taxonomy: "category",
    count: 2890,
    thumbnail:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
];


function PageHome() {
  return (
    <main className="nc-PageHome relative overflow-hidden">
      {/* GLASSMOPHIN */}
      <BgGlassmorphism />

      <div className="container relative space-y-24 mb-24 lg:space-y-28 lg:mb-28">
        {/* SECTION HERO */}
        <SectionHero className="pt-10 lg:pt-16 lg:pb-16" />

        {/* SECTION 1 - Popular Kenyan Cities */}
        <SectionSliderNewCategories
          categories={DEMO_CATS}
          heading="Explore Properties by City"
          subHeading="Find rental homes in Kenya's major cities"
        />

        <SectionOurFeatures />

        <SectionGridFeaturePlaces cardType="card2" />

        <SectionHowItWork />

        <div className="relative py-16">
          <BackgroundSection className="bg-primary-50 dark:bg-black/20" />
          <SectionSliderNewCategories
            categories={DEMO_CATS_2}
            categoryCardType="card4"
            itemPerRow={4}
            heading="Browse by Property Type"
            subHeading="From bedsitters to luxury apartments - find what suits your needs"
            sliderStyle="style2"
          />
        </div>

        <SectionSubscribe2 />

        <div className="relative py-16">
          <BackgroundSection className="bg-primary-50 dark:bg-black dark:bg-opacity-20 " />
          <SectionGridAuthorBox />
        </div>

        <SectionGridCategoryBox />

        <div className="relative py-16">
          <BackgroundSection />
          <SectionBecomeAnAuthor />
        </div>

        <SectionVideos />

        <div className="relative py-16">
          <BackgroundSection />
          <SectionClientSay />
        </div>
      </div>
    </main>
  );
}

export default PageHome;

