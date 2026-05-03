# Backend VitaSalud

## Descripción
Este módulo contiene la API REST de VitaSalud. Aquí se implementa la lógica central del sistema: autenticación, gestión de usuarios, control de roles, disponibilidad médica, agendamiento, reprogramación, cancelación y atención de citas.

El backend es la parte del proyecto donde se aplica de forma directa el patrón **MVC**, reforzado con una **capa de servicios** para mantener aislada la lógica de negocio.

## Stack del backend

- Node.js
- Express
- TypeScript
- Sequelize ORM
- MySQL
- JWT
- bcrypt
- express-validator
- Swagger UI

## Estructura principal

```text
Backend/
├── database/
│   ├── migrations/        # Definición de tablas
│   └── seeders/           # Datos de prueba
├── src/
│   ├── config/            # DB, Swagger, bootstrap
│   ├── controllers/       # Capa Controller
│   ├── middlewares/       # Auth, roles, validaciones, rate limit
│   ├── models/            # Capa Model
│   ├── routes/            # Definición de endpoints
│   ├── services/          # Lógica de negocio
│   ├── types/             # Tipos y DTOs
│   ├── utils/             # Helpers comunes
│   ├── validators/        # Reglas de validación
│   ├── app.ts             # Configuración de Express
│   ├── server.ts          # Punto de arranque
│   └── swagger-docs.ts    # Definición OpenAPI
├── README.md
└── SWAGGER.md
```

## Cómo se aplicó MVC

### Model
Ubicado en `src/models/`.

Representa las entidades del dominio:

- `User`
- `Doctor`
- `Appointment`

Aquí se define:

- estructura de datos
- tipos
- restricciones base
- relaciones entre tablas

### Controller
Ubicado en `src/controllers/`.

Se encarga de:

- recibir la petición HTTP
- leer parámetros, body y contexto autenticado
- delegar operaciones al servicio correspondiente
- construir la respuesta HTTP

Los controladores son deliberadamente delgados para no mezclar la lógica clínica con la capa de transporte.

### View
En esta arquitectura desacoplada, la vista no vive en el backend sino en el frontend React. El backend responde en JSON y actúa como servidor de datos y reglas del sistema.

## Capa de servicios

Además del MVC clásico, se añadió una **Service Layer** en `src/services/` para aislar la lógica de negocio.

### ¿Por qué?

- evita controladores demasiado extensos
- separa reglas del negocio del protocolo HTTP
- facilita mantenimiento y escalabilidad
- permite reutilización de lógica
- mejora claridad para pruebas y documentación

### Servicios principales

- `auth.service.ts`: login, registro, refresh token, hashing
- `user.service.ts`: consulta y administración de usuarios
- `appointment.service.ts`: citas, disponibilidad, cambios de estado y reprogramación
- `tokenBlacklist.service.ts`: revocación temporal de tokens cerrados

## Funcionalidades del backend

- autenticación JWT
- emisión de access token y refresh token
- cambio autenticado de contraseña
- recuperación de contraseña por email registrado
- control de acceso por roles
- validación de requests
- registro de pacientes y médicos
- gestión de usuarios por administrador
- agendamiento de citas
- verificación de conflictos horarios
- reprogramación de citas
- cancelación y atención de citas
- validación de calendario laboral de lunes a sábado entre 07:00 y 17:00
- validación de fechas/hora en Colombia (America/Bogota) para evitar inconsistencias con el timezone UTC del servidor/DB
- documentación Swagger

## Seguridad implementada

- contraseñas con `bcrypt`
- autenticación con JWT
- middleware de verificación de token
- middleware de roles
- rate limiting para login
- validaciones con `express-validator`
- blacklist de token para logout

## Requisitos

- Node.js 18 o superior
- npm
- MySQL 8 o superior

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Crear `.env` a partir de `.env.example`.

Variables esperadas:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`

### 3. Crear base de datos

La base de datos se crea automáticamente al ejecutar la aplicación. No requiere comandos manuales.

### 4. Ejecutar la aplicación

```bash
npm run dev
```

Al iniciar, la aplicación:
- Crea la base de datos si no existe
- Sincroniza las tablas automáticamente
- Inserta datos de prueba iniciales

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | inicia servidor en desarrollo |
| `npm run build` | compila TypeScript |
| `npm start` | ejecuta build compilado |

## Endpoints principales

### Autenticación

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/register/doctor`
- `POST /api/auth/refresh`
- `POST /api/auth/recover-password`
- `POST /api/auth/change-password`
- `POST /api/auth/logout`

El endpoint de recuperación pública quedó simplificado para usar únicamente el email registrado y una nueva contraseña que cumpla la misma política de seguridad definida para el registro.

### Usuarios

- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users/doctors`
- `GET /api/users`
- `GET /api/users/{id}`
- `PATCH /api/users/{id}`
- `DELETE /api/users/{id}`
- `PATCH /api/users/doctors/{id}/toggle`
- `POST /api/users/bulk-doctors`

### Citas

- `POST /api/appointments`
- `GET /api/appointments`
- `GET /api/appointments/availability/{doctorId}`
- `GET /api/appointments/{id}`
- `PATCH /api/appointments/{id}`
- `PATCH /api/appointments/{id}/reschedule`

## Documentación de la API

- Swagger UI: `http://localhost:3000/api-docs`
- Health check: `http://localhost:3000/health`
- Guía detallada: [SWAGGER.md](./SWAGGER.md)

## Reglas de negocio relevantes

- solo el paciente agenda citas
- solo las citas `agendadas` pueden reprogramarse
- una cita `atendida` ya no puede modificarse
- el médico no puede tener dos citas activas en la misma fecha y hora
- no se aceptan citas los domingos
- las citas solo se permiten en los bloques laborales habilitados entre 07:00 y 17:00
- las solicitudes del mismo día deben hacerse dentro del horario laboral y con mínimo 1 hora de anticipación, usando el horario de Colombia (America/Bogota)
- el paciente recibe alertas en su dashboard cuando el médico carga recomendaciones o cancela una cita
- el paciente solo puede actuar sobre sus propias citas
- el médico solo puede gestionar citas pertenecientes a su agenda

## Usuarios de prueba

Los usuarios se crean automáticamente al iniciar la aplicación por primera vez:

| Rol | Email | Password | Especialidad |
|---|---|---|---|
| Admin | `admin@vitasalud.com` | `Admin123456*!` | - |
| Médico | `carlos.garcia@vitasalud.com` | `Medico123456*!` | Medicina General |
| Médico | `maria.martinez@vitasalud.com` | `Medico123456*!` | Pediatría |

## Archivos clave para sustentación

- `src/routes/`: definición de contratos HTTP
- `src/controllers/`: capa controller
- `src/services/`: lógica del negocio
- `src/models/`: capa model
- `src/middlewares/`: seguridad y control de acceso

## Cambios Recientes

### Mejoras en Notificaciones y Alertas (2026-05-02)
- **Comportamiento de alertas para pacientes**: Las alertas en el frontend se activan cuando el médico carga recomendaciones clínicas o cancela una cita. El backend mantiene el estado de las citas y recomendaciones, permitiendo que el frontend consulte cambios en tiempo real.
- **Alertas para médicos**: Los médicos reciben notificaciones cuando un paciente agenda una nueva cita. El sistema verifica el estado "agendada" de las citas para activar estas alertas.
- **Generación de recomendaciones IA**: Aunque la lógica de generación está en el frontend (`src/lib/auth.ts`), el backend proporciona la estructura de datos de citas y especialidades que alimenta esta funcionalidad. Las recomendaciones ahora generan entre 3 y 5 ítems aleatorios por paciente para mayor variedad.

### Validaciones Realizadas
- Build exitoso con `npm run build`.
- Funcionalidad de notificaciones probada en integración con frontend.
- `src/swagger-docs.ts`: endpoints documentados
- `src/config/swagger.ts`: esquemas OpenAPI
