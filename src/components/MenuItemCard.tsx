import { Plus, Check, X, ImageOff, Clock } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MenuItem, MenuVariant } from "@/data/menu";
import { useCart } from "@/contexts/CartContext";
import { checkStoreStatus } from "@/services/api";

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const parseComboItems = (desc?: string): string[] | null => {
  if (!desc) return null;
  const parts = desc
    .split(/[,;]/)
    .map((s) => s.replace(/\.$/, "").trim())
    .filter(Boolean);
  if (parts.length < 3) return null;
  if (!parts.every((p) => /^\d+\s+/.test(p))) return null;
  return parts;
};

export const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();
  const { data: storeStatus } = useQuery({
    queryKey: ["storeStatus"],
    queryFn: checkStoreStatus,
    refetchInterval: 60_000,
  });
  const storeOpen = storeStatus?.open ?? false;

  const [added, setAdded] = useState(false);
  const [addedVariantId, setAddedVariantId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [observation, setObservation] = useState("");

  const hasVariants = !!(item.variants && item.variants.length > 0);
  const comboItems = parseComboItems(item.description);
  const variantsHaveCombos = !!(
    hasVariants && item.variants!.some((v) => parseComboItems(v.description))
  );
  const showTopCombo = !!comboItems && !variantsHaveCombos;

  const closeModal = () => {
    setModalOpen(false);
    setObservation("");
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasVariants || !storeOpen) {
      setModalOpen(true);
      return;
    }
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const handleAddFromModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!storeOpen) return;
    addItem(item, observation);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      closeModal();
    }, 600);
  };

  const handleAddVariant = (variant: MenuVariant, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!storeOpen) return;
    addItem(
      {
        id: variant.id,
        name: variant.fullName,
        price: variant.price,
        description: item.description,
        image: item.image,
      },
      observation
    );
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
        {storeOpen && (
          <button
            onClick={handleQuickAdd}
            className={`absolute top-3 right-3 z-10 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              added
                ? "bg-green-600 text-white scale-110"
                : "bg-primary text-primary-foreground hover:scale-110"
            }`}
            aria-label={`Adicionar ${item.name}`}
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        )}

        {/* Info */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-card-foreground text-sm leading-snug line-clamp-2">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
          <span className="inline-block mt-auto pt-2 text-base font-bold text-primary">
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
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] bg-card rounded-2xl overflow-y-auto shadow-2xl border border-border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
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
                showTopCombo ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      O que vem no combo
                    </p>
                    <ul className="text-sm text-foreground space-y-1">
                      {comboItems!.map((part, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{part}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : !variantsHaveCombos ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                ) : null
              )}

              {!storeOpen && (
                <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                  <Clock className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-destructive">
                    <span className="font-semibold">Loja fechada.</span> Voltamos de Terça a Domingo das 19h às 23h30.
                  </p>
                </div>
              )}

              {storeOpen && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Observação (opcional)
                  </label>
                  <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Ex: sem cebola, ponto da carne, etc."
                    maxLength={200}
                    rows={2}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              )}

              {hasVariants ? (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {variantsHaveCombos ? "Escolha o combo" : "Escolha a quantidade"}
                  </p>
                  <div className="space-y-2">
                    {item.variants!.map((v) => {
                      const isAdded = addedVariantId === v.id;
                      const variantCombo = parseComboItems(v.description);
                      return (
                        <button
                          key={v.id}
                          onClick={(e) => handleAddVariant(v, e)}
                          disabled={!storeOpen}
                          className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-200 ${
                            !storeOpen
                              ? "border-border bg-muted/40 opacity-60 cursor-not-allowed"
                              : isAdded
                              ? "border-green-600 bg-green-600/10"
                              : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
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
                          </div>
                          {variantCombo && (
                            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                              {variantCombo.map((part, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-primary mt-0.5">•</span>
                                  <span>{part}</span>
                                </li>
                              ))}
                            </ul>
                          )}
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
                    onClick={handleAddFromModal}
                    disabled={!storeOpen}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                      !storeOpen
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : added
                        ? "bg-green-600 text-white scale-105"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {!storeOpen ? (
                      <>
                        <Clock className="h-4 w-4" /> Indisponível
                      </>
                    ) : added ? (
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
