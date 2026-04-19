import { motion } from "framer-motion";
import { Shield, Calendar, Heart } from "lucide-react";

/**
 * Sección de Características principales del servicio.
 * Destaca los valores competitivos de la plataforma mediante tarjetas informativas.
 */
export function FeaturesSection() {
  return (
    <section id="caracteristicas" className="w-full bg-background py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-foreground mb-3">¿Por qué elegir VitaSalud?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Nuestra plataforma está diseñada para ofrecerte la mejor experiencia al gestionar tus citas médicas, priorizando siempre tu seguridad y comodidad.
          </p>
        </div>
        
        {/* Grilla de características con animaciones de entrada */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full"
        >
          {[
            {
              icon: Shield,
              title: "Datos Protegidos",
              desc: "Tus datos personales están seguros bajo la Ley 1581 de Habeas Data.",
            },
            {
              icon: Calendar,
              title: "Citas en Minutos",
              desc: "Elige especialista, fecha y hora. Sin largas filas ni esperas.",
            },
            {
              icon: Heart,
              title: "Seguimiento Completo",
              desc: "Consulta tus citas y recomendaciones médicas en cualquier momento.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl bg-card border border-border p-6 shadow-sm text-center transition-all hover:shadow-md hover:-translate-y-1"
            >
              <f.icon className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
