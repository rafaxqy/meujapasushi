import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";
import { menuData } from "@/data/menu";
import { CategoryNav } from "@/components/CategoryNav";
import { MenuItemCard } from "@/components/MenuItemCard";
import { CartSheet } from "@/components/CartSheet";
import { Footer } from "@/components/Footer";
import logoImage from "@/assets/logo-japa-sushi.png";

const Cardapio = () => {
  const [activeCategory, setActiveCategory] = useState(menuData[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-background">
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

      <CategoryNav
        categories={menuData}
        activeCategory={activeCategory}
        onSelect={scrollTo}
      />

      <main className="mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6 pb-28">
        {filteredData.length === 0 ? (
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
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                <h2 className="text-lg font-semibold uppercase tracking-widest text-foreground">
                  {category.name}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
              </div>
              <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                {category.items.map((item) => (
                  <MenuItemCard key={item.name} item={item} />
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
