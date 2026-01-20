export type Location = {
  id: string;
  name: string;
};

export type LocationWithQty = Location & {
  qty: number;
};

export type PriceList = {
  id: string;
  name: string;
};

export type PriceListEntry = PriceList & {
  include: boolean;
  price: number;
};

export type LocationsResponse = {
  locations: Location[];
};

export type PriceListsResponse = {
  priceLists: PriceList[];
};
