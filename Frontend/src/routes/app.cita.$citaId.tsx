import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Calendar, Clock, FileText, CheckCircle2, Stethoscope } from "lucide-react";
import { getCitaById, getDoctorById, getCurrentUser } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

/**
 * Página de detalle de una cita médica atendida.
 * Muestra el reporte clínico oficial, recomendaciones y datos del profesional.
 */
export default function DetalleCitaPage() {
  const { citaId } = useParams();
  const cita = getCitaById(citaId ?? "");
  const user = getCurrentUser();

  // Control de errores: Cita no encontrada
  if (!cita) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Cita no encontrada.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/app">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  /**
   * Recuperación robusta de datos para citas antiguas o incompletas.
   * Prioriza los datos de la cita y usa los del usuario actual o el médico si faltan campos.
   */
  const doctorInfo = getDoctorById(cita.doctorId);
  const pacienteNombre = cita.pacienteNombre || user?.nombre || "Paciente";
  const pacienteTipoDoc = cita.pacienteTipoDoc || user?.tipoDocumento || "CC";
  const pacienteId = cita.pacienteIdentificacion || user?.identificacion || "No registrado";
  
  const doctorDoc = cita.doctorIdentificacion || doctorInfo?.identificacion || "1.000.000.000";
  const doctorTP = cita.doctorTarjetaProfesional || doctorInfo?.tarjetaProfesional || "REG-M-0000";

  /**
   * Lógica de limpieza de recomendaciones médicas.
   * Filtra metadatos innecesarios o formatos antiguos para presentar solo el contenido clínico relevante.
   */
  let cleanRecomendaciones = cita.recomendaciones || "";
  if (cleanRecomendaciones.toUpperCase().includes("AGENTE MCP") || cleanRecomendaciones.includes("protocolo automatizado")) {
    const lines = cleanRecomendaciones.split("\n");
    // Extrae únicamente las líneas numeradas para el plan de manejo
    const numberedLines = lines.filter(l => /^\d+\./.test(l.trim()));
    if (numberedLines.length > 0) {
      cleanRecomendaciones = numberedLines.join("\n");
    } else {
      // Limpieza mediante expresiones regulares si el formato es plano
      cleanRecomendaciones = cleanRecomendaciones
        .replace(/RECOMENDACIÓN MÉDICA GENERADA POR AGENTE MCP[\s\S]*?sugiere:/gi, "")
        .replace(/Este reporte ha sido validado por el sistema inteligente[\s\S]*$/gi, "")
        .trim();
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/app"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Mis Citas
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6 shadow-card"
      >
        {/* Encabezado del Estado de la Cita */}
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-6 w-6 text-success" />
          <h1 className="text-xl font-bold text-foreground font-heading">Cita Atendida</h1>
        </div>

        {/* Resumen Informativo Rápido */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{cita.doctorNombre}</p>
              <p className="text-xs text-muted-foreground">{cita.especialidad}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm text-foreground">{cita.fecha}</span>
            <Clock className="h-5 w-5 text-primary ml-4" />
            <span className="text-sm text-foreground">{cita.hora}</span>
          </div>
        </div>

        {/* Visualización del Reporte Clínico Oficial */}
        {cita.recomendaciones && (
          <div className="mt-8 relative pt-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-background px-4 py-1 border border-border rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground z-10">
              Documento Sanitario Oficial
            </div>
            
            <div className="bg-white border-2 border-primary/20 rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden text-slate-800">
              {/* Encabezado de la Institución (Branding) */}
              <div className="flex justify-between items-start mb-8 border-b-4 border-primary pb-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-primary font-heading tracking-tighter italic leading-none">VitaSalud</h2>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Tu Salud en Conexión Digital</p>
                  <p className="text-[10px] text-slate-400">NIT: 900.234.123-1 | Registro Sanitario: VTS-2026</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-black text-primary uppercase">Fórmula Médica</p>
                  <p className="text-[10px] text-slate-500 font-mono">Folio: {cita.id.toUpperCase().slice(0, 12)}</p>
                </div>
              </div>

              {/* Información Detallada del Paciente */}
              <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Identificación del Paciente</label>
                  <p className="text-sm font-bold uppercase">{pacienteNombre}</p>
                  <p className="text-[10px] font-medium text-slate-600">{pacienteTipoDoc}: {pacienteId}</p>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Especialidad</label>
                  <p className="text-sm font-bold uppercase text-primary">{cita.especialidad}</p>
                  <p className="text-[10px] font-medium text-slate-600">Atención Ambulatoria</p>
                </div>
              </div>

              {/* Prescripción Médica y Plan de Manejo (RP) */}
              <div className="min-h-[220px] mb-10">
                <div className="flex items-center gap-2 mb-4">
                   <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                   </div>
                   <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">RP / Indicaciones y Plan de Manejo</h3>
                </div>
                <div className="pl-10">
                   <div className="text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-line border-l-4 border-primary/10 pl-6 py-2">
                    {cleanRecomendaciones}
                  </div>
                </div>
              </div>

              {/* Firma y Credenciales del Profesional de Salud */}
              <div className="mt-12 pt-8 border-t border-dashed border-slate-200 grid grid-cols-2 gap-4">
                <div className="text-[10px] text-slate-400 self-end">
                   Sello de Validación Digital.<br/>
                   Emisión: {cita.fecha} — {cita.hora}<br/>
                   Vigencia: 30 días calendario.
                </div>
                <div className="text-right">
                   <div className="inline-block border-b-2 border-slate-800 pb-1 mb-2 px-8">
                      <span className="font-heading italic text-xl text-slate-900 font-bold tracking-widest opacity-80">
                        {cita.doctorNombre.split(" ").filter(n => n.length > 2).map(n => n[0]).join("")}-VTS
                      </span>
                   </div>
                   <p className="text-[11px] font-black uppercase text-slate-900 leading-none">{cita.doctorNombre}</p>
                   <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">
                     Reg. Médico: {doctorTP} | CC: {doctorDoc}
                   </p>
                </div>
              </div>

              {/* Marca de agua decorativa para autenticidad visual */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none -rotate-12">
                 <Stethoscope className="h-80 w-80 text-primary" />
              </div>
            </div>
          </div>
        )}

        <Button variant="default" asChild className="mt-6 w-full">
          <Link to="/app">Volver a Mis Citas</Link>
        </Button>
      </motion.div>
    </div>
  );
}
