import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { getCurrentUser, logout } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Menu, X, Calendar, Home, Settings, LogOut, User } from "lucide-react";
import facebookIcon from "@/assets/facebook-svgrepo-com.svg";
import instagramIcon from "@/assets/instagram-logo-facebook-2-svgrepo-com.svg";
import whatsappIcon from "@/assets/whatsapp-svgrepo-com.svg";
import youtubeIcon from "@/assets/youtube-svgrepo-com.svg";

/**
 * Cabecera principal de la aplicación privada.
 * Gestiona la navegación interna del paciente, visualización del perfil actual
 * y el cierre de sesión. Incluye un menú colapsable para dispositivos móviles.
 */
export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Finaliza la sesión del usuario y lo redirige al portal público.
   */
  function handleLogout() {
    logout();
    navigate("/");
  }

  /** Definición de ítems de navegación interna filtrados por rol */
  const navItems = user?.rol === "admin"
    ? [
      { to: "/app" as const, label: "Registro Médicos", icon: User },
      { to: "/app/configuracion" as const, label: "Configuración", icon: Settings },
    ]
    : user?.rol === "medico"
      ? [
        { to: "/app" as const, label: "Citas", icon: Home },
        { to: "/app/configuracion" as const, label: "Configuración", icon: Settings },
      ]
      : [
        { to: "/app" as const, label: "Mis Citas", icon: Home },
        { to: "/app/agendar" as const, label: "Agendar Cita", icon: Calendar },
        { to: "/app/configuracion" as const, label: "Configuración", icon: Settings },
      ];

  /** Evalúa si una ruta específica es la actual para resaltar el enlace en la UI */
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-card">
      <div className="w-full mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
        {/* Identidad de marca con enlace al panel inicial */}
        <Link
          to="/app"
          className="flex items-center gap-2 group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="text-primary-foreground font-bold text-base">VS</span>
          </div>
          <span className="text-xl font-black text-primary font-heading tracking-tighter italic leading-none transition-transform group-hover:scale-105 duration-300">
            VitaSalud
          </span>
        </Link>

        {/* Navegación para Escritorio - Centrada */}
        <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.to)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Perfil de usuario y botón de salida para Escritorio */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-full border border-border/50">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <User className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-bold text-foreground max-w-[120px] truncate">
              {user?.nombre?.split(" ").slice(0, 1).join(" ")}
            </span>
          </div>
          <div className="w-px h-6 bg-border mx-1"></div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors px-2">
            <LogOut className="h-4 w-4 mr-1" /> Salir
          </Button>
        </div>

        {/* Botón de menú Hamburguesa para móviles */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menú Desplegable para Móviles */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <User className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{user.nombre.split(" ").slice(0, 2).join(" ")}</span>
            </div>
          )}
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.to)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => { setMenuOpen(false); handleLogout(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      )}
    </header>
  );
}
