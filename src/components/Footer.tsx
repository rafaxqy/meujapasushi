import { MapPin, Clock, Phone, Mail, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-10">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Contato */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
              Contato
            </h3>
            <a
              href="https://wa.me/5538998305282"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-4 w-4 text-primary" />
              (38) 9830-5282
            </a>
            <a
              href="mailto:japasushisalinas@gmail.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4 text-primary" />
              japasushisalinas@gmail.com
            </a>
            <a
              href="https://www.instagram.com/japasushisalinas/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram className="h-4 w-4 text-primary" />
              @japasushisalinas
            </a>
          </div>

          {/* Endereço */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
              Endereço
            </h3>
            <a
              href="https://maps.google.com/?q=Avenida+Antônio+Carlos,+R.+São+Geraldo,+51A,+Salinas+-+MG,+39560-000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              Av. Antônio Carlos, R. São Geraldo, 51A — Salinas, MG, 39560-000
            </a>
          </div>

          {/* Horário */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
              Horário
            </h3>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <div>
                <p>Terça a Domingo</p>
                <p>19:00 — 23:30</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Restaurante Japonês & Delivery
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © {new Date().getFullYear()} Japa Sushi — Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};
