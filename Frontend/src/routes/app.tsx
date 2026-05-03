import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { AppHeader } from "@/components/layout/AppHeader";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

/**
 * Layout principal para el área privada de la aplicación.
 * Se encarga de la protección de rutas redirigiendo al login si no hay sesión activa.
 */
export default function AppLayout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  /**
   * Efecto que verifica la existencia de un usuario en sesión.
   * Si no se encuentra, redirige automáticamente al portal de acceso.
   */
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user?.id, navigate]);

  // Si no hay usuario, no se renderiza nada mientras se procesa la redirección
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollToTop />
      <AppHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Renderizado de las sub-rutas de la aplicación */}
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card py-4 mt-auto">
        <p className="text-xs text-center text-muted-foreground">
          © 2026 VitaSalud. Panel Administrativo.
        </p>
      </footer>
    </div>
  );
}
