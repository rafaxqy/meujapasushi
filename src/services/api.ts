const BASE_URL = "https://api-gfood.gdoor.com.br";
const ESTABLISHMENT_ID = "b707b9bd-fdc7-4357-b85f-63db29d80cdd";

const API_HEADERS = {
  accept: "application/json",
  "content-type": "application/json",
};

let _sessionToken: string | null = localStorage.getItem("accessToken");

const getAuthHeaders = () => ({
  ...API_HEADERS,
  Authorization: `Bearer ${_sessionToken ?? ""}`,
});

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(
    `${BASE_URL}/establishments/${ESTABLISHMENT_ID}${path}`,
    { headers: API_HEADERS }
  );
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export type ApiGroup = {
  id: number;
  name: string;
  ordering: number;
  isPizza: boolean;
};

export type ApiMenuItem = {
  id: number;
  name: string;
  price: number;
  observation: string;
  category: { id: number; name: string; visible?: number; ordering?: number };
  imageUrl: string;
  categoryId: number;
};

export type ApiProduct = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  additionalGroups: unknown[];
};

export const checkSystemStatus = () =>
  apiFetch<{ online: boolean }>("/system-status");

export const checkStoreStatus = () =>
  apiFetch<{ open: boolean }>("/status");

export const fetchGroups = () =>
  apiFetch<ApiGroup[]>("/groups");

export const fetchMenu = (page = 1, size = 200) =>
  apiFetch<ApiMenuItem[]>(`/menu?page=${page}&size=${size}`);

export const fetchProduct = (id: number) =>
  apiFetch<ApiProduct>(`/products/${id}`);

export type SignupResult = {
  isNewUser: boolean;
};

export const signupUser = async (phone: string): Promise<SignupResult> => {
  const digits = phone.replace(/\D/g, "");
  const res = await fetch(`${BASE_URL}/user/signup`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({ phone: digits }),
  });
  if (!res.ok) throw new Error(`Falha ao criar sessão (${res.status})`);
  const data = (await res.json()) as {
    accessToken: string;
    sessionExpiration?: string;
    user?: { name: string | null; document: string | null };
  };
  _sessionToken = data.accessToken;
  localStorage.setItem("accessToken", data.accessToken);
  if (data.sessionExpiration) {
    localStorage.setItem("sessionExpiration", data.sessionExpiration);
  }
  return {
    isNewUser: data.user?.name === null && data.user?.document === null,
  };
};

export const updateUserProfile = async (name: string, document: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/user/profile`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, document }),
  });
  if (!res.ok) throw new Error(`Falha ao atualizar perfil (${res.status})`);
};

export type SavedAddress = {
  id: number;
  name: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  isMaster: boolean;
  isPending: boolean;
};

export const fetchUserAddresses = (): Promise<SavedAddress[]> =>
  fetch(`${BASE_URL}/establishments/${ESTABLISHMENT_ID}/customer/delivery-addresses`, {
    headers: getAuthHeaders(),
  }).then(async (r) => {
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? (data as SavedAddress[]) : [];
  });

export type OrderAddress = {
  id?: number;
  name: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cityCode?: string;
  isMaster: boolean;
  isPending: boolean;
};

export type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  observations: string;
  tipPercent: number;
  additionals: unknown[];
  total: number;
  isPizza: boolean;
  tip: number;
};

export type OrderPayload = {
  type: "delivery";
  customer: {
    document: string;
    deliveryAddresses: OrderAddress[];
  };
  delivery: {
    valueForChange: number;
    deliveryMethod: "delivery" | "takeout";
    paymentMethod: string;
    deliveryAddress?: OrderAddress;
    deliveryFee: number;
  };
  items: OrderItem[];
};

export type OrderResponse = {
  id?: number | string;
  [key: string]: unknown;
};

export const submitOrder = async (payload: OrderPayload): Promise<OrderResponse> => {
  const res = await fetch(
    `${BASE_URL}/establishments/${ESTABLISHMENT_ID}/order`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erro ao enviar pedido (${res.status})${text ? ": " + text : ""}`);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as OrderResponse) : {};
};

export type ApiDistrictItem = {
  neighborhood: string;
  hasDelivery?: boolean;
  minOrderData?: number;
  deliveryFee?: number;
  regions?: Array<{
    region: string;
    hasDelivery: boolean;
    minOrderData: number;
    deliveryFee: number;
  }>;
};

export type ApiCityDistricts = {
  state: string;
  cityCode: string;
  city: string;
  districts: ApiDistrictItem[];
};

export const fetchDeliveryDistricts = (): Promise<ApiCityDistricts[]> =>
  fetch(`${BASE_URL}/establishments/${ESTABLISHMENT_ID}/delivery-districts`, {
    headers: getAuthHeaders(),
  }).then((r) => r.json() as Promise<ApiCityDistricts[]>);

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export const fetchViaCep = async (cep: string): Promise<ViaCepResponse> => {
  const digits = cep.replace(/\D/g, "");
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) throw new Error("Erro ao consultar CEP");
  return res.json() as Promise<ViaCepResponse>;
};

export const storeUrlToken = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) localStorage.setItem("token", token);
};
