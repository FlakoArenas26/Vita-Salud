import facebookIcon from "@/assets/facebook-svgrepo-com.svg";
import instagramIcon from "@/assets/instagram-logo-facebook-2-svgrepo-com.svg";
import whatsappIcon from "@/assets/whatsapp-svgrepo-com.svg";
import youtubeIcon from "@/assets/youtube-svgrepo-com.svg";
import phoneIcon from "@/assets/telephone-receiver-material-svgrepo-com.svg";

/**
 * Pie de página oficial de VitaSalud.
 * Compila enlaces legales, navegación de características y presencia en redes sociales.
 * Proporciona coherencia de marca al final de todas las páginas públicas.
 */
export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid sm:grid-cols-4 gap-8 mb-8">
          {/* Identidad de marca en el footer */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">VS</span>
              </div>
              <span className="text-lg font-black text-primary font-heading tracking-tighter italic leading-none">
                VitaSalud
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Tu clínica digital en Colombia</p>
          </div>

          {/* Enlaces a las características principales para navegación rápida */}
          <div className="text-center">
            <h4 className="font-semibold text-foreground mb-3">Características</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#como-funciona" className="hover:text-primary transition">Agendar Citas</a></li>
              <li><a href="#especialidades" className="hover:text-primary transition">Especialidades</a></li>
              <li><a href="#caracteristicas" className="hover:text-primary transition">Seguridad</a></li>
            </ul>
          </div>

          {/* Enlaces de soporte legal y privacidad del usuario */}
          <div className="text-center">
            <h4 className="font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition">Privacidad</a></li>
              <li><a href="#" className="hover:text-primary transition">Términos de Uso</a></li>
            </ul>
          </div>

          {/* Acceso a canales sociales oficiales de la clínica */}
          <div className="text-center">
            <h4 className="font-semibold text-foreground mb-4">Síguenos</h4>
            <div className="flex items-center justify-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <img src={facebookIcon} alt="Facebook" className="h-6 w-6 filter brightness-0" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <img src={instagramIcon} alt="Instagram" className="h-6 w-6 filter brightness-0" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <img src={whatsappIcon} alt="WhatsApp" className="h-6 w-6 filter brightness-0" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <img src={youtubeIcon} alt="YouTube" className="h-6 w-6 filter brightness-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Derechos de autor y cierre institucional de la página */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 VitaSalud. Todos los derechos reservados. Plataforma segura para agendar citas médicas en Colombia.
          </p>
        </div>
      </div>
    </footer>
  );
}
