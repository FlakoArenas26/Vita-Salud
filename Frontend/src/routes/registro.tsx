import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { RegisterForm } from "@/components/auth/AuthForms";

/**
 * Página de registro para nuevos pacientes en la plataforma VitaSalud.
 * Proporciona el flujo inicial para la captura de información personal y geográfica.
 */
export default function RegistroPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 sm:px-8 py-4 bg-card border-b border-border">
        {/* Retornar al portal de inicio público */}
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

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border"
        >
          <h1 className="text-2xl font-bold text-foreground font-heading mb-1">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Completa tus datos para registrarte en el ecosistema digital de VitaSalud.
          </p>

          {/* Formulario complejo que gestiona la creación del perfil del paciente */}
          <RegisterForm onSuccess={() => navigate("/app")} onSwitchToLogin={() => navigate("/login")} />
        </motion.div>
      </main>
    </div>
  );
}
