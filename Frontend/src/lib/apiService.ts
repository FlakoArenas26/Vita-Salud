const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Construye las cabeceras base para todas las solicitudes HTTP del frontend.
 * Si existe un token activo en sesión, se adjunta automáticamente como Bearer.
 */
const getHeaders = () => {
  const token = sessionStorage.getItem("vitasalud_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Estandariza el manejo de respuestas HTTP del backend.
 * Centraliza errores de sesión, validación y mensajes de negocio.
 */
async function handleResponse(response: Response) {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    // Si el usuario no existe (404 en /me) o el token expiró (401)
    if ((response.status === 401 || response.status === 404) && response.url.includes("/users/me")) {
      console.warn("Sesión inválida o usuario no encontrado. Cerrando sesión...");
      sessionStorage.removeItem("vitasalud_token");
      sessionStorage.removeItem("vitasalud_refresh_token");
      sessionStorage.removeItem("vitasalud_current_user");
      window.location.href = "/login";
    }

    let error = (data && data.message) || response.statusText;
    
    // Si hay errores de validación adicionales, adjuntarlos al mensaje
    if (data && Array.isArray(data.errors) && data.errors.length > 0) {
      const details = data.errors.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
      error = `${error}: ${details}`;
    }

    return Promise.reject(new Error(error));
  }

  return data;
}

/**
 * Cliente HTTP centralizado de VitaSalud.
 * Expone operaciones agrupadas por dominio para evitar `fetch` dispersos
 * dentro de los componentes de la interfaz.
 */
export const apiService = {
  auth: {
    login: async (credentials: any) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse(response);
      if (data && data.data.token) {
        sessionStorage.setItem("vitasalud_token", data.data.token);
        if (data.data.refreshToken) {
          sessionStorage.setItem("vitasalud_refresh_token", data.data.refreshToken);
        }
      }
      return data;
    },
    refresh: async () => {
      const refreshToken = sessionStorage.getItem("vitasalud_refresh_token");
      if (!refreshToken) throw new Error("No hay refresh token");

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await handleResponse(response);
      if (data && data.data.token) {
        sessionStorage.setItem("vitasalud_token", data.data.token);
      }
      return data;
    },
    registerPatient: async (data: any) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    registerDoctor: async (data: any) => {
      const response = await fetch(`${API_URL}/auth/register/doctor`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    logout: async () => {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: getHeaders(),
      });
      sessionStorage.removeItem("vitasalud_token");
      sessionStorage.removeItem("vitasalud_refresh_token");
      sessionStorage.removeItem("vitasalud_current_user");
      return handleResponse(response);
    },
  },
  appointments: {
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    getAll: async () => {
      const response = await fetch(`${API_URL}/appointments`, {
        headers: getHeaders(),
      });
      const res = await handleResponse(response);
      if (res && res.data && Array.isArray(res.data)) {
        res.data = res.data.map((cita: any) => ({
          ...cita,
          pacienteNombre: cita.paciente?.nombre || cita.pacienteNombre || 'Paciente',
          pacienteIdentificacion: cita.paciente?.identificacion || cita.pacienteIdentificacion || '',
          pacienteTipoDoc: cita.paciente?.tipoDocumento || cita.pacienteTipoDoc || '',
          doctorNombre: cita.doctor?.user?.nombre ? `Dr. ${cita.doctor.user.nombre.replace(/^Dr\.\s*/i, '')}` : cita.doctorNombre || 'Dr.',
          doctorIdentificacion: cita.doctor?.user?.identificacion || cita.doctorIdentificacion || '',
          doctorTarjetaProfesional: cita.doctor?.tarjetaProfesional || cita.doctorTarjetaProfesional || '',
        }));
      }
      return res;
    },
    getDoctorAvailability: async (doctorId: string, fecha: string) => {
      const response = await fetch(`${API_URL}/appointments/availability/${doctorId}?fecha=${fecha}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        headers: getHeaders(),
      });
      const res = await handleResponse(response);
      if (res && res.data) {
        const cita = res.data;
        res.data = {
          ...cita,
          pacienteNombre: cita.paciente?.nombre || cita.pacienteNombre || 'Paciente',
          pacienteIdentificacion: cita.paciente?.identificacion || cita.pacienteIdentificacion || '',
          pacienteTipoDoc: cita.paciente?.tipoDocumento || cita.pacienteTipoDoc || '',
          doctorNombre: cita.doctor?.user?.nombre ? `Dr. ${cita.doctor.user.nombre.replace(/^Dr\.\s*/i, '')}` : cita.doctorNombre || 'Dr.',
          doctorIdentificacion: cita.doctor?.user?.identificacion || cita.doctorIdentificacion || '',
          doctorTarjetaProfesional: cita.doctor?.tarjetaProfesional || cita.doctorTarjetaProfesional || '',
        };
      }
      return res;
    },
    updateStatus: async (id: string, data: any) => {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    reschedule: async (id: string, data: { fecha: string; hora: string }) => {
      const response = await fetch(`${API_URL}/appointments/${id}/reschedule`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  },
  users: {
    getProfile: async () => {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    updateProfile: async (data: any) => {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    updateUser: async (id: string, data: any) => {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    deleteUser: async (id: string) => {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getDoctors: async () => {
      const response = await fetch(`${API_URL}/users/doctors`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getAll: async () => {
      const response = await fetch(`${API_URL}/users`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    toggleDoctorStatus: async (id: string, activo: boolean) => {
      const response = await fetch(`${API_URL}/users/doctors/${id}/toggle`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ activo }),
      });
      return handleResponse(response);
    },
    bulkCreateDoctors: async (data: any[]) => {
      const response = await fetch(`${API_URL}/users/bulk-doctors`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  },
};
