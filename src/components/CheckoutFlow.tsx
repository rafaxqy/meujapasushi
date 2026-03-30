import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, MapPin, CreditCard, User, Send, Truck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type DeliveryType = "entrega" | "retirada" | null;
type PaymentMethod = "pix" | "cartao" | "dinheiro" | null;

type AddressData = {
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
};

const DELIVERY_FEE = 4;
const WHATSAPP_NUMBER = "5538998685633";

const SAVED_ADDRESS_KEY = "japa-sushi-address";
const SAVED_CUSTOMER_KEY = "japa-sushi-customer";

const loadSavedAddress = (): AddressData => {
  try {
    const saved = localStorage.getItem(SAVED_ADDRESS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { rua: "", numero: "", bairro: "", complemento: "", cidade: "Salinas - MG" };
};

const loadSavedCustomer = () => {
  try {
    const saved = localStorage.getItem(SAVED_CUSTOMER_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { nome: "", telefone: "" };
};

type Step = "delivery" | "address" | "payment" | "customer" | "summary";

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

  const deliveryFee = deliveryType === "entrega" ? DELIVERY_FEE : 0;
  const orderTotal = totalPrice + deliveryFee;

  const goNext = () => {
    if (step === "delivery") {
      if (deliveryType === "entrega") setStep("address");
      else setStep("payment");
    } else if (step === "address") setStep("payment");
    else if (step === "payment") setStep("customer");
    else if (step === "customer") setStep("summary");
  };

  const goBack = () => {
    if (step === "delivery") onBack();
    else if (step === "address") setStep("delivery");
    else if (step === "payment") {
      if (deliveryType === "entrega") setStep("address");
      else setStep("delivery");
    } else if (step === "customer") setStep("payment");
    else if (step === "summary") setStep("customer");
  };

  const canAdvance = () => {
    if (step === "delivery") return deliveryType !== null;
    if (step === "address") return address.rua.trim() && address.numero.trim() && address.bairro.trim();
    if (step === "payment") return payment !== null;
    if (step === "customer") return customer.nome.trim() && customer.telefone.trim();
    return true;
  };

  const paymentLabel = (p: PaymentMethod) => {
    if (p === "pix") return "PIX";
    if (p === "cartao") return "Cartão";
    if (p === "dinheiro") return "Dinheiro";
    return "";
  };

  const sendOrder = () => {
    // Save address & customer for next time
    if (deliveryType === "entrega") {
      localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify(address));
    }
    localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify(customer));

    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR");
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const itemLines = items.map(
      (i) => `  ${i.name} | Qtd: ${i.quantity} | Vlr. Unit: ${formatPrice(i.price)} | Total: ${formatPrice(i.price * i.quantity)}`
    );

    let msg = `🍣 *Pedido Japa Sushi*\n`;
    msg += `*Data Hora:* ${dateStr} ${timeStr}\n`;
    msg += `*Nome:* ${customer.nome}\n`;
    msg += `*Telefone:* ${customer.telefone}\n`;

    if (deliveryType === "entrega") {
      const addr = `${address.rua}, ${address.numero}${address.complemento ? ", " + address.complemento : ""}, ${address.bairro}, ${address.cidade}`;
      msg += `*Endereço:* ${addr}\n`;
    } else {
      msg += `*Forma:* Retirada no local\n`;
    }

    msg += `\n*Itens:*\n${itemLines.join("\n")}\n`;

    if (deliveryType === "entrega") {
      msg += `\n*Valor Entrega:* ${formatPrice(deliveryFee)}`;
    }
    msg += `\n*Total:* ${formatPrice(orderTotal)}`;
    msg += `\n*Forma Pgto.:* ${paymentLabel(payment)}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    clearCart();
    onBack();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-foreground mb-4 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-semibold text-base">
          {step === "delivery" && "Voltar ao carrinho"}
          {step === "address" && "Forma de entrega"}
          {step === "payment" && "Forma de pagamento"}
          {step === "customer" && "Identificação"}
          {step === "summary" && "Resumo do pedido"}
        </span>
      </button>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {step === "delivery" && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Selecione a forma de entrega</h3>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  deliveryType === "entrega"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryType === "entrega"}
                  onChange={() => setDeliveryType("entrega")}
                  className="accent-primary"
                />
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Entrega</p>
                  <p className="text-xs text-muted-foreground">Taxa de entrega: {formatPrice(DELIVERY_FEE)}</p>
                </div>
              </label>
              <label
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  deliveryType === "retirada"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryType === "retirada"}
                  onChange={() => setDeliveryType("retirada")}
                  className="accent-primary"
                />
                <Store className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Retirada</p>
                  <p className="text-xs text-muted-foreground">Retire no local sem taxa</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {step === "address" && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Endereço de entrega
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Rua"
                value={address.rua}
                onChange={(e) => setAddress({ ...address, rua: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Número"
                  value={address.numero}
                  onChange={(e) => setAddress({ ...address, numero: e.target.value })}
                  className="w-1/3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Bairro"
                  value={address.bairro}
                  onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <input
                type="text"
                placeholder="Complemento (opcional)"
                value={address.complemento}
                onChange={(e) => setAddress({ ...address, complemento: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Cidade"
                value={address.cidade}
                onChange={(e) => setAddress({ ...address, cidade: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {step === "payment" && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Selecione a forma de pagamento
            </h3>
            <div className="space-y-2">
              {(["pix", "cartao", "dinheiro"] as PaymentMethod[]).map((method) => (
                <label
                  key={method}
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
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <input
                type="tel"
                placeholder="Seu telefone (ex: 38 99830-5282)"
                value={customer.telefone}
                onChange={(e) => setCustomer({ ...customer, telefone: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

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
                    <span className="text-muted-foreground">Taxa de entrega</span>
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
                <div className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
                  {address.rua}, {address.numero}
                  {address.complemento && `, ${address.complemento}`}, {address.bairro}, {address.cidade}
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
          <Button onClick={sendOrder} className="w-full gap-2 rounded-full py-6 text-base">
            <Send className="h-5 w-5" />
            Fazer pedido
          </Button>
        ) : (
          <Button
            onClick={goNext}
            disabled={!canAdvance()}
            className="w-full rounded-full py-6 text-base"
          >
            Continuar
          </Button>
        )}
      </div>
    </div>
  );
};
