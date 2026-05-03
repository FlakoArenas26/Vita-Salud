# Frontend VitaSalud

## Descripción
Este módulo contiene la capa de presentación de VitaSalud. Está construido como una **SPA en React + TypeScript** y se encarga de renderizar la experiencia de usuario para pacientes, médicos y administradores, consumiendo la API REST del backend.

Su responsabilidad principal es la **View** dentro de la arquitectura general del proyecto, junto con la orquestación del estado visual, formularios, navegación y alertas del sistema.

## Objetivos del frontend

- ofrecer una experiencia moderna, clara y responsive
- permitir navegación por roles
- consumir la API centralizada del backend
- mostrar citas, médicos, perfiles y estados del sistema
- reflejar cambios importantes mediante notificaciones visuales

## Stack del frontend

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Framer Motion
- Radix UI
- Lucide React
- SweetAlert2

## Estructura principal

```text
Frontend/
├── public/                 # PWA, favicon y activos estáticos
├── src/
│   ├── assets/             # Recursos visuales
│   ├── components/
│   │   ├── auth/           # Formularios y diálogos de autenticación
│   │   ├── layout/         # Header, footer y composición visual
│   │   └── ui/             # Componentes reutilizables base
│   ├── hooks/              # Hooks personalizados
│   ├── lib/                # Tipos, utilidades, capa de consumo API
│   ├── routes/             # Pantallas principales por flujo
│   ├── App.tsx             # Definición de rutas
│   ├── main.tsx            # Punto de entrada
│   └── styles.css          # Estilos globales
├── package.json
└── vite.config.ts
```

## Organización funcional

### `src/routes/`
Define las páginas principales:

- landing pública
- login y registro
- dashboard del paciente
- dashboard del médico
- dashboard del administrador
- agendamiento
- detalle de cita
- configuración

### `src/components/`
Contiene bloques reutilizables y mantiene separada la UI de la lógica de páginas.

### `src/lib/apiService.ts`
Actúa como **capa de servicios del frontend** y centraliza:

- llamadas HTTP
- inyección del token Bearer
- manejo estándar de errores
- normalización de respuestas del backend

Esto evita tener `fetch` dispersos por toda la aplicación y mejora mantenibilidad.

### `src/lib/auth.ts`
Define tipos de usuario/cita, datos compartidos y utilidades como la generación de recomendaciones clínicas por especialidad.

## Funcionalidades destacadas del frontend

- autenticación por roles con persistencia de sesión
- recuperación de contraseña por email desde el mismo modal de acceso
- dashboards diferenciados por perfil
- agendamiento con consulta dinámica de disponibilidad
- reprogramación y cancelación de citas
- generación asistida de recomendaciones para el médico
- alertas para citas agendadas, canceladas, reprogramadas y recomendaciones disponibles
- notificaciones de escritorio y SweetAlert para pacientes cuando el médico carga recomendaciones o cancela una cita
- bloqueo visual de fechas y horas fuera del calendario laboral del sistema
- validación de fechas/hora en Colombia (America/Bogota) para agendamiento y reprogramación
- diseño responsive y navegación fluida

## Manejo de sesión y datos

### SessionStorage
Se usa para mantener:

- usuario autenticado
- token JWT
- refresh token

Esto permite sesiones activas por pestaña y facilita pruebas de múltiples roles.

## Cambios Recientes

### Mejoras en Notificaciones y Alertas (2026-05-02)
- **Sincronización de notificaciones para pacientes**: Agregado triggers explícitos en `syncPatientNotifications` para mostrar SweetAlert y notificaciones de escritorio cuando el médico carga recomendaciones o cancela una cita. Reducido intervalo de polling de 30s a 10s para menor latencia.
- **Alertas en dashboard del médico**: Extendido `syncDoctorNotifications` para incluir notificaciones cuando un paciente agenda una nueva cita (estado "agendada"). Agregado refresh automático al ganar foco en la ventana y listener de eventos de storage para sincronización entre pestañas.
- **Generación de recomendaciones IA**: Modificado `generateAgentRecommendation` en `src/lib/auth.ts` para seleccionar entre 3 y 5 recomendaciones aleatorias por paciente de un pool ampliado por especialidad (manejo, cuidados, alertas, seguimiento y genéricas). Eliminado servidor MCP no utilizado.
- **Limpieza de código**: Removida carpeta `mcp-medical-assistant` ya que las recomendaciones se generan localmente y no se utiliza el servidor MCP.

### Validaciones Realizadas
- Build exitoso en Frontend con `npm run build`.
- Build exitoso en Backend con `npm run build`.
- Funcionalidad probada en dashboards de paciente y médico para confirmación de alertas.

### Consumo de API
El frontend ya no opera con una base mock central como versión final del proyecto, sino que consume la API del backend mediante `apiService`.

## PWA y experiencia responsive

- manifiesto web incluido
- soporte de instalación en navegador compatible
- diseño pensado para escritorio y móvil
- uso de Flexbox y Grid
- alertas compatibles con flujos de dashboard y formularios

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Variables relevantes

- `VITE_API_URL`: URL base del backend

Ejemplo:

```env
VITE_API_URL=http://localhost:3000/api
```

## Rutas y archivos clave

- `src/App.tsx`: rutas de la aplicación
- `src/routes/app.index.tsx`: dashboard principal por roles
- `src/routes/app.agendar.tsx`: flujo de agendamiento
- `src/components/auth/AuthForms.tsx`: formularios principales
- `src/lib/apiService.ts`: cliente HTTP centralizado
- `src/lib/auth.ts`: tipos y utilidades de dominio frontend
- `src/lib/appointmentRules.ts`: reglas compartidas de agenda laboral
- `src/components/auth/AuthDialog.tsx`: modal de login, registro y recuperación

## Rol del frontend dentro de la arquitectura MVC

Aunque el MVC se aplica principalmente en el backend, el frontend cumple el papel de **View desacoplada**, ya que:

- representa los datos al usuario
- captura acciones e intención de uso
- consume la capa Controller del backend vía HTTP
- reacciona a los resultados generados por la lógica de negocio

## Recomendaciones para demo

1. iniciar sesión con paciente
2. agendar una cita
3. reprogramarla
4. abrir sesión de médico
5. mostrar alertas y atención
6. regresar al paciente para ver recomendaciones

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run build` | build de producción |
| `npm run build:dev` | build modo development |
| `npm run preview` | vista previa del build |
| `npm run lint` | análisis estático |
| `npm run format` | formateo del código |
