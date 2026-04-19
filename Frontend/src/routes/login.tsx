import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/AuthForms";

/**
 * Página de inicio de sesión de la plataforma VitaSalud.
 * Proporciona el contenedor y el contexto necesario para el formulario de autenticación.
 */
export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 sm:px-8 py-4 bg-card border-b border-border">
        {/* Enlace para retornar a la página principal pública */}
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">VS</span>
          </div>
          <span className="text-lg font-extrabold text-foreground font-heading">VitaSalud</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border"
        >
          <h1 className="text-2xl font-bold text-foreground font-heading mb-1">Iniciar Sesión</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Ingresa tus credenciales para acceder a tu panel de salud personal.
          </p>

          {/* Componente central que gestiona la validación y el acceso */}
          <LoginForm onSuccess={() => navigate("/app")} onSwitchToRegister={() => navigate("/registro")} />
        </motion.div>
      </main>
    </div>
  );
}
