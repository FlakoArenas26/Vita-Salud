import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import facebookIcon from "@/assets/facebook-svgrepo-com.svg";
import instagramIcon from "@/assets/instagram-logo-facebook-2-svgrepo-com.svg";
import whatsappIcon from "@/assets/whatsapp-svgrepo-com.svg";
import youtubeIcon from "@/assets/youtube-svgrepo-com.svg";

/**
 * Cabecera de la Landing Page (Portal Público).
 * Proporciona navegación mediante anclas a las diferentes secciones de la página principal.
 * Implementa detección de scroll para resaltar la sección activa en el menú.
 */
export function LandingHeader() {
  const [activeSection, setActiveSection] = useState("");

  /** Definición de las secciones ancladas en la landing */
  const navItems = [
    { id: "caracteristicas", label: "Características" },
    { id: "especialidades", label: "Especialidades" },
    { id: "como-funciona", label: "Cómo Funciona" },
    { id: "testimonios", label: "Testimonios" },
  ];

  /**
   * Efecto para gestionar el resaltado de la sección activa mediante scroll.
   * Utiliza IntersectionObserver para detectar qué sección está predominando en pantalla.
   */
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Margen ajustado para detectar la sección central del viewport
      threshold: 0,
    };

    /** Manejador de la intersección que actualiza el estado de la sección activa */
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Observar cada sección definida en los ítems de navegación
    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-border shadow-sm backdrop-blur-sm bg-card/95">
      {/* Contenedor del Logo con retorno suave al inicio de la página */}
      <div 
        className="flex items-center gap-2 cursor-pointer group" 
        onClick={() => {
          window.history.pushState("", document.title, window.location.pathname + window.location.search);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
          <span className="text-primary-foreground font-bold text-base">VS</span>
        </div>
        <span className="text-xl font-black text-primary font-heading tracking-tighter italic leading-none transition-transform group-hover:scale-105 duration-300">
          VitaSalud
        </span>
      </div>
      
      {/* Navegación por anclas - Disponible solo en escritorio */}
      <div className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground flex-1 justify-center px-8">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeSection === item.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Acceso a redes sociales y acciones de autenticación modales */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <a href="#" className="text-muted-foreground hover:text-primary transition" title="Facebook">
            <img src={facebookIcon} alt="Facebook" className="h-5 w-5 filter brightness-0" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition" title="Instagram">
            <img src={instagramIcon} alt="Instagram" className="h-5 w-5 filter brightness-0" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition" title="WhatsApp">
            <img src={whatsappIcon} alt="WhatsApp" className="h-5 w-5 filter brightness-0" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition" title="YouTube">
            <img src={youtubeIcon} alt="YouTube" className="h-5 w-5 filter brightness-0" />
          </a>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block"></div>
        <AuthDialog
          initialMode="login"
          trigger={<Button variant="ghost" size="sm">Iniciar Sesión</Button>}
        />
        <AuthDialog
          initialMode="register"
          trigger={<Button variant="default" size="sm">Registrarse</Button>}
        />
      </div>
    </header>
  );
}
