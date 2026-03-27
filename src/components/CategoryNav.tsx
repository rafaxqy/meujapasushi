import type { MenuCategory } from "@/data/menu";
import { cn } from "@/lib/utils";

type Props = {
  categories: MenuCategory[];
  activeCategory: string;
  onSelect: (id: string) => void;
};

export const CategoryNav = ({ categories, activeCategory, onSelect }: Props) => {
  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="mx-auto max-w-4xl overflow-x-auto scrollbar-hide px-4 py-3">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <span className="mr-1.5">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
