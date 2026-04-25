export type MenuVariant = {
  id: number;
  label: string;
  fullName: string;
  price: number;
  description?: string;
};

export type MenuItem = {
  id?: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  variants?: MenuVariant[];
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};
