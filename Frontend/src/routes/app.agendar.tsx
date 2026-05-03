/**
 * @fileoverview Página de agendamiento de citas médicas
 *
 * Funcionalidades principales:
 * - Búsqueda y filtrado de médicos por especialidad y ubicación
 * - Selección de fecha con validaciones (no fechas anteriores)
 * - Selección de hora con verificación de disponibilidad
 * - Restricción de agenda a días y bloques hábiles del sistema
 * - Validaciones de tiempo estrictas (mínimo 1 hora de anticipación)
 * - Zona horaria Colombia (GMT-5) para todas las validaciones
 *
 * Validaciones implementadas:
 * - No permite agendar en fechas anteriores al día actual
 * - No permite agendar los domingos ni bloques fuera de 07:00 a 17:00
 * - Si la solicitud se hace fuera del horario laboral del día actual, se bloquea la agenda del mismo día
 * - Si es el mismo día, requiere mínimo 1 hora de anticipación
 * - Verifica disponibilidad horaria del médico seleccionado
 *
 * @author Vita-Salud Team
 * @version 2.0.0
 * @since 2026-05-01
 */

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  ChevronDownIcon,
  SearchX,
  CheckCircle2,
} from "lucide-react";
import { getCurrentUser, type Cita, type Doctor } from "@/lib/auth";
import { apiService } from "@/lib/apiService";
import {
  canScheduleOnDate,
  getUtcDateString,
  validateAppointmentSelection,
  WORKING_HOURS,
} from "@/lib/appointmentRules";
import {
  fetchDepartamentos,
  fetchCiudadesByDepartamento,
  type Departamento,
  type Ciudad,
} from "@/lib/colombiaApi";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import Swal from "sweetalert2";

/**
 * Página encargada del proceso de agendamiento de nuevas citas médicas.
 * Permite filtrar médicos por especialidad y ubicación, seleccionar fecha y hora, y confirmar la reserva.
 *
 * Flujo de agendamiento:
 * 1. Seleccionar especialidad médica
 * 2. Filtrar por departamento y ciudad
 * 3. Elegir médico disponible
 * 4. Seleccionar fecha (con validaciones de tiempo)
 * 5. Elegir hora disponible
 * 6. Confirmar agendamiento
 *
 * @returns {JSX.Element} Página de agendamiento de citas
 */
export default function AgendarCitaPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Estados para la selección de la cita
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState<Date>();
  const [hora, setHora] = useState("");
  const [bookedHours, setBookedHours] = useState<string[]>([]);

  // Estados para los filtros de búsqueda
  const [userProfile, setUserProfile] = useState<any>(null);
  const [departamentoId, setDepartamentoId] = useState("");
  const [ciudadId, setCiudadId] = useState("");
  const [departamentoNombre, setDepartamentoNombre] = useState("");
  const [ciudadNombre, setCiudadNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar perfil del usuario para obtener ubicación real de la BD
  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, doctorsRes] = await Promise.all([
          apiService.users.getProfile(),
          apiService.users.getDoctors()
        ]);
        
        const profile = profileRes.data;
        setUserProfile(profile);
        setDepartamentoId(String(profile.departamentoId || ""));
        setCiudadId(String(profile.ciudadId || ""));
        setDoctores(doctorsRes.data);

        // Fetch location names dynamically from the Colombia API based on the user's IDs
        if (profile.departamentoId) {
          try {
            const depts = await fetchDepartamentos();
            const dept = depts.find((d) => d.id === Number(profile.departamentoId));
            if (dept) {
              setDepartamentoNombre(dept.name);
              if (profile.ciudadId) {
                const cities = await fetchCiudadesByDepartamento(dept.id);
                const city = cities.find((c) => c.id === Number(profile.ciudadId));
                if (city) {
                  setCiudadNombre(city.name);
                }
              }
            }
          } catch (apiError) {
            console.error("Error fetching location names:", apiError);
          }
        }
      } catch (error) {
        console.error("Error loading scheduling data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Impedir acceso si no hay usuario autenticado
  if (!user) return null;

  // 2. Cargar disponibilidad del doctor cuando cambia la fecha o el doctor seleccionado
  useEffect(() => {
    async function fetchAvailability() {
      if (doctorId && date) {
        try {
          const fechaFormat = getUtcDateString(date);
          const response = await apiService.appointments.getDoctorAvailability(doctorId, fechaFormat);
          setBookedHours(response.data || []);
        } catch (error) {
          console.error("Error fetching doctor availability:", error);
          setBookedHours([]);
        }
      } else {
        setBookedHours([]);
      }
    }
    fetchAvailability();
  }, [doctorId, date]);

  /** Listado de especialidades disponibles para filtrar */
  const especialidadesFiltrables = [
    "Medicina General",
    "Pediatría",
    "Oftalmología",
    "Cardiología",
    "Neurología",
    "Ginecología",
  ];

  /** Bloques de horario permitidos para las citas según la política operativa */
  const horasDisponibles = WORKING_HOURS;

  /**
   * Filtro Estricto: Solo muestra médicos que coincidan exactamente con la ubicación del usuario.
   */
  const doctoresFiltrados = doctores.filter((d) => {
    const coincideUbicacion = 
      d.activo && 
      d.departamentoId === parseInt(departamentoId) && 
      d.ciudadId === parseInt(ciudadId);
      
    const coincideEspecialidad = !especialidad || d.especialidad === especialidad;
    
    return coincideUbicacion && coincideEspecialidad;
  });

  /** Referencia al médico seleccionado actualmente */
  const selectedDoctor = doctores.find((d) => d.id === doctorId);

  /**
   * Procesa el envío del formulario de agendamiento.
   * Valida campos, genera datos adicionales de la cita y la guarda en el sistema.
   *
   * @param ev Evento de envío del formulario.
   */
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();

    // Validar que todos los campos requeridos estén presentes
    if (!doctorId || !date || !hora) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Selecciona el médico, la fecha y el bloque de hora.",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    const scheduleError = validateAppointmentSelection(date, hora, new Date());
    if (scheduleError) {
      Swal.fire({
        icon: "error",
        title: "Horario no disponible",
        text: scheduleError,
        timer: 3500,
        showConfirmButton: false,
      });
      return;
    }

    const doctor = doctores.find((d) => d.id === doctorId);
    if (!doctor) return;

    const fechaFormat = getUtcDateString(date);

    /**
     * Creación del objeto Cita con datos del paciente, médico y detalles de la reserva.
     * Se simulan datos como consultorio para realismo.
     */
    /**
     * Creación del objeto Cita con datos del paciente, médico y detalles de la reserva.
     * Se simulan datos como consultorio para realismo.
     */
    try {
      await apiService.appointments.create({
        doctorId: doctor.id,
        fecha: fechaFormat,
        hora,
        consultorio: `${Math.floor(Math.random() * 5 + 1)}0${Math.floor(Math.random() * 9 + 1)}`,
        especialidad: doctor.especialidad,
      });

      await Swal.fire({
        icon: "success",
        title: "Se ha agendado tu cita",
        text: `Tu cita con ${doctor.nombre} está agendada para ${format(date, "PPP", { locale: es })} a las ${hora}.`,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      navigate("/app"); // Redirigir al dashboard tras confirmar
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo agendar la cita", "error");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-ring outline-none";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
          Agendar Nueva Cita
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Encuentra a los mejores especialistas más cerca de ti y reserva al instante.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección: Filtros de Localización y Especialidad */}
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            Filtros de Búsqueda
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">
                Especialidad
              </label>
              <Combobox
                items={especialidadesFiltrables.map((e) => ({ value: e, label: e }))}
                value={especialidad}
                onValueChange={setEspecialidad}
                itemValue={(item) => item.value}
                itemLabel={(item) => item.label}
              >
                <ComboboxInput placeholder="Cualquiera" className={inputClass} />
                <ComboboxContent>
                  <ComboboxEmpty>No encontrada</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => <ComboboxItem item={item}>{item.label}</ComboboxItem>}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">
                Departamento
              </label>
              <div className={inputClass + " bg-muted cursor-not-allowed flex items-center"}>
                {departamentoNombre || "No configurado"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">
                Ciudad / Municipio
              </label>
              <div className={inputClass + " bg-muted cursor-not-allowed flex items-center"}>
                {ciudadNombre || "No configurado"}
              </div>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground italic bg-accent/30 p-2 rounded-lg border border-border/50">
            * Tu ubicación está preconfigurada según tu registro. Si necesitas buscar en otra
            ciudad, por favor actualízala en la sección de <strong>Configuración</strong>.
          </p>
        </div>

        {/* Sección: Listado Progresivo de Médicos Disponibles */}
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="h-4 w-4" /> Selección de Médico
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {doctoresFiltrados.length === 0 ? (
              <div className="col-span-full py-12 text-center space-y-4 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Stethoscope className="h-8 w-8 text-primary/40" />
                </div>
                <div className="space-y-2 max-w-md mx-auto px-4">
                  <h3 className="font-bold text-foreground">Disponibilidad en tu zona</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Actualmente no contamos con especialistas en tu ubicación. Estamos expandiendo nuestra red médica para brindarte la mejor atención muy pronto.
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                      Próximamente más cobertura
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              doctoresFiltrados.map((d) => (
                <label
                  key={d.id}
                  className={`relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    doctorId === String(d.id)
                      ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                      : "border-border hover:border-primary/40 hover:bg-accent/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="doctor"
                    value={d.id}
                    checked={doctorId === String(d.id)}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-foreground leading-tight truncate pr-4">
                        {d.nombre}
                      </p>
                      {doctorId === String(d.id) && (
                        <CheckCircle2 className="h-4 w-4 text-primary absolute right-4 top-4" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {d.especialidad}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2 bg-muted px-2 py-0.5 rounded-full inline-block">
                      ★ {d.experienciaAnios || 5} años exp.
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Sección: Selección Dinámica de Fecha y Hora */}
        <AnimatePresence>
          {doctorId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
                <h2 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" /> Eligiendo tu Fecha y Hora
                </h2>

                <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
                  <div className="flex-none">
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">
                      Calendario
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-[260px] justify-between text-left font-normal py-6 rounded-xl border-2 hover:border-primary/50 transition-colors ${!date ? "text-muted-foreground" : "text-foreground font-medium border-primary/50 bg-primary/5"}`}
                        >
                          {date ? (
                            format(date, "PPP", { locale: es })
                          ) : (
                            <span>Elige una fecha...</span>
                          )}
                          <ChevronDownIcon className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => !canScheduleOnDate(d)}
                          initialFocus
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[260px]">
                      Solo se habilitan citas de lunes a sábado en los bloques operativos de 07:00 a 17:00.
                    </p>
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">
                      Bloque de Hora
                    </label>
                    {!date ? (
                      <div className="h-full min-h-[100px] flex items-center justify-center text-sm text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border/50">
                        Selecciona un día para ver disponibilidad
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {horasDisponibles.map((h) => {
                          const isSelected = hora === h;
                          const selectedDateError = validateAppointmentSelection(date, h, new Date());
                          // Verificar disponibilidad real desde el backend
                          const isOccupied = bookedHours.includes(h);
                          const isDisabled = isOccupied || Boolean(selectedDateError);

                          return (
                            <button
                              key={h}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setHora(h)}
                              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                isDisabled
                                  ? "bg-muted text-muted-foreground/40 opacity-50 cursor-not-allowed border border-transparent"
                                  : isSelected
                                    ? "bg-primary text-primary-foreground shadow-md scale-105 border border-primary"
                                    : "bg-card border-2 border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5 text-foreground"
                              }`}
                            >
                              {h}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tarjeta de Resumen Final de Reserva */}
        {selectedDoctor && date && hora && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-primary/10 via-background to-background rounded-2xl p-6 border-l-4 border-l-primary border-t border-r border-b border-border shadow-sm"
          >
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-3">
              Resumen de Agendamiento
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">
                    Especialista
                  </p>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {selectedDoctor.nombre}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">
                    Cita Médica
                  </p>
                  <p className="text-sm font-bold text-foreground leading-tight capitalize">
                    {format(date, "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Hora</p>
                  <p className="text-sm font-bold text-foreground leading-tight">{hora}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full text-lg py-7 rounded-2xl shadow-lg mt-6"
          disabled={!doctorId || !date || !hora}
        >
          Confirmar y Agendar Cita
        </Button>
      </form>
    </div>
  );
}
