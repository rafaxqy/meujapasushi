import { Plus, Check } from "lucide-react";
import { useState } from "react";
import type { MenuItem } from "@/data/menu";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <div className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
      {item.image && (
        <div className="h-18 w-18 sm:h-22 sm:w-22 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-card-foreground text-sm leading-tight">
          {item.name}
        </h3>
        {item.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
        <span className="inline-block mt-1.5 text-sm font-semibold text-primary">
          {formatPrice(item.price)}
        </span>
      </div>
      <button
        onClick={handleAdd}
        className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 ${
          added
            ? "bg-green-600 text-white scale-110"
            : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
        }`}
        aria-label={`Adicionar ${item.name}`}
      >
        {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </div>
  );
};
