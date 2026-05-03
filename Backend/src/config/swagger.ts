import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vita-Salud API',
            version: '1.0.0',
            description: 'API REST para plataforma Vita-Salud - Gestión de citas médicas',
            contact: {
                name: 'Vita-Salud Team',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo',
            },
            {
                url: 'https://api.vita-salud.com',
                description: 'Servidor de producción',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Bearer token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        nombre: {
                            type: 'string',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        tipoDocumento: {
                            type: 'string',
                            enum: ['CC', 'TI', 'CE', 'PA', 'RC'],
                        },
                        identificacion: {
                            type: 'string',
                        },
                        edad: {
                            type: 'integer',
                        },
                        rol: {
                            type: 'string',
                            enum: ['paciente', 'medico', 'admin'],
                        },
                        activo: {
                            type: 'boolean',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Doctor: {
                    allOf: [
                        { $ref: '#/components/schemas/User' },
                        {
                            type: 'object',
                            properties: {
                                tarjetaProfesional: {
                                    type: 'string',
                                },
                                especialidad: {
                                    type: 'string',
                                },
                                experienciaAnios: {
                                    type: 'integer',
                                },
                            },
                        },
                    ],
                },
                Appointment: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        pacienteId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        doctorId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        fecha: {
                            type: 'string',
                            format: 'date',
                        },
                        hora: {
                            type: 'string',
                            format: 'time',
                        },
                        consultorio: {
                            type: 'string',
                        },
                        estado: {
                            type: 'string',
                            enum: ['agendada', 'atendida', 'cancelada'],
                        },
                        recomendaciones: {
                            type: 'string',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'usuario@example.com',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'password123',
                        },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                        },
                        message: {
                            type: 'string',
                        },
                        data: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                },
                                user: {
                                    $ref: '#/components/schemas/User',
                                },
                            },
                        },
                    },
                },
                RefreshTokenRequest: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: {
                            type: 'string',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.demo',
                        },
                    },
                },
                RefreshTokenResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: 'Token renovado exitosamente',
                        },
                        data: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
                ChangePasswordRequest: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword'],
                    properties: {
                        currentPassword: {
                            type: 'string',
                            format: 'password',
                            example: 'Actual1234*!',
                        },
                        newPassword: {
                            type: 'string',
                            format: 'password',
                            example: 'NuevaClave1234*!',
                        },
                    },
                },
                RecoverPasswordRequest: {
                    type: 'object',
                    required: ['email', 'newPassword'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'juan@email.com',
                        },
                        newPassword: {
                            type: 'string',
                            format: 'password',
                            example: 'NuevaClave1234*!',
                        },
                    },
                },
                RegisterPatientRequest: {
                    type: 'object',
                    required: ['nombre', 'email', 'password', 'tipoDocumento', 'identificacion'],
                    properties: {
                        nombre: {
                            type: 'string',
                            example: 'Juan Pérez',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'juan@example.com',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'password123',
                        },
                        tipoDocumento: {
                            type: 'string',
                            enum: ['CC', 'TI', 'CE', 'PA', 'RC'],
                            example: 'CC',
                        },
                        identificacion: {
                            type: 'string',
                            example: '1234567890',
                        },
                        edad: {
                            type: 'integer',
                            example: 30,
                        },
                    },
                },
                RegisterDoctorRequest: {
                    allOf: [
                        { $ref: '#/components/schemas/RegisterPatientRequest' },
                        {
                            type: 'object',
                            required: ['tarjetaProfesional', 'especialidad', 'experienciaAnios'],
                            properties: {
                                tarjetaProfesional: {
                                    type: 'string',
                                    example: 'TP-123456',
                                },
                                especialidad: {
                                    type: 'string',
                                    example: 'Cardiología',
                                },
                                experienciaAnios: {
                                    type: 'integer',
                                    example: 10,
                                },
                            },
                        },
                    ],
                },
                UpdateProfileRequest: {
                    type: 'object',
                    properties: {
                        nombre: {
                            type: 'string',
                            example: 'Juan David Perez',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'juan@email.com',
                        },
                        tipoDocumento: {
                            type: 'string',
                            enum: ['CC', 'TI', 'CE', 'PA', 'RC'],
                            example: 'CC',
                        },
                        identificacion: {
                            type: 'string',
                            example: '1234567890',
                        },
                        edad: {
                            type: 'integer',
                            example: 29,
                        },
                        departamentoId: {
                            type: 'integer',
                            example: 11,
                        },
                        ciudadId: {
                            type: 'integer',
                            example: 11001,
                        },
                    },
                },
                CreateAppointmentRequest: {
                    type: 'object',
                    required: ['doctorId', 'fecha', 'hora', 'consultorio'],
                    properties: {
                        doctorId: {
                            type: 'string',
                            format: 'uuid',
                            example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                        },
                        fecha: {
                            type: 'string',
                            format: 'date',
                            example: '2024-12-25',
                            description: 'Fecha de la cita. Debe corresponder a lunes-sábado y se valida contra el horario de Colombia (America/Bogota).',
                        },
                        hora: {
                            type: 'string',
                            format: 'time',
                            example: '14:30',
                            description: 'Bloque horario habilitado por la app entre 07:00 y 17:00 en Colombia.',
                        },
                        consultorio: {
                            type: 'string',
                            example: '101',
                        },
                    },
                },
                UpdateAppointmentRequest: {
                    type: 'object',
                    required: ['estado'],
                    properties: {
                        estado: {
                            type: 'string',
                            enum: ['agendada', 'atendida', 'cancelada'],
                            example: 'atendida',
                        },
                        recomendaciones: {
                            type: 'string',
                            example: 'Descanso y medicamentos prescritos',
                        },
                    },
                },
                RescheduleAppointmentRequest: {
                    type: 'object',
                    required: ['fecha', 'hora'],
                    properties: {
                        fecha: {
                            type: 'string',
                            format: 'date',
                            example: '2026-05-12',
                            description: 'Nueva fecha de la cita. No se permiten domingos. Se valida con zona horaria Colombia (America/Bogota).',
                        },
                        hora: {
                            type: 'string',
                            format: 'time',
                            example: '10:30',
                            description: 'Nueva hora dentro de los bloques laborales habilitados por la app en Colombia.',
                        },
                    },
                },
                ToggleDoctorStatusRequest: {
                    type: 'object',
                    required: ['activo'],
                    properties: {
                        activo: {
                            type: 'boolean',
                            example: false,
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/swagger-docs.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
