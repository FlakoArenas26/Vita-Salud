import * as React from "react";

/** Punto de corte en píxeles para considerar un dispositivo como 'móvil' */
const MOBILE_BREAKPOINT = 768;

/**
 * Hook personalizado para detectar si el usuario está navegando desde un dispositivo móvil.
 * Escucha cambios en el tamaño de la ventana en tiempo real mediante Media Queries.
 * 
 * @returns boolean Indica true si el ancho de pantalla es inferior al breakpoint móvil.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Configuración de la consulta de medios (Media Query)
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    /** Actualiza el estado basado en el ancho actual del viewport */
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Suscripción al evento de cambio de tamaño
    mql.addEventListener("change", onChange);
    
    // Verificación inicial al montar el hook
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Limpieza del listener al desmontar el componente para evitar fugas de memoria
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
