import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-sushi.jpg";
import logoImage from "@/assets/logo-japa-sushi.png";

type Props = {
  searchTerm: string;
  onSearchChange: (val: string) => void;
};

export const Header = ({ searchTerm, onSearchChange }: Props) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="relative h-[480px] md:h-[520px] overflow-hidden">
      {/* Background image */}
      <img
        src={heroImage}
        alt="Japa Sushi"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />

      <div className="relative z-10 flex h-full flex-col items-center justify-end pb-12 px-4 text-center">
        <motion.img
          src={logoImage}
          alt="Japa Sushi Logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="h-36 w-36 md:h-44 md:w-44 object-contain mb-4 drop-shadow-2xl"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-1 text-sm text-muted-foreground font-light tracking-wide"
        >
          寿司 — Sabores autênticos da culinária japonesa
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 w-full max-w-md"
        >
          {searchOpen ? (
            <div className="relative animate-in fade-in duration-200">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar no cardápio..."
                className="w-full rounded-2xl border border-border bg-card/90 backdrop-blur-md text-foreground pl-11 pr-11 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                onClick={() => { setSearchOpen(false); onSearchChange(""); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 mx-auto rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md px-6 py-3.5 text-sm text-muted-foreground transition-all hover:bg-card/60 hover:border-border"
            >
              <Search className="h-4 w-4" />
              Buscar no cardápio
            </button>
          )}
        </motion.div>
      </div>
    </header>
  );
};
