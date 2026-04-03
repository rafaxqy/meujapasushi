import { useRef } from "react";
import type { MenuCategory } from "@/data/menu";
import { cn } from "@/lib/utils";

type Props = {
  categories: MenuCategory[];
  activeCategory: string;
  onSelect: (id: string) => void;
};

export const CategoryNav = ({ categories, activeCategory, onSelect }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startX: 0, scrollLeft: 0, moved: false });

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = { dragging: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false };
    el.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!dragState.current.dragging || !el) return;
    const dx = e.pageX - el.offsetLeft - dragState.current.startX;
    if (Math.abs(dx) > 4) dragState.current.moved = true;
    el.scrollLeft = dragState.current.scrollLeft - dx;
  };

  const onMouseUp = () => {
    const el = scrollRef.current;
    if (el) el.style.cursor = "";
    dragState.current.dragging = false;
  };

  const handleClick = (e: React.MouseEvent, id: string) => {
    if (dragState.current.moved) { e.preventDefault(); return; }
    onSelect(id);
  };

  return (
    <nav className="sticky top-[57px] z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div
        ref={scrollRef}
        className="mx-auto max-w-4xl overflow-x-auto scrollbar-hide px-4 py-3 select-none cursor-grab"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={(e) => handleClick(e, cat.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
