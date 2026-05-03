# Swagger y Pruebas de API

Esta guía complementa la UI de Swagger de VitaSalud y resume qué endpoints existen, cómo autenticarse y cómo probar cada flujo importante.

## 1. Dónde abrir Swagger

Con el backend levantado en local:

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json` si expones el spec manualmente en el futuro
- Health check: `http://localhost:3000/health`

## 2. Cómo autorizarse en Swagger

1. Ejecuta `POST /api/auth/login`.
2. Copia el valor de `data.token`.
3. En Swagger UI pulsa `Authorize`.
4. Pega el token así:

```text
Bearer TU_TOKEN
```

5. Confirma y prueba cualquier endpoint protegido.

## 3. Respuesta estándar de la API

La mayoría de endpoints responden con esta estructura:

```json
{
  "success": true,
  "message": "Mensaje opcional",
  "data": {}
}
```

Cuando ocurre un error:

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## 4. Endpoints disponibles

### Autenticación

| Método | Endpoint | Uso principal | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión | No |
| `POST` | `/api/auth/register` | Registrar paciente | No |
| `POST` | `/api/auth/register/doctor` | Registrar médico | No |
| `POST` | `/api/auth/refresh` | Renovar access token | No |
| `POST` | `/api/auth/recover-password` | Restablecer contraseña por email | No |
| `POST` | `/api/auth/change-password` | Cambiar contraseña autenticado | Sí |
| `POST` | `/api/auth/logout` | Cerrar sesión y revocar token actual | Sí |

### Usuarios

| Método | Endpoint | Uso principal | Rol |
|---|---|---|---|
| `GET` | `/api/users/me` | Consultar perfil propio | Cualquiera autenticado |
| `PATCH` | `/api/users/me` | Actualizar perfil propio | Cualquiera autenticado |
| `GET` | `/api/users/doctors` | Listar médicos | Cualquiera autenticado |
| `GET` | `/api/users` | Listar todos los usuarios | Admin |
| `GET` | `/api/users/{id}` | Consultar usuario por ID | Admin |
| `PATCH` | `/api/users/{id}` | Editar usuario por ID | Admin |
| `DELETE` | `/api/users/{id}` | Eliminar usuario | Admin |
| `PATCH` | `/api/users/doctors/{id}/toggle` | Activar o desactivar médico | Admin |
| `POST` | `/api/users/bulk-doctors` | Crear médicos en lote | Admin |

### Citas

| Método | Endpoint | Uso principal | Rol |
|---|---|---|---|
| `POST` | `/api/appointments` | Agendar cita | Paciente |
| `GET` | `/api/appointments` | Listar citas según rol | Autenticado |
| `GET` | `/api/appointments/availability/{doctorId}` | Ver horas ocupadas de un médico | Autenticado |
| `GET` | `/api/appointments/{id}` | Consultar detalle de una cita | Autenticado |
| `PATCH` | `/api/appointments/{id}` | Cancelar o atender cita | Médico/Paciente/Admin |
| `PATCH` | `/api/appointments/{id}/reschedule` | Reprogramar cita | Paciente |

> Nota: las fechas y horas de cita se validan con el huso horario de Colombia (`America/Bogota`), incluso cuando el backend opera con UTC en servidor y base de datos.

### Sistema

| Método | Endpoint | Uso principal | Auth |
|---|---|---|---|
| `GET` | `/health` | Verificar estado de la API | No |

## 5. Flujos recomendados para probar en Swagger

### Flujo A. Login y uso de token

Body:

```json
{
  "email": "admin@vitasalud.com",
  "password": "Admin1234"
}
```

Resultado esperado:

- `200 OK`
- llega `data.token`
- con ese token ya puedes autorizar el resto

### Flujo B. Registro de paciente

Body:

```json
{
  "nombre": "Paciente Demo",
  "email": "paciente.demo@correo.com",
  "password": "Paciente1234",
  "tipoDocumento": "CC",
  "identificacion": "1099001122",
  "edad": 28,
  "departamentoId": 11,
  "ciudadId": 11001
}
```

Resultado esperado:

- `201 Created`
- el usuario queda listo para iniciar sesión

### Flujo C. Registro de médico

Body:

```json
{
  "nombre": "Dra. Ana Torres",
  "email": "ana.torres@vitasalud.com",
  "password": "Doctor1234",
  "tipoDocumento": "CC",
  "identificacion": "1002003004",
  "edad": 39,
  "departamentoId": 11,
  "ciudadId": 11001,
  "tarjetaProfesional": "TP-778899",
  "especialidad": "Cardiología",
  "experienciaAnios": 12
}
```

### Flujo C1. Recuperar contraseña desde "Olvidé mi contraseña"

Body:

```json
{
  "email": "juan.perez@email.com",
  "newPassword": "NuevaClave1234*!"
}
```

Resultado esperado:

- `200 OK`
- la contraseña queda actualizada y el usuario puede volver a iniciar sesión
- la nueva contraseña debe cumplir la misma política de seguridad del registro
- el frontend puede sugerir una contraseña segura automáticamente igual que en el registro

### Flujo C2. Cambiar contraseña autenticado

Body:

```json
{
  "currentPassword": "Paciente1234",
  "newPassword": "PacienteNueva1234*!"
}
```

Endpoint:

```text
POST /api/auth/change-password
```

### Flujo D. Consultar disponibilidad antes de agendar

Endpoint:

```text
GET /api/appointments/availability/{doctorId}?fecha=2026-05-10
```

Resultado esperado:

- un arreglo de horas ocupadas
- ejemplo: `["08:00", "08:30", "10:30"]`

### Flujo E. Agendar una cita

Body:

```json
{
  "doctorId": "UUID_DEL_MEDICO",
  "fecha": "2026-05-10",
  "hora": "08:30",
  "consultorio": "301"
}
```

Validaciones importantes:

- el médico debe existir
- el médico debe estar activo
- no puede existir otra cita `agendada` del mismo médico en esa fecha y hora
- solo se permiten citas de lunes a sábado
- la cita debe usar uno de los bloques habilitados por la app entre `07:00` y `17:00`
- las citas del mismo día solo pueden solicitarse durante el horario laboral y con al menos 1 hora de anticipación

### Flujo F. Reprogramar una cita

Body:

```json
{
  "fecha": "2026-05-12",
  "hora": "10:30"
}
```

Endpoint:

```text
PATCH /api/appointments/{id}/reschedule
```

Resultado esperado:

- `200 OK`
- la cita conserva paciente, médico, estado y consultorio
- solo cambia fecha y hora

Validaciones importantes:

- solo aplica sobre citas en estado `agendada`
- el paciente solo puede reprogramar sus propias citas
- no puede generar conflicto con otra cita activa del mismo médico
- la nueva fecha no puede caer en domingo
- la nueva hora debe pertenecer a los bloques laborales habilitados
- si la reprogramación es para el mismo día, debe hacerse dentro del horario laboral y con mínimo 1 hora de anticipación

### Flujo G. Cancelar una cita

Body:

```json
{
  "estado": "cancelada"
}
```

Endpoint:

```text
PATCH /api/appointments/{id}
```

### Flujo H. Atender una cita y guardar recomendaciones

Body:

```json
{
  "estado": "atendida",
  "recomendaciones": "Reposo relativo, hidratación abundante y control en 7 días."
}
```

Validaciones importantes:

- el médico solo puede atender citas propias
- una cita ya atendida no puede volver a modificarse

### Flujo I. Activar o desactivar médico

Body:

```json
{
  "activo": false
}
```

Endpoint:

```text
PATCH /api/users/doctors/{id}/toggle
```

### Flujo J. Carga masiva de médicos

Body:

```json
[
  {
    "nombre": "Dr. Uno",
    "email": "dr.uno@vitasalud.com",
    "password": "Doctor1234",
    "tipoDocumento": "CC",
    "identificacion": "900001",
    "edad": 40,
    "departamentoId": 11,
    "ciudadId": 11001,
    "tarjetaProfesional": "TP-001",
    "especialidad": "Medicina General",
    "experienciaAnios": 8
  }
]
```

## 6. Casos de error útiles para demostrar

- Login con contraseña incorrecta: debe responder `401`.
- Intentar agendar dos citas para el mismo médico en la misma franja: debe responder `400`.
- Intentar agendar un domingo o fuera de los bloques `07:00-17:00`: debe responder `400`.
- Intentar agendar el mismo día después del cierre operativo: debe responder `400`.
- Reprogramar una cita cancelada o atendida: debe responder `400`.
- Consumir endpoints admin con token de paciente: debe responder `403`.
- Llamar endpoints protegidos sin token: debe responder `401`.

## 7. Orden sugerido para probar la API en una demo

1. `POST /api/auth/login`
2. `GET /api/users/me`
3. `GET /api/users/doctors`
4. `GET /api/appointments/availability/{doctorId}`
5. `POST /api/appointments`
6. `GET /api/appointments`
7. `PATCH /api/appointments/{id}/reschedule`
8. `PATCH /api/appointments/{id}` para cancelar o atender
9. `POST /api/auth/logout`

## 8. Funcionalidades de Notificaciones y Alertas

### Comportamiento de Notificaciones
- **Para Pacientes**: Reciben alertas cuando el médico carga recomendaciones clínicas o cancela una cita. Las notificaciones se activan en el frontend mediante polling cada 10 segundos y eventos de foco en la ventana.
- **Para Médicos**: Reciben alertas cuando un paciente agenda una nueva cita (estado "agendada"). Incluye sincronización automática al cambiar entre pestañas del navegador.
- **Tipos de Notificación**:
  - SweetAlert modales para eventos importantes.
  - Notificaciones de escritorio (si permisos concedidos).
  - Actualización visual en dashboards sin recarga completa.

### Generación de Recomendaciones IA
- La función `generateAgentRecommendation` en el frontend genera entre 3 y 5 recomendaciones aleatorias basadas en la especialidad médica de la cita.
- Categorías: manejo farmacológico, cuidados domiciliarios, alertas de alarma y seguimiento clínico.
- Especialidades soportadas: Medicina General, Pediatría, Cardiología, Oftalmología, Neurología, Ginecología.
- Eliminado servidor MCP no utilizado; las recomendaciones se generan localmente para mayor control y variedad.

### Validaciones Recientes (2026-05-02)
- Build exitoso del backend.
- Integración probada con frontend para sincronización de notificaciones.
- Recomendaciones IA modificadas para generar 3-5 ítems aleatorios por paciente.
- Eliminada carpeta MCP no utilizada para limpieza de código.
- Eliminadas migraciones y seeders no utilizados; BD se crea automáticamente.

## 9. Nota importante sobre la documentación

La fuente principal de Swagger vive en:

- `Backend/src/swagger-docs.ts`
- `Backend/src/config/swagger.ts`

Si agregas un nuevo endpoint en rutas/controladores, actualiza ambos archivos para que la UI y los esquemas sigan alineados.
