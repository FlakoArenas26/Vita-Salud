# VitaSalud - Plataforma de Gestión Médica Integral

## 📋 Descripción del Proyecto
VitaSalud es una aplicación web moderna orientada a la gestión eficiente de procesos clínicos y administrativos dentro de un centro médico. La plataforma permite la interacción coordinada entre **Administradores, Médicos y Pacientes**, centralizando el ciclo completo de autenticación, gestión de usuarios, agendamiento, reprogramación, atención y seguimiento de citas médicas.

Este proyecto fue desarrollado en el marco de la asignatura de **Desarrollo Web** del programa de **Ingeniería de Sistemas (10mo semestre)**, con un enfoque no solo funcional, sino también arquitectónico, documental y demostrativo. Por ello, además de resolver el flujo operativo del sistema, se diseñó una estructura técnica sólida basada en **Frontend + Backend desacoplados**, documentación Swagger y una explicación explícita de cómo se aplicó el patrón **MVC** junto con una **capa de servicios** para aislar la lógica de negocio.

---

## 🎯 Objetivo del Sistema
VitaSalud busca digitalizar y organizar la operación básica de una plataforma médica mediante:

- autenticación por roles
- gestión de usuarios y médicos
- agendamiento y reprogramación de citas
- atención médica con recomendaciones clínicas
- control de disponibilidad por médico
- restricción de agenda a lunes-sábado dentro del horario operativo del sistema
- notificaciones visuales ante cambios relevantes
- documentación técnica para consumo y prueba de la API

---

## 👥 Actores del Sistema

### Paciente
- registro e inicio de sesión
- consulta de médicos disponibles
- agendamiento de citas
- reprogramación de citas
- cancelación de citas
- consulta del historial de atención
- recepción de alertas cuando una cita cambia o cuando el médico carga recomendaciones

### Médico
- inicio de sesión
- visualización de agenda propia
- atención de pacientes
- generación y edición de recomendaciones médicas
- recepción de alertas cuando se agenda, cancela o reprograma una cita

### Administrador
- visualización global de usuarios
- gestión de médicos del sistema
- activación y desactivación de médicos
- edición y eliminación de usuarios
- creación individual y masiva de médicos

---

## 🏗️ Arquitectura General del Proyecto
El proyecto está dividido en dos aplicaciones desacopladas:

- `Frontend/`: capa de presentación desarrollada con React, TypeScript y Vite
- `Backend/`: API REST desarrollada con Node.js, Express, TypeScript, Sequelize y MySQL

Esta separación permite:

- mantener responsabilidades claras entre interfaz y lógica de negocio
- facilitar pruebas y mantenimiento
- documentar la API de forma independiente
- escalar el sistema de forma más ordenada

---

## 🧱 Aplicación del Patrón MVC
Uno de los requerimientos clave del proyecto es la implementación del patrón **Modelo - Vista - Controlador (MVC)**. En VitaSalud este patrón se aplicó principalmente en el backend, mientras que el frontend actúa como la capa visual consumidora de la API.

### 1. Model
La capa **Model** está representada por los modelos Sequelize definidos en `Backend/src/models/`.

Su responsabilidad es:

- representar las entidades del dominio
- definir atributos y relaciones
- mapear la estructura relacional de MySQL a objetos TypeScript

Entidades principales:

- `User`: base de autenticación y control de roles
- `Doctor`: extensión del perfil médico con especialidad y tarjeta profesional
- `Appointment`: vínculo transaccional entre paciente y médico

### 2. Controller
La capa **Controller** está implementada en `Backend/src/controllers/`.

Su responsabilidad es:

- recibir la petición HTTP
- leer parámetros, body y contexto del usuario autenticado
- delegar la operación al servicio correspondiente
- devolver respuestas HTTP normalizadas

Es decir, los controladores no concentran la lógica clínica o de negocio, sino que coordinan el flujo entre entrada y salida.

### 3. View
En una arquitectura web desacoplada como esta, la **View** no vive dentro del backend, sino en el frontend React.

La vista está implementada en:

- `Frontend/src/routes/`
- `Frontend/src/components/`

Esta capa se encarga de:

- renderizar formularios, dashboards y módulos visuales
- capturar acciones del usuario
- consumir los endpoints del backend
- mostrar estados, alertas y resultados

### 4. ¿Por qué se mantuvo MVC aunque haya frontend separado?
Porque el backend sigue respetando claramente la separación entre:

- representación de datos (`models`)
- coordinación HTTP (`controllers`)
- reglas de negocio (`services`)

Y el frontend cumple el papel de vista desacoplada del sistema.

---

## 🔧 ¿Por qué se añadió una Capa de Servicios?
Aunque MVC ya organiza responsabilidades, en sistemas medianos o escalables no es recomendable sobrecargar los controladores con reglas de negocio. Por eso se añadió una **Service Layer** en `Backend/src/services/`.

### Beneficios de esta decisión

- aísla la lógica de negocio del transporte HTTP
- evita controladores demasiado extensos
- facilita reutilización de reglas entre múltiples endpoints
- mejora mantenibilidad y legibilidad
- hace más sencillo probar y evolucionar el sistema

### Ejemplos dentro del proyecto

- `appointment.service.ts` concentra validaciones de conflicto horario, control por rol y reprogramación
- `auth.service.ts` encapsula login, hashing, emisión de tokens y registro
- `user.service.ts` centraliza actualización, consulta y administración de usuarios

### Resultado arquitectónico
El backend queda estructurado como:

- `routes`: definen endpoints y middleware
- `controllers`: reciben y responden peticiones
- `services`: contienen la lógica de negocio
- `models`: representan la persistencia

Esto fortalece el MVC clásico con una separación más profesional y mantenible.

---

## 🗂️ Estructura del Repositorio

```text
vita-salud/
├── Backend/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── swagger-docs.ts
│   ├── README.md
│   └── SWAGGER.md
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   └── README.md
└── README.md
```

---

## 🚀 Tecnologías Utilizadas

### Frontend
- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Framer Motion
- Radix UI
- SweetAlert2

### Backend
- Node.js
- Express
- TypeScript
- Sequelize ORM
- MySQL
- JWT
- bcrypt
- express-validator
- Swagger UI

---

## ⚙️ Requisitos Previos

- Node.js 18 o superior
- npm
- MySQL 8 o superior

---

## 🛠️ Instalación y Ejecución

### 1. Backend

```bash
cd Backend
npm install
cp .env.example .env
```

Crear base de datos:

```sql
CREATE DATABASE vitasalud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ejecutar migraciones y seeders:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Si el backend corre en otra URL, se debe configurar `VITE_API_URL`.

---

## 🔐 Usuarios de Prueba

Los usuarios se crean automáticamente al iniciar el backend por primera vez:

| Rol | Usuario | Contraseña | Especialidad |
|---|---|---|---|
| Admin | `admin@vitasalud.com` | `Admin123456*!` | - |
| Médico | `carlos.garcia@vitasalud.com` | `Medico123456*!` | Medicina General |
| Médico | `maria.martinez@vitasalud.com` | `Medico123456*!` | Pediatría |

---

## ✨ Funcionalidades Destacadas

- autenticación con control por roles
- gestión de perfiles y médicos
- agenda médica filtrada por usuario
- reprogramación de citas con validaciones
- agenda operativa limitada a días hábiles y bloques horarios configurados
- atención médica con recomendaciones clínicas generadas por especialidad
- alertas para agendamiento, cancelación, reprogramación y recomendaciones
- documentación Swagger de los endpoints disponibles

---

## 📘 API y Documentación
Con el backend ejecutándose:

- Swagger UI: `http://localhost:3000/api-docs`
- Health check: `http://localhost:3000/health`
- guía ampliada de endpoints: `Backend/SWAGGER.md`

---

## 🎥 Guion Sugerido para el Video Explicativo

### 1. Presentación del proyecto
- nombre del sistema
- problema que resuelve
- actores involucrados

### 2. Explicación arquitectónica
- separación frontend/backend
- uso de MySQL
- implementación de MVC
- necesidad de la capa de servicios
- autenticación JWT y documentación Swagger

### 3. Flujo del paciente
1. registro o login
2. consulta de médicos
3. revisión de disponibilidad
4. agendamiento de cita
5. reprogramación
6. recepción de recomendaciones

### 4. Flujo del médico
1. ingreso al dashboard
2. visualización de agenda
3. demostración de alertas
4. atención del paciente
5. generación de recomendaciones

### 5. Flujo del administrador
1. listado de usuarios
2. creación de médico
3. activación/desactivación
4. carga masiva si se desea mostrar

### 6. Cierre técnico
- reglas de negocio
- separación de responsabilidades
- mantenibilidad del sistema
- documentación y trazabilidad de endpoints

---

## 👨‍💻 Autores
- **Rafael José Arenas Restrepo**
- **Valeria Martínez Castañeda**
- **Miguel Ángel Herrera Oyola**

---
**Asignatura:** Desarrollo Web  
**Programa:** Ingeniería de Sistemas - 10mo Semestre  
**Institución:** Fundación Universitaria del Área Andina
