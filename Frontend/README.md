# VitaSalud - Plataforma de Gestión Médica Integral

## 📋 Descripción del Proyecto
VitaSalud es una aplicación web moderna (SPA) diseñada para la gestión eficiente de centros médicos, permitiendo la interacción fluida entre Administradores, Médicos y Pacientes. Este proyecto ha sido desarrollado como parte del programa de **Ingeniería de Sistemas (10mo Semestre)** para la asignatura de Desarrollo Web.

La plataforma se destaca por su enfoque en la **experiencia de usuario (UX)**, con una interfaz premium, animaciones fluidas y una arquitectura de datos robusta simulada en el lado del cliente.

---

## 🏗️ Estructura del Proyecto

La organización del código sigue los estándares modernos de desarrollo con React:

```text
Frontend/
├── public/              # Activos estáticos y manifiesto PWA
├── src/
│   ├── assets/          # Imágenes y recursos multimedia
│   ├── components/      # Componentes reutilizables (UI, Auth, Layout)
│   │   ├── auth/        # Lógica de formularios de autenticación
│   │   ├── ui/          # Componentes base (Botones, Inputs, etc.)
│   │   └── layout/      # Estructura visual (Header, Footer)
│   ├── hooks/           # Hooks personalizados de React
│   ├── lib/             # Utilidades y Capa de Datos (Mock DB)
│   ├── routes/          # Páginas y vistas principales de la aplicación
│   ├── App.tsx          # Enrutador y configuración global
│   ├── main.tsx         # Punto de entrada de la aplicación
│   └── styles.css       # Estilos globales y tokens de diseño
├── package.json         # Dependencias y scripts
└── vite.config.ts       # Configuración de Vite y PWA
```

---

## 🚀 Tecnologías Utilizadas

- **Core**: [React 19](https://react.dev/) - La versión más reciente para una gestión de estado y renderizado óptimo.
- **Build Tool**: [Vite 7](https://vitejs.dev/) - Entorno de desarrollo ultra rápido.
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) - Tipado estático para un código más seguro y mantenible.
- **Estilos**: 
  - **Tailwind CSS 4**: Motor de estilos utilitarios de última generación.
  - **Vanilla CSS**: Para micro-interacciones y personalización avanzada.
  - **Framer Motion**: Biblioteca de animaciones de alto rendimiento.
- **Iconografía**: [Lucide React](https://lucide.dev/) - Set de iconos vectoriales consistentes.
- **UI Components**: Basados en **Radix UI** para accesibilidad (WAI-ARIA).
- **Alertas**: [SweetAlert2](https://sweetalert2.github.io/) - Notificaciones elegantes y funcionales.

---

## 💾 Estrategia de Persistencia de Datos

Para cumplir con los requisitos académicos de simular un entorno completo sin necesidad de un backend complejo, se implementó una estrategia híbrida de almacenamiento en el navegador:

1. **LocalStorage (Base de Datos Mock)**: 
   - Se utiliza como el "servidor" central de la aplicación.
   - Permite que los datos (Médicos registrados, Citas agendadas) persistan incluso al cerrar el navegador.
   - Facilita la **consistencia entre pestañas**: un médico creado por el Admin en la Pestaña A es visible inmediatamente para el Login en la Pestaña B.

2. **SessionStorage (Gestión de Sesiones)**:
   - Se utiliza exclusivamente para el `CURRENT_USER`.
   - **Ventaja Crítica**: Permite abrir múltiples pestañas del mismo navegador y tener sesiones independientes (un Admin en una, un Médico en otra y un Paciente en otra), facilitando las pruebas de flujo cruzado.

---

## 📱 PWA & Diseño Responsive

- **Progressive Web App (PWA)**: La aplicación está configurada para ser instalable en dispositivos móviles y escritorio, con soporte para carga rápida y manifiesto de aplicación web.
- **Mobile-First**: El diseño ha sido concebido desde dispositivos móviles hacia arriba, garantizando que todas las funcionalidades (como el Dashboard Médico) sean 100% operativas en pantallas táctiles.
- **Responsive Design**: Uso intensivo de Flexbox y CSS Grid para adaptabilidad total.

---

## 🛠️ Instalación y Ejecución

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Construir para producción:
   ```bash
   npm run build
   ```

---

## 👨‍💻 Autores
- **Rafael José Arenas Restrepo**
- **Valeria Martínez Castañeda**
- **Miguel Ángel Herrera Oyola**

---
**Asignatura:** Desarrollo Web
**Programa:** Ingeniería de Sistemas - 10mo Semestre  
**Institución:** Fundación Universitaria del Área Andina  
