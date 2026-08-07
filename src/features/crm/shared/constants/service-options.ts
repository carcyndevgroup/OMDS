import type { TranslationKey } from "@/core/i18n";

import type { ServiceCategory } from "../types/crm-options";

export type ServiceOption = {
  id: string;
  translationKey: TranslationKey;
};

export type ServiceFamily = {
  id: string;
  translationKey: TranslationKey;
  options: ServiceOption[];
};

export type ServiceGroup = {
  category: ServiceCategory;
  translationKey: TranslationKey;
  families: ServiceFamily[];
};

export const serviceGroups: ServiceGroup[] = [
  {
    category: "desserts",
    translationKey: "crm.lead.serviceCategory.desserts",
    families: [
      {
        id: "churros",
        translationKey: "crm.lead.serviceFamily.churros",
        options: [
          { id: "churros_cinnamon_sugar", translationKey: "crm.lead.service.churrosCinnamonSugar" },
          { id: "churros_topping_bar", translationKey: "crm.lead.service.churrosToppingBar" },
          { id: "churros_filled_topping_bar", translationKey: "crm.lead.service.churrosFilledToppingBar" },
          { id: "churros_topping_bar_gelato", translationKey: "crm.lead.service.churrosToppingBarGelato" },
        ],
      },
      {
        id: "gelato",
        translationKey: "crm.lead.serviceFamily.gelato",
        options: [
          { id: "gelato_topping_bar", translationKey: "crm.lead.service.gelatoToppingBar" },
          { id: "sorbet_topping_bar", translationKey: "crm.lead.service.sorbetToppingBar" },
          { id: "rolled_ice_cream_signature", translationKey: "crm.lead.service.rolledIceCreamSignature" },
          { id: "rolled_ice_cream_traditional", translationKey: "crm.lead.service.rolledIceCreamTraditional" },
        ],
      },
      {
        id: "cannolis",
        translationKey: "crm.lead.serviceFamily.cannolis",
        options: [
          { id: "cannolis_box_only", translationKey: "crm.lead.service.cannolisBoxOnly" },
          { id: "cannolis_box_booth", translationKey: "crm.lead.service.cannolisBoxBooth" },
          { id: "cannolis_booth_only", translationKey: "crm.lead.service.cannolisBoothOnly" },
        ],
      },
      {
        id: "fountains",
        translationKey: "crm.lead.serviceFamily.fountains",
        options: [{ id: "chocolate_fountains", translationKey: "crm.lead.service.chocolateFountains" }],
      },
      {
        id: "conchas",
        translationKey: "crm.lead.serviceFamily.conchas",
        options: [{ id: "conchas", translationKey: "crm.lead.service.conchas" }],
      },
      {
        id: "donuts",
        translationKey: "crm.lead.serviceFamily.donuts",
        options: [
          { id: "donuts_topping_bar", translationKey: "crm.lead.service.donutsToppingBar" },
          { id: "donuts_topping_bar_gelato", translationKey: "crm.lead.service.donutsToppingBarGelato" },
        ],
      },
      {
        id: "pancakes",
        translationKey: "crm.lead.serviceFamily.pancakes",
        options: [
          { id: "pancakes_topping_bar", translationKey: "crm.lead.service.pancakesToppingBar" },
          { id: "pancakes_topping_bar_fruit", translationKey: "crm.lead.service.pancakesToppingBarFruit" },
          { id: "pancakes_topping_bar_gelato", translationKey: "crm.lead.service.pancakesToppingBarGelato" },
        ],
      },
      {
        id: "waffles",
        translationKey: "crm.lead.serviceFamily.waffles",
        options: [
          { id: "waffles_topping_bar", translationKey: "crm.lead.service.wafflesToppingBar" },
          { id: "waffles_topping_bar_fruit", translationKey: "crm.lead.service.wafflesToppingBarFruit" },
          { id: "waffles_topping_bar_gelato", translationKey: "crm.lead.service.wafflesToppingBarGelato" },
        ],
      },
      {
        id: "smores",
        translationKey: "crm.lead.serviceFamily.smores",
        options: [{ id: "smores_topping_bar", translationKey: "crm.lead.service.smoresToppingBar" }],
      },
      {
        id: "cookies",
        translationKey: "crm.lead.serviceFamily.cookies",
        options: [
          { id: "cookies_topping_bar", translationKey: "crm.lead.service.cookiesToppingBar" },
          { id: "cookies_topping_bar_gelato", translationKey: "crm.lead.service.cookiesToppingBarGelato" },
        ],
      },
    ],
  },
  {
    category: "snacks",
    translationKey: "crm.lead.serviceCategory.snacks",
    families: [
      {
        id: "snacks",
        translationKey: "crm.lead.serviceFamily.snacks",
        options: [
          { id: "popcorn_bar", translationKey: "crm.lead.service.popcornBar" },
          { id: "mexican_street_corn_bar", translationKey: "crm.lead.service.mexicanStreetCornBar" },
          { id: "ramen_bar", translationKey: "crm.lead.service.ramenBar" },
        ],
      },
    ],
  },
];

export const serviceOptions = serviceGroups.flatMap((group) => {
  return group.families.flatMap((family) => {
    return family.options;
  });
});

export const serviceIds = serviceOptions.map((option) => option.id);
