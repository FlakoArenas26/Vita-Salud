/**
 * Reglas compartidas de agenda para la interfaz del paciente.
 * Estas validaciones usan la hora de Colombia (America/Bogota) y no la hora
 * local del navegador, para mantener consistencia con el backend y la base de datos.
 */

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

function getColombiaDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  return {
    year: Number(parts.year),
    month: Number(parts.month) - 1,
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function normalizeDate(date: Date): Date {
  const { year, month, day } = getColombiaDateParts(date);
  return new Date(year, month, day);
}

function buildColombiaDateTime(date: Date, hour: string): Date {
  const { year, month, day } = getColombiaDateParts(date);
  const formattedDate = `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return new Date(`${formattedDate}T${hour}:00-05:00`);
}

export function isWorkingDay(date: Date): boolean {
  return WORKING_DAYS.includes(normalizeDate(date).getDay());
}

export function canScheduleOnDate(date: Date, now = new Date()): boolean {
  const selectedDay = normalizeDate(date);
  const today = normalizeDate(now);

  if (selectedDay < today) {
    return false;
  }

  if (!isWorkingDay(date)) {
    return false;
  }

  if (selectedDay.getTime() === today.getTime()) {
    const colombiaNow = getColombiaDateParts(now);
    const currentMinutes = colombiaNow.hour * 60 + colombiaNow.minute;
    const lastPossibleRequest = 16 * 60;
    const isWithinOperationalWindow = currentMinutes >= 7 * 60 && currentMinutes <= lastPossibleRequest;

    return isWithinOperationalWindow;
  }

  return true;
}

export function validateAppointmentSelection(
  date: Date,
  hour: string,
  now = new Date(),
): string | null {
  if (!isWorkingDay(date)) {
    return "Solo puedes agendar o reprogramar citas de lunes a sábado.";
  }

  if (!WORKING_HOURS.includes(hour)) {
    return "La hora seleccionada está fuera de los bloques habilitados por la app.";
  }

  if (!canScheduleOnDate(date, now)) {
    const selectedDay = normalizeDate(date);
    const today = normalizeDate(now);

    if (selectedDay < today) {
      return "No puedes agendar o reprogramar citas en fechas anteriores.";
    }

    if (selectedDay.getTime() === today.getTime()) {
      return "Las citas del mismo día solo pueden solicitarse dentro del horario laboral de 07:00 a 17:00.";
    }
  }

  const selectedDateTime = buildColombiaDateTime(date, hour);
  const colombiaNow = getColombiaDateParts(now);
  const currentTime = new Date(
    `${String(colombiaNow.year).padStart(4, '0')}-${String(colombiaNow.month + 1).padStart(2, '0')}-${String(colombiaNow.day).padStart(2, '0')}T${String(colombiaNow.hour).padStart(2, '0')}:${String(colombiaNow.minute).padStart(2, '0')}:00-05:00`,
  );
  const minTime = new Date(currentTime.getTime() + 60 * 60 * 1000);

  if (normalizeDate(date).getTime() === normalizeDate(now).getTime() && selectedDateTime <= minTime) {
    return "Debes agendar o reprogramar tu cita con al menos 1 hora de anticipación.";
  }

  return null;
}
