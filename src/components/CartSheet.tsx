import { Minus, Plus, ShoppingCart, Trash2, Clock } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import { CheckoutFlow } from "@/components/CheckoutFlow";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const OPEN_HOUR = 18;
const CLOSE_HOUR = 23;

const isStoreOpen = () => {
  const hour = new Date().getHours();
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
};

export const CartSheet = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [storeOpen, setStoreOpen] = useState(isStoreOpen());
  const [showCheckout, setShowCheckout] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setStoreOpen(isStoreOpen()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Reset checkout when sheet closes
  useEffect(() => {
    if (!open) setShowCheckout(false);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 sm:px-5 py-3 sm:py-3.5 text-primary-foreground shadow-xl transition-transform hover:scale-105">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="text-sm font-bold">{totalItems}</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        {showCheckout ? (
          <CheckoutFlow onBack={() => setShowCheckout(false)} />
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Seu Pedido
              </SheetTitle>
            </SheetHeader>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
                <p className="font-medium">Carrinho vazio</p>
                <p className="text-sm mt-1">Adicione itens do cardápio</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-4">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-primary font-semibold mt-0.5">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.name, item.quantity - 1)}
                          className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.name, item.quantity + 1)}
                          className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeItem(item.name)}
                          className="h-7 w-7 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  {storeOpen ? (
                    <Button
                      onClick={() => setShowCheckout(true)}
                      className="w-full gap-2 rounded-full py-6 text-base"
                    >
                      Finalizar Pedido
                    </Button>
                  ) : (
                    <div className="w-full text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 rounded-full py-4 px-5 bg-destructive/10 border border-destructive/20">
                        <Clock className="h-5 w-5 text-destructive" />
                        <span className="text-sm font-medium text-destructive">
                          Loja fechada no momento
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Funcionamos das {OPEN_HOUR}h às {CLOSE_HOUR}h
                      </p>
                    </div>
                  )}
                  <button
                    onClick={clearCart}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpar carrinho
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
