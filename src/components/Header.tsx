import { Search, X } from "lucide-react";
import { useState } from "react";

type Props = {
  searchTerm: string;
  onSearchChange: (val: string) => void;
};

export const Header = ({ searchTerm, onSearchChange }: Props) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-8 text-6xl">🍣</div>
        <div className="absolute top-12 right-12 text-4xl">🥢</div>
        <div className="absolute bottom-6 left-1/3 text-5xl">🍙</div>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground/70 mb-2">
          Cardápio Digital
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Japa Sushi
        </h1>
        <p className="mt-2 text-sm text-primary-foreground/80 font-light">
          Sabores autênticos do Japão
        </p>

        {/* Search */}
        <div className="mt-6 flex justify-center">
          {searchOpen ? (
            <div className="relative w-full max-w-md animate-in fade-in slide-in-from-top-2 duration-200">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar no cardápio..."
                className="w-full rounded-full bg-background text-foreground pl-10 pr-10 py-2.5 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  onSearchChange("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full bg-primary-foreground/15 px-5 py-2.5 text-sm text-primary-foreground/90 backdrop-blur-sm transition hover:bg-primary-foreground/25"
            >
              <Search className="h-4 w-4" />
              Buscar no cardápio
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
