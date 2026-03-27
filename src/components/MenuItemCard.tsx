import type { MenuItem } from "@/data/menu";

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const MenuItemCard = ({ item }: { item: MenuItem }) => {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
      {item.image && (
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
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
      </div>
      <span className="flex-shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
        {formatPrice(item.price)}
      </span>
    </div>
  );
};
