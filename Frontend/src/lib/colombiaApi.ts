import type { ReactNode } from "react";

/**
 * Interfaz que define la estructura de un Departamento.
 */
export interface Departamento {
  nombre: ReactNode;
  /** Identificador único del departamento */
  id: number;
  /** Nombre oficial del departamento */
  name: string;
}

/**
 * Interfaz que define la estructura de una Ciudad o Municipio.
 */
export interface Ciudad {
  nombre: ReactNode;
  /** Identificador único de la ciudad */
  id: number;
  /** Nombre oficial de la ciudad */
  name: string;
  /** Identificador del departamento al que pertenece */
  departmentId: number;
}

/**
 * Obtiene el listado de todos los departamentos de Colombia desde el servicio externo.
 * Los datos se retornan ordenados de forma alfabética.
 * 
 * @returns Una promesa que resuelve con la lista de departamentos.
 * @throws Error si la conexión con el servicio falla.
 */
export async function fetchDepartamentos(): Promise<Departamento[]> {
  const res = await fetch("https://api-colombia.com/api/v1/Department");
  if (!res.ok) throw new Error("Error cargando departamentos");
  const data: Departamento[] = await res.json();
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Obtiene las ciudades asociadas a un departamento específico mediante su identificador.
 * 
 * @param departmentId El ID del departamento para filtrar las ciudades.
 * @returns Una promesa que resuelve con la lista de ciudades del departamento.
 * @throws Error si la consulta al servicio falla.
 */
export async function fetchCiudadesByDepartamento(departmentId: number): Promise<Ciudad[]> {
  const res = await fetch(`https://api-colombia.com/api/v1/Department/${departmentId}/cities`);
  if (!res.ok) throw new Error("Error cargando ciudades");
  const data: Ciudad[] = await res.json();
  return data.sort((a, b) => a.name.localeCompare(b.name));
}
