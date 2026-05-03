/**
 * Reglas compartidas de agenda para la interfaz del paciente.
 * La aplicación maneja fechas en UTC, pero la política operativa se evalúa
 * explícitamente contra la zona horaria de Colombia (America/Bogota).
 */

const COLOMBIA_TIME_ZONE = "America/Bogota";
const COLOMBIA_OFFSET = "-05:00";

export const WORKING_DAYS = [1, 2, 3, 4, 5, 6];
export const WORKING_HOURS = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Cuando el calendario trabaja con UTC, usamos los getters UTC para conservar
 * el día exacto que seleccionó el usuario y no desplazarlo al convertir zonas.
 */
export function getUtcDateString(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function getColombiaNowContext(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: COLOMBIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  return {
    today: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function resolveDateString(date: Date | string): string {
  return typeof date === "string" ? date : getUtcDateString(date);
}

function getWeekdayInColombia(date: Date | string): number {
  const dateString = resolveDateString(date);
  return new Date(`${dateString}T12:00:00${COLOMBIA_OFFSET}`).getUTCDay();
}

function buildColombiaDateTime(date: Date | string, hour: string): Date {
  return new Date(`${resolveDateString(date)}T${hour}:00${COLOMBIA_OFFSET}`);
}

export function canScheduleOnDate(date: Date | string, now = new Date()): boolean {
  const selectedDate = resolveDateString(date);
  const { today, hour, minute } = getColombiaNowContext(now);

  if (selectedDate < today) {
    return false;
  }

  if (!WORKING_DAYS.includes(getWeekdayInColombia(date))) {
    return false;
  }

  if (selectedDate === today) {
    const currentMinutes = hour * 60 + minute;
    return currentMinutes >= 7 * 60 && currentMinutes <= 16 * 60;
  }

  return true;
}

export function validateAppointmentSelection(
  date: Date | string,
  hour: string,
  now = new Date(),
): string | null {
  const selectedDate = resolveDateString(date);
  const { today, hour: currentHour, minute: currentMinute } = getColombiaNowContext(now);

  if (!WORKING_DAYS.includes(getWeekdayInColombia(date))) {
    return "Solo puedes agendar o reprogramar citas de lunes a sábado.";
  }

  if (!WORKING_HOURS.includes(hour)) {
    return "La hora seleccionada está fuera de los bloques habilitados por la app.";
  }

  if (selectedDate < today) {
    return "No puedes agendar o reprogramar citas en fechas anteriores.";
  }

  if (selectedDate === today) {
    const currentMinutes = currentHour * 60 + currentMinute;

    if (currentMinutes < 7 * 60 || currentMinutes > 16 * 60) {
      return "Las citas del mismo día solo pueden solicitarse dentro del horario laboral de 07:00 a 17:00.";
    }

    const selectedDateTime = buildColombiaDateTime(date, hour);
    const currentColombiaDateTime = new Date(`${today}T${pad(currentHour)}:${pad(currentMinute)}:00${COLOMBIA_OFFSET}`);
    const minTime = new Date(currentColombiaDateTime.getTime() + 60 * 60 * 1000);

    if (selectedDateTime <= minTime) {
      return "Debes agendar o reprogramar tu cita con al menos 1 hora de anticipación.";
    }
  }

  return null;
}

export function getCurrentColombiaDateString(now = new Date()): string {
  return getColombiaNowContext(now).today;
}
