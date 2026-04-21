import { Plus, Check, X, ImageOff } from "lucide-react";
import { useState } from "react";
import type { MenuItem, MenuVariant } from "@/data/menu";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [addedVariantId, setAddedVariantId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const hasVariants = !!(item.variants && item.variants.length > 0);

  const handleAdd = (e?: React.MouseEvent, closeAfter = false) => {
    e?.stopPropagation();
    if (hasVariants) {
      setModalOpen(true);
      return;
    }
    addItem(item);
    setAdded(true);
    if (closeAfter) {
      setTimeout(() => { setAdded(false); setModalOpen(false); }, 600);
    } else {
      setTimeout(() => setAdded(false), 800);
    }
  };

  const handleAddVariant = (variant: MenuVariant, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: variant.id,
      name: variant.fullName,
      price: variant.price,
      description: item.description,
      image: item.image,
    });
    setAddedVariantId(variant.id);
    setTimeout(() => setAddedVariantId(null), 800);
  };

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 cursor-pointer"
      >
        {/* Image */}
        {item.image ? (
          <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 scale-105 contrast-[1.05] saturate-[1.1]"
              loading="lazy"
              style={{ imageRendering: 'auto' }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-muted flex flex-col items-center justify-center gap-1.5 text-muted-foreground/60">
            <ImageOff className="h-7 w-7" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Sem imagem</span>
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
            {hasVariants && (
              <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-wider mr-1">
                A partir de
              </span>
            )}
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

            {item.image ? (
              <div className="w-full aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover contrast-[1.08] saturate-[1.15] brightness-[1.02]"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground/60">
                <ImageOff className="h-10 w-10" />
                <span className="text-xs font-medium uppercase tracking-wider">Sem imagem</span>
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
              {hasVariants ? (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Escolha a quantidade
                  </p>
                  <div className="space-y-2">
                    {item.variants!.map((v) => {
                      const isAdded = addedVariantId === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={(e) => handleAddVariant(v, e)}
                          className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
                            isAdded
                              ? "border-green-600 bg-green-600/10"
                              : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50"
                          }`}
                        >
                          <span className="text-sm font-medium text-foreground">
                            {v.label}
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="text-base font-bold text-primary">
                              {formatPrice(v.price)}
                            </span>
                            <span
                              className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors ${
                                isAdded
                                  ? "bg-green-600 text-white"
                                  : "bg-primary text-primary-foreground"
                              }`}
                            >
                              {isAdded ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Plus className="h-3.5 w-3.5" />
                              )}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
