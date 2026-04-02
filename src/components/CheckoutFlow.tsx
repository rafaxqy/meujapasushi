import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  ArrowLeft, MapPin, CreditCard, User, Send,
  Truck, Store, Loader2, AlertTriangle, CheckCircle2, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchViaCep, signupUser, updateUserProfile, fetchUserAddresses,
  fetchDeliveryDistricts, submitOrder,
  type ApiCityDistricts, type OrderAddress, type SavedAddress,
} from "@/services/api";
import {
  findDistrict, normalizeStr, VALID_CITIES, CITY_CODES,
  type District,
} from "@/data/deliveryDistricts";

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const extractCity = (cidade: string) => cidade.split(" - ")[0].trim();

const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const maskCpf = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatZip = (zip: string) => {
  const d = zip.replace(/\D/g, "");
  return d.length >= 8 ? `${d.slice(0, 5)}-${d.slice(5, 8)}` : d;
};

const flattenDistricts = (cityDistricts: ApiCityDistricts[]): District[] =>
  cityDistricts.flatMap(({ city, state, cityCode, districts }) =>
    districts.flatMap((d) => {
      if (d.regions?.length) {
        return d.regions.map((r) => ({
          neighborhood: d.neighborhood.trim(),
          city,
          state,
          cityCode,
          deliveryFee: r.deliveryFee,
          minOrder: r.minOrderData,
        }));
      }
      if (!d.hasDelivery) return [];
      return [{
        neighborhood: d.neighborhood.trim(),
        city,
        state,
        cityCode,
        deliveryFee: d.deliveryFee ?? 0,
        minOrder: d.minOrderData ?? 0,
      }];
    })
  );

type DeliveryType = "entrega" | "retirada" | null;
type PaymentMethod = "pix" | "cartao" | "dinheiro" | null;

type AddressData = {
  nome: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
};

const SAVED_ADDRESS_KEY = "japa-sushi-address";
const SAVED_CUSTOMER_KEY = "japa-sushi-customer";

const emptyAddress = (): AddressData => ({
  nome: "", cep: "", rua: "", numero: "", bairro: "", complemento: "", cidade: "Salinas - MG",
});

const loadSavedAddress = (): AddressData => {
  try {
    const s = localStorage.getItem(SAVED_ADDRESS_KEY);
    if (s) return { ...emptyAddress(), ...JSON.parse(s) };
  } catch {}
  return emptyAddress();
};

const loadSavedCustomer = () => {
  try {
    const s = localStorage.getItem(SAVED_CUSTOMER_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return { nome: "", telefone: "" };
};

const PAYMENT_METHODS: Record<string, string> = {
  pix: "pix",
  cartao: "credit_card",
  dinheiro: "cash",
};

type Step = "delivery" | "customer" | "address" | "payment" | "summary" | "success";

interface Props {
  onBack: () => void;
}

export const CheckoutFlow = ({ onBack }: Props) => {
  const { items, totalPrice, clearCart } = useCart();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(null);
  const [address, setAddress] = useState<AddressData>(loadSavedAddress);
  const [payment, setPayment] = useState<PaymentMethod>(null);
  const [customer, setCustomer] = useState(loadSavedCustomer);
  const [step, setStep] = useState<Step>("delivery");

  const [districts, setDistricts] = useState<District[]>([]);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [outOfArea, setOutOfArea] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<number | null>(null);

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [awaitingCpf, setAwaitingCpf] = useState(false);
  const [cpf, setCpf] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderId, setOrderId] = useState<string | number | null>(null);

  const selectedDistrict: District | undefined = findDistrict(districts, address.bairro);
  const deliveryFee = deliveryType === "entrega" ? (selectedDistrict?.deliveryFee ?? 0) : 0;
  const orderTotal = totalPrice + deliveryFee;

  const handleCepChange = async (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 5
      ? `${digits.slice(0, 5)}-${digits.slice(5)}`
      : digits;

    setAddress((prev) => ({ ...prev, cep: formatted }));
    setCepError("");
    setOutOfArea(false);
    setSelectedSavedId(null);

    if (digits.length === 8) {
      setCepLoading(true);
      try {
        const data = await fetchViaCep(digits);
        if (data.erro) {
          setCepError("CEP não encontrado. Verifique e tente novamente.");
        } else {
          const cityValid = VALID_CITIES.some(
            (c) => normalizeStr(c) === normalizeStr(data.localidade)
          );
          if (!cityValid) {
            setOutOfArea(true);
            setAddress((prev) => ({
              ...prev, cep: formatted,
              rua: data.logradouro || prev.rua,
              cidade: `${data.localidade} - ${data.uf}`,
              bairro: "",
            }));
          } else {
            const match = findDistrict(districts, data.bairro);
            setAddress((prev) => ({
              ...prev, cep: formatted,
              rua: data.logradouro || prev.rua,
              bairro: match ? match.neighborhood : "",
              cidade: `${data.localidade} - ${data.uf}`,
            }));
          }
        }
      } catch {
        setCepError("Erro ao buscar CEP. Verifique sua conexão.");
      } finally {
        setCepLoading(false);
      }
    }
  };

  const applySavedAddress = (addr: SavedAddress) => {
    setSelectedSavedId(addr.id);
    setOutOfArea(false);
    setCepError("");
    setAddress({
      nome: addr.name,
      cep: formatZip(addr.zipCode),
      rua: addr.street,
      numero: addr.number,
      bairro: addr.neighborhood,
      complemento: addr.complement ?? "",
      cidade: `${addr.city} - ${addr.state}`,
    });
  };

  const clearSavedSelection = () => {
    setSelectedSavedId(null);
    setAddress(emptyAddress());
  };

  const goNext = async () => {
    if (step === "delivery") {
      setStep("customer");
      return;
    }

    if (step === "customer") {
      setAuthError("");
      setAuthLoading(true);
      try {
        if (!awaitingCpf) {
          const { isNewUser } = await signupUser(customer.telefone);
          const [apiDistricts, addrs] = await Promise.all([
            fetchDeliveryDistricts(),
            fetchUserAddresses(),
          ]);
          setDistricts(flattenDistricts(apiDistricts));
          setSavedAddresses(addrs);
          const master = addrs.find((a) => a.isMaster) ?? addrs[0];
          if (master && !address.rua) applySavedAddress(master);
          if (isNewUser) {
            setAwaitingCpf(true);
          } else {
            setStep(deliveryType === "entrega" ? "address" : "payment");
          }
        } else {
          await updateUserProfile(customer.nome, cpf.replace(/\D/g, ""));
          setStep(deliveryType === "entrega" ? "address" : "payment");
        }
      } catch (err) {
        setAuthError(
          err instanceof Error ? err.message : "Erro ao identificar usuário."
        );
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (step === "address") { setStep("payment"); return; }
    if (step === "payment") { setStep("summary"); return; }
  };

  const goBack = () => {
    if (step === "delivery") { onBack(); return; }
    if (step === "customer") {
      if (awaitingCpf) {
        setAwaitingCpf(false);
        setCpf("");
        return;
      }
      setStep("delivery");
      return;
    }
    if (step === "address") {
      setSavedAddresses([]);
      setSelectedSavedId(null);
      setStep("customer");
      return;
    }
    if (step === "payment") {
      setStep(deliveryType === "entrega" ? "address" : "customer");
      return;
    }
    if (step === "summary") { setStep("payment"); return; }
  };

  const canAdvance = () => {
    if (step === "delivery") return deliveryType !== null;
    if (step === "customer") {
      if (awaitingCpf) return cpf.replace(/\D/g, "").length === 11;
      return customer.nome.trim() !== "" && customer.telefone.replace(/\D/g, "").length >= 10;
    }
    if (step === "address")
      return !outOfArea && address.rua.trim() !== "" && address.numero.trim() !== "" && address.bairro.trim() !== "";
    if (step === "payment") return payment !== null;
    return true;
  };

  const paymentLabel = (p: PaymentMethod) => {
    if (p === "pix") return "PIX";
    if (p === "cartao") return "Cartão";
    if (p === "dinheiro") return "Dinheiro";
    return "";
  };

  const sendOrder = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      if (deliveryType === "entrega") {
        localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify(address));
      }
      localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify(customer));

      const cityName = extractCity(address.cidade);

      const orderItems = items.map((i) => ({
        id: i.id ?? 0,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        observations: "",
        tipPercent: 0,
        additionals: [],
        total: i.price * i.quantity,
        isPizza: false,
        tip: 0,
      }));

      let payload: Parameters<typeof submitOrder>[0];

      if (deliveryType === "entrega") {
        const addr: OrderAddress = {
          ...(selectedSavedId !== null ? { id: selectedSavedId } : {}),
          name: address.nome,
          zipCode: address.cep.replace(/\D/g, ""),
          street: address.rua,
          number: address.numero,
          complement: address.complemento || " ",
          neighborhood: address.bairro,
          city: cityName,
          state: "MG",
          cityCode: selectedDistrict?.cityCode ?? CITY_CODES[cityName],
          isMaster: false,
          isPending: selectedSavedId === null,
        };
        payload = {
          type: "delivery",
          customer: { document: "", deliveryAddresses: [] },
          delivery: {
            valueForChange: 0,
            deliveryMethod: "delivery",
            paymentMethod: PAYMENT_METHODS[payment ?? "pix"] ?? payment ?? "pix",
            deliveryAddress: addr,
            deliveryFee,
          },
          items: orderItems,
        };
      } else {
        payload = {
          type: "delivery",
          customer: { document: "", deliveryAddresses: [] },
          delivery: {
            valueForChange: 0,
            deliveryMethod: "takeout",
            paymentMethod: PAYMENT_METHODS[payment ?? "pix"] ?? payment ?? "pix",
            deliveryFee: 0,
          },
          items: orderItems,
        };
      }

      const result = await submitOrder(payload);
      setOrderId(result?.id ?? null);
      clearCart();
      setStep("success");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erro ao enviar pedido. Tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary";

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Pedido realizado!</h2>
          {orderId && (
            <p className="text-sm text-muted-foreground">
              Nº do pedido: <span className="font-semibold text-foreground">#{orderId}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground pt-1">
            Seu pedido foi enviado ao restaurante e em breve estará em preparo.
          </p>
        </div>
        <Button onClick={onBack} className="mt-4 rounded-full px-8 py-5">
          Voltar ao cardápio
        </Button>
      </div>
    );
  }

  const backLabel: Record<Step, string> = {
    delivery: "Voltar ao carrinho",
    customer: awaitingCpf ? "Identificação" : "Tipo de entrega",
    address: "Identificação",
    payment: deliveryType === "entrega" ? "Endereço" : "Identificação",
    summary: "Pagamento",
    success: "",
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-foreground mb-4 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-semibold text-base">{backLabel[step]}</span>
      </button>

      <div className="flex-1 overflow-y-auto">

        {/* ── Delivery type ─────────────────────────────────── */}
        {step === "delivery" && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Selecione a forma de entrega</h3>
            <div className="space-y-2">
              {(["entrega", "retirada"] as DeliveryType[]).map((type) => (
                <label
                  key={type!}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    deliveryType === type
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryType === type}
                    onChange={() => setDeliveryType(type)}
                    className="accent-primary"
                  />
                  {type === "entrega"
                    ? <Truck className="h-5 w-5 text-primary" />
                    : <Store className="h-5 w-5 text-primary" />
                  }
                  <div>
                    <p className="font-medium text-foreground capitalize">{type}</p>
                    <p className="text-xs text-muted-foreground">
                      {type === "entrega" ? "Taxa por bairro" : "Retire no local sem taxa"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Customer ──────────────────────────────────────── */}
        {step === "customer" && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Identificação
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Seu nome"
                value={customer.nome}
                onChange={(e) => setCustomer({ ...customer, nome: e.target.value })}
                className={inputClass}
              />
              <input
                type="tel"
                placeholder="Seu telefone (ex: (38) 99830-5282)"
                value={customer.telefone}
                onChange={(e) => setCustomer({ ...customer, telefone: maskPhone(e.target.value) })}
                className={inputClass}
              />
              {awaitingCpf && (
                <>
                  <div className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-2">
                    <p className="text-xs text-primary font-medium">
                      Cadastro necessário — informe seu CPF para continuar.
                    </p>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="CPF (ex: 000.000.000-00)"
                    value={cpf}
                    onChange={(e) => setCpf(maskCpf(e.target.value))}
                    className={inputClass}
                    maxLength={14}
                  />
                </>
              )}
              {authError && (
                <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-destructive">{authError}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Address ───────────────────────────────────────── */}
        {step === "address" && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Endereço de entrega
            </h3>
            <div className="space-y-3">

              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Endereços salvos
                  </p>
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applySavedAddress(addr)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                        selectedSavedId === addr.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-muted-foreground"
                      }`}
                    >
                      <Home className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{addr.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {addr.street}, {addr.number} — {addr.neighborhood}
                        </p>
                      </div>
                      {selectedSavedId === addr.id && (
                        <CheckCircle2 className="h-4 w-4 text-primary ml-auto flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearSavedSelection}
                    className={`w-full text-sm text-center py-2 rounded-xl border transition-colors ${
                      selectedSavedId === null
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    + Usar novo endereço
                  </button>
                  <div className="border-t border-border pt-1" />
                </div>
              )}

              <input
                type="text"
                placeholder="Nome de quem vai receber"
                value={address.nome}
                onChange={(e) => { setAddress({ ...address, nome: e.target.value }); setSelectedSavedId(null); }}
                className={inputClass}
              />
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="CEP (ex: 39560-000)"
                  value={address.cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  className={inputClass}
                  maxLength={9}
                />
                {cepLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {cepError && <p className="text-xs text-destructive -mt-1 px-1">{cepError}</p>}
              {outOfArea && (
                <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-destructive space-y-1">
                    <p className="font-semibold">Endereço fora da área de entrega</p>
                    <p>Atendemos apenas Salinas - MG e São Geraldo - MG.</p>
                    <button
                      onClick={() => { setStep("delivery"); setDeliveryType("retirada"); }}
                      className="underline font-medium"
                    >
                      Alterar para retirada no local
                    </button>
                  </div>
                </div>
              )}
              <input
                type="text"
                placeholder="Rua"
                value={address.rua}
                onChange={(e) => { setAddress({ ...address, rua: e.target.value }); setSelectedSavedId(null); }}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Número"
                value={address.numero}
                onChange={(e) => { setAddress({ ...address, numero: e.target.value }); setSelectedSavedId(null); }}
                className={inputClass}
              />
              <select
                value={address.bairro}
                onChange={(e) => { setAddress({ ...address, bairro: e.target.value }); setSelectedSavedId(null); }}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Selecione o bairro</option>
                {districts.map((d) => (
                  <option key={`${d.city}-${d.neighborhood}`} value={d.neighborhood}>
                    {d.neighborhood}
                    {d.city !== "Salinas" ? ` (${d.city})` : ""}
                  </option>
                ))}
              </select>
              {selectedDistrict && (
                <p className="text-xs text-muted-foreground px-1">
                  Taxa:{" "}
                  <span className="text-primary font-semibold">{formatPrice(selectedDistrict.deliveryFee)}</span>
                  {selectedDistrict.minOrder > 0 && (
                    <> · pedido mínimo: {formatPrice(selectedDistrict.minOrder)}</>
                  )}
                </p>
              )}
              <input
                type="text"
                placeholder="Complemento (opcional)"
                value={address.complemento}
                onChange={(e) => { setAddress({ ...address, complemento: e.target.value }); setSelectedSavedId(null); }}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Cidade"
                value={address.cidade}
                onChange={(e) => { setAddress({ ...address, cidade: e.target.value }); setSelectedSavedId(null); }}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* ── Payment ───────────────────────────────────────── */}
        {step === "payment" && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Selecione a forma de pagamento
            </h3>
            <div className="space-y-2">
              {(["pix", "cartao", "dinheiro"] as PaymentMethod[]).map((method) => (
                <label
                  key={method!}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    payment === method
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === method}
                    onChange={() => setPayment(method)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-foreground">{paymentLabel(method)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Summary ───────────────────────────────────────── */}
        {step === "summary" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Itens do pedido</h3>
              <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                {items.map((item) => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.quantity}x {item.name}</span>
                    <span className="text-foreground font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Resumo</h3>
              <div className="rounded-xl border border-border bg-card p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                {deliveryType === "entrega" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Taxa{selectedDistrict ? ` (${selectedDistrict.neighborhood})` : ""}
                    </span>
                    <span className="text-foreground">{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-border pt-1.5">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(orderTotal)}</span>
                </div>
              </div>
            </div>
            {deliveryType === "entrega" && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Entrega</h3>
                <div className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground space-y-0.5">
                  <p className="font-medium text-foreground">{address.nome}</p>
                  <p>{address.rua}, {address.numero}{address.complemento && `, ${address.complemento}`}</p>
                  <p>{address.bairro}{address.cep && ` — CEP ${address.cep}`}</p>
                  <p>{address.cidade}</p>
                </div>
              </div>
            )}
            {deliveryType === "retirada" && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Retirada</h3>
                <div className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
                  Retirar no local
                </div>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Pagamento</h3>
              <div className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
                {paymentLabel(payment)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Cliente</h3>
              <div className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
                {customer.nome} — {customer.telefone}
              </div>
            </div>
            {submitError && (
              <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive">{submitError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border pt-4 mt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Total</span>
          <span className="text-lg font-bold text-foreground">{formatPrice(orderTotal)}</span>
        </div>

        {step === "summary" ? (
          <Button
            onClick={sendOrder}
            disabled={submitting}
            className="w-full gap-2 rounded-full py-6 text-base"
          >
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="h-5 w-5" /> Fazer pedido</>
            )}
          </Button>
        ) : (
          <Button
            onClick={goNext}
            disabled={!canAdvance() || authLoading}
            className="w-full rounded-full py-6 text-base"
          >
            {authLoading
              ? <><Loader2 className="h-5 w-5 animate-spin" /> Verificando...</>
              : "Continuar"
            }
          </Button>
        )}
      </div>
    </div>
  );
};
