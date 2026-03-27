import { Plus, Check, X } from "lucide-react";
import { useState } from "react";
import type { MenuItem } from "@/data/menu";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer"
      >
        {item.image && (
          <div className="h-[72px] w-[72px] sm:h-[88px] sm:w-[88px] flex-shrink-0 overflow-hidden rounded-lg bg-muted">
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

      {/* Modal de detalhes */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-2xl border border-border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão fechar */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Imagem grande */}
            {item.image && (
              <div className="w-full aspect-square bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="p-5 space-y-3">
              <h2 className="text-xl font-semibold text-card-foreground">
                {item.name}
              </h2>
              {item.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(item.price)}
                </span>
                <button
                  onClick={handleAdd}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                    added
                      ? "bg-green-600 text-white scale-105"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" /> Adicionado
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Adicionar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
