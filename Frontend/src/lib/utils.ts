import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilidad para combinar clases de CSS de forma condicional y optimizada.
 * Utiliza 'clsx' para la lógica condicional y 'tailwind-merge' para resolver
 * conflictos de clases de Tailwind CSS de manera eficiente.
 * 
 * @param inputs Lista de valores de clase que pueden ser strings, objetos o arreglos.
 * @returns string Cadena de clases procesada y lista para el atributo className.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
