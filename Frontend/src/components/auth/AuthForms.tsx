"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import {
  findPacienteByEmail,
  verifyPassword,
  setCurrentUser,
  isBlocked,
  incrementLoginAttempt,
  resetLoginAttempts,
  savePaciente,
  hashPassword,
  tiposDocumento,
  type Paciente,
  findMedicoByEmail,
  findAdminByEmail,
  saveMedico,
  updateMedico,
  especialidades,
  seedAppointmentsForDoctor,
  normalize,
  type Doctor,
} from "@/lib/mockData";
import {
  fetchCiudadesByDepartamento,
  fetchDepartamentos,
  type Ciudad,
  type Departamento,
} from "@/lib/colombiaApi";

/** 
 * Propiedades para el componente LoginForm 
 */
interface LoginFormProps {
  /** Función opcional que se ejecuta tras un login exitoso */
  onSuccess?: () => void;
  /** Función para cambiar la vista al formulario de registro */
  onSwitchToRegister?: () => void;
}

/**
 * Componente que gestiona el formulario de Inicio de Sesión.
 * Incluye validaciones de intentos fallidos, bloqueo temporal y persistencia de sesión.
 */
export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("paciente");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);

  /**
   * Verifica si la cuenta asociada al email ingresado está bloqueada.
   */
  const checkBlock = useCallback(() => {
    if (!email) {
      setBlockTimer(0);
      return;
    }
    const { blocked, remainingSeconds } = isBlocked(email.trim().toLowerCase());
    setBlockTimer(blocked ? remainingSeconds : 0);
  }, [email]);

  /** 
   * Hook para ejecutar la verificación de bloqueo periódicamente (cada segundo).
   */
  useEffect(() => {
    checkBlock();
    const interval = setInterval(checkBlock, 1000);
    return () => clearInterval(interval);
  }, [checkBlock]);

  /**
   * Procesa la redirección o ejecución de callback tras un inicio de sesión correcto.
   */
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    navigate("/app");
  };

  /**
   * Maneja el envío del formulario de login.
   * Realiza validaciones de campos, bloqueos e intentos antes de autenticar.
   */
  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const trimEmail = email.trim().toLowerCase();

    // Validación de campos obligatorios
    if (!trimEmail || !password) {
      Swal.fire({
        icon: "info",
        title: "Campos vacíos",
        text: "Por favor ingresa tu email y contraseña.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    // Verificar si la cuenta está bloqueada por demasiados intentos
    const { blocked, remainingSeconds } = isBlocked(trimEmail);
    if (blocked) {
      Swal.fire({
        icon: "warning",
        title: "Cuenta bloqueada",
        text: `Demasiados intentos fallidos. Intenta de nuevo en ${remainingSeconds} segundos.`,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulación de retraso de red

    let usuario = null;
    if (rol === "paciente") {
      usuario = findPacienteByEmail(trimEmail);
    } else if (rol === "medico") {
      usuario = findMedicoByEmail(trimEmail);
    } else if (rol === "admin") {
      usuario = findAdminByEmail(trimEmail);
    }

    // DIAGNÓSTICO DE LOGIN
    console.group("🔍 Diagnóstico de Autenticación");
    console.log("Rol:", rol);
    console.log("Email buscado:", trimEmail);
    console.log("Usuario encontrado:", usuario ? "✅" : "❌");
    if (usuario) {
      const pwdMatch = verifyPassword(password, usuario.password);
      console.log("Nombre:", usuario.nombre);
      console.log("Email en BD:", usuario.email);
      console.log("Password OK:", pwdMatch ? "✅" : "❌");
    }
    console.groupEnd();

    // Validación de credenciales
    if (!usuario || !verifyPassword(password, usuario.password)) {
      const attempts = incrementLoginAttempt(trimEmail);
      setSubmitting(false);
      
      if (attempts.blockedUntil) {
        Swal.fire({
          icon: "warning",
          title: "Cuenta bloqueada",
          text: "Has superado el máximo de 3 intentos. Espera 30 segundos.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Credenciales incorrectas",
          text: `Email o contraseña inválidos. Intentos restantes: ${3 - attempts.count}`,
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
      return;
    }

    // Login exitoso
    resetLoginAttempts(trimEmail);
    setCurrentUser(usuario);
    setSubmitting(false);
    
    await Swal.fire({
      icon: "success",
      title: "¡Bienvenido/a!",
      html: `Hola, <b>${usuario.nombre.split(" ")[0]}</b>. Iniciando sesión...`,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    
    handleSuccess();
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-ring outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
        <Input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Contraseña</label>
        <div className="relative">
          <Input
            type={showPwd ? "text" : "password"}
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Rol</label>
        <Combobox
          items={[
            { value: "paciente", label: "Paciente" },
            { value: "medico", label: "Médico" },
            { value: "admin", label: "Administrador" },
          ]}
          value={rol}
          onValueChange={(value) => setRol(value)}
          itemValue={(item) => item.value}
          itemLabel={(item) => item.label}
        >
          <ComboboxInput placeholder="Seleccionar rol" className={inputClass} />
          <ComboboxContent>
            <ComboboxEmpty>No hay roles disponibles.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem item={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {blockTimer > 0 && (
        <div className="p-3 rounded-lg bg-warning/10 text-warning-foreground text-sm text-center font-medium">
          ⚠️ Cuenta bloqueada. Intenta en {blockTimer}s
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full text-base py-6"
        disabled={submitting || blockTimer > 0}
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        Iniciar Sesión
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={() => {
            if (onSwitchToRegister) {
              onSwitchToRegister();
            } else {
              navigate("/registro");
            }
          }}
          className="text-primary font-medium hover:underline"
        >
          Regístrate aquí
        </button>
      </div>
    </form>
  );
}

/**
 * Propiedades para el componente RegisterForm
 */
interface RegisterFormProps {
  /** Función opcional que se ejecuta tras un registro exitoso */
  onSuccess?: () => void;
  /** Función para cambiar la vista al formulario de login */
  onSwitchToLogin?: () => void;
}

/**
 * Componente que gestiona el formulario de Registro de Pacientes.
 * Incluye lógica de carga de departamentos/ciudades, validación de campos y fortaleza de contraseña.
 */
export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tipoDocumento: "",
    identificacion: "",
    nombre: "",
    edad: "",
    departamentoId: "",
    ciudadId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Carga inicial de departamentos desde la API de Colombia.
   */
  useEffect(() => {
    fetchDepartamentos()
      .then(setDepartamentos)
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los departamentos.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      })
      .finally(() => setLoadingDeps(false));
  }, []);

  /**
   * Actualiza el listado de ciudades cada vez que cambia el departamento seleccionado.
   */
  useEffect(() => {
    const depId = parseInt(form.departamentoId);
    if (!depId) {
      setCiudades([]);
      return;
    }
    setLoadingCities(true);
    setForm((prev) => ({ ...prev, ciudadId: "" }));
    fetchCiudadesByDepartamento(depId)
      .then(setCiudades)
      .catch(() => setCiudades([]))
      .finally(() => setLoadingCities(false));
  }, [form.departamentoId]);

  /** 
   * Maneja la redirección o acción tras un registro satisfactorio.
   */
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    navigate("/app");
  };

  /**
   * Actualiza los valores del formulario y limpia errores asociados al campo modificado.
   */
  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  /**
   * Genera una contraseña segura aleatoria (mínimo 16 caracteres, mezcla de tipos).
   */
  function generateSecurePassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%&*_-+=";
    const all = upper + lower + digits + symbols;
    const pwd = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];
    for (let i = pwd.length; i < 16; i++) pwd.push(all[Math.floor(Math.random() * all.length)]);
    return pwd.sort(() => Math.random() - 0.5).join("");
  }

  /**
   * Realiza la validación front-end de todos los campos del registro.
   * @returns Verdadero si no hay errores de validación.
   */
  function validate() {
    const e: Record<string, string> = {};
    if (!form.identificacion.trim()) e.identificacion = "El número de documento es requerido";
    if (!form.tipoDocumento) e.tipoDocumento = "Selecciona un tipo de documento";
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.edad || parseInt(form.edad) < 1 || parseInt(form.edad) > 120)
      e.edad = "La edad debe ser mayor a 0 y hasta 120";
    if (!form.departamentoId) e.departamentoId = "Selecciona un departamento";
    if (!form.ciudadId) e.ciudadId = "Selecciona una ciudad";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Ingresa un email válido";
    if (form.password.length < 12) e.password = "Mínimo 12 caracteres";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /**
   * Maneja el envío del formulario de registro.
   * Valida datos, verifica duplicados de email y persiste el nuevo paciente.
   */
  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      Swal.fire({
        icon: "warning",
        title: "Campos inválidos",
        text: "Por favor revisa los campos marcados en rojo.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    
    // Verificar si el email ya existe en la base de datos simulada
    if (findPacienteByEmail(form.email)) {
      Swal.fire({
        icon: "error",
        title: "Email ya registrado",
        text: "Ya existe una cuenta con este email.",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    setSubmitting(true);
    const dep = departamentos.find((d) => d.id === parseInt(form.departamentoId));
    const ciu = ciudades.find((c) => c.id === parseInt(form.ciudadId));
    
    // Construcción del objeto Paciente
    const paciente: Paciente = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).substr(2),
      tipoDocumento: form.tipoDocumento,
      identificacion: form.identificacion.trim(),
      nombre: form.nombre.trim(),
      edad: parseInt(form.edad),
      departamentoId: dep?.id ?? 0,
      departamentoNombre: dep?.name ?? "",
      ciudadId: ciu?.id ?? 0,
      ciudadNombre: ciu?.name ?? "",
      email: form.email.trim().toLowerCase(),
      password: hashPassword(form.password),
      rol: "paciente",
    };

    // Guardado y login automático tras registro exitoso
    savePaciente(paciente);
    setCurrentUser(paciente);
    setSubmitting(false);
    
    await Swal.fire({
      icon: "success",
      title: "¡Registro exitoso!",
      text: "Tu cuenta ha sido creada correctamente. En unos segundos serás redirigido para agendar tus citas.",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    
    handleSuccess();
  }

  /**
   * Calcula el nivel de seguridad de la contraseña ingresada.
   * @returns Un valor numérico de 0 a 4 basado en criterios de complejidad.
   */
  function passwordStrength(pwd: string) {
    let s = 0;
    if (pwd.length >= 12) s++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  }

  /** Retorna la clase de color de Tailwind según la fuerza de la contraseña */
  function strengthColor(s: number) {
    if (s <= 1) return "bg-destructive";
    if (s === 2) return "bg-warning";
    if (s === 3) return "bg-info";
    return "bg-success";
  }

  /** Retorna el texto descriptivo de la seguridad de la contraseña */
  function strengthLabel(s: number) {
    if (s <= 1) return "Débil";
    if (s === 2) return "Regular";
    if (s === 3) return "Buena";
    return "Fuerte ✓";
  }

  const inputClass = (field: string) =>
    `w-full rounded-lg border ${errors[field] ? "border-destructive" : "border-input"} bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-ring outline-none`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Fila 1: Tipo y Número de Documento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de Documento</label>
          <Combobox
            items={tiposDocumento}
            value={form.tipoDocumento}
            onValueChange={(value) => handleChange("tipoDocumento", value)}
            itemValue={(item) => item.value}
            itemLabel={(item) => item.label}
          >
            <ComboboxInput placeholder="Seleccionar" className={inputClass("tipoDocumento")} />
            <ComboboxContent>
              <ComboboxEmpty>No se encontraron tipos.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem item={item}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {errors.tipoDocumento && <p className="text-xs text-destructive mt-1 text-center">{errors.tipoDocumento}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Número de Documento</label>
          <Input
            type="text"
            placeholder="Ej: 1020304050"
            value={form.identificacion}
            onChange={(e) => handleChange("identificacion", e.target.value)}
            className={inputClass("identificacion")}
          />
          {errors.identificacion && <p className="text-xs text-destructive mt-1 text-center">{errors.identificacion}</p>}
        </div>
      </div>

      {/* Fila 2: Nombre Completo y Edad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Nombre completo</label>
          <Input
            type="text"
            placeholder="Nombre y apellidos"
            value={form.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            className={inputClass("nombre")}
          />
          {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Edad</label>
          <Input
            type="number"
            min="1"
            max="120"
            placeholder="Ej: 25"
            value={form.edad}
            onChange={(e) => {
              // Evitar que el primer número escrito sea un cero literal
              if (e.target.value === "0") return;
              handleChange("edad", e.target.value);
            }}
            className={inputClass("edad")}
          />
          {errors.edad && <p className="text-xs text-destructive mt-1">{errors.edad}</p>}
        </div>
      </div>

      {/* Fila 3: Departamento y Ciudad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Departamento</label>
          <Combobox
            items={departamentos}
            value={form.departamentoId}
            onValueChange={(value) => handleChange("departamentoId", value)}
            itemValue={(item) => String(item.id)}
            itemLabel={(item) => item.name}
          >
            <ComboboxInput placeholder={loadingDeps ? "Cargando..." : "Seleccionar"} className={inputClass("departamentoId")} />
            <ComboboxContent>
              <ComboboxEmpty>No se encontraron.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem item={item}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {errors.departamentoId && <p className="text-xs text-destructive mt-1">{errors.departamentoId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Ciudad</label>
          <Combobox
            items={ciudades}
            value={form.ciudadId}
            onValueChange={(value) => handleChange("ciudadId", value)}
            itemValue={(item) => String(item.id)}
            itemLabel={(item) => item.name}
          >
            <ComboboxInput placeholder={loadingCities ? "Cargando..." : "Seleccionar"} className={inputClass("ciudadId")} />
            <ComboboxContent>
              <ComboboxEmpty>No se encontraron.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem item={item}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {errors.ciudadId && <p className="text-xs text-destructive mt-1">{errors.ciudadId}</p>}
        </div>
      </div>

      {/* Fila 4: Email */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
        <Input
          type="email"
          placeholder="correo@ejemplo.com"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className={inputClass("email")}
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
      </div>

      {/* Fila 5: Contraseña y Confirmar Contraseña */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">Contraseña</label>
            <button
              type="button"
              onClick={() => {
                const p = generateSecurePassword();
                handleChange("password", p);
                handleChange("confirmPassword", p);
                setShowPwd(true);
                setShowConfirmPwd(true);
              }}
              className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-primary hover:underline font-medium"
            >
              <RefreshCw className="h-3 w-3" /> Sugerir Contraseña segura
            </button>
          </div>
          <div className="relative">
            <Input
              type={showPwd ? "text" : "password"}
              placeholder="12 caracteres mín."
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`${inputClass("password")} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5 mt-[1px]">Confirmar contraseña</label>
          <div className="relative">
            <Input
              type={showConfirmPwd ? "text" : "password"}
              placeholder="Repite tu contraseña"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className={`${inputClass("confirmPassword")} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Fuerza de la Contraseña */}
      {form.password ? (
        <div className="space-y-2 mt-2">
          <div className="flex gap-1 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span>Seguridad</span>
            <span className="ml-auto font-medium">{strengthLabel(passwordStrength(form.password))}</span>
          </div>
          <div className="flex h-1.5 gap-1">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className={`h-full flex-1 rounded-full ${i < passwordStrength(form.password) ? strengthColor(passwordStrength(form.password)) : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="pt-2">
        <Button type="submit" variant="default" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Crear Cuenta
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={() => {
            if (onSwitchToLogin) {
              onSwitchToLogin();
            } else {
              navigate("/login");
            }
          }}
          className="text-primary font-medium hover:underline"
        >
          Inicia sesión aquí
        </button>
      </div>
    </form>
  );
}

/**
 * Componente que gestiona el formulario de Registro de Médicos.
 * Incluye lógica de especialidades, validación de tarjeta profesional y departamentos.
/**
 * Propiedades para el componente DoctorRegisterForm
 */
interface DoctorRegisterFormProps extends RegisterFormProps {
  /** Datos iniciales para modo edición */
  initialData?: Doctor;
  /** Si es verdadero, no cambia la sesión del usuario actual tras el registro */
  isAdminMode?: boolean;
}

/**
 * Componente que gestiona el formulario de Registro y Edición de Médicos.
 * Incluye lógica de especialidades, validación de tarjeta profesional y departamentos.
 */
export function DoctorRegisterForm({ onSuccess, onSwitchToLogin, initialData, isAdminMode }: DoctorRegisterFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: initialData ? initialData.nombre.replace(/^(Dr\.|Dra\.)\s*/, "") : "",
    especialidad: initialData?.especialidad || "",
    tipoDocumento: initialData?.tipoDocumento || "",
    identificacion: initialData?.identificacion || "",
    tarjetaProfesional: initialData?.tarjetaProfesional || "",
    departamentoId: initialData?.departamentoId?.toString() || "",
    ciudadId: initialData?.ciudadId?.toString() || "",
    email: initialData?.email || "",
    password: "",
    confirmPassword: "",
    titulo: initialData ? (initialData.nombre.startsWith("Dra.") ? "Dra." : "Dr.") : "Dr.",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Carga inicial de departamentos desde la API de Colombia.
   */
  useEffect(() => {
    fetchDepartamentos()
      .then(setDepartamentos)
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los departamentos.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      })
      .finally(() => setLoadingDeps(false));
  }, []);

  /**
   * Actualiza el listado de ciudades cada vez que cambia el departamento seleccionado.
   */
  useEffect(() => {
    const depId = parseInt(form.departamentoId);
    if (!depId) {
      setCiudades([]);
      return;
    }
    setLoadingCities(true);
    setForm((prev) => ({ ...prev, ciudadId: "" }));
    fetchCiudadesByDepartamento(depId)
      .then(setCiudades)
      .catch(() => setCiudades([]))
      .finally(() => setLoadingCities(false));
  }, [form.departamentoId]);

  /** 
   * Maneja la redirección o acción tras un registro satisfactorio.
   */
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    navigate("/app");
  };

  /**
   * Actualiza los valores del formulario y limpia errores asociados al campo modificado.
   */
  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  /**
   * Genera una contraseña segura aleatoria (mínimo 16 caracteres, mezcla de tipos).
   */
  function generateSecurePassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%&*_-+=";
    const all = upper + lower + digits + symbols;
    const pwd = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];
    for (let i = pwd.length; i < 16; i++) pwd.push(all[Math.floor(Math.random() * all.length)]);
    return pwd.sort(() => Math.random() - 0.5).join("");
  }

  /**
   * Realiza la validación front-end de todos los campos del registro.
   * @returns Verdadero si no hay errores de validación.
   */
  function validate() {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.especialidad) e.especialidad = "Selecciona una especialidad";
    if (!form.tipoDocumento) e.tipoDocumento = "Selecciona tipo de documento";
    if (!form.identificacion.trim()) e.identificacion = "El número de documento es requerido";
    if (!form.tarjetaProfesional.trim()) e.tarjetaProfesional = "La tarjeta profesional es requerida";
    if (!form.departamentoId) e.departamentoId = "Selecciona un departamento";
    if (!form.ciudadId) e.ciudadId = "Selecciona una ciudad";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Ingresa un email válido";
    
    // En modo edición, la contraseña es opcional
    if (!initialData) {
      if (form.password.length < 12) e.password = "Mínimo 12 caracteres";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    } else if (form.password) {
      if (form.password.length < 12) e.password = "Mínimo 12 caracteres";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /**
   * Maneja el envío del formulario de registro.
   * Valida datos, verifica duplicados de email y persiste el nuevo médico.
   */
  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      Swal.fire({
        icon: "warning",
        title: "Campos inválidos",
        text: "Por favor revisa los campos marcados en rojo.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    
    // Verificar si el email ya existe (solo si es nuevo o cambió)
    if (!initialData || form.email !== initialData.email) {
      if (findMedicoByEmail(form.email)) {
        Swal.fire({
          icon: "error",
          title: "Email ya registrado",
          text: "Ya existe una cuenta con este email.",
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }
    }

    setSubmitting(true);
    const dep = departamentos.find((d) => d.id === parseInt(form.departamentoId));
    const ciu = ciudades.find((c) => c.id === parseInt(form.ciudadId));
    
    // Construcción del objeto Doctor
    const doctor: Doctor = {
      id: initialData?.id || (
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).substr(2)
      ),
      nombre: `${form.titulo} ${form.nombre.trim()}`,
      especialidad: form.especialidad,
      tipoDocumento: form.tipoDocumento,
      identificacion: form.identificacion.trim(),
      tarjetaProfesional: form.tarjetaProfesional.trim(),
      departamentoId: dep?.id ?? 0,
      ciudadId: ciu?.id ?? 0,
      activo: initialData?.activo ?? true,
      experienciaAnios: initialData?.experienciaAnios ?? (Math.floor(Math.random() * 25) + 3),
      email: normalize(form.email.trim()),
      password: form.password ? hashPassword(form.password) : (initialData?.password || ""),
      rol: "medico",
    };

    // Guardado
    if (initialData) {
      updateMedico(doctor);
    } else {
      saveMedico(doctor);
      // Si es un registro nuevo (especialmente por admin), sembramos citas de prueba
      if (isAdminMode) {
        seedAppointmentsForDoctor(doctor);
      }
    }

    // Solo cambiar sesión si NO estamos en modo admin
    if (!isAdminMode) {
      setCurrentUser(doctor);
    }

    setSubmitting(false);
    
    await Swal.fire({
      icon: "success",
      title: initialData ? "¡Cambios guardados!" : "¡Registro exitoso!",
      text: initialData 
        ? "La información del médico ha sido actualizada correctamente."
        : isAdminMode 
          ? "El médico ha sido registrado en el sistema."
          : "Tu cuenta ha sido creada correctamente. En unos segundos serás redirigido a tu panel médico.",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    
    handleSuccess();
  }

  /**
   * Calcula el nivel de seguridad de la contraseña ingresada.
   * @returns Un valor numérico de 0 a 4 basado en criterios de complejidad.
   */
  function passwordStrength(pwd: string) {
    let s = 0;
    if (pwd.length >= 12) s++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  }

  /** Retorna la clase de color de Tailwind según la fuerza de la contraseña */
  function strengthColor(s: number) {
    if (s <= 1) return "bg-destructive";
    if (s === 2) return "bg-warning";
    if (s === 3) return "bg-info";
    return "bg-success";
  }

  /** Retorna el texto descriptivo de la seguridad de la contraseña */
  function strengthLabel(s: number) {
    if (s <= 1) return "Débil";
    if (s === 2) return "Regular";
    if (s === 3) return "Buena";
    return "Fuerte ✓";
  }

  const inputClass = (field: string) =>
    `w-full rounded-lg border ${errors[field] ? "border-destructive" : "border-input"} bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-ring outline-none transition-all duration-200`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Fila 1: Nombre Completo y Especialidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-1">
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 text-center">Título</label>
              <Combobox
                items={[
                  { value: "Dr.", label: "Dr." },
                  { value: "Dra.", label: "Dra." },
                ]}
                value={form.titulo}
                onValueChange={(value) => handleChange("titulo", value)}
                itemValue={(item) => item.value}
                itemLabel={(item) => item.label}
              >
                <ComboboxInput placeholder="Tít." className={inputClass("titulo")} />
                <ComboboxContent>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem item={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nombre completo</label>
              <Input
                type="text"
                placeholder="Nombre y apellidos"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className={inputClass("nombre")}
              />
              {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre}</p>}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Especialidad</label>
          <Combobox
            items={especialidades}
            value={form.especialidad}
            onValueChange={(value) => handleChange("especialidad", value)}
            itemValue={(item) => item}
            itemLabel={(item) => item}
          >
            <ComboboxInput placeholder="Seleccionar especialidad" className={inputClass("especialidad")} />
            <ComboboxContent>
              <ComboboxEmpty>No se encontraron especialidades.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem item={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {errors.especialidad && <p className="text-xs text-destructive mt-1">{errors.especialidad}</p>}
        </div>
      </div>

      {/* Fila 2: Tipo de Documento e Identificación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de Documento</label>
          <Combobox
            items={tiposDocumento}
            value={form.tipoDocumento}
            onValueChange={(value) => handleChange("tipoDocumento", value)}
            itemValue={(item) => item.value}
            itemLabel={(item) => item.label}
          >
            <ComboboxInput placeholder="Seleccionar tipo" className={inputClass("tipoDocumento")} />
            <ComboboxContent>
              <ComboboxEmpty>No encontrado.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem item={item}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {errors.tipoDocumento && <p className="text-xs text-destructive mt-1">{errors.tipoDocumento}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Número de Documento</label>
          <Input
            type="text"
            placeholder="Ej: 1020304050"
            value={form.identificacion}
            onChange={(e) => handleChange("identificacion", e.target.value)}
            className={inputClass("identificacion")}
          />
          {errors.identificacion && <p className="text-xs text-destructive mt-1">{errors.identificacion}</p>}
        </div>
      </div>

      {/* Fila 3: Tarjeta Profesional y Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Tarjeta Profesional</label>
          <Input
            type="text"
            placeholder="Ej: TP123456"
            value={form.tarjetaProfesional}
            onChange={(e) => handleChange("tarjetaProfesional", e.target.value)}
            className={inputClass("tarjetaProfesional")}
          />
          {errors.tarjetaProfesional && <p className="text-xs text-destructive mt-1">{errors.tarjetaProfesional}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={inputClass("email")}
            disabled={!!initialData}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Fila 4: Departamento y Ciudad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Departamento</label>
          <Combobox
            items={departamentos}
            value={form.departamentoId}
            onValueChange={(value) => handleChange("departamentoId", value)}
            itemValue={(item) => String(item.id)}
            itemLabel={(item) => item.name}
          >
            <ComboboxInput placeholder={loadingDeps ? "Cargando..." : "Seleccionar"} className={inputClass("departamentoId")} />
            <ComboboxContent>
              <ComboboxEmpty>No se encontraron.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem item={item}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {errors.departamentoId && <p className="text-xs text-destructive mt-1">{errors.departamentoId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Ciudad</label>
          <Combobox
            items={ciudades}
            value={form.ciudadId}
            onValueChange={(value) => handleChange("ciudadId", value)}
            itemValue={(item) => String(item.id)}
            itemLabel={(item) => item.name}
          >
            <ComboboxInput placeholder={loadingCities ? "Cargando..." : "Seleccionar"} className={inputClass("ciudadId")} />
            <ComboboxContent>
              <ComboboxEmpty>No se encontraron.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem item={item}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {errors.ciudadId && <p className="text-xs text-destructive mt-1">{errors.ciudadId}</p>}
        </div>
      </div>

      {/* Fila 5: Contraseña y Confirmar Contraseña */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5 h-5">
            <label className="block text-sm font-medium text-foreground">
              Contraseña
            </label>
            <button
              type="button"
              onClick={() => {
                const p = generateSecurePassword();
                handleChange("password", p);
                handleChange("confirmPassword", p);
                setShowPwd(true);
                setShowConfirmPwd(true);
              }}
              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"
            >
              <RefreshCw className="h-3 w-3" /> Sugerir segura
            </button>
          </div>
          <div className="relative">
            <Input
              type={showPwd ? "text" : "password"}
              placeholder={initialData ? "Dejar vacío para no cambiar" : "Mínimo 12 caracteres"}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`${inputClass("password")} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
        </div>

        <div>
          {(!initialData || form.password) && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="block text-sm font-medium text-foreground">Confirmar Contraseña</label>
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className={`${inputClass("confirmPassword")} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Fuerza de la Contraseña */}
      {form.password ? (
        <div className="space-y-2 mt-2">
          <div className="flex gap-1 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span>Seguridad</span>
            <span className="ml-auto font-medium">{strengthLabel(passwordStrength(form.password))}</span>
          </div>
          <div className="flex h-1.5 gap-1">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className={`h-full flex-1 rounded-full ${i < passwordStrength(form.password) ? strengthColor(passwordStrength(form.password)) : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="pt-2">
        <Button type="submit" variant="default" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {initialData ? "Guardar Cambios" : "Crear Cuenta"}
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={() => {
            if (onSwitchToLogin) {
              onSwitchToLogin();
            } else {
              navigate("/login");
            }
          }}
          className="text-primary font-medium hover:underline"
        >
          Inicia sesión aquí
        </button>
      </div>
    </form>
  );
}
