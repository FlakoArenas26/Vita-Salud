import { motion } from "framer-motion";
import { Heart, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import doctorHero from "@/assets/doctor-hero.png";

/**
 * Componente Hero de la página principal.
 * Representa la primera sección de impacto que ve el usuario, proporcionando
 * el mensaje principal y los botones de llamado a la acción iniciales.
 */
export function HeroSection() {
  return (
    <div className="w-full px-4 sm:px-8 py-8 sm:py-12">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Etiqueta informativa de ubicación y servicio */}
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold tracking-wide mb-4">
            <Heart className="h-3.5 w-3.5" />
            Tu clínica digital en Colombia
          </span>

          {/* Título principal con degradado dinámico */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-foreground font-heading mb-6 max-w-2xl">
            Agenda tu cita médica{" "}
            <span className="text-gradient-primary">de forma fácil y segura</span>
          </h1>

          {/* Imagen destacada del profesional médico */}
          <div className="mx-auto mb-6">
            <div className="rounded-2xl overflow-hidden w-48 sm:w-56">
              <img
                src={doctorHero}
                alt="Doctor profesional de VitaSalud"
                width={224}
                height={300}
                className="w-full h-auto bg-accent rounded-2xl"
              />
            </div>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Regístrate, elige tu especialista y agenda tu cita en minutos. Tu salud, al alcance
            de un clic.
          </p>

          {/* Acciones de acceso rápido mediante diálogos modales */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <AuthDialog
              initialMode="register"
              trigger={
                <Button
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Crear mi cuenta
                </Button>
              }
            />
            <AuthDialog
              initialMode="login"
              trigger={
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6"
                >
                  Ya tengo cuenta
                </Button>
              }
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
