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
  Power,
  FileSpreadsheet,
} from "lucide-react";
import {
  getCurrentUser,
  getCitasByPaciente,
  updateCita,
  generateAgentRecommendation,
  type Cita,
  getCitasByDoctor,
  getMedicos,
  updateMedico,
  saveMedico,
  especialidades,
  hashPassword,
  type Doctor,
} from "@/lib/mockData";
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
                Bienvenido/a a tu panel de citas médicas.
              </p>
            </>
          )}
          {user.rol === "medico" && (
            <>
              <h1 className="text-2xl font-bold text-foreground font-heading">
                Panel Médico 👨‍⚕️
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gestión de tus citas y pacientes.
              </p>
            </>
          )}
          {user.rol === "admin" && (
            <>
              <h1 className="text-2xl font-bold text-foreground font-heading">
                Panel de Administración 👨‍💼
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gestiona médicos, citas y el sistema.
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

/**
 * Dashboard para pacientes.
 */
function PacienteDashboard({ user }: { user: any }) {
  const [citas, setCitas] = useState<Cita[]>([]);

  /**
   * Carga las citas del paciente actual al montar el componente o cambiar el usuario.
   */
  useEffect(() => {
    if (user?.id) setCitas(getCitasByPaciente(user.id));
  }, [user?.id]);

  /**
   * Simula el proceso de atención médica mediante una "IA".
   * Cambia el estado de la cita a 'atendida' y genera recomendaciones automáticas.
   *
   * @param cita Objeto de la cita que se va a procesar.
   */
  async function simularAtencionIA(cita: Cita) {
    const isMale = cita.doctorNombre.startsWith("Dr.");

    // Confirmación inicial para ingresar a la consulta
    const { isConfirmed } = await Swal.fire({
      title: "Ingresar a la cita médica",
      text: `¿Deseas ingresar a la consulta con ${isMale ? "el" : "la"} ${cita.doctorNombre}? Al finalizar se generará el reporte clínico oficial.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, iniciar consulta",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#167e91",
    });

    if (!isConfirmed) return;

    // Pantalla de carga simulando procesamiento
    Swal.fire({
      title: "Registrando Consulta Médica",
      html: "El profesional está redactando las observaciones y pautas de recuperación...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Simulación de retraso de procesamiento de IA (2.5 segundos)
    setTimeout(() => {
      const recomendacion = generateAgentRecommendation(cita);
      const updated: Cita = {
        ...cita,
        estado: "atendida",
        recomendaciones: recomendacion,
      };

      updateCita(updated); // Persiste el cambio en sessionStorage
      setCitas(getCitasByPaciente(user!.id)); // Refresca la interfaz

      Swal.fire({
        icon: "success",
        title: "Consulta Finalizada",
        text: "El reporte médico ha sido firmado y guardado en tu historial.",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }, 2500);
  }

  /**
   * Gestiona la cancelación de una cita médica.
   * Aplica reglas de negocio: no se puede cancelar si falta menos de 1 hora.
   *
   * @param cita Objeto de la cita a cancelar.
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
      confirmButtonColor: "hsl(var(--destructive))",
    });

    if (result.isConfirmed) {
      const updated: Cita = { ...cita, estado: "cancelada" };
      updateCita(updated);
      setCitas(getCitasByPaciente(user!.id));

      Swal.fire({
        icon: "success",
        title: "Cita cancelada",
        text: "Se ha liberado el espacio y cancelado tu asistencia.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  }

  // Filtrado de citas según su estado para mostrar en secciones distintas
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

      {/* Sección de Citas Pendientes */}
      <section>
        <h2 className="text-lg font-bold text-foreground font-heading mb-3 flex items-center gap-2">
          Citas Pendientes
          {citasAgendadas.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {citasAgendadas.length}
            </span>
          )}
        </h2>

        {citasAgendadas.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center shadow-sm">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">No tienes citas agendadas.</p>
            <Button size="sm" asChild className="mt-4">
              <Link to="/app/agendar">Agendar cita</Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {citasAgendadas.map((cita) => (
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
                      {cita.especialidad}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-primary px-2 py-0.5 border border-primary/30 rounded-full">
                      Próxima
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
                  </div>

                  <div className="mt-5 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-primary text-primary-foreground shadow-md hover:opacity-90"
                      onClick={() => simularAtencionIA(cita)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Asistir a la cita
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Sección de Historial (Atendidas y Canceladas) */}
      {citasTerminadas.length > 0 && (
        <section className="pt-4">
          <h2 className="text-lg font-bold text-foreground font-heading mb-3">
            Historial de Citas
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 opacity-70">
            {citasTerminadas.map((cita) => (
              <div
                key={cita.id}
                className={`bg-card rounded-xl p-4 border ${cita.estado === "cancelada" ? "border-destructive/30" : "border-border"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${cita.estado === "atendida" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                  >
                    {cita.estado === "atendida" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {cita.estado === "atendida" ? "Atendida" : "Cancelada"}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {cita.especialidad}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{cita.doctorNombre}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cita.fecha} — {cita.hora}
                </p>

                {cita.estado === "atendida" && (
                  <Link
                    to={`/app/cita/${cita.id}`}
                    className="text-primary text-sm font-medium hover:underline mt-2 inline-block"
                  >
                    Ver recomendaciones →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
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
  const itemsPerPage = 10;

  useEffect(() => {
    setMedicos(getMedicos().slice().reverse());
  }, []);

  const refreshMedicos = () => {
    setMedicos(getMedicos().slice().reverse());
  };

  const handleBulkImport = () => {
    handleFileUpload({ target: { files: [] } } as any);
  };

  const handleDownloadTemplate = () => {
    console.log("Iniciando descarga de plantilla CSV...");
    try {
      const headers = "nombre, especialidad, identificacion, tarjetaProfesional, departamentoId, ciudadId, email, password\n";
      const example = "Dr. Juan Pérez, Medicina General, 123456789, TP12345, 11, 11001, juan@example.com, password123\n";
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
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split("\n").filter(line => line.trim());
      if (lines.length < 2) {
        Swal.fire("Error", "El archivo CSV debe tener al menos una fila de datos", "error");
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim());
      const expectedHeaders = ["nombre", "especialidad", "identificacion", "tarjetaProfesional", "departamentoId", "ciudadId", "email", "password"];
      if (!expectedHeaders.every(h => headers.includes(h))) {
        Swal.fire("Error", "El archivo CSV no tiene los headers correctos", "error");
        return;
      }

      const nuevosMedicos: Doctor[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        if (values.length !== 8) continue;

        const [nombre, especialidad, identificacion, tarjetaProfesional, depId, ciuId, email, password] = values.map(v => v.trim());

        if (!nombre || !especialidad || !identificacion || !tarjetaProfesional || !depId || !ciuId || !email || !password) continue;

        const isMale = Math.random() > 0.5;
        const titulo = isMale ? "Dr." : "Dra.";
        const tituloNombre = nombre.startsWith("Dr.") || nombre.startsWith("Dra.") ? nombre : `${titulo} ${nombre}`;

        const nuevoMedico: Doctor = {
          id: `medico-${Date.now()}-${i}`,
          nombre: tituloNombre,
          especialidad,
          identificacion,
          tarjetaProfesional,
          departamentoId: parseInt(depId),
          ciudadId: parseInt(ciuId),
          activo: true,
          experienciaAnios: Math.floor(Math.random() * 25) + 3,
          email,
          password: hashPassword(password),
          rol: "medico",
        };

        nuevosMedicos.push(nuevoMedico);
      }

      nuevosMedicos.forEach(saveMedico);
      refreshMedicos();
      setShowBulkModal(false);
      Swal.fire("Éxito", `Se registraron ${nuevosMedicos.length} médicos`, "success");
    };
    reader.readAsText(file);
  };

  const toggleActivo = (medico: Doctor) => {
    const updated = { ...medico, activo: !medico.activo };
    updateMedico(updated);
    refreshMedicos();
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
      cancelButtonColor: "#6b7280",  // Gray-500
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Para eliminar, simulamos desactivando permanentemente
        const updated = { ...medico, activo: false };
        updateMedico(updated);
        setMedicos(getMedicos().filter((m) => m.id !== medico.id));
        Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "El médico ha sido eliminado correctamente del sistema.",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  };

  // Paginación
  const totalPages = Math.ceil(medicos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedicos = medicos.slice(startIndex, startIndex + itemsPerPage);

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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="px-3 py-2 text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal Registro Individual */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex flex-items items-center justify-center z-[1000] p-4">
          <div className="bg-background rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex items-center justify-between bg-card">
              <h3 className="text-xl font-bold font-heading w-full text-center">Registrar Médico</h3>
              <button onClick={() => setShowRegisterModal(false)} className="p-2 hover:bg-muted rounded-full ml-auto">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <DoctorRegisterForm
                isAdminMode={true}
                onSuccess={() => { refreshMedicos(); setShowRegisterModal(false); }}
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
              <h3 className="text-xl font-bold font-heading w-full text-center">Editar Información del Médico</h3>
              <button onClick={() => { setShowEditModal(false); setEditingMedico(null); }} className="p-2 hover:bg-muted rounded-full ml-auto">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <DoctorRegisterForm
                initialData={editingMedico}
                isAdminMode={true}
                onSuccess={() => { refreshMedicos(); setShowEditModal(false); setEditingMedico(null); }}
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
              <h3 className="text-xl font-bold font-heading w-full text-center">Importar Médicos</h3>
              <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-muted rounded-full ml-auto">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Instrucciones</p>
                <p className="text-sm text-foreground leading-relaxed">
                  Para una importación exitosa, el archivo CSV debe contener exactamente las siguientes columnas en este orden:
                </p>
                <div className="mt-2 bg-background/50 p-2 rounded border border-border text-[10px] font-mono overflow-x-auto whitespace-nowrap">
                  nombre, especialidad, identificacion, tarjetaProfesional, departamentoId, ciudadId, email, password
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
  const [filtro, setFiltro] = useState<"todas" | "hoy" | "pendientes" | "atendidas">("todas");

  useEffect(() => {
    setCitas(getCitasByDoctor(user.id));
  }, [user.id]);

  const citasFiltradas = citas.filter((cita) => {
    if (filtro === "hoy") {
      const hoy = new Date().toISOString().split("T")[0];
      return cita.fecha === hoy;
    }
    if (filtro === "pendientes") {
      return cita.estado === "agendada";
    }
    if (filtro === "atendidas") {
      return cita.estado === "atendida";
    }
    return true;
  });

  const citasHoy = citas.filter((cita) => {
    const hoy = new Date().toISOString().split("T")[0];
    return cita.fecha === hoy;
  });

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <p className="text-2xl font-bold">{citas.filter(c => c.estado === "agendada").length}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{citas.filter(c => c.estado === "atendida").length}</p>
              <p className="text-sm text-muted-foreground">Atendidas</p>
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
        <Button
          variant={filtro === "hoy" ? "default" : "outline"}
          onClick={() => setFiltro("hoy")}
        >
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
      </div>

      {/* Lista de citas */}
      <div className="space-y-4">
        {citasFiltradas.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">
              {filtro === "hoy" ? "No tienes citas programadas para hoy" :
                filtro === "pendientes" ? "No tienes citas pendientes" :
                  filtro === "atendidas" ? "Aún no has atendido citas" :
                    "No tienes citas registradas"}
            </p>
          </div>
        ) : (
          citasFiltradas.map((cita) => (
            <motion.div
              key={cita.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{cita.pacienteNombre}</h3>
                  <p className="text-sm text-muted-foreground">{cita.especialidad}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${cita.estado === "atendida"
                    ? "bg-success/10 text-success"
                    : cita.estado === "cancelada"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                    }`}
                >
                  {cita.estado === "atendida" ? "Atendida" :
                    cita.estado === "cancelada" ? "Cancelada" : "Agendada"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{cita.fecha}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{cita.hora}</span>
                </div>
              </div>
              {cita.estado === "atendida" && cita.recomendaciones && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Recomendaciones:</p>
                  <p className="text-sm text-muted-foreground">{cita.recomendaciones}</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
