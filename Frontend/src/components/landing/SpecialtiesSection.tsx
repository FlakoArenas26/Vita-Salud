import { Stethoscope, Activity, Eye, Baby, Brain, HeartPulse } from "lucide-react";

/**
 * Sección de Especialidades Médicas destacadas.
 * Presenta las principales áreas de atención disponibles en VitaSalud
 * mediante una cuadrícula de categorías con iconos representativos.
 */
export function SpecialtiesSection() {
  /**
   * Definición de especialidades con sus respectivos iconos y descripciones breves.
   */
  const specialties = [
    { icon: Stethoscope, name: "Medicina General", desc: "Atención integral para toda la familia." },
    { icon: Baby, name: "Pediatría", desc: "Cuidado especializado para los más pequeños." },
    { icon: Eye, name: "Oftalmología", desc: "Evaluación y tratamiento de salud visual." },
    { icon: HeartPulse, name: "Cardiología", desc: "Expertos en salud cardiovascular." },
    { icon: Brain, name: "Neurología", desc: "Diagnóstico y tratamiento neurológico." },
    { icon: Activity, name: "Ginecología", desc: "Salud integral y cuidado preventivo para la mujer." },
  ];

  return (
    <section id="especialidades" className="w-full bg-background py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Encabezado informativo de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-foreground mb-3">Nuestras Especialidades</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Contamos con profesionales altamente capacitados en diversas áreas médicas para ofrecerte la mejor atención.
          </p>
        </div>
        
        {/* Grilla dinámica de especialidades con efectos de hover */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {specialties.map((spec, i) => (
            <div key={i} className="rounded-xl border border-border p-6 text-center hover:shadow-md transition-shadow bg-card group">
              {/* Contenedor del icono con transición de color al pasar el cursor */}
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
                <spec.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">{spec.name}</h3>
              <p className="text-sm text-muted-foreground">{spec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
