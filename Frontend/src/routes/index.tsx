import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SpecialtiesSection } from "@/components/landing/SpecialtiesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

/**
 * Página de Inicio de la plataforma VitaSalud.
 * Compone todas las secciones informativas orientadas al público general.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollToTop />
      <LandingHeader />
      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Sección principal con el llamado a la acción inicial */}
        <HeroSection />
        {/* Presentación de las características clave del servicio */}
        <FeaturesSection />
        {/* Visualización de las especialidades médicas ofrecidas */}
        <SpecialtiesSection />
        {/* Explicación del funcionamiento paso a paso para el paciente */}
        <HowItWorksSection />
        {/* Sección de pruebas sociales y testimonios de usuarios */}
        <TestimonialsSection />
      </main>
      <LandingFooter />
    </div>
  );
}
