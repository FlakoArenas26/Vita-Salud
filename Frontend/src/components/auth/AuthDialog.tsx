import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { LoginForm, RegisterForm } from "@/components/auth/AuthForms";
import { X } from "lucide-react";

interface AuthDialogProps {
  initialMode: "login" | "register";
  trigger: React.ReactNode;
}

/**
 * Componente de diálogo modal para autenticación rápida.
 * Utiliza Portales de React para renderizarse sobre el resto de la interfaz,
 * permitiendo al usuario loguearse o registrarse sin perder el contexto de la página actual.
 */
export function AuthDialog({ initialMode, trigger }: AuthDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);

  /**
   * Maneja el éxito de la autenticación.
   * Cierra el modal y redirige al panel principal.
   */
  const handleSuccess = () => {
    setOpen(false);
    navigate("/app");
  };

  /**
   * Efecto para gestionar el scroll del cuerpo del documento.
   * Bloquea el desplazamiento cuando el modal está activo para mejorar la experiencia UX.
   */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /**
   * Accesibilidad: Permite cerrar el modal presionando la tecla Escape.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      {/* Elemento que dispara la apertura del modal */}
      <div className="inline-flex cursor-pointer" onClick={() => setOpen(true)}>
        {trigger}
      </div>

      {open && createPortal(
        <div 
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setOpen(false)} // Cerrar al hacer clic fuera del contenido
        >
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
            {/* Contenedor principal del Modal con sombra y bordes redondeados */}
            <div 
              className="bg-background w-full max-w-xl rounded-2xl shadow-xl relative z-[1001]"
              onClick={(e) => e.stopPropagation()} // Evita que clicks internos cierren el modal
            >
              {/* Encabezado del Modal con título y descripción dinámica */}
              <div className="relative p-5 sm:p-6 border-b bg-card rounded-t-2xl text-center">
                <div className="pr-6 pl-6">
                  <h2 className="text-xl font-bold font-heading text-foreground">
                    {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mode === "login"
                      ? "Accede a tu cuenta de VitaSalud sin salir de esta página."
                      : "Regístrate de forma rápida y segura desde este portal."}
                  </p>
                </div>
                <button 
                  onClick={() => setOpen(false)}
                  className="absolute right-4 top-4 sm:right-6 sm:top-6 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Área de contenido: Renderiza el formulario correspondiente (Login o Registro) */}
              <div className="p-5 sm:p-6">
                {mode === "login" ? (
                  <LoginForm 
                    onSuccess={handleSuccess} 
                    onSwitchToRegister={() => setMode("register")} 
                  />
                ) : (
                  <RegisterForm 
                    onSuccess={handleSuccess} 
                    onSwitchToLogin={() => setMode("login")} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
