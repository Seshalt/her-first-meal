export type Region = "northeast" | "south" | "midwest" | "west" | "pacific";

export type UsState = { code: string; name: string; region: Region };

export const US_STATES: UsState[] = [
  { code: "AL", name: "Alabama", region: "south" },
  { code: "AK", name: "Alaska", region: "pacific" },
  { code: "AZ", name: "Arizona", region: "west" },
  { code: "AR", name: "Arkansas", region: "south" },
  { code: "CA", name: "California", region: "pacific" },
  { code: "CO", name: "Colorado", region: "west" },
  { code: "CT", name: "Connecticut", region: "northeast" },
  { code: "DE", name: "Delaware", region: "northeast" },
  { code: "DC", name: "District of Columbia", region: "northeast" },
  { code: "FL", name: "Florida", region: "south" },
  { code: "GA", name: "Georgia", region: "south" },
  { code: "HI", name: "Hawaii", region: "pacific" },
  { code: "ID", name: "Idaho", region: "west" },
  { code: "IL", name: "Illinois", region: "midwest" },
  { code: "IN", name: "Indiana", region: "midwest" },
  { code: "IA", name: "Iowa", region: "midwest" },
  { code: "KS", name: "Kansas", region: "midwest" },
  { code: "KY", name: "Kentucky", region: "south" },
  { code: "LA", name: "Louisiana", region: "south" },
  { code: "ME", name: "Maine", region: "northeast" },
  { code: "MD", name: "Maryland", region: "northeast" },
  { code: "MA", name: "Massachusetts", region: "northeast" },
  { code: "MI", name: "Michigan", region: "midwest" },
  { code: "MN", name: "Minnesota", region: "midwest" },
  { code: "MS", name: "Mississippi", region: "south" },
  { code: "MO", name: "Missouri", region: "midwest" },
  { code: "MT", name: "Montana", region: "west" },
  { code: "NE", name: "Nebraska", region: "midwest" },
  { code: "NV", name: "Nevada", region: "west" },
  { code: "NH", name: "New Hampshire", region: "northeast" },
  { code: "NJ", name: "New Jersey", region: "northeast" },
  { code: "NM", name: "New Mexico", region: "west" },
  { code: "NY", name: "New York", region: "northeast" },
  { code: "NC", name: "North Carolina", region: "south" },
  { code: "ND", name: "North Dakota", region: "midwest" },
  { code: "OH", name: "Ohio", region: "midwest" },
  { code: "OK", name: "Oklahoma", region: "south" },
  { code: "OR", name: "Oregon", region: "pacific" },
  { code: "PA", name: "Pennsylvania", region: "northeast" },
  { code: "RI", name: "Rhode Island", region: "northeast" },
  { code: "SC", name: "South Carolina", region: "south" },
  { code: "SD", name: "South Dakota", region: "midwest" },
  { code: "TN", name: "Tennessee", region: "south" },
  { code: "TX", name: "Texas", region: "south" },
  { code: "UT", name: "Utah", region: "west" },
  { code: "VT", name: "Vermont", region: "northeast" },
  { code: "VA", name: "Virginia", region: "south" },
  { code: "WA", name: "Washington", region: "pacific" },
  { code: "WV", name: "West Virginia", region: "south" },
  { code: "WI", name: "Wisconsin", region: "midwest" },
  { code: "WY", name: "Wyoming", region: "west" },
];

export const REGION_LABEL: Record<Region, string> = {
  northeast: "Northeast",
  south: "South",
  midwest: "Midwest",
  west: "Interior West",
  pacific: "Pacific",
};

type Season = "winter" | "spring" | "summer" | "fall";

function seasonFromMonth(month = new Date().getMonth()): Season {
  if (month <= 1 || month === 11) return "winter";
  if (month <= 4) return "spring";
  if (month <= 7) return "summer";
  return "fall";
}

const PRODUCE: Record<Region, Record<Season, { name: string; qty: string; dept: string }[]>> = {
  northeast: {
    winter: [
      { name: "Storage apples", qty: "6", dept: "Produce" },
      { name: "Cabbage", qty: "1", dept: "Produce" },
      { name: "Carrots", qty: "1 lb", dept: "Produce" },
    ],
    spring: [
      { name: "Asparagus", qty: "1 bunch", dept: "Produce" },
      { name: "Peas", qty: "1 lb", dept: "Produce" },
      { name: "Spring greens", qty: "1 bag", dept: "Produce" },
    ],
    summer: [
      { name: "Tomatoes", qty: "4", dept: "Produce" },
      { name: "Sweet corn", qty: "4 ears", dept: "Produce" },
      { name: "Blueberries", qty: "1 pint", dept: "Produce" },
    ],
    fall: [
      { name: "Apples", qty: "6", dept: "Produce" },
      { name: "Squash", qty: "2", dept: "Produce" },
      { name: "Kale", qty: "1 bunch", dept: "Produce" },
    ],
  },
  south: {
    winter: [
      { name: "Citrus", qty: "6", dept: "Produce" },
      { name: "Collard greens", qty: "1 bunch", dept: "Produce" },
      { name: "Sweet potatoes", qty: "3", dept: "Produce" },
    ],
    spring: [
      { name: "Strawberries", qty: "1 pint", dept: "Produce" },
      { name: "Snap beans", qty: "1 lb", dept: "Produce" },
      { name: "Spring onions", qty: "1 bunch", dept: "Produce" },
    ],
    summer: [
      { name: "Okra", qty: "1 lb", dept: "Produce" },
      { name: "Peaches", qty: "4", dept: "Produce" },
      { name: "Tomatoes", qty: "4", dept: "Produce" },
    ],
    fall: [
      { name: "Pecans", qty: "1 cup", dept: "Dry goods" },
      { name: "Winter squash", qty: "2", dept: "Produce" },
      { name: "Mustard greens", qty: "1 bunch", dept: "Produce" },
    ],
  },
  midwest: {
    winter: [
      { name: "Potatoes", qty: "3 lb", dept: "Produce" },
      { name: "Beets", qty: "1 bunch", dept: "Produce" },
      { name: "Onions", qty: "3", dept: "Produce" },
    ],
    spring: [
      { name: "Rhubarb", qty: "4 stalks", dept: "Produce" },
      { name: "Lettuce", qty: "2 heads", dept: "Produce" },
      { name: "Radishes", qty: "1 bunch", dept: "Produce" },
    ],
    summer: [
      { name: "Sweet corn", qty: "6 ears", dept: "Produce" },
      { name: "Tomatoes", qty: "4", dept: "Produce" },
      { name: "Zucchini", qty: "2", dept: "Produce" },
    ],
    fall: [
      { name: "Apples", qty: "6", dept: "Produce" },
      { name: "Pumpkin", qty: "1", dept: "Produce" },
      { name: "Cabbage", qty: "1", dept: "Produce" },
    ],
  },
  west: {
    winter: [
      { name: "Chile peppers (dried)", qty: "6", dept: "Spices" },
      { name: "Winter squash", qty: "2", dept: "Produce" },
      { name: "Onions", qty: "3", dept: "Produce" },
    ],
    spring: [
      { name: "Spinach", qty: "1 bag", dept: "Produce" },
      { name: "Green onions", qty: "1 bunch", dept: "Produce" },
      { name: "Herbs", qty: "1 bunch", dept: "Produce" },
    ],
    summer: [
      { name: "Melon", qty: "1", dept: "Produce" },
      { name: "Peppers", qty: "4", dept: "Produce" },
      { name: "Tomatoes", qty: "4", dept: "Produce" },
    ],
    fall: [
      { name: "Chile peppers", qty: "6", dept: "Produce" },
      { name: "Apples", qty: "6", dept: "Produce" },
      { name: "Squash", qty: "2", dept: "Produce" },
    ],
  },
  pacific: {
    winter: [
      { name: "Citrus", qty: "6", dept: "Produce" },
      { name: "Kale", qty: "1 bunch", dept: "Produce" },
      { name: "Avocados", qty: "3", dept: "Produce" },
    ],
    spring: [
      { name: "Strawberries", qty: "1 pint", dept: "Produce" },
      { name: "Artichokes", qty: "2", dept: "Produce" },
      { name: "Asparagus", qty: "1 bunch", dept: "Produce" },
    ],
    summer: [
      { name: "Stone fruit", qty: "6", dept: "Produce" },
      { name: "Tomatoes", qty: "4", dept: "Produce" },
      { name: "Berries", qty: "1 pint", dept: "Produce" },
    ],
    fall: [
      { name: "Grapes", qty: "1 bunch", dept: "Produce" },
      { name: "Squash", qty: "2", dept: "Produce" },
      { name: "Mushrooms", qty: "8 oz", dept: "Produce" },
    ],
  },
};

export function stateByCode(code?: string | null) {
  if (!code) return null;
  return US_STATES.find((s) => s.code === code.toUpperCase()) ?? null;
}

export function seasonalProduce(stateCode?: string | null, month?: number) {
  const state = stateByCode(stateCode);
  const region: Region = state?.region ?? "south";
  return PRODUCE[region][seasonFromMonth(month)];
}

export const PANTRY_STAPLES = [
  { name: "Olive oil", qty: "1 bottle", dept: "Oils" },
  { name: "Sea salt", qty: "1 box", dept: "Spices" },
  { name: "Black pepper", qty: "1 jar", dept: "Spices" },
  { name: "Garlic", qty: "1 head", dept: "Produce" },
  { name: "Onions", qty: "3", dept: "Produce" },
  { name: "Rolled oats", qty: "1 canister", dept: "Dry goods" },
  { name: "Rice", qty: "2 lb", dept: "Dry goods" },
  { name: "Dried lentils", qty: "1 lb", dept: "Dry goods" },
  { name: "Canned beans", qty: "3 cans", dept: "Dry goods" },
  { name: "Canned tomatoes", qty: "2 cans", dept: "Dry goods" },
];
