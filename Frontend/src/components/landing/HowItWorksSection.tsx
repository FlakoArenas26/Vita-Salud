/**
 * Sección descriptiva del proceso de agendamiento.
 * Utiliza una línea de tiempo visual (Timeline) para guiar al usuario
 * por los pasos necesarios para obtener atención médica en VitaSalud.
 */
export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="w-full bg-muted/30 py-16 border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-foreground mb-3">¿Cómo solicitar tu cita médica?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tu salud no tiene por qué esperar. Sigue estos 4 sencillos pasos para asegurar tu atención con nuestros médicos especialistas.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-center relative">
          {/* Línea decorativa del conector de pasos (solo visible en pantallas medianas/grandes) */}
          <div className="hidden md:block absolute top-[25%] left-[12%] right-[12%] h-0.5 bg-border -z-10" />
          
          {[
            { number: "1", title: "Crea tu Cuenta o Ingresa", desc: "Regístrate gratis o inicia sesión instantáneamente con tu perfil para agilizar el proceso." },
            { number: "2", title: "Encuentra al Especialista", desc: "Filtra rápidamente por especialidad, servicio y ciudad para encontrar el médico ideal." },
            { number: "3", title: "Elige Fecha y Hora", desc: "Visualiza la agenda en tiempo real de los doctores y escoge el horario que más te convenga." },
            { number: "4", title: "Confirma tu Cita", desc: "Recibe una confirmación instantánea. Todo tu historial quedará guardado para tu tranquilidad." },
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Indicador numérico circular con realce visual */}
              <div className="bg-primary text-primary-foreground font-bold text-xl w-12 h-12 flex items-center justify-center rounded-full mb-4 shadow-md ring-4 ring-background">
                {step.number}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
