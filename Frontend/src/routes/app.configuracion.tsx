import { FormEvent, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User, Briefcase, Stethoscope, Award, Fingerprint } from "lucide-react";
import { 
  getCurrentUser, 
  updatePaciente, 
  updateMedico, 
  tiposDocumento, 
  especialidades,
  type Paciente, 
  type Doctor 
} from "@/lib/mockData";
import {
  fetchDepartamentos,
  fetchCiudadesByDepartamento,
  type Departamento,
  type Ciudad,
} from "@/lib/colombiaApi";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import Swal from "sweetalert2";

/**
 * Página de configuración del perfil del usuario.
 * Permite tanto a pacientes como a médicos actualizar su información profesional y personal.
 */
export default function ConfiguracionPage() {
  const user = getCurrentUser();
  
  // Estado polimórfico del formulario
  const [form, setForm] = useState({
    tipoDocumento: "",
    nombre: "",
    identificacion: "",
    departamentoId: "",
    ciudadId: "",
    email: "",
    // Campos específicos
    edad: "",               // Solo paciente
    especialidad: "",       // Solo médico
    tarjetaProfesional: "", // Solo médico
    experienciaAnios: "",    // Solo médico
  });

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        tipoDocumento: (user as any).tipoDocumento || "CC",
        nombre: user.nombre,
        identificacion: user.identificacion,
        departamentoId: String(user.departamentoId),
        ciudadId: String(user.ciudadId),
        email: user.email,
        edad: user.rol === "paciente" ? String((user as Paciente).edad) : "",
        especialidad: user.rol === "medico" ? (user as Doctor).especialidad : "",
        tarjetaProfesional: user.rol === "medico" ? (user as Doctor).tarjetaProfesional : "",
        experienciaAnios: user.rol === "medico" ? String((user as Doctor).experienciaAnios) : "",
      });
    }
  }, []);

  useEffect(() => {
    fetchDepartamentos().then(setDepartamentos).catch(() => {});
  }, []);

  useEffect(() => {
    const depId = parseInt(form.departamentoId);
    if (!depId) {
      setCiudades([]);
      return;
    }
    setLoadingCities(true);
    fetchCiudadesByDepartamento(depId)
      .then(setCiudades)
      .catch(() => setCiudades([]))
      .finally(() => setLoadingCities(false));
  }, [form.departamentoId]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(ev: FormEvent) {
    ev.preventDefault();
    if (!user) return;

    // Validación básica común
    if (!form.nombre.trim() || !form.identificacion.trim()) {
      Swal.fire({ icon: "warning", title: "Campos requeridos", text: "El nombre y la identificación son obligatorios." });
      return;
    }

    const dep = departamentos.find((d) => d.id === parseInt(form.departamentoId));
    const ciu = ciudades.find((c) => c.id === parseInt(form.ciudadId));

    if (user.rol === "medico") {
      const updated: Doctor = {
        ...(user as Doctor),
        tipoDocumento: form.tipoDocumento,
        nombre: form.nombre.trim(),
        identificacion: form.identificacion.trim(),
        especialidad: form.especialidad,
        tarjetaProfesional: form.tarjetaProfesional,
        experienciaAnios: parseInt(form.experienciaAnios) || 0,
        departamentoId: dep?.id ?? user.departamentoId,
        ciudadId: ciu?.id ?? user.ciudadId,
      };
      updateMedico(updated);
    } else if (user.rol === "paciente") {
      const updated: Paciente = {
        ...(user as Paciente),
        tipoDocumento: form.tipoDocumento,
        nombre: form.nombre.trim(),
        identificacion: form.identificacion.trim(),
        edad: parseInt(form.edad) || 20,
        departamentoId: dep?.id ?? user.departamentoId,
        departamentoNombre: dep?.name ?? (user as Paciente).departamentoNombre,
        ciudadId: ciu?.id ?? user.ciudadId,
        ciudadNombre: ciu?.name ?? (user as Paciente).ciudadNombre,
      };
      updatePaciente(updated);
    }

    Swal.fire({
      icon: "success",
      title: "Perfil actualizado",
      text: "Tus datos han sido guardados correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  if (!user) return null;

  const inputClass = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all";

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2">
          {user.rol === "medico" ? <Stethoscope className="h-6 w-6 text-primary" /> : <User className="h-6 w-6 text-primary" />}
          Mi Perfil {user.rol === "medico" ? "Médico" : "Personal"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user.rol === "medico" ? "Gestiona tu información profesional y contacto." : "Actualiza tus datos personales y de contacto."}
        </p>
      </motion.div>

      <form onSubmit={handleSave} className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
        {/* Identificación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
              <Fingerprint className="h-3.5 w-3.5 text-muted-foreground" /> Tipo de Documento
            </label>
            <Combobox
              items={tiposDocumento}
              value={form.tipoDocumento}
              onValueChange={(value) => handleChange("tipoDocumento", value)}
              itemValue={(item) => item.value}
              itemLabel={(item) => item.label}
            >
              <ComboboxInput className={inputClass} placeholder="Seleccionar" />
              <ComboboxContent>
                <ComboboxEmpty>No encontrado</ComboboxEmpty>
                <ComboboxList>{(item) => <ComboboxItem item={item}>{item.label}</ComboboxItem>}</ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Número de Documento</label>
            <input 
              type="text" 
              value={form.identificacion} 
              onChange={(e) => handleChange("identificacion", e.target.value)} 
              className={inputClass} 
            />
          </div>
        </div>

        {/* Nombre y Edad/Especialidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={user.rol === "paciente" ? "col-span-1" : "col-span-2"}>
            <label className="block text-sm font-medium mb-1.5">Nombre Completo</label>
            <input 
              type="text" 
              value={form.nombre} 
              onChange={(e) => handleChange("nombre", e.target.value)} 
              className={inputClass} 
            />
          </div>
          {user.rol === "paciente" && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Edad</label>
              <input 
                type="number" 
                value={form.edad} 
                onChange={(e) => handleChange("edad", e.target.value)} 
                className={inputClass} 
              />
            </div>
          )}
        </div>

        {/* Campos exclusivos para Médicos */}
        {user.rol === "medico" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border mt-4 overflow-visible">
               <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                  <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" /> Especialidad
                </label>
                <Combobox
                  items={especialidades}
                  value={form.especialidad}
                  onValueChange={(value) => handleChange("especialidad", value)}
                  itemValue={(val) => val}
                  itemLabel={(val) => val}
                >
                  <ComboboxInput className={inputClass} placeholder="Seleccionar" />
                  <ComboboxContent>
                    <ComboboxEmpty>No encontrado</ComboboxEmpty>
                    <ComboboxList>{(item) => <ComboboxItem item={item}>{item}</ComboboxItem>}</ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-muted-foreground" /> Tarjeta Profesional
                </label>
                <input 
                  type="text" 
                  value={form.tarjetaProfesional} 
                  onChange={(e) => handleChange("tarjetaProfesional", e.target.value)} 
                  className={inputClass} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> Años de Experiencia
              </label>
              <input 
                type="number" 
                value={form.experienciaAnios} 
                onChange={(e) => handleChange("experienciaAnios", e.target.value)} 
                className={inputClass} 
              />
            </div>
          </>
        )}

        {/* Ubicación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Departamento</label>
            <Combobox
              items={departamentos}
              value={form.departamentoId}
              onValueChange={(value) => handleChange("departamentoId", value)}
              itemValue={(item) => String(item.id)}
              itemLabel={(item) => item.name}
            >
              <ComboboxInput className={inputClass} placeholder="Seleccionar" />
              <ComboboxContent>
                <ComboboxEmpty>No encontrado</ComboboxEmpty>
                <ComboboxList>{(item) => <ComboboxItem item={item}>{item.name}</ComboboxItem>}</ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Ciudad</label>
            <Combobox
              items={ciudades}
              value={form.ciudadId}
              onValueChange={(value) => handleChange("ciudadId", value)}
              itemValue={(item) => String(item.id)}
              itemLabel={(item) => item.name}
            >
              <ComboboxInput className={inputClass} placeholder={loadingCities ? "Cargando..." : "Seleccionar"} />
              <ComboboxContent>
                <ComboboxEmpty>No encontrado</ComboboxEmpty>
                <ComboboxList>{(item) => <ComboboxItem item={item}>{item.name}</ComboboxItem>}</ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>

        {/* Contacto */}
        <div className="pt-2 border-t border-border">
          <label className="block text-sm font-medium mb-1.5">Email (Institucional)</label>
          <input type="email" value={form.email} disabled className={`${inputClass} bg-muted opacity-80 cursor-not-allowed`} />
          <p className="text-[10px] text-muted-foreground mt-1">El correo electrónico no puede ser modificado por políticas de seguridad.</p>
        </div>

        <Button type="submit" variant="default" size="lg" className="w-full shadow-lg">
          <Save className="h-4 w-4 mr-2" /> Guardar Cambios
        </Button>
      </form>
    </div>
  );
}
