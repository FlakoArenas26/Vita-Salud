/**
 * @fileoverview Dashboard principal de Vita-Salud
 *
 * Este archivo contiene los componentes principales del dashboard que manejan:
 * - Panel de administración con gestión de usuarios y médicos
 * - Panel de médico con gestión de citas y notificaciones en tiempo real
 * - Panel de paciente con agendamiento, reprogramación y filtros de citas
 *
 * @author Vita-Salud Team
 * @version 2.0.0
 * @since 2026-05-01
 */

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Power,
  FileSpreadsheet,
  MapPin,
} from "lucide-react";
import {
  getCurrentUser,
  generateAgentRecommendation,
  type Cita,
  especialidades,
  type Doctor,
} from "@/lib/auth";
import { apiService } from "@/lib/apiService";
import {
  canScheduleOnDate,
  getCurrentColombiaDateString,
  validateAppointmentSelection,
  WORKING_HOURS,
} from "@/lib/appointmentRules";
import { DoctorRegisterForm } from "@/components/auth/AuthForms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Swal from "sweetalert2";
import {
  fetchCiudadesByDepartamento,
  fetchDepartamentos,
  type Ciudad,
  type Departamento,
} from "@/lib/colombiaApi";

/**
 * Componente principal de la página del Panel de Control (Dashboard).
 * Muestra contenido diferente según el rol del usuario.
 */
export default function DashboardPage() {
  const user = getCurrentUser();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <DashboardHeader user={user} />
      {user.rol === "medico" ? (
        <MedicoDashboard user={user as Doctor} />
      ) : user.rol === "admin" ? (
        <AdminDashboard user={user} />
      ) : (
        <PacienteDashboard user={user} />
      )}
    </div>
  );
}

/**
 * Header dinámico según el rol del usuario.
 * Cada rol tiene título, descripción y botones de acción diferentes.
 */
function DashboardHeader({ user }: { user: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          {user.rol === "paciente" && (
            <>
              <h1 className="text-2xl font-bold text-foreground font-heading">
                Hola, {user.nombre.split(" ")[0]} 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Panel de gestión de citas médicas.
              </p>
            </>
          )}
          {user.rol === "medico" && (
            <>
              <h1 className="text-2xl font-bold text-foreground font-heading">
                Hola, {user.nombre} 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gestión de citas de tus pacientes.
              </p>
            </>
          )}
          {user.rol === "admin" && (
            <>
              <h1 className="text-2xl font-bold text-foreground font-heading">
                Panel de Administración 👨‍💼
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gestiona de médicos del sistema.
              </p>
            </>
          )}
        </div>

        {/* Botones dinámicos según el rol */}
        <div className="flex gap-2">
          {user.rol === "paciente" && (
            <Link to="/app/agendar">
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Cita
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

type AppointmentNotificationSnapshot = {
  estado: Cita["estado"];
  fecha: string;
  hora: string;
  tieneRecomendaciones: boolean;
};

function buildAppointmentSnapshot(cita: Cita): AppointmentNotificationSnapshot {
  return {
    estado: cita.estado,
    fecha: cita.fecha,
    hora: cita.hora,
    tieneRecomendaciones: Boolean(cita.recomendaciones?.trim()),
  };
}

function wasAppointmentRescheduled(
  previous: AppointmentNotificationSnapshot,
  current: AppointmentNotificationSnapshot,
): boolean {
  return previous.fecha !== current.fecha || previous.hora !== current.hora;
}

/**
 * Dashboard para pacientes.
 */
/**
 * Componente del dashboard para pacientes
 *
 * Funcionalidades principales:
 * - Visualización de citas con filtros (todas, agendadas, atendidas, canceladas)
 * - Agendamiento de nuevas citas
 * - Reprogramación de citas existentes con validaciones de tiempo
 * - Cancelación de citas con reglas de negocio
 * - Notificaciones en tiempo real de cambios en citas atendidas
 * - Ordenamiento automático por fecha y hora ascendente
 *
 * Validaciones implementadas:
 * - No permite agendar/reprogramar en fechas anteriores
 * - No permite agendar o reprogramar los domingos ni fuera del horario operativo
 * - Requiere mínimo 1 hora de anticipación para citas del mismo día
 * - Zona horaria Colombia (GMT-5)
 *
 * @param {Object} props - Propiedades del componente
 * @param {any} props.user - Usuario autenticado
 * @returns {JSX.Element} Dashboard del paciente
 */
function PacienteDashboard({ user }: { user: any }) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [showReprogramarModal, setShowReprogramarModal] = useState(false);
  const [citaToReschedule, setCitaToReschedule] = useState<Cita | null>(null);
  const [newFecha, setNewFecha] = useState("");
  const [newHora, setNewHora] = useState("");
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<"todas" | "agendadas" | "atendidas" | "canceladas">("todas");

  /** Bloques de horario permitidos para las citas */
  const horasDisponibles = WORKING_HOURS;
  const patientNotificationStorageKey = "pacienteCitaSnapshots";

  /**
   * Carga las citas del paciente actual al montar el componente o cambiar el usuario.
   */
  const loadCitas = async () => {
    try {
      const response = await apiService.appointments.getAll();
      setCitas(response.data);
      return response.data;
    } catch (error) {
      console.error("Error loading appointments:", error);
      return [];
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // Ignorar fallos de permiso.
      }
    }
  };

  const showBrowserNotification = async (title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
      return;
    }

    if (Notification.permission === "default") {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification(title, { body });
        }
      } catch {
        // Ignorar si el usuario cierra el prompt.
      }
    }
  };

  /**
   * Sincroniza notificaciones del paciente para reprogramaciones externas y
   * recomendaciones cargadas por el médico.
   * Actualizado 2026-05-02: Agregado trigger explícito para recomendaciones y cancelaciones,
   * reducido polling a 10s para menor latencia.
   */
  const syncPatientNotifications = (serverCitas: Cita[], isInitial = false) => {
    const previousSnapshots = JSON.parse(
      localStorage.getItem(patientNotificationStorageKey) || "{}",
    ) as Record<string, AppointmentNotificationSnapshot>;
    const nextSnapshots: Record<string, AppointmentNotificationSnapshot> = {};

    serverCitas.forEach((cita) => {
      const previous = previousSnapshots[cita.id];
      const current = buildAppointmentSnapshot(cita);
      nextSnapshots[cita.id] = current;

      if (isInitial || !previous) {
        return;
      }

      if (cita.estado === "agendada" && wasAppointmentRescheduled(previous, current)) {
        const title = "Cita reprogramada";
        const text = `Tu cita con ${cita.doctorNombre} fue reprogramada para ${cita.fecha} a las ${cita.hora}.`;

        void showBrowserNotification(title, text);

        Swal.fire({
          icon: "info",
          title,
          text,
          position: "center",
          showConfirmButton: false,
          timer: 3500,
        });
        return;
      }

      if (previous.estado !== cita.estado && cita.estado === "cancelada") {
        const title = "Cita cancelada";
        const text = `Tu cita de ${cita.especialidad} para ${cita.fecha} a las ${cita.hora} ha sido cancelada.`;

        void showBrowserNotification(title, text);

        Swal.fire({
          icon: "warning",
          title,
          text,
          position: "center",
          showConfirmButton: false,
          timer: 3500,
        });
        return;
      }

      const recommendationsReady =
        cita.estado === "atendida" &&
        current.tieneRecomendaciones &&
        (!previous.tieneRecomendaciones || previous.estado !== "atendida");

      if (!recommendationsReady) {
        return;
      }

      void showBrowserNotification(
        "Recomendaciones listas",
        `El doctor ${cita.doctorNombre} ha cargado las recomendaciones de tu cita.`,
      );

      Swal.fire({
        icon: "info",
        title: "Recomendaciones listas",
        text: `Se han cargado las recomendaciones de tu cita de ${cita.especialidad}.`,
        position: "center",
        showConfirmButton: false,
        timer: 3500,
      });
    });

    localStorage.setItem(patientNotificationStorageKey, JSON.stringify(nextSnapshots));
  };

  useEffect(() => {
    async function loadAndSyncPatientAppointments() {
      if (!user?.id) {
        return;
      }

      const serverCitas = await loadCitas();
      syncPatientNotifications(serverCitas, true);
    }

    loadAndSyncPatientAppointments();
  }, [user?.id]);

  // Permisos de Notificación
  useEffect(() => {
    void requestNotificationPermission();
  }, []);

  // Polling de citas para notificaciones
  useEffect(() => {
    const refreshNotifications = async () => {
      try {
        const serverCitas = await loadCitas();
        syncPatientNotifications(serverCitas, false);
      } catch (error) {
        // Ignorar
      }
    };

    // Polling cada 5 segundos para notificaciones de pacientes (reducido de 30s para menor latencia)
    const interval = setInterval(refreshNotifications, 5000);
    const handleWindowFocus = () => {
      void refreshNotifications();
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [user?.id]);

  useEffect(() => {
    async function fetchDisponibilidad() {
      if (citaToReschedule && newFecha) {
        try {
          const response = await apiService.appointments.getDoctorAvailability(
            citaToReschedule.doctorId,
            newFecha,
          );
          const bookedHours = response.data || [];
          // Calcular horas disponibles: todas menos las ocupadas, y excluir siempre la hora original de la cita
          const available = horasDisponibles.filter(
            (h) =>
              !bookedHours.includes(h) &&
              h !== citaToReschedule.hora &&
              !validateAppointmentSelection(newFecha, h, new Date()),
          );
          setAvailableHours(available);
          setNewHora(""); // Reset hora al cambiar fecha
        } catch (error) {
          console.error("Error cargando disponibilidad:", error);
          setAvailableHours([]);
        }
      }
    }
    fetchDisponibilidad();
  }, [newFecha, citaToReschedule]);

  /**
   * Abre el modal de reprogramación.
   */
  function openReprogramar(cita: Cita) {
    setCitaToReschedule(cita);
    setNewFecha("");
    setNewHora("");
    setAvailableHours([]);
    setShowReprogramarModal(true);
  }

  /**
   * Ejecuta la reprogramación de una cita con validaciones estrictas de tiempo.
   *
   * Validaciones implementadas:
   * - No permite reprogramar a fechas anteriores al día actual
   * - Si es el mismo día, requiere mínimo 1 hora de anticipación
   * - Zona horaria Colombia (GMT-5) para todas las validaciones
   * - Verifica que la nueva fecha/hora esté disponible
   *
   * @async
   * @throws {Error} Si faltan campos requeridos o no pasan las validaciones
   */
  async function submitReprogramar() {
    if (!citaToReschedule || !newFecha || !newHora) {
      Swal.fire("Error", "Debe seleccionar una nueva fecha y hora.", "error");
      return;
    }

    const scheduleError = validateAppointmentSelection(newFecha, newHora, new Date());
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

    try {
      await apiService.appointments.reschedule(citaToReschedule.id, {
        fecha: newFecha,
        hora: newHora,
      });
      const refreshedCitas = await loadCitas();
      syncPatientNotifications(refreshedCitas, true);
      Swal.fire({
        icon: "success",
        title: "Cita Reprogramada",
        text: "Tu cita ha sido actualizada exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      setShowReprogramarModal(false);
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo reprogramar la cita", "error");
    }
  }

  /**
   * Gestiona la cancelación de una cita médica.
   * Aplica reglas de negocio: no se puede cancelar si falta menos de 1 hora.
   *
   * Validaciones implementadas:
   * - No permite cancelar citas que ya ocurrieron
   * - No permite cancelar citas con menos de 1 hora de anticipación
   * - Requiere confirmación del usuario antes de proceder
   *
   * @param cita Objeto de la cita a cancelar
   * @async
   */
  async function cancelarCita(cita: Cita) {
    // Cálculo del tiempo restante para la cita
    const citaDateStr = `${cita.fecha}T${cita.hora}:00`;
    const citaTime = new Date(citaDateStr).getTime();
    const now = new Date().getTime();

    // Diferencia calculada en horas
    const difHours = (citaTime - now) / (1000 * 60 * 60);

    // Validación: Cita en el pasado
    if (citaTime < now) {
      Swal.fire({
        icon: "error",
        title: "Cita vencida",
        text: "No puedes cancelar una cita que ya ocurrió o está transcurriendo.",
      });
      return;
    }

    // Validación comercial: Política de 1 hora de anticipación
    if (difHours < 1) {
      Swal.fire({
        icon: "error",
        title: "Cancelación DENEGADA",
        text: "Las políticas prohíben cancelar citas cuando falta menos de 1 hora para el encuentro.",
      });
      return;
    }

    // Confirmación de seguridad antes de proceder
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Cancelar tu cita?",
      text: `Estás a punto de cancelar tu cita con ${cita.doctorNombre} (${cita.especialidad}) de forma irreversible.`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar cita",
      cancelButtonText: "No, mantenerla",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      buttonsStyling: true,
    });

    if (result.isConfirmed) {
      try {
        await apiService.appointments.updateStatus(cita.id, { estado: "cancelada" });
        const response = await apiService.appointments.getAll();
        setCitas(response.data);

        Swal.fire({
          icon: "success",
          title: "Cita cancelada",
          text: `Se ha cancelado tu cita de las ${cita.hora}.`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } catch (error: any) {
        Swal.fire("Error", error.message || "No se pudo cancelar la cita", "error");
      }
    }
  }

  // Filtrado y ordenamiento de citas
  const citasFiltradas = citas
    .filter((cita) => {
      if (filtro === "agendadas") {
        return cita.estado === "agendada";
      }
      if (filtro === "atendidas") {
        return cita.estado === "atendida";
      }
      if (filtro === "canceladas") {
        return cita.estado === "cancelada";
      }
      return true; // "todas"
    })
    .sort((a, b) => {
      // Primero ordenar por fecha ascendente
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      
      if (fechaA !== fechaB) {
        return fechaA - fechaB;
      }
      
      // Si las fechas son iguales, ordenar por hora ascendente
      return a.hora.localeCompare(b.hora);
    });

  // Mantener las variables antiguas para compatibilidad
  const citasAgendadas = citas.filter((c) => c.estado === "agendada");
  const citasTerminadas = citas.filter((c) => c.estado === "atendida" || c.estado === "cancelada");

  return (
    <div className="space-y-6">
      {/* Header movido a DashboardHeader */}

      {/* Acción rápida para agendar */}
      <Link
        to="/app/agendar"
        className="block bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl p-5 text-center hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
      >
        <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
        <span className="font-semibold text-foreground">Agendar Nueva Cita</span>
        <p className="text-xs text-muted-foreground mt-1">
          Encuentra a tu especialista y reserva al instante
        </p>
      </Link>

      {/* Sección de Mis Citas con Filtros */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground font-heading flex items-center gap-2">
            Mis Citas
            {citasFiltradas.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {citasFiltradas.length}
              </span>
            )}
          </h2>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filtro === "todas" ? "default" : "outline"}
            onClick={() => setFiltro("todas")}
            size="sm"
          >
            Todas
          </Button>
          <Button
            variant={filtro === "agendadas" ? "default" : "outline"}
            onClick={() => setFiltro("agendadas")}
            size="sm"
          >
            Agendadas
          </Button>
          <Button
            variant={filtro === "atendidas" ? "default" : "outline"}
            onClick={() => setFiltro("atendidas")}
            size="sm"
          >
            Atendidas
          </Button>
          <Button
            variant={filtro === "canceladas" ? "default" : "outline"}
            onClick={() => setFiltro("canceladas")}
            size="sm"
          >
            Canceladas
          </Button>
        </div>

        {citasFiltradas.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center shadow-sm">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">
              {filtro === "todas"
                ? "No tienes citas registradas."
                : filtro === "agendadas"
                  ? "No tienes citas agendadas."
                  : filtro === "atendidas"
                    ? "No tienes citas atendidas."
                    : "No tienes citas canceladas."}
            </p>
            {filtro === "todas" && (
              <Button size="sm" asChild className="mt-4">
                <Link to="/app/agendar">Agendar cita</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {citasFiltradas.map((cita) => (
                <motion.div
                  key={cita.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-card rounded-xl border-2 p-5 shadow-sm relative overflow-hidden ${
                    cita.estado === "agendada"
                      ? "border-primary/20"
                      : cita.estado === "atendida"
                        ? "border-success/30"
                        : "border-destructive/30"
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-2 h-full ${
                    cita.estado === "agendada"
                      ? "bg-primary/20"
                      : cita.estado === "atendida"
                        ? "bg-success/20"
                        : "bg-destructive/20"
                  }`}></div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-semibold uppercase tracking-wider">
                      {cita.especialidad}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 border rounded-full ${
                        cita.estado === "atendida"
                          ? "border-success/30 text-success bg-success/10"
                          : cita.estado === "cancelada"
                            ? "border-destructive/30 text-destructive bg-destructive/10"
                            : "border-primary/30 text-primary bg-primary/10"
                      }`}
                    >
                      {cita.estado === "atendida"
                        ? "Atendida"
                        : cita.estado === "cancelada"
                          ? "Cancelada"
                          : "Próxima"}
                    </span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">{cita.doctorNombre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        {cita.fecha}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground font-bold">{cita.hora}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground font-medium">
                        Consultorio {cita.consultorio}
                      </span>
                    </div>
                  </div>

                  {cita.estado === "agendada" && (
                    <div className="mt-5 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-primary text-primary-foreground shadow-md hover:opacity-90"
                        onClick={() => openReprogramar(cita)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Reprogramar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => cancelarCita(cita)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancelar cita
                      </Button>
                    </div>
                  )}

                  {cita.estado === "atendida" && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Link
                        to={`/app/cita/${cita.id}`}
                        className="text-primary text-sm font-medium hover:underline inline-block"
                      >
                        Ver recomendaciones →
                      </Link>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Modal Reprogramar */}
      {showReprogramarModal && citaToReschedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-heading">Reprogramar Cita</h3>
              <button
                onClick={() => setShowReprogramarModal(false)}
                className="p-2 hover:bg-muted rounded-full"
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
                <p>
                  <strong>Médico:</strong> {citaToReschedule.doctorNombre}
                </p>
                <p>
                  <strong>Especialidad:</strong> {citaToReschedule.especialidad}
                </p>
                <p>
                  <strong>Consultorio:</strong> {citaToReschedule.consultorio}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nueva Fecha</label>
                <Input
                  type="date"
                  value={newFecha}
                  onChange={(e) => {
                    const nextDate = e.target.value;
                    if (!nextDate) {
                      setNewFecha("");
                      return;
                    }

                    if (!canScheduleOnDate(nextDate)) {
                      setNewFecha(nextDate);
                      setAvailableHours([]);
                      setNewHora("");
                      return;
                    }

                    setNewFecha(nextDate);
                  }}
                  min={getCurrentColombiaDateString()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Agenda disponible de lunes a sábado en bloques entre 07:00 y 17:00.
                </p>
              </div>

              {newFecha && (
                <div>
                  <label className="block text-sm font-medium mb-1">Nueva Hora</label>
                  {availableHours.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                      {availableHours.map((horaOp) => (
                        <button
                          key={horaOp}
                          type="button"
                          onClick={() => setNewHora(horaOp)}
                          className={`p-2 rounded-lg text-sm font-medium transition-all ${
                            newHora === horaOp
                              ? "bg-primary text-primary-foreground shadow-md scale-105"
                              : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                          }`}
                        >
                          {horaOp}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg text-center">
                      No hay horarios disponibles para la fecha seleccionada.
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-border flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReprogramarModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={submitReprogramar}
                  disabled={!newFecha || !newHora}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Dashboard para administradores.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AdminDashboard({ user }: { user: any }) {
  const [medicos, setMedicos] = useState<Doctor[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedico, setEditingMedico] = useState<Doctor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "activos" | "inactivos">("todos");

  useEffect(() => {
    async function loadMedicos() {
      try {
        const response = await apiService.users.getDoctors();
        // Ordenar por fecha de registro descendente (más reciente primero)
        const sorted = response.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
        );
        setMedicos(sorted);
      } catch (error) {
        console.error("Error loading doctors:", error);
      }
    }
    loadMedicos();
  }, []);

  const refreshMedicos = async () => {
    try {
      const response = await apiService.users.getDoctors();
      const sorted = response.data.sort(
        (a: any, b: any) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
      setMedicos(sorted);
    } catch (error) {
      console.error("Error refreshing doctors:", error);
    }
  };

  const handleBulkImport = () => {
    handleFileUpload({ target: { files: [] } } as any);
  };

  const handleDownloadTemplate = () => {
    console.log("Iniciando descarga de plantilla CSV...");
    try {
      const headers =
        "nombre, especialidad, identificacion, tarjetaProfesional, departamentoId, ciudadId, email, password\n";
      const example =
        "Dr. Juan Pérez, Medicina General, 123456789, TP12345, 11, 11001, juan@example.com, password123\n";
      const csvContent = headers + example;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "plantilla_medicos.csv");
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Limpieza con pequeño delay para asegurar que el navegador procese el click
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      Swal.fire({
        title: "Plantilla Descargada",
        text: "El archivo plantilla_medicos.csv se ha generado correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al descargar la plantilla:", error);
      Swal.fire("Error", "No se pudo generar la descarga", "error");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        // Dividir por líneas y filtrar vacías
        const lines = csv.split(/\r?\n/).filter((line) => line.trim());

        if (lines.length < 2) {
          Swal.fire("Error", "El archivo CSV debe tener al menos una fila de datos", "error");
          return;
        }

        // Limpiar BOM si existe y detectar delimitador
        const headerLine = lines[0].replace(/^\uFEFF/, "");
        const delimiter = headerLine.includes(";") ? ";" : ",";

        // Normalizar headers
        const rawHeaders = headerLine.split(delimiter).map((h) => h.trim());
        const normalizedHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/\s+/g, ""));

        console.log("Headers detectados:", rawHeaders);

        const expectedMapping: Record<string, string> = {
          nombre: "nombre",
          especialidad: "especialidad",
          identificacion: "identificacion",
          tarjetaprofesional: "tarjetaProfesional",
          departamentoid: "departamentoId",
          ciudadid: "ciudadId",
          email: "email",
          password: "password",
        };

        const missingHeaders = Object.keys(expectedMapping).filter(
          (h) => !normalizedHeaders.includes(h),
        );
        if (missingHeaders.length > 0) {
          Swal.fire(
            "Error",
            `El archivo CSV no tiene los headers requeridos: ${missingHeaders.join(", ")}`,
            "error",
          );
          return;
        }

        const nuevosMedicos = [];
        for (let i = 1; i < lines.length; i++) {
          let currentLine = lines[i].trim();
          if (!currentLine) continue;

          // Reparación de emergencia: si la línea está mal citada por Excel
          if (currentLine.startsWith('"') && currentLine.endsWith('"')) {
            currentLine = currentLine.substring(1, currentLine.length - 1).replace(/""/g, '"');
          }

          // Regex para detectar campos CSV
          let values: string[] = currentLine.match(/(".*?"|[^",]+)/g) ?? [];

          if (values.length < 8) {
            // Reparación definitiva: insertar coma antes de la contraseña citada
            currentLine = currentLine.replace(/([a-zA-Z0-9])"/g, '$1,"');
            values = currentLine.split(delimiter).map((v) => v.trim());
          }

          if (values.length < 8) {
            console.warn(`Línea ${i} ignorada. Campos: ${values.length}. Contenido:`, currentLine);
            continue;
          }

          const medicoData: any = {
            tipoDocumento: "CC",
            edad: 35,
            experienciaAnios: Math.floor(Math.random() * 20) + 5,
          };

          normalizedHeaders.forEach((header, index) => {
            const apiKey = expectedMapping[header];
            if (apiKey) {
              let value = values[index]?.trim() || "";
              value = value.replace(/^['"]+|['"]+$/g, "").trim();

              // REPARACIÓN CRÍTICA DE EMAIL: Si está truncado, lo completamos
              if (apiKey === "email") {
                if (
                  value.toLowerCase().includes("@vitasalud") &&
                  !value.toLowerCase().endsWith(".com")
                ) {
                  // Extraemos la parte del usuario y forzamos el dominio correcto
                  const userPart = value.split("@")[0];
                  value = `${userPart}@vitasalud.com`;
                }
              }

              if (apiKey === "departamentoId" || apiKey === "ciudadId") {
                const isNull = !value || value.toLowerCase() === "null";
                medicoData[apiKey] = isNull ? null : parseInt(value) || null;
              } else {
                medicoData[apiKey] = value;
              }
            }
          });

          nuevosMedicos.push(medicoData);
        }

        console.log(`Total de médicos a enviar: ${nuevosMedicos.length}`);

        if (nuevosMedicos.length === 0) {
          Swal.fire("Error", "No se encontraron datos válidos en el CSV", "error");
          return;
        }

        Swal.fire({
          title: "Procesando...",
          text:
            nuevosMedicos.length === 1
              ? "Registrando al médico en el sistema..."
              : `Registrando a los ${nuevosMedicos.length} médicos en el sistema...`,
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await apiService.users.bulkCreateDoctors(nuevosMedicos);
        const results = response.data;

        const successCount = results.filter((r: any) => r.success).length;
        const failCount = results.filter((r: any) => !r.success).length;

        refreshMedicos();
        setShowBulkModal(false);

        if (failCount > 0) {
          // Traductor de errores comunes para que nada salga en inglés
          const translateError = (err: string) => {
            if (err.includes("Validation isEmail"))
              return "El formato del correo electrónico es inválido";
            if (err.includes("already registered") || err.includes("registrado"))
              return "El correo o tarjeta profesional ya existe";
            if (err.includes("too short") || err.includes("corta"))
              return "La contraseña debe tener al menos 12 caracteres";
            return "Error en los datos del registro";
          };

          const firstError = translateError(results.find((r: any) => !r.success)?.error || "");
          Swal.fire({
            icon: "warning",
            title: "Carga Parcial",
            text:
              successCount === 1
                ? `Se registró 1 médico, pero ${failCount} fallaron. Motivo: ${firstError}`
                : `Se registraron ${successCount} médicos, pero ${failCount} fallaron. Motivo: ${firstError}`,
          });
        } else {
          Swal.fire({
            icon: "success",
            title: "¡Carga Exitosa!",
            text:
              successCount === 1
                ? "Se ha registrado el médico correctamente."
                : `Se han registrado los ${successCount} médicos correctamente.`,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      } catch (error: any) {
        console.error("CSV Import Error:", error);
        Swal.fire(
          "Error",
          "No se pudo procesar el archivo. Asegúrate de que sea un CSV válido.",
          "error",
        );
      }
    };
    reader.readAsText(file);
  };

  const toggleActivo = async (medico: Doctor) => {
    try {
      await apiService.users.toggleDoctorStatus(medico.id, !medico.activo);
      refreshMedicos();
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo cambiar el estado", "error");
    }
  };

  const openEditModal = (medico: Doctor) => {
    setEditingMedico(medico);
    setShowEditModal(true);
  };

  const handleDeleteMedico = (medico: Doctor) => {
    Swal.fire({
      title: "¿Eliminar médico?",
      text: `¿Estás seguro de eliminar a ${medico.nombre}? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626", // Red-600
      cancelButtonColor: "#6b7280", // Gray-500
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiService.users.deleteUser(medico.id);
          refreshMedicos();
          Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "El registro ha sido eliminado totalmente del sistema.",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
        } catch (error: any) {
          Swal.fire("Error", error.message || "No se pudo eliminar el médico", "error");
        }
      }
    });
  };

  // Filtrado y Paginación
  const filteredMedicos = medicos.filter((medico) => {
    const matchesSearch =
      medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.identificacion.includes(searchTerm);
    const matchesStatus =
      statusFilter === "todos" ? true : statusFilter === "activos" ? medico.activo : !medico.activo;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMedicos.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedicos = filteredMedicos.slice(startIndex, startIndex + itemsPerPage);

  // Reiniciar a la primera página si cambia el filtro y la página actual queda fuera de rango
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredMedicos.length, currentPage, totalPages]);

  return (
    <div className="space-y-6">
      {/* Header movido a DashboardHeader */}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground font-heading">Médicos Registrados</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkModal(true)}>
            Importar Masivo
          </Button>
          <Button onClick={() => setShowRegisterModal(true)}>Registrar Nuevo Médico</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Buscar por nombre o especialidad ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-background border border-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Solo activos</option>
          <option value="inactivos">Solo inactivos</option>
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMedicos.map((medico) => (
              <TableRow key={medico.id}>
                <TableCell className="font-medium">{medico.nombre}</TableCell>
                <TableCell>{medico.especialidad}</TableCell>
                <TableCell>{medico.email}</TableCell>
                <TableCell>{medico.identificacion}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${medico.activo ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                  >
                    {medico.activo ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Switch
                      checked={medico.activo}
                      onCheckedChange={() => toggleActivo(medico)}
                      className="data-[state=checked]:bg-primary"
                    />
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(medico)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteMedico(medico)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación Avanzada */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-4 border-t border-border/50">
        {/* Izquierda: Contador */}
        <div className="text-sm text-muted-foreground w-full md:w-1/3 text-center md:text-left">
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {filteredMedicos.length > 0 ? startIndex + 1 : 0}
          </span>{" "}
          a{" "}
          <span className="font-medium text-foreground">
            {Math.min(startIndex + itemsPerPage, filteredMedicos.length)}
          </span>{" "}
          de <span className="font-medium text-foreground">{filteredMedicos.length}</span> registros
        </div>

        {/* Centro: Navegación Numérica y Flechas */}
        <div className="flex items-center justify-center gap-1 w-full md:w-1/3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 text-xs font-medium ${
                  currentPage === page ? "shadow-md shadow-primary/20" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Derecha: Selector de registros por página */}
        <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-1/3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Registros por página:
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-transparent text-sm font-medium border-none focus:ring-0 cursor-pointer outline-none text-right"
          >
            {[5, 10, 15, 20].map((size) => (
              <option key={size} value={size} className="bg-background text-foreground">
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal Registro Individual */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex flex-items items-center justify-center z-[1000] p-4">
          <div className="bg-background rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex items-center justify-between bg-card">
              <h3 className="text-xl font-bold font-heading w-full text-center">
                Registrar Médico
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-2 hover:bg-muted rounded-full ml-auto"
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <DoctorRegisterForm
                isAdminMode={true}
                onSuccess={() => {
                  refreshMedicos();
                  setShowRegisterModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Edición */}
      {showEditModal && editingMedico && (
        <div className="fixed inset-0 bg-black/50 flex flex-items items-center justify-center z-[1000] p-4">
          <div className="bg-background rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex items-center justify-between bg-card">
              <h3 className="text-xl font-bold font-heading w-full text-center">
                Editar Información del Médico
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMedico(null);
                }}
                className="p-2 hover:bg-muted rounded-full ml-auto"
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <DoctorRegisterForm
                initialData={editingMedico}
                isAdminMode={true}
                onSuccess={() => {
                  refreshMedicos();
                  setShowEditModal(false);
                  setEditingMedico(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Importación Masiva */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-background rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-heading w-full text-center">
                Importar Médicos
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-2 hover:bg-muted rounded-full ml-auto"
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">
                  Instrucciones
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Para una importación exitosa, el archivo CSV debe contener exactamente las
                  siguientes columnas en este orden:
                </p>
                <div className="mt-2 bg-background/50 p-2 rounded border border-border text-[10px] font-mono overflow-x-auto whitespace-nowrap">
                  nombre, especialidad, identificacion, tarjetaProfesional, departamentoId,
                  ciudadId, email, password
                </div>
                <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-600 font-medium">
                    Importante: Para garantizar la estabilidad del sistema, se recomienda cargar un
                    máximo de 20 médicos por cada archivo.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">1. Descarga la referencia</label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="w-full justify-start border-dashed"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Bajar Plantilla CSV
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">2. Sube tu archivo</label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="cursor-pointer bg-accent/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button onClick={() => setShowBulkModal(false)} variant="ghost" className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => setShowBulkModal(false)} className="flex-1">
                Listo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Dashboard para médicos.
 */
function MedicoDashboard({ user }: { user: Doctor }) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [filtro, setFiltro] = useState<"todas" | "hoy" | "pendientes" | "atendidas" | "canceladas">("todas");
  const [showAtenderModal, setShowAtenderModal] = useState(false);
  const [citaToAtender, setCitaToAtender] = useState<Cita | null>(null);
  const [activeRecomendaciones, setActiveRecomendaciones] = useState<Cita | null>(null);
  const [recomendaciones, setRecomendaciones] = useState("");
  const doctorNotificationStorageKey = "medicoCitaSnapshots";

  const loadCitas = async () => {
    try {
      const response = await apiService.appointments.getAll();
      setCitas(response.data);
      return response.data;
    } catch (error) {
      console.error("Error loading appointments:", error);
      return [] as Cita[];
    }
  };

  const syncDoctorNotifications = (serverCitas: Cita[], isInitial = false) => {
    /**
     * Sincroniza notificaciones para médicos.
     * - Detecta nuevas citas agendadas, reprogramaciones y cancelaciones.
     * - Actualizado 2026-05-02: Agregado trigger para nuevas citas agendadas,
     *   incluido refresh al ganar foco y listener de storage para sincronización entre pestañas.
     */
    const previousSnapshots = JSON.parse(
      localStorage.getItem(doctorNotificationStorageKey) || "{}",
    ) as Record<string, AppointmentNotificationSnapshot>;
    const nextSnapshots: Record<string, AppointmentNotificationSnapshot> = {};

    serverCitas.forEach((cita) => {
      const previous = previousSnapshots[cita.id];
      const current = buildAppointmentSnapshot(cita);
      nextSnapshots[cita.id] = current;

      if (isInitial) {
        return;
      }

      let title = "";
      let text = "";
      let icon: "success" | "warning" | "error" | "info" = "info";

      if (!previous && cita.estado === "agendada") {
        title = "Nueva cita agendada";
        text = `${cita.pacienteNombre} ha agendado una cita de ${cita.especialidad} para las ${cita.fecha} a las ${cita.hora}.`;
        icon = "success";
      } else if (previous && cita.estado === "agendada" && wasAppointmentRescheduled(previous, current)) {
        title = "Cita reprogramada";
        text = `${cita.pacienteNombre} reprogramó su cita de ${cita.especialidad} para ${cita.fecha} a las ${cita.hora}.`;
        icon = "info";
      } else if (previous && previous.estado !== cita.estado && cita.estado === "cancelada") {
        title = "Cita cancelada";
        text = `${cita.pacienteNombre} ha cancelado su cita de ${cita.especialidad} de las ${cita.hora}.`;
        icon = "warning";
      } else {
        return;
      }

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: text });
      }

      Swal.fire({
        icon,
        title,
        text,
        position: "center",
        showConfirmButton: false,
        timer: 3000,
      });
    });

    localStorage.setItem(doctorNotificationStorageKey, JSON.stringify(nextSnapshots));
  };

  useEffect(() => {
    async function loadAndSync() {
      const serverCitas = await loadCitas();
      syncDoctorNotifications(serverCitas, true);
    }
    loadAndSync();
  }, [user.id]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const refreshNotifications = async () => {
      try {
        const serverCitas = await loadCitas();
        syncDoctorNotifications(serverCitas, false);
      } catch (error) {
        console.error("Error refreshing doctor notifications:", error);
      }
    };

    // Polling cada 3 segundos para notificaciones de médicos (reducido para menor latencia)
    const interval = setInterval(refreshNotifications, 3000);
    const handleWindowFocus = () => {
      void refreshNotifications();
    };
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.includes("cita")) {
        void refreshNotifications();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user.id]);

  const citasFiltradas = citas
    .filter((cita) => {
      if (filtro === "hoy") {
        const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
        return cita.fecha === hoy;
      }
      if (filtro === "pendientes") {
        return cita.estado === "agendada";
      }
      if (filtro === "atendidas") {
        return cita.estado === "atendida";
      }
      if (filtro === "canceladas") {
        return cita.estado === "cancelada";
      }
      return true;
    })
    .sort((a, b) => {
      // Primero ordenar por fecha ascendente
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      
      if (fechaA !== fechaB) {
        return fechaA - fechaB;
      }
      
      // Si las fechas son iguales, ordenar por hora ascendente
      return a.hora.localeCompare(b.hora);
    });

  function openAtender(cita: Cita) {
    setCitaToAtender(cita);
    setRecomendaciones("");
    setShowAtenderModal(true);
  }

  const handleGenerateIA = () => {
    if (citaToAtender) {
      const rec = generateAgentRecommendation(citaToAtender);
      setRecomendaciones(rec);
      Swal.fire({
        title: "Recomendaciones Listas",
        text: "Se han generado recomendaciones base, puedes modificarlas si lo deseas.",
        icon: "success",
        position: "center",
        timer: 2500,
        showConfirmButton: false,
      });
    }
  };

  const submitAtender = async () => {
    if (!citaToAtender) return;
    if (!recomendaciones.trim()) {
      Swal.fire("Error", "Debe ingresar las recomendaciones para el paciente", "error");
      return;
    }

    try {
      await apiService.appointments.updateStatus(citaToAtender.id, {
        estado: "atendida",
        recomendaciones,
      });
      Swal.fire({
        icon: "success",
        title: "Consulta Finalizada",
        text: "El reporte se ha guardado exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      setShowAtenderModal(false);
      const response = await apiService.appointments.getAll();
      setCitas(response.data);
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo finalizar la consulta", "error");
    }
  };

  const citasHoy = citas.filter((cita) => {
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    return cita.fecha === hoy;
  });

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{citasHoy.length}</p>
              <p className="text-sm text-muted-foreground">Citas hoy</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">
                {citas.filter((c) => c.estado === "agendada").length}
              </p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">
                {citas.filter((c) => c.estado === "atendida").length}
              </p>
              <p className="text-sm text-muted-foreground">Atendidas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">
                {citas.filter((c) => c.estado === "cancelada").length}
              </p>
              <p className="text-sm text-muted-foreground">Canceladas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filtro === "todas" ? "default" : "outline"}
          onClick={() => setFiltro("todas")}
        >
          Todas
        </Button>
        <Button variant={filtro === "hoy" ? "default" : "outline"} onClick={() => setFiltro("hoy")}>
          Citas Hoy
        </Button>
        <Button
          variant={filtro === "pendientes" ? "default" : "outline"}
          onClick={() => setFiltro("pendientes")}
        >
          Pendientes
        </Button>
        <Button
          variant={filtro === "atendidas" ? "default" : "outline"}
          onClick={() => setFiltro("atendidas")}
        >
          Atendidas
        </Button>
        <Button
          variant={filtro === "canceladas" ? "default" : "outline"}
          onClick={() => setFiltro("canceladas")}
        >
          Canceladas
        </Button>
      </div>

      {/* Lista de citas */}
      <div className="space-y-4">
        {citasFiltradas.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">
              {filtro === "hoy"
                ? "No tienes citas programadas para hoy"
                : filtro === "pendientes"
                  ? "No tienes citas pendientes"
                  : filtro === "atendidas"
                    ? "Aún no has atendido citas"
                    : "No tienes citas registradas"}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {citasFiltradas.map((cita) => (
                <motion.div
                  key={cita.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card rounded-xl border-2 border-primary/20 p-5 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-primary/20"></div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-semibold uppercase tracking-wider">
                      Consultorio {cita.consultorio}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 border rounded-full ${
                        cita.estado === "atendida"
                          ? "border-success/30 text-success bg-success/10"
                          : cita.estado === "cancelada"
                            ? "border-destructive/30 text-destructive bg-destructive/10"
                            : "border-primary/30 text-primary bg-primary/10"
                      }`}
                    >
                      {cita.estado === "atendida"
                        ? "Atendida"
                        : cita.estado === "cancelada"
                          ? "Cancelada"
                          : "Próxima"}
                    </span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">
                        {cita.pacienteNombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        {cita.fecha}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground font-bold">{cita.hora}</span>
                    </div>
                  </div>

                  {cita.estado === "agendada" && (
                    <div className="mt-5 pt-4 border-t border-border">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-primary text-primary-foreground shadow-md hover:opacity-90"
                        onClick={() => openAtender(cita)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Atender Paciente
                      </Button>
                    </div>
                  )}

                  {cita.estado === "atendida" && cita.recomendaciones && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveRecomendaciones(cita)}
                      >
                        Ver recomendaciones →
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal Atender Paciente */}
      {showAtenderModal && citaToAtender && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-background rounded-2xl p-6 max-w-xl w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-heading">
                Atender a {citaToAtender.pacienteNombre}
              </h3>
              <button
                onClick={() => setShowAtenderModal(false)}
                className="p-2 hover:bg-muted rounded-full"
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground grid grid-cols-2 gap-2">
                <p>
                  <strong>Fecha:</strong> {citaToAtender.fecha}
                </p>
                <p>
                  <strong>Hora:</strong> {citaToAtender.hora}
                </p>
                <p>
                  <strong>Consultorio:</strong> {citaToAtender.consultorio}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recomendaciones Clínicas</label>
                <Textarea
                  placeholder="Redacta las observaciones y recomendaciones para el paciente..."
                  value={recomendaciones}
                  onChange={(e) => setRecomendaciones(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="secondary"
                  onClick={handleGenerateIA}
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  ✨ Generar con IA
                </Button>
              </div>

              <div className="pt-4 border-t border-border flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAtenderModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={submitAtender}
                >
                  Finalizar Consulta
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeRecomendaciones && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold font-heading">Recomendaciones</h3>
                <p className="text-sm text-muted-foreground">
                  {activeRecomendaciones.especialidad}
                </p>
              </div>
              <button
                onClick={() => setActiveRecomendaciones(null)}
                className="p-2 hover:bg-muted rounded-full"
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-line leading-relaxed">
                {activeRecomendaciones.recomendaciones}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setActiveRecomendaciones(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
