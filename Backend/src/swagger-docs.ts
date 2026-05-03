/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con correo y contraseña y retorna tokens JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: admin@vitasalud.com
 *             password: Admin1234
 *     responses:
 *       200:
 *         description: Login exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas.
 *       429:
 *         description: Demasiados intentos de autenticación.
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Autenticación]
 *     summary: Registrar paciente
 *     description: Crea una cuenta de paciente con credenciales y datos personales básicos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterPatientRequest'
 *     responses:
 *       201:
 *         description: Paciente creado correctamente.
 *       400:
 *         description: Error de validación o datos inválidos.
 *       409:
 *         description: El correo o la identificación ya existen.
 */

/**
 * @swagger
 * /api/auth/register/doctor:
 *   post:
 *     tags: [Autenticación]
 *     summary: Registrar médico
 *     description: Crea un usuario con rol médico y su información profesional asociada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDoctorRequest'
 *     responses:
 *       201:
 *         description: Médico creado correctamente.
 *       400:
 *         description: Error de validación o datos inválidos.
 *       409:
 *         description: El correo, documento o tarjeta profesional ya existen.
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Autenticación]
 *     summary: Renovar token
 *     description: Entrega un nuevo access token a partir de un refresh token vigente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *           example:
 *             refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.demo
 *     responses:
 *       200:
 *         description: Token renovado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       401:
 *         description: Refresh token ausente, inválido o expirado.
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Autenticación]
 *     summary: Cerrar sesión
 *     description: Revoca el token actual agregándolo a la blacklist en memoria.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente.
 *       401:
 *         description: Token inválido o expirado.
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener mi perfil
 *     description: Retorna la información del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente.
 *       401:
 *         description: No autorizado.
 *   patch:
 *     tags: [Usuarios]
 *     summary: Actualizar mi perfil
 *     description: Permite editar los datos personales del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *           example:
 *             nombre: Juan David Perez
 *             edad: 29
 *             departamentoId: 11
 *             ciudadId: 11001
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 */

/**
 * @swagger
 * /api/users/doctors:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar médicos
 *     description: Entrega los médicos disponibles. Si el usuario es admin, también puede ver inactivos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de médicos obtenida correctamente.
 *       401:
 *         description: No autorizado.
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar usuarios
 *     description: Retorna todos los usuarios registrados. Solo disponible para administradores.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener usuario por ID
 *     description: Consulta el detalle de un usuario puntual. Solo disponible para administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador del usuario.
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Usuario no encontrado.
 *   patch:
 *     tags: [Usuarios]
 *     summary: Actualizar usuario por ID
 *     description: Edita un usuario específico desde el panel administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *   delete:
 *     tags: [Usuarios]
 *     summary: Eliminar usuario
 *     description: Elimina un usuario por su ID. Solo disponible para administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador del usuario.
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Usuario no encontrado.
 */

/**
 * @swagger
 * /api/users/doctors/{id}/toggle:
 *   patch:
 *     tags: [Usuarios]
 *     summary: Activar o desactivar médico
 *     description: Cambia el estado activo de un médico. Solo disponible para administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador del médico.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToggleDoctorStatusRequest'
 *           example:
 *             activo: false
 *     responses:
 *       200:
 *         description: Estado del médico actualizado.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Médico no encontrado.
 */

/**
 * @swagger
 * /api/users/bulk-doctors:
 *   post:
 *     tags: [Usuarios]
 *     summary: Registro masivo de médicos
 *     description: Permite crear múltiples médicos en una sola operación. Solo disponible para administradores.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/RegisterDoctorRequest'
 *     responses:
 *       201:
 *         description: Proceso de creación masiva finalizado.
 *       400:
 *         description: Cuerpo inválido o error de validación.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Citas]
 *     summary: Agendar cita
 *     description: Registra una cita para el paciente autenticado validando disponibilidad del médico y reglas operativas de agenda. Solo se aceptan citas de lunes a sábado en bloques habilitados entre 07:00 y 17:00; las solicitudes del mismo día deben realizarse dentro del horario laboral y con mínimo 1 hora de anticipación.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *           example:
 *             doctorId: 7f5aa8f8-8c68-4c9a-a710-93a2f6f73b15
 *             fecha: 2026-05-10
 *             hora: "08:30"
 *             consultorio: "301"
 *     responses:
 *       201:
 *         description: Cita creada correctamente.
 *       400:
 *         description: Error de validación, conflicto de horario, médico inactivo o cita fuera del calendario laboral.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *   get:
 *     tags: [Citas]
 *     summary: Listar citas según rol
 *     description: Pacientes ven sus citas, médicos ven su agenda y admin ve el consolidado global.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Citas obtenidas correctamente.
 *       401:
 *         description: No autorizado.
 */

/**
 * @swagger
 * /api/appointments/availability/{doctorId}:
 *   get:
 *     tags: [Citas]
 *     summary: Consultar disponibilidad del médico
 *     description: Devuelve las horas ya ocupadas por un médico en una fecha dada.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del médico o del usuario médico.
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha objetivo en formato YYYY-MM-DD.
 *     responses:
 *       200:
 *         description: Horas ocupadas obtenidas correctamente.
 *       400:
 *         description: Falta la fecha o tiene formato inválido.
 *       401:
 *         description: No autorizado.
 */

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     tags: [Citas]
 *     summary: Obtener una cita
 *     description: Consulta el detalle de una cita específica según permisos del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cita.
 *     responses:
 *       200:
 *         description: Cita encontrada.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Cita no encontrada.
 *   patch:
 *     tags: [Citas]
 *     summary: Actualizar estado de cita
 *     description: Permite cancelar o atender una cita según el rol autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cita.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAppointmentRequest'
 *           examples:
 *             cancelar:
 *               summary: Cancelar cita
 *               value:
 *                 estado: cancelada
 *             atender:
 *               summary: Marcar como atendida con recomendaciones
 *               value:
 *                 estado: atendida
 *                 recomendaciones: Reposo de 48 horas, hidratación y control en 7 días.
 *     responses:
 *       200:
 *         description: Cita actualizada correctamente.
 *       400:
 *         description: Datos inválidos o transición no permitida.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Cita no encontrada.
 */

/**
 * @swagger
 * /api/appointments/{id}/reschedule:
 *   patch:
 *     tags: [Citas]
 *     summary: Reprogramar cita
 *     description: Cambia la fecha y hora de una cita agendada conservando paciente, médico y consultorio. La nueva franja debe respetar el calendario operativo del sistema, es decir, lunes a sábado, bloques habilitados entre 07:00 y 17:00 y mínimo 1 hora de anticipación para citas del mismo día.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cita a reprogramar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RescheduleAppointmentRequest'
 *           example:
 *             fecha: 2026-05-12
 *             hora: "10:30"
 *     responses:
 *       200:
 *         description: Cita reprogramada correctamente.
 *       400:
 *         description: Datos inválidos, cita no agendada, conflicto de horario o franja fuera de la política laboral.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Cita no encontrada.
 */

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Verifica que la API se encuentre en ejecución.
 *     responses:
 *       200:
 *         description: Estado de la API.
 */

export {};
