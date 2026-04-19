/**
 * Interface que representa la estructura de un Médico.
 */
export interface Doctor {
  /** Identificador único del médico */
  id: string;
  /** Nombre completo del doctor con título (Dr. o Dra.) */
  nombre: string;
  /** Especialidad médica que desempeña */
  especialidad: string;
  /** Tipo de documento de identificación */
  tipoDocumento: string;
  /** Cédula o número de identificación profesional */
  identificacion: string;
  /** Número de la tarjeta profesional médica */
  tarjetaProfesional: string;
  /** ID del departamento donde reside el médico */
  departamentoId: number;
  /** ID de la ciudad donde reside el médico */
  ciudadId: number;
  /** Indica si el médico está disponible para recibir citas */
  activo: boolean;
  /** Cantidad de años de trayectoria profesional */
  experienciaAnios: number;
  /** Correo electrónico del médico */
  email: string;
  /** Contraseña hasheada */
  password: string;
  /** Rol del usuario */
  rol: "medico";
}

/** Listado de especialidades médicas disponibles en el sistema */
export const especialidades = [
  "Medicina General",
  "Pediatría",
  "Oftalmología",
  "Cardiología",
  "Neurología",
  "Ginecología",
];

const nombresHombres = ["Carlos", "Andrés", "Santiago", "Felipe", "Alejandro", "Jorge", "Luis", "David", "Diego", "Miguel"];
const nombresMujeres = ["María", "Valentina", "Camila", "Laura", "Daniela", "Sofía", "Isabella", "Ana", "Juana", "Lucía"];
const apellidos = ["García", "Martínez", "López", "González", "Pérez", "Rodríguez", "Gómez", "Ramírez", "Sánchez", "Díaz"];

/** 
 * Conjunto de combinaciones de departamentos y ciudades para asignar a los médicos.
 * Se utilizan IDs que coinciden con la API de Colombia para mantener la coherencia.
 */
const locaciones = [
  { dep: 2, ciu: 2001 }, { dep: 5, ciu: 5001 }, { dep: 8, ciu: 8001 }, { dep: 11, ciu: 11001 },
  { dep: 13, ciu: 13001 }, { dep: 15, ciu: 15001 }, { dep: 17, ciu: 17001 }, { dep: 19, ciu: 19001 },
  { dep: 20, ciu: 20001 }, { dep: 23, ciu: 23001 }, { dep: 25, ciu: 25001 }, { dep: 27, ciu: 27001 },
  { dep: 41, ciu: 41001 }, { dep: 44, ciu: 44001 }, { dep: 47, ciu: 47001 }, { dep: 50, ciu: 50001 }
];

/**
 * Normaliza una cadena eliminando acentos y caracteres especiales.
 * Util para generar correos electrónicos consistentes.
 */
export function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Genera de forma aleatoria un listado de médicos para simular una base de datos.
 * 
 * @returns Un arreglo de objetos de tipo Doctor.
 */
function generateDoctors(): Doctor[] {
  const docs: Doctor[] = [];
  let idCounter = 1;

  for (const esp of especialidades) {
    for (let i = 0; i < 10; i++) {
      const isMale = Math.random() > 0.5;
      const firstName = isMale ? nombresHombres[Math.floor(Math.random() * nombresHombres.length)] : nombresMujeres[Math.floor(Math.random() * nombresMujeres.length)];
      const lastName = apellidos[Math.floor(Math.random() * apellidos.length)] + " " + apellidos[Math.floor(Math.random() * apellidos.length)];
      const loc = locaciones[Math.floor(Math.random() * locaciones.length)];

        const doctorIdVal = `1.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}`;
        const tarjetaVal = `${Math.floor(Math.random() * 90000 + 10000)}-TP`;
        const emailVal = `${normalize(firstName)}.${normalize(lastName).replace(/\s+/g, '')}@vitasalud.com`;

        docs.push({
          id: `medico-${idCounter++}`,
          nombre: `${isMale ? "Dr." : "Dra."} ${firstName} ${lastName}`,
          especialidad: esp,
          tipoDocumento: "CC",
          identificacion: doctorIdVal,
          tarjetaProfesional: tarjetaVal,
          departamentoId: loc.dep,
          ciudadId: loc.ciu,
          activo: Math.random() > 0.15,
          experienciaAnios: Math.floor(Math.random() * 25) + 3,
          email: emailVal,
          password: hashPassword("medico123"),
          rol: "medico",
        });
    }
  }
  return docs;
}

/** Exportación de la lista de médicos generada */
export const doctores = generateDoctors();

/**
 * Genera administradores mock para el sistema.
 * Incluye un admin principal con credenciales conocidas para pruebas.
 * 
 * @returns Un arreglo de objetos de tipo Admin.
 */
function generateAdmins(): Admin[] {
  const admins: Admin[] = [];
  const adminNames = ["Admin Principal", "Super Admin", "Gestor Sistema"];
  const loc = locaciones[Math.floor(Math.random() * locaciones.length)];

  // Agregar admin principal con credenciales conocidas
  admins.push({
    id: "admin-principal",
    tipoDocumento: "CC",
    identificacion: "123456789",
    nombre: "Administrador Principal",
    edad: 40,
    departamentoId: 11, // Bogotá
    departamentoNombre: "Bogotá D.C.",
    ciudadId: 11001,
    ciudadNombre: "Bogotá",
    email: "admin@vitasalud.com",
    password: hashPassword("admin123"),
    rol: "admin",
  });

  for (let i = 0; i < 3; i++) {
    admins.push({
      id: `admin-${i + 1}`,
      tipoDocumento: "CC",
      identificacion: `12345678${i}`,
      nombre: adminNames[i],
      edad: 35 + i * 5,
      departamentoId: loc.dep,
      departamentoNombre: "Bogotá D.C.",
      ciudadId: loc.ciu,
      ciudadNombre: "Bogotá",
      email: `admin${i + 1}@vitasalud.com`,
      password: hashPassword("admin123"),
      rol: "admin",
    });
  }
  return admins;
}

/** Exportación de la lista de administradores generada */
export const adminsMock = generateAdmins();

/** Listado de tipos de documento aceptados por el sistema */
export const tiposDocumento = [
  { value: "CC", label: "Cédula de Ciudadanía (CC)" },
  { value: "TI", label: "Tarjeta de Identidad (TI)" },
  { value: "CE", label: "Cédula de Extranjería (CE)" },
  { value: "PA", label: "Pasaporte (PA)" },
  { value: "RC", label: "Registro Civil (RC)" },
];

/**
 * Interfaz que representa los datos de un Paciente.
 */
export interface Paciente {
  id: string;
  tipoDocumento: string;
  identificacion: string;
  nombre: string;
  edad: number;
  departamentoId: number;
  departamentoNombre: string;
  ciudadId: number;
  ciudadNombre: string;
  email: string;
  password: string;
  /** Rol del usuario en el sistema */
  rol: "paciente" | "medico" | "admin";
}

/**
 * Interfaz que representa los datos de un Administrador.
 */
export interface Admin {
  id: string;
  tipoDocumento: string;
  identificacion: string;
  nombre: string;
  edad: number;
  departamentoId: number;
  departamentoNombre: string;
  ciudadId: number;
  ciudadNombre: string;
  email: string;
  password: string;
  /** Rol del usuario en el sistema */
  rol: "admin";
}

/** Tipo union para todos los tipos de usuario */
export type Usuario = Paciente | Doctor | Admin;
export interface Cita {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteIdentificacion: string;
  pacienteTipoDoc: string;
  doctorId: number;
  doctorNombre: string;
  doctorIdentificacion: string;
  doctorTarjetaProfesional: string;
  consultorio: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: "agendada" | "atendida" | "cancelada";
  recomendaciones?: string;
}

/** Claves utilizadas para almacenar información en el sessionStorage del navegador */
const PACIENTES_KEY = "medicita_pacientes";
const MEDICOS_KEY = "medicita_medicos";
const ADMINS_KEY = "medicita_admins";
const CURRENT_USER_KEY = "medicita_current_user";
const CITAS_KEY = "medicita_citas";
const LOGIN_ATTEMPTS_KEY = "medicita_login_attempts";

/**
 * Busca un médico específico por su identificador.
 * 
 * @param id El ID del médico a buscar.
 * @returns El objeto Doctor o undefined si no se encuentra.
 */
export function getDoctorById(id: string): Doctor | undefined {
  return getMedicos().find((d) => d.id === id);
}

/**
 * Obtiene la lista completa de pacientes registrados desde el almacenamiento local.
 * 
 * @returns Un arreglo con todos los pacientes.
 */
export function getPacientes(): Paciente[] {
  try {
    const data = localStorage.getItem(PACIENTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Registra y guarda un nuevo paciente en el almacenamiento local.
 * 
 * @param paciente Objeto con la información del paciente a guardar.
 */
export function savePaciente(paciente: Paciente): void {
  const pacientes = getPacientes();
  pacientes.push(paciente);
  localStorage.setItem(PACIENTES_KEY, JSON.stringify(pacientes));
}

/**
 * Actualiza la información de un paciente existente.
 * También actualiza el perfil del usuario actual si coincide.
 * 
 * @param updated Objeto con los datos actualizados del paciente.
 */
export function updatePaciente(updated: Paciente): void {
  const pacientes = getPacientes().map((p) => (p.id === updated.id ? updated : p));
  localStorage.setItem(PACIENTES_KEY, JSON.stringify(pacientes));
  // El usuario actual de la pestaña se actualiza en sessionStorage
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
}

/**
 * Busca un paciente en los registros mediante su correo electrónico.
 * 
 * @param email Correo a consultar.
 * @returns El paciente encontrado o undefined.
 */
export function findPacienteByEmail(email: string): Paciente | undefined {
  return getPacientes().find((p) => p.email.toLowerCase() === email.toLowerCase());
}

/**
 * Obtiene la lista completa de médicos registrados desde el almacenamiento local.
 * 
 * @returns Un arreglo con todos los médicos.
 */
export function getMedicos(): Doctor[] {
  try {
    const data = localStorage.getItem(MEDICOS_KEY);
    if (data) return JSON.parse(data);
    
    // Inicialización eager para que todas las pestañas compartan el mismo set inicial
    localStorage.setItem(MEDICOS_KEY, JSON.stringify(doctores));
    return doctores;
  } catch {
    return doctores;
  }
}

/**
 * Registra y guarda un nuevo médico en el almacenamiento local.
 * 
 * @param medico Objeto con la información del médico a guardar.
 */
export function saveMedico(medico: Doctor): void {
  const medicos = getMedicos();
  medicos.push(medico);
  localStorage.setItem(MEDICOS_KEY, JSON.stringify(medicos));
}

/**
 * Actualiza la información de un médico existente.
 * 
 * @param updated Objeto con los datos actualizados del médico.
 */
export function updateMedico(updated: Doctor): void {
  const medicos = getMedicos().map((m) => (m.id === updated.id ? updated : m));
  localStorage.setItem(MEDICOS_KEY, JSON.stringify(medicos));
  
  // Sincronizar usuario actual si es el mismo que se está editando en esta pestaña
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === updated.id) {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
  }
}

/**
 * Busca un médico en los registros mediante su correo electrónico.
 * 
 * @param email Correo a consultar.
 * @returns El médico encontrado o undefined.
 */
export function findMedicoByEmail(email: string): Doctor | undefined {
  return getMedicos().find((m) => m.email.toLowerCase() === email.toLowerCase());
}

/**
 * Obtiene la lista completa de administradores registrados desde el almacenamiento local.
 * 
 * @returns Un arreglo con todos los administradores.
 */
export function getAdmins(): Admin[] {
  try {
    const data = localStorage.getItem(ADMINS_KEY);
    if (data) return JSON.parse(data);
    
    // Inicialización eager para compartir admins entre pestañas
    localStorage.setItem(ADMINS_KEY, JSON.stringify(adminsMock));
    return adminsMock;
  } catch {
    return adminsMock;
  }
}

/**
 * Registra y guarda un nuevo administrador en el almacenamiento local.
 * 
 * @param admin Objeto con la información del administrador a guardar.
 */
export function saveAdmin(admin: Admin): void {
  const admins = getAdmins();
  admins.push(admin);
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

/**
 * Busca un administrador en los registros mediante su correo electrónico.
 * 
 * @param email Correo a consultar.
 * @returns El administrador encontrado o undefined.
 */
export function findAdminByEmail(email: string): Admin | undefined {
  return getAdmins().find((a) => a.email.toLowerCase() === email.toLowerCase());
}

/**
 * Establece el usuario que ha iniciado sesión actualmente.
 * 
 * @param usuario Objeto del usuario que accede al sistema.
 */
export function setCurrentUser(usuario: Usuario): void {
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuario));
}

/**
 * Recupera el usuario que tiene la sesión activa.
 * 
 * @returns El usuario actual o null si no hay sesión iniciada.
 */
export function getCurrentUser(): Usuario | null {
  try {
    const data = sessionStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Cierra la sesión del usuario actual eliminando sus datos del almacenamiento.
 */
export function logout(): void {
  sessionStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Obtiene la lista global de citas programadas.
 * 
 * @returns Arreglo de citas de todos los pacientes.
 */
export function getCitas(): Cita[] {
  try {
    const data = localStorage.getItem(CITAS_KEY);
    if (!data) {
      const initial = seedCitasForTest();
      if (initial.length > 0) {
        localStorage.setItem(CITAS_KEY, JSON.stringify(initial));
        return initial;
      }
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Genera un set inicial de citas para pruebas del dashboard médico.
 */
function seedCitasForTest(): Cita[] {
  const hoy = new Date().toISOString().split("T")[0];
  const mañana = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const ayer = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const medicos = getMedicos();
  const doctorTest = medicos[0]; // El primer médico generado (usualmente Carlos García)
  if (!doctorTest) return [];

  return [
    {
      id: "cita-1",
      pacienteId: "pac-1",
      pacienteNombre: "Juan Sebastián Torres",
      pacienteIdentificacion: "1.098.765",
      pacienteTipoDoc: "CC",
      doctorId: doctorTest.id as any,
      doctorNombre: doctorTest.nombre,
      doctorIdentificacion: doctorTest.identificacion,
      doctorTarjetaProfesional: doctorTest.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctorTest.especialidad,
      fecha: hoy,
      hora: "08:00 AM",
      estado: "agendada"
    },
    {
      id: "cita-2",
      pacienteId: "pac-2",
      pacienteNombre: "Clara Inés Rojas",
      pacienteIdentificacion: "1.234.567",
      pacienteTipoDoc: "CC",
      doctorId: doctorTest.id as any,
      doctorNombre: doctorTest.nombre,
      doctorIdentificacion: doctorTest.identificacion,
      doctorTarjetaProfesional: doctorTest.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctorTest.especialidad,
      fecha: hoy,
      hora: "10:30 AM",
      estado: "agendada"
    },
    {
      id: "cita-3",
      pacienteId: "pac-3",
      pacienteNombre: "Roberto Gómez",
      pacienteIdentificacion: "1.456.789",
      pacienteTipoDoc: "CC",
      doctorId: doctorTest.id as any,
      doctorNombre: doctorTest.nombre,
      doctorIdentificacion: doctorTest.identificacion,
      doctorTarjetaProfesional: doctorTest.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctorTest.especialidad,
      fecha: hoy,
      hora: "02:00 PM",
      estado: "agendada"
    },
    {
      id: "cita-4",
      pacienteId: "pac-4",
      pacienteNombre: "Elena María Restrepo",
      pacienteIdentificacion: "1.111.222",
      pacienteTipoDoc: "CC",
      doctorId: doctorTest.id as any,
      doctorNombre: doctorTest.nombre,
      doctorIdentificacion: doctorTest.identificacion,
      doctorTarjetaProfesional: doctorTest.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctorTest.especialidad,
      fecha: mañana,
      hora: "09:15 AM",
      estado: "agendada"
    },
    {
      id: "cita-5",
      pacienteId: "pac-5",
      pacienteNombre: "Samuel David López",
      pacienteIdentificacion: "1.333.444",
      pacienteTipoDoc: "CC",
      doctorId: doctorTest.id as any,
      doctorNombre: doctorTest.nombre,
      doctorIdentificacion: doctorTest.identificacion,
      doctorTarjetaProfesional: doctorTest.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctorTest.especialidad,
      fecha: ayer,
      hora: "11:00 AM",
      estado: "atendida",
      recomendaciones: "Paciente presenta mejoría notable. Continuar con el tratamiento prescrito y control en 3 meses."
    },
    {
      id: "cita-6",
      pacienteId: "pac-6",
      pacienteNombre: "Marta Lucía Díaz",
      pacienteIdentificacion: "1.555.666",
      pacienteTipoDoc: "CC",
      doctorId: doctorTest.id as any,
      doctorNombre: doctorTest.nombre,
      doctorIdentificacion: doctorTest.identificacion,
      doctorTarjetaProfesional: doctorTest.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctorTest.especialidad,
      fecha: ayer,
      hora: "03:30 PM",
      estado: "atendida",
      recomendaciones: "Se ajustó la dosis de medicación. Vigilar signos de alarma y reportar cualquier síntoma inusual."
    }
  ];
}

/**
 * Filtra las citas programadas para un paciente en concreto.
 * 
 * @param pacienteId El identificador del paciente.
 * @returns Lista de citas del paciente.
 */
export function getCitasByPaciente(pacienteId: string): Cita[] {
  return getCitas().filter((c) => c.pacienteId === pacienteId);
}

/**
 * Filtra las citas programadas para un médico en concreto.
 * 
 * @param doctorId El identificador del médico.
 * @returns Lista de citas del médico.
 */
export function getCitasByDoctor(doctorId: string): Cita[] {
  return getCitas().filter((c) => c.doctorId.toString() === doctorId);
}

/**
 * Almacena una nueva cita médica en el sistema.
 * 
 * @param cita Objeto con los detalles de la reserva.
 */
export function saveCita(cita: Cita): void {
  const citas = getCitas();
  citas.push(cita);
  localStorage.setItem(CITAS_KEY, JSON.stringify(citas));
}

/**
 * Actualiza el estado o la descripción de una cita ya existente.
 * 
 * @param updated Cita con los cambios realizados.
 */
export function updateCita(updated: Cita): void {
  const citas = getCitas().map((c) => (c.id === updated.id ? updated : c));
  localStorage.setItem(CITAS_KEY, JSON.stringify(citas));
}

/**
 * Localiza una cita individual por su ID.
 * 
 * @param id El código único de la cita.
 * @returns La cita encontrada o undefined.
 */
export function getCitaById(id: string): Cita | undefined {
  return getCitas().find((c) => c.id === id);
}

/** Estructura de datos para controlar intentos de acceso fallidos */
interface LoginAttemptData {
  count: number;
  blockedUntil: number | null;
}

/**
 * Obtiene el registro de intentos de login para un correo específico.
 * 
 * @param email Correo del usuario que intenta acceder.
 * @returns Datos de intentos y tiempo de bloqueo si aplica.
 */
export function getLoginAttempts(email: string): LoginAttemptData {
  try {
    const data = localStorage.getItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
    return data ? JSON.parse(data) : { count: 0, blockedUntil: null };
  } catch {
    return { count: 0, blockedUntil: null };
  }
}

/**
 * Registra un fallo en el inicio de sesión y aplica bloqueo temporal si excede 3 intentos.
 * 
 * @param email Correo del usuario.
 * @returns El registro de intentos actualizado.
 */
export function incrementLoginAttempt(email: string): LoginAttemptData {
  const attempts = getLoginAttempts(email);
  attempts.count += 1;
  if (attempts.count >= 3) {
    attempts.blockedUntil = Date.now() + 30000;
  }
  localStorage.setItem(`${LOGIN_ATTEMPTS_KEY}_${email}`, JSON.stringify(attempts));
  return attempts;
}

/**
 * Limpia el contador de fallos de acceso tras un login exitoso.
 * 
 * @param email Correo del usuario.
 */
export function resetLoginAttempts(email: string): void {
  localStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
}

/**
 * Evalúa si una cuenta se encuentra bajo restricción temporal por fallos de acceso.
 * 
 * @param email Correo a verificar.
 * @returns Indicación de bloqueo y segundos restantes.
 */
export function isBlocked(email: string): { blocked: boolean; remainingSeconds: number } {
  const attempts = getLoginAttempts(email);
  if (attempts.blockedUntil && Date.now() < attempts.blockedUntil) {
    return {
      blocked: true,
      remainingSeconds: Math.ceil((attempts.blockedUntil - Date.now()) / 1000),
    };
  }
  if (attempts.blockedUntil && Date.now() >= attempts.blockedUntil) {
    resetLoginAttempts(email);
  }
  return { blocked: false, remainingSeconds: 0 };
}

/**
 * Aplica una transformación básica (Base64) a la contraseña para evitar que sea texto plano.
 * NOTA: Esto es solo didáctico para simulaciones; en producción se deben usar algoritmos de hash como bcrypt.
 * 
 * @param password Contraseña original.
 * @returns Contraseña transformada.
 */
export function hashPassword(password: string): string {
  return btoa(password);
}

/**
 * Compara si una contraseña coincide con la transformación almacenada.
 * 
 * @param password Contraseña ingresada.
 * @param hash Transformación guardada.
 * @returns Verdadero si la validación es correcta.
 */
export function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash;
}

/**
 * Genera un set inicial de citas para pruebas de un médico específico.
 * Utilizado para validar el dashboard médico de forma inmediata.
 * 
 * @param doctor El médico para el cual se generarán las citas.
 */
export function seedAppointmentsForDoctor(doctor: Doctor): void {
  const hoy = new Date().toISOString().split("T")[0];
  const mañana = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const ayer = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const initialCitas: Cita[] = [
    {
      id: `cita-${doctor.id}-1`,
      pacienteId: "pac-1",
      pacienteNombre: "Juan Sebastián Torres",
      pacienteIdentificacion: "1.098.765",
      pacienteTipoDoc: "CC",
      doctorId: doctor.id as any,
      doctorNombre: doctor.nombre,
      doctorIdentificacion: doctor.identificacion,
      doctorTarjetaProfesional: doctor.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctor.especialidad,
      fecha: hoy,
      hora: "08:00 AM",
      estado: "agendada"
    },
    {
      id: `cita-${doctor.id}-2`,
      pacienteId: "pac-2",
      pacienteNombre: "Clara Inés Rojas",
      pacienteIdentificacion: "1.234.567",
      pacienteTipoDoc: "CC",
      doctorId: doctor.id as any,
      doctorNombre: doctor.nombre,
      doctorIdentificacion: doctor.identificacion,
      doctorTarjetaProfesional: doctor.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctor.especialidad,
      fecha: hoy,
      hora: "10:30 AM",
      estado: "agendada"
    },
    {
      id: `cita-${doctor.id}-3`,
      pacienteId: "pac-3",
      pacienteNombre: "Roberto Gómez",
      pacienteIdentificacion: "1.456.789",
      pacienteTipoDoc: "CC",
      doctorId: doctor.id as any,
      doctorNombre: doctor.nombre,
      doctorIdentificacion: doctor.identificacion,
      doctorTarjetaProfesional: doctor.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctor.especialidad,
      fecha: hoy,
      hora: "02:00 PM",
      estado: "agendada"
    },
    {
      id: `cita-${doctor.id}-4`,
      pacienteId: "pac-4",
      pacienteNombre: "Elena María Restrepo",
      pacienteIdentificacion: "1.111.222",
      pacienteTipoDoc: "CC",
      doctorId: doctor.id as any,
      doctorNombre: doctor.nombre,
      doctorIdentificacion: doctor.identificacion,
      doctorTarjetaProfesional: doctor.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctor.especialidad,
      fecha: mañana,
      hora: "09:15 AM",
      estado: "agendada"
    },
    {
      id: `cita-${doctor.id}-5`,
      pacienteId: "pac-5",
      pacienteNombre: "Samuel David López",
      pacienteIdentificacion: "1.333.444",
      pacienteTipoDoc: "CC",
      doctorId: doctor.id as any,
      doctorNombre: doctor.nombre,
      doctorIdentificacion: doctor.identificacion,
      doctorTarjetaProfesional: doctor.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctor.especialidad,
      fecha: ayer,
      hora: "11:00 AM",
      estado: "atendida",
      recomendaciones: "Paciente presenta mejoría notable. Continuar con el tratamiento prescrito y control en 3 meses."
    },
    {
      id: `cita-${doctor.id}-6`,
      pacienteId: "pac-6",
      pacienteNombre: "Marta Lucía Díaz",
      pacienteIdentificacion: "1.555.666",
      pacienteTipoDoc: "CC",
      doctorId: doctor.id as any,
      doctorNombre: doctor.nombre,
      doctorIdentificacion: doctor.identificacion,
      doctorTarjetaProfesional: doctor.tarjetaProfesional,
      consultorio: "301",
      especialidad: doctor.especialidad,
      fecha: ayer,
      hora: "03:30 PM",
      estado: "atendida",
      recomendaciones: "Se ajustó la dosis de medicación. Vigilar signos de alarma y reportar cualquier síntoma inusual."
    }
  ];

  const currentCitas = getCitas();
  localStorage.setItem(CITAS_KEY, JSON.stringify([...currentCitas, ...initialCitas]));
}

/**
 * Genera de forma dinámica recomendaciones médicas basadas en la especialidad de la cita.
 * Simula el criterio de un asistente médico inteligente tras una consulta.
 * 
 * @param cita La cita atendida para la cual se generan los consejos.
 * @returns Una cadena con múltiples líneas de recomendaciones numeradas.
 */
export function generateAgentRecommendation(cita: Cita): string {
  const recommendations: Record<string, string[]> = {
    "Medicina General": [
      "Acetaminofén 500mg: 1 tableta cada 6 horas por 3 días.",
      "Loratadina 10mg: 1 tableta diaria en la noche por 5 días.",
      "Vitamina C: 1 gramo efervescente al día."
    ],
    "Pediatría": [
      "Suero oral: 2 onzas después de cada episodio de emesis.",
      "Control térmico riguroso cada 4 horas.",
      "Dieta blanda: Sin lácteos ni irritantes por 48 horas."
    ],
    "Cardiología": [
      "Ácido Acetilsalicílico 100mg: 1 tableta diaria con el almuerzo.",
      "Atorvastatina 20mg: 1 tableta antes de dormir.",
      "Reducir sodio: Evitar embutidos y alimentos procesados."
    ],
    "Oftalmología": [
      "Gotas Lubricantes (Lágrimas): 1 gota cada 4 horas.",
      "Paños de agua tibia sobre párpados: 5 min al día.",
      "Uso de gafas oscuras en exteriores por 48 horas."
    ],
    "Neurología": [
      "Complejo B: 1 gragea cada 12 horas por 10 días.",
      "Higiene del sueño: Evitar pantallas tras las 9 PM.",
      "Reposo relativo en ambiente con poca iluminación."
    ],
    "Ginecología": [
      "Ácido Fólico 5mg: 1 tableta diaria con el desayuno.",
      "Calcio + Vitamina D: 1 tableta diaria.",
      "Consulta inmediata ante cualquier signo de alarma abdominal."
    ]
  };

  const genericPool = [
    "Hidratación oral constante. Evitar bebidas azucaradas.",
    "Control de signos vitales por enfermería si hay cambios térmicos.",
    "Seguir pautas de higiene y ventilación en el hogar.",
    "No suspender el tratamiento sin previa consulta profesional."
  ];

  let selected = recommendations[cita.especialidad] || recommendations["Medicina General"];
  const randomGeneric = genericPool[Math.floor(Math.random() * genericPool.length)];
  selected = [...selected, randomGeneric].sort(() => Math.random() - 0.5);

  return selected.map((r, i) => `${i + 1}. ${r}`).join("\n");
}

/** Ejemplos genéricos de reportes clínicos para simular resultados rápidos */
export const recomendacionesMock = [
  "Tomar los medicamentos recetados según las indicaciones. Descansar adecuadamente y mantener una dieta balanceada. Asistir a la cita de control en 15 días.",
  "Realizar los exámenes de laboratorio indicados antes de la próxima consulta. Evitar esfuerzos físicos intensos durante una semana. Hidratarse constantemente.",
  "Seguir el tratamiento farmacológico prescrito. Aplicar compresas frías en la zona afectada 3 veces al día. Agendar cita de seguimiento en 10 días.",
  "Mantener reposo relativo por 5 días. Tomar abundantes líquidos. Si los síntomas persisten o empeoran, acudir a urgencias inmediatamente.",
  "Iniciar terapia física 2 veces por semana. Evitar cargar objetos pesados. Control con especialista en 3 semanas.",
];
