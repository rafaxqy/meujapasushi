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

  const handleAdd = (e?: React.MouseEvent, closeAfter = false) => {
    e?.stopPropagation();
    addItem(item);
    setAdded(true);
    if (closeAfter) {
      setTimeout(() => { setAdded(false); setModalOpen(false); }, 600);
    } else {
      setTimeout(() => setAdded(false), 800);
    }
  };

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 cursor-pointer"
      >
        {/* Image */}
        {item.image ? (
          <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 contrast-[1.05] saturate-[1.1]"
              loading="lazy"
              style={{ imageRendering: 'auto' }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
            <span className="text-3xl opacity-30">🍣</span>
          </div>
        )}

        {/* Add button floating */}
        <button
          onClick={handleAdd}
          className={`absolute top-3 right-3 z-10 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            added
              ? "bg-green-600 text-white scale-110"
              : "bg-primary text-primary-foreground hover:scale-110"
          }`}
          aria-label={`Adicionar ${item.name}`}
        >
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>

        {/* Info */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-card-foreground text-sm leading-snug line-clamp-2">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 flex-1">
              {item.description}
            </p>
          )}
          <span className="inline-block mt-2 text-base font-bold text-primary">
            {formatPrice(item.price)}
          </span>
        </div>
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
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {item.image && (
              <div className="w-full aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover contrast-[1.08] saturate-[1.15] brightness-[1.02]"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            )}

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
                  onClick={(e) => handleAdd(e, true)}
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
