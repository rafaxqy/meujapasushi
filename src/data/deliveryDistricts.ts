export type District = {
  neighborhood: string;
  city: string;
  state: string;
  cityCode: string;
  deliveryFee: number;
  minOrder: number;
};

export const VALID_CITIES = ["Salinas", "São Geraldo"];

export const CITY_CODES: Record<string, string> = {
  "Salinas": "3157005",
  "São Geraldo": "3161502",
};

export const normalizeStr = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const findDistrict = (districts: District[], bairro: string): District | undefined =>
  districts.find((d) => normalizeStr(d.neighborhood) === normalizeStr(bairro));
