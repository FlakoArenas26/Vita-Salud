import { useRef, useEffect } from "react";
import { Star } from "lucide-react";

/**
 * Sección de Testimonios de pacientes.
 * Muestra experiencias reales de usuarios para generar confianza y credibilidad.
 * Incluye una funcionalidad de carrusel con desplazamiento automático responsivo.
 */
export function TestimonialsSection() {
  /** listado de testimonios predefinidos con puntuación y rol */
  const testimonials = [
    { name: "María González", role: "Paciente Recurrente", text: "Agendar citas aquí es súper rápido y me ahorro horas en fila. Muy intuitiva.", stars: 5 },
    { name: "Carlos Ramírez", role: "Padre de familia", text: "La sección de pediatría es mi favorita. Puedo ver a los doctores de mis hijos a un par de clics y ver su disponibilidad.", stars: 5 },
    { name: "Lucía Fernández", role: "Paciente Regular", text: "Me encanta el historial médico; tengo todo organizado en un solo lugar. Totalmente recomendada.", stars: 4 },
    { name: "Andrés Silva", role: "Adulto Mayor", text: "Incluso para personas de mi edad, la página es muy sencilla de entender. Pude sacar mi cita para cardiología.", stars: 5 },
    { name: "Valeria Ríos", role: "Madre Gestante", text: "Nunca fue tan fácil consultar mis exámenes y agendar un médico especialista para mi seguimiento.", stars: 5 },
    { name: "Jorge Mendoza", role: "Paciente", text: "Buena plataforma, los recordatorios me ayudan mucho. El servicio de especialistas es muy completo.", stars: 4 },
    { name: "Daniela Castro", role: "Universitaria", text: "Ideal cuando no tienes tiempo para llamar a clínicas. Seleccionas la fecha, la hora y el médico en minutos.", stars: 5 },
    { name: "Roberto Peña", role: "Trabajador", text: "El sistema funciona muy bien, pude agendar con mi odontólogo sin tiempos de espera telefónicos. Ahorra tiempo.", stars: 4 }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Efecto para el desplazamiento automático del carrusel.
   * Rota los testimonios cada 4.5 segundos para mejorar la visibilidad de los mismos.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Si se alcanza el final del scroll, reinicia al principio de forma suave
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Calcula el ancho de cada tarjeta para un desplazamiento preciso
          const cardWidth = scrollRef.current.children[0]?.clientWidth || 320;
          scrollRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' }); // +24px por el gap de la grilla
        }
      }
    }, 4500); 
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonios" className="w-full bg-card py-20 border-t border-border overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Encabezado del área de testimonios */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-foreground mb-3">Lo que dicen nuestros pacientes</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10">
            Miles de pacientes en todo el país confían en nosotros para gestionar su bienestar médico sin complicaciones ni llamadas eternas.
          </p>
        </div>

        {/* Contenedor del Carrusel con Scroll Snap para móvil y escritorio */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((t, i) => (
              <div 
                key={i} 
                className="min-w-[85vw] sm:min-w-[calc(50%-12px)] md:min-w-[calc(33.333%-16px)] snap-center shrink-0 bg-background border border-border rounded-3xl p-6 sm:p-8 shadow-sm relative hover:shadow-md transition duration-300 flex flex-col"
              >
                {/* Visualización de estrellas de calificación */}
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= t.stars ? "fill-primary text-primary" : "fill-muted text-muted"}`} 
                    />
                  ))}
                </div>
                {/* Texto del testimonio */}
                <p className="italic text-foreground/80 mb-8 flex-1 leading-relaxed text-sm sm:text-base">
                  "{t.text}"
                </p>
                {/* Información del autor del testimonio */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Degradados laterales estéticos para indicar que hay más contenido (solo escritorio) */}
          <div className="hidden sm:block absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-card to-transparent pointer-events-none" />
          <div className="hidden sm:block absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
      </div>
      
      {/* Estilos locales para asegurar que la barra de desplazamiento no sea visible */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
