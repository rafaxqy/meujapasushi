import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { checkStoreStatus, fetchGroups, streamMenu, type ApiMenuItem } from "@/services/api";
import { localImageMap } from "@/data/localImages";
import type { MenuCategory, MenuItem, MenuVariant } from "@/data/menu";

const QTY_IN_NAME_RE =
  /^(.*?)[\s(]*(\d+)\s*(PEÇAS?|PÇS|UNIDADES?|UNI|UN)\s*\)?\s*$/i;
const SIZE_RE = /\b(INTEIRA|MEIA)\b/i;
const QTY_IN_DESC_RE = /(\d+)\s*(UNIDADES?|PEÇAS?|UN|PÇS)\b/i;

type ParsedVariant =
  | { kind: "qty"; base: string; qty: number }
  | { kind: "size"; base: string; size: "Inteira" | "Meia" };

const parseVariant = (name: string): ParsedVariant | null => {
  const q = name.match(QTY_IN_NAME_RE);
  if (q) {
    const base = q[1].replace(/[\s(]+$/, "").trim();
    const qty = parseInt(q[2], 10);
    if (base && qty) return { kind: "qty", base, qty };
  }

  const s = name.match(SIZE_RE);
  if (s) {
    const size = s[1].toUpperCase() === "INTEIRA" ? "Inteira" : "Meia";
    const base = name
      .replace(SIZE_RE, "")
      .replace(/\s*\/\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (base) return { kind: "size", base, size };
  }

  return null;
};

const extractQtyFromDesc = (desc?: string): number | null => {
  if (!desc) return null;
  const m = desc.match(QTY_IN_DESC_RE);
  return m ? parseInt(m[1], 10) : null;
};

const buildLabel = (p: ParsedVariant, desc?: string): string => {
  if (p.kind === "qty") return p.qty === 1 ? "1 peça" : `${p.qty} peças`;
  const descQty = extractQtyFromDesc(desc);
  return descQty ? `${p.size} · ${descQty} un.` : p.size;
};

const SEM_ARROZ_RE = /\s+SEM\s+ARROZ\s*$/i;
const baseWithoutSemArroz = (name: string) =>
  name.replace(SEM_ARROZ_RE, "").trim().toUpperCase();

const reorderSemArroz = (items: MenuItem[]): MenuItem[] => {
  const regulars: MenuItem[] = [];
  const semArrozByBase = new Map<string, MenuItem[]>();

  for (const item of items) {
    if (SEM_ARROZ_RE.test(item.name)) {
      const base = baseWithoutSemArroz(item.name);
      if (!semArrozByBase.has(base)) semArrozByBase.set(base, []);
      semArrozByBase.get(base)!.push(item);
    } else {
      regulars.push(item);
    }
  }

  const result: MenuItem[] = [];
  for (const item of regulars) {
    result.push(item);
    const base = baseWithoutSemArroz(item.name);
    const matches = semArrozByBase.get(base);
    if (matches) {
      result.push(...matches);
      semArrozByBase.delete(base);
    }
  }
  for (const remaining of semArrozByBase.values()) result.push(...remaining);
  return result;
};

const groupVariants = (items: MenuItem[]): MenuItem[] => {
  const buckets = new Map<string, MenuItem[]>();
  const order: string[] = [];

  for (const item of items) {
    const parsed = parseVariant(item.name);
    const key = parsed
      ? `${parsed.kind}:${parsed.base.toUpperCase()}`
      : `solo:${item.id}`;
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(item);
  }

  return order.map((key) => {
    const bucket = buckets.get(key)!;
    if (bucket.length < 2) return bucket[0];

    const sorted = [...bucket].sort((a, b) => a.price - b.price);
    const base = parseVariant(sorted[0].name)!.base;

    const variants: MenuVariant[] = sorted.map((v) => ({
      id: v.id!,
      label: buildLabel(parseVariant(v.name)!, v.description),
      fullName: v.name,
      price: v.price,
      description: v.description,
    }));

    const withImage = sorted.find((v) => v.image) ?? sorted[0];
    const withDesc = sorted.find((v) => v.description) ?? sorted[0];

    return {
      id: sorted[0].id,
      name: base,
      price: variants[0].price,
      description: withDesc.description,
      image: withImage.image,
      variants,
    };
  });
};
import { CategoryNav } from "@/components/CategoryNav";
import { MenuItemCard } from "@/components/MenuItemCard";
import { CartSheet } from "@/components/CartSheet";
import { Footer } from "@/components/Footer";
import logoImage from "@/assets/logo-japa-sushi.png";

const Cardapio = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: storeStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["storeStatus"],
    queryFn: checkStoreStatus,
    refetchInterval: 60_000,
  });

  const storeOpen = storeStatus?.open ?? false;

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
    staleTime: 5 * 60 * 1000,
  });

  const [apiItems, setApiItems] = useState<ApiMenuItem[]>([]);
  const [hasFirstPage, setHasFirstPage] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    setApiItems([]);
    setHasFirstPage(false);

    streamMenu(
      (batch) => {
        if (ac.signal.aborted) return;
        setApiItems((prev) => {
          const seen = new Set(prev.map((i) => i.id));
          return [...prev, ...batch.filter((i) => !seen.has(i.id))];
        });
        setHasFirstPage(true);
      },
      { signal: ac.signal }
    ).catch(() => {});

    return () => ac.abort();
  }, []);

  const isLoading = statusLoading || !hasFirstPage;

  // Convert API response to MenuCategory[] with local images
  const menuData = useMemo<MenuCategory[]>(() => {
    if (!groups.length || !apiItems.length) return [];

    const sortedGroups = [...groups].sort((a, b) => a.ordering - b.ordering);

    const categories = sortedGroups
      .map((group) => {
        const items: MenuItem[] = apiItems
          .filter((item) => item.categoryId === group.id && item.price > 0)
          .map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.observation?.trim() || undefined,
            image: localImageMap[item.id] || item.imageUrl || undefined,
          }));
        return {
          id: String(group.id),
          name: group.name,
          items: reorderSemArroz(groupVariants(items)),
        };
      })
      .filter((cat) => cat.items.length > 0);

    return categories;
  }, [groups, apiItems]);

  // Set initial active category once data loads
  const firstCategoryId = menuData[0]?.id ?? "";
  const resolvedActive = activeCategory || firstCategoryId;

  const scrollTo = useCallback((id: string) => {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return menuData;
    const q = searchTerm.toLowerCase();
    return menuData
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [searchTerm, menuData]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-4xl flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-8 w-8 rounded-full overflow-hidden bg-white flex items-center justify-center p-0.5">
            <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-lg font-semibold text-foreground flex-1">Cardápio</h1>

          {searchOpen ? (
            <div className="relative flex-1 max-w-xs animate-in fade-in duration-200">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-full border border-border bg-card text-foreground pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchTerm(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {!storeOpen && !statusLoading && (
        <div className="bg-destructive/10 border-b border-destructive/20">
          <div className="mx-auto max-w-4xl px-3 sm:px-4 py-2.5 flex items-center gap-2.5 text-destructive">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              <span className="font-semibold">Loja fechada</span>
              <span className="hidden sm:inline"> — Voltamos de Terça a Domingo das 19h às 23h30.</span>
              <span className="sm:hidden"> — pedidos indisponíveis</span>
            </p>
          </div>
        </div>
      )}

      {menuData.length > 0 && (
        <CategoryNav
          categories={menuData}
          activeCategory={resolvedActive}
          onSelect={scrollTo}
        />
      )}

      <main className="flex-1 flex flex-col mx-auto w-full max-w-4xl px-3 sm:px-4 py-4 sm:py-6 pb-28">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <p className="text-4xl animate-pulse">🍣</p>
            <p className="text-sm">Carregando cardápio...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-medium">Nenhum item encontrado</p>
            <p className="text-sm mt-1">Tente buscar por outro termo</p>
          </div>
        ) : (
          filteredData.map((category) => (
            <section
              key={category.id}
              ref={(el: HTMLDivElement | null) => { sectionRefs.current[category.id] = el; }}
              className="mb-10 scroll-mt-28"
            >
              <div className="mb-6 text-center">
                <div className="flex items-center gap-4 mb-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-primary/50" />
                  <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em] text-foreground font-serif">
                    {category.name}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/50 to-primary/50" />
                </div>
                <div className="w-12 h-0.5 bg-primary mx-auto rounded-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {category.items.map((item) => (
                  <MenuItemCard key={item.id ?? item.name} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <Footer />
      <CartSheet />

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/5538998305282"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[hsl(142,70%,45%)] text-white shadow-xl transition-transform hover:scale-110"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
};

export default Cardapio;
