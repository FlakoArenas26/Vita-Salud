/**
 * Interfaces y Tipos del sistema VitaSalud
 */

export interface Doctor {
  id: string;
  nombre: string;
  especialidad: string;
  tipoDocumento: string;
  identificacion: string;
  tarjetaProfesional: string;
  departamentoId: number;
  ciudadId: number;
  activo: boolean;
  experienciaAnios: number;
  email: string;
  rol: "medico";
}

export interface Paciente {
  id: string;
  tipoDocumento: string;
  identificacion: string;
  nombre: string;
  edad: number;
  departamentoId: number;
  ciudadId: number;
  email: string;
  rol: "paciente";
}

export interface Admin {
  id: string;
  tipoDocumento: string;
  identificacion: string;
  nombre: string;
  email: string;
  rol: "admin";
}

export type Usuario = Paciente | Doctor | Admin;

export interface Cita {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteIdentificacion: string;
  pacienteTipoDoc: string;
  doctorId: string;
  doctorNombre: string;
  doctorIdentificacion: string;
  doctorTarjetaProfesional: string;
  consultorio: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: "agendada" | "atendida" | "cancelada";
  recomendaciones?: string;
}

/**
 * Constantes Globales
 */

export const especialidades = [
  "Medicina General",
  "Pediatría",
  "Oftalmología",
  "Cardiología",
  "Neurología",
  "Ginecología",
];

export const tiposDocumento = [
  { value: "CC", label: "Cédula de Ciudadanía (CC)" },
  { value: "TI", label: "Tarjeta de Identidad (TI)" },
  { value: "CE", label: "Cédula de Extranjería (CE)" },
  { value: "PA", label: "Pasaporte (PA)" },
  { value: "RC", label: "Registro Civil (RC)" },
];

/**
 * Gestión de Sesión (SessionStorage)
 * Se mantiene el uso de sessionStorage para la sesión activa por pestaña.
 */

const CURRENT_USER_KEY = "vitasalud_current_user";

export function setCurrentUser(usuario: Usuario): void {
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuario));
}

export function getCurrentUser(): Usuario | null {
  try {
    const data = sessionStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  sessionStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem("vitasalud_token");
}

/**
 * Utilidades
 */

export function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function pickRandomItems(items: string[], count: number): string[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, items.length));
}

/**
 * Genera recomendaciones clínicas asistidas por IA para una cita médica.
 * Selecciona entre 3 y 5 recomendaciones aleatorias de un pool ampliado por especialidad.
 * Categorías: manejo, cuidados, alertas, seguimiento y genéricas.
 * Actualizado 2026-05-02: Genera 3-5 recomendaciones aleatorias por paciente para mayor variedad,
 * pool ampliado con 10+ recomendaciones por especialidad.
 */
export function generateAgentRecommendation(cita: Cita): string {
  const recommendations: Record<
    string,
    {
      manejo: string[];
      cuidados: string[];
      alertas: string[];
      seguimiento: string[];
    }
  > = {
    "Medicina General": {
      manejo: [
        "Acetaminofén 500 mg: 1 tableta cada 6 a 8 horas por 3 días si hay dolor o fiebre.",
        "Loratadina 10 mg: 1 tableta en la noche por 5 a 7 días si persisten síntomas alérgicos.",
        "Omeprazol 20 mg: 1 cápsula en ayunas por 7 días si hay irritación gástrica asociada.",
        "Ibuprofeno 400 mg: 1 tableta cada 8 horas por máximo 3 días si no hay contraindicación.",
        "Solución salina nasal: 2 aplicaciones por fosa cada 8 horas por 5 días si hay congestión.",
        "Vitamina C 1 g al día por 5 días como apoyo general.",
        "Suero oral en pequeños sorbos cada hora si hay signos de deshidratación leve.",
        "Antitusivo de prescripción breve si la tos es seca y limita el descanso nocturno.",
        "Antibiótico solo si se confirma infección bacteriana y con la duración indicada.",
        "Cortar bebidas frías y productos irritantes mientras duren los síntomas respiratorios."
      ],
      cuidados: [
        "Mantener hidratación oral constante durante el día.",
        "Guardar reposo relativo por 24 a 48 horas según evolución clínica.",
        "Evitar automedicación adicional mientras se completa el manejo indicado.",
        "Preferir dieta blanda y fraccionada si hay malestar general o digestivo.",
        "Controlar temperatura corporal 2 veces al día.",
        "Ventilar adecuadamente la habitación y evitar cambios bruscos de temperatura.",
        "Usar mascarilla si convive con personas vulnerables hasta 24 horas sin fiebre.",
        "Mantener un ambiente tranquilo y evitar el uso excesivo de pantallas electrónicas.",
        "Aumentar el consumo de agua con sales de rehidratación oral en caso de diarrea leve.",
        "Seguir las medidas de higiene respiratoria: taparse al toser y lavarse las manos."
      ],
      alertas: [
        "Consultar de inmediato si presenta fiebre persistente mayor de 38.5 °C por más de 48 horas.",
        "Acudir a urgencias si aparece dificultad respiratoria, dolor torácico o somnolencia marcada.",
        "Reconsultar si los síntomas empeoran pese al tratamiento inicial.",
        "Solicitar valoración prioritaria si hay vómito persistente o signos de deshidratación.",
        "Buscar atención si aparece tendencia al sangrado, palidez intensa o sudor frío.",
        "Consultar si se desarrolla dolor abdominal intenso o evacuaciones negras."
      ],
      seguimiento: [
        "Control médico en 3 a 5 días para reevaluación clínica.",
        "Seguimiento virtual o presencial si en 72 horas no hay mejoría evidente.",
        "Continuar observación domiciliaria y registrar evolución de síntomas principales.",
        "Solicitar nueva cita si reaparecen síntomas después de la mejoría inicial.",
        "Programar retorno antes si hay empeoramiento de tos, dolor o dificultad respiratoria.",
        "Revisar la evolución del apetito y el patrón de sueño en el próximo control."
      ]
    },
    "Pediatría": {
      manejo: [
        "Suero oral: administrar pequeñas cantidades frecuentes después de cada deposición o vómito.",
        "Acetaminofén pediátrico según peso y fórmula prescrita para control térmico.",
        "Lavados nasales con solución salina 3 a 4 veces al día si hay congestión.",
        "Nebulización o inhaloterapia solo si fue formulada en la valoración médica.",
        "Dieta blanda transitoria con buena tolerancia oral.",
        "Aplicar medidas físicas suaves si hay fiebre antes de repetir medicación.",
        "Bebidas frías en sorbos pequeños para calmar la irritación de garganta.",
        "Administrar probióticos si fue indicado en casos de diarrea leve asociada.",
        "Ofrecer alimentos ricos en electrolitos naturales si hay pérdida de líquidos.",
        "Mantener analgésicos de rescate a mano según plan médico para dolor o fiebre."
      ],
      cuidados: [
        "Monitorear temperatura cada 4 horas durante el cuadro agudo.",
        "Evitar bebidas gaseosas, fritos y productos irritantes por 48 horas.",
        "Favorecer descanso, sueño reparador y ambiente ventilado.",
        "Mantener al menor acompañado y observar tolerancia a líquidos y alimentos.",
        "No enviar al colegio o guardería mientras continúen síntomas contagiosos.",
        "Verificar frecuencia urinaria para descartar deshidratación.",
        "Controlar la ingesta de líquidos cada 2 horas e incentivar el consumo frecuente.",
        "Usar ropa ligera y cómoda según temperatura ambiente.",
        "Ofrecer líquidos fríos o a temperatura ambiente para aliviar la garganta.",
        "Mantener la piel limpia y seca si hay exantema o irritación en la piel."
      ],
      alertas: [
        "Acudir de inmediato si hay hundimiento de costillas, respiración rápida o labios morados.",
        "Consultar urgente si presenta decaimiento extremo, convulsión o rechazo completo a líquidos.",
        "Reconsultar si la fiebre dura más de 48 horas o no cede con manejo habitual.",
        "Buscar atención prioritaria si aparecen signos de deshidratación o llanto sin lágrimas.",
        "Acudir si el niño no puede orinar por más de 6 horas o la boca está seca.",
        "Buscar ayuda si hay dificultad para despertar, letargo o incoordinación."
      ],
      seguimiento: [
        "Control pediátrico en 24 a 72 horas según evolución.",
        "Llevar registro de fiebre, vómitos y deposiciones para la próxima valoración.",
        "Si los síntomas mejoran, continuar cuidados en casa y completar el plan indicado.",
        "Solicitar revisión de seguimiento si reaparecen síntomas respiratorios o digestivos.",
        "Revisar la hidratación y el apetito diario en los primeros 3 días.",
        "Mantener comunicación con el pediatra si aparecen nuevos signos o dudas."
      ]
    },
    "Cardiología": {
      manejo: [
        "Ácido acetilsalicílico 100 mg al día solo si se encuentra formulado en el plan de manejo.",
        "Atorvastatina 20 mg en la noche de acuerdo con indicación médica actual.",
        "Control estricto de presión arterial en casa si el paciente dispone de tensiómetro.",
        "Continuar antihipertensivos previamente formulados sin suspender dosis por cuenta propia.",
        "Registrar frecuencia cardiaca en reposo una vez al día.",
        "Reducir consumo de sodio y embutidos de manera estricta.",
        "Limitar la ingesta de bebidas con cafeína hasta nueva indicación médica.",
        "Iniciar caminatas suaves de 10 a 15 minutos según tolerancia y sin disnea.",
        "Seguir un régimen alimentario con abundante vegetales y pescado magro.",
        "Aumentar consumo de frutas ricas en potasio si no hay contraindicación."
      ],
      cuidados: [
        "Evitar esfuerzos físicos intensos hasta nueva valoración.",
        "Mantener horarios regulares para medicación y alimentación.",
        "Preferir dieta baja en sal, grasas saturadas y ultraprocesados.",
        "Incrementar consumo de agua según tolerancia y restricciones médicas previas.",
        "Dormir adecuadamente y reducir situaciones de estrés intenso.",
        "No fumar ni exponerse a humo de tabaco.",
        "Practicar técnicas de respiración profunda en sesiones cortas varias veces al día.",
        "Levantar las piernas ligeramente si hay edema leve en extremidades inferiores.",
        "Consultar al médico antes de iniciar suplementos de magnesio o potasio.",
        "Evitar saleros en la mesa y revisar etiquetas de alimentos procesados."
      ],
      alertas: [
        "Acudir a urgencias si presenta dolor torácico opresivo, sudoración fría o falta de aire.",
        "Consultar de inmediato si la presión arterial permanece muy elevada pese al tratamiento.",
        "Reconsultar urgentemente si hay palpitaciones sostenidas, mareo intenso o síncope.",
        "Buscar atención inmediata si aparece edema progresivo o dificultad respiratoria nocturna.",
        "Acudir si la piel se pone azulada en manos, labios o alrededor de la boca.",
        "Solicitar ayuda si nota sensación de desmayo o latidos rápidos irregulares."
      ],
      seguimiento: [
        "Control por cardiología en 5 a 7 días o antes si empeoran los síntomas.",
        "Llevar registro de presión arterial y frecuencia cardiaca para la siguiente cita.",
        "Solicitar evaluación de seguimiento para ajustar tratamiento y hábitos.",
        "Continuar monitoreo clínico y adherencia al manejo farmacológico prescrito.",
        "Revisar la adherencia a la escala de dolor o malestar en cada consulta.",
        "Reportar cualquier cambio en el patrón del sueño o en la tolerancia al ejercicio."
      ]
    },
    "Oftalmología": {
      manejo: [
        "Lágrimas artificiales: 1 gota en cada ojo cada 4 a 6 horas según síntomas.",
        "Compresas tibias sobre párpados por 5 a 10 minutos dos veces al día.",
        "Higiene palpebral suave con gasa limpia si hay secreción o irritación superficial.",
        "Uso de gafas oscuras en exteriores si hay fotofobia o sensibilidad ocular.",
        "Descanso visual cada 20 minutos si trabaja frente a pantallas.",
        "Evitar frotar los ojos para disminuir irritación adicional.",
        "Aplicar gotas antibióticas o antiinflamatorias según el esquema médico.",
        "Mantener los ojos cerrados y relajados durante 5 a 10 minutos cada hora si hay sequedad.",
        "Evitar maquillaje ocular hasta su próxima valoración.",
        "Limpiar secreciones con solución fisiológica y gasa estéril."
      ],
      cuidados: [
        "Limitar exposición prolongada a pantallas durante la fase sintomática.",
        "Mantener manos limpias antes de aplicar gotas o manipular párpados.",
        "No compartir toallas, pañuelos ni maquillaje ocular.",
        "Evitar piscinas, humo y ambientes muy secos mientras persista irritación.",
        "Retirar lentes de contacto hasta nueva indicación médica.",
        "Dormir con buena higiene ocular y descanso suficiente.",
        "Usar humidificador si el aire está muy seco para evitar sequedad ocular.",
        "Aplicar compresas de manzanilla solo si han sido formuladas por el profesional.",
        "Evitar ambientes con polvo o contaminantes durante el tratamiento.",
        "Mantener la cabeza ligeramente elevada si hay inflamación periocular."
      ],
      alertas: [
        "Consultar de urgencia si presenta pérdida súbita de visión o dolor ocular intenso.",
        "Buscar atención prioritaria si aparece secreción abundante, enrojecimiento severo o trauma.",
        "Reconsultar si la fotofobia o la visión borrosa aumentan progresivamente.",
        "Acudir inmediatamente si nota destellos, sombras o disminución marcada del campo visual.",
        "Buscar atención si el ojo se pone muy rojo, duro o con secreción espesa.",
        "Acudir si aparecen halos alrededor de luces o visión doble de forma súbita."
      ],
      seguimiento: [
        "Control por oftalmología en 3 a 5 días según evolución.",
        "Si hay mejoría parcial, continuar manejo y reevaluar síntomas visuales.",
        "Solicitar nueva valoración si persiste ojo rojo más allá del tiempo esperado.",
        "Registrar cambios de visión, dolor o secreción para la próxima consulta.",
        "Observar la tolerancia a la luz y reportar cualquier aumento de fotofobia.",
        "Revisar respuesta a las gotas y suspender solo si lo indica el especialista."
      ]
    },
    "Neurología": {
      manejo: [
        "Complejo B: 1 cápsula cada 12 horas por 10 días si fue indicado en la consulta.",
        "Reposo en ambiente tranquilo, con baja estimulación lumínica y sonora.",
        "Analgésico formulado según orden médica para manejo de cefalea o dolor asociado.",
        "Rutina de sueño estricta con horarios regulares de descanso.",
        "Evitar exposición prolongada a pantallas durante la recuperación inicial.",
        "Ejercicios suaves de relajación y respiración si no existe contraindicación.",
        "Aplicar compresas frías si hay cefalea intensa y no hay contraindicación.",
        "Reducir el consumo de alimentos con cafeína si hay migraña o síndrome de fatiga.",
        "Mantener ingesta adecuada de agua para favorecer la perfusión cerebral.",
        "Seguir una rutina de desconexión cognitiva antes de dormir."
      ],
      cuidados: [
        "No conducir ni operar maquinaria si persisten mareo, visión borrosa o somnolencia.",
        "Mantener adecuada hidratación y alimentación regular.",
        "Evitar consumo de alcohol y estimulantes mientras haya síntomas neurológicos.",
        "Dormir entre 7 y 8 horas por noche para favorecer recuperación.",
        "Reducir estrés y sobrecarga mental durante los días siguientes.",
        "Pedir acompañamiento familiar si ha presentado episodios de desorientación.",
        "Realizar pausas cortas de descanso cada hora si trabaja con actividades cognitivas intensas.",
        "Practicar técnicas de relajación guiada o respiración diafragmática.",
        "Mantener el entorno silencioso y poco iluminado durante los episodios agudos.",
        "Evitar movimientos bruscos de cabeza si hay mareo asociado."
      ],
      alertas: [
        "Acudir a urgencias si presenta debilidad súbita, dificultad para hablar o desviación facial.",
        "Consultar inmediatamente si aparece convulsión, pérdida de conciencia o vómito explosivo.",
        "Buscar atención urgente si el dolor de cabeza aumenta bruscamente o es el peor de su vida.",
        "Reconsultar de forma prioritaria si hay alteraciones de memoria, marcha o sensibilidad.",
        "Acudir si aparece bajo estado de alerta, confusión o comportamiento extraño.",
        "Solicitar ayuda si la visión se vuelve doble o hay pérdida de campo visual repentina."
      ],
      seguimiento: [
        "Control por neurología en 5 a 7 días o antes según evolución.",
        "Llevar registro de episodios de cefalea, mareo, aura o alteraciones neurológicas.",
        "Solicitar seguimiento si persisten síntomas más allá del manejo inicial.",
        "Continuar observación clínica y adherencia al plan terapéutico indicado.",
        "Revisar la respuesta al tratamiento y detectar efectos secundarios tempranos.",
        "Programar consulta de control ante cualquier cambio en la frecuencia o severidad de los episodios."
      ]
    },
    "Ginecología": {
      manejo: [
        "Ácido fólico 5 mg: 1 tableta diaria según indicación médica.",
        "Calcio con vitamina D: 1 tableta al día si fue incluido en el plan de manejo.",
        "Analgésico formulado según necesidad y tolerancia para dolor pélvico leve.",
        "Higiene íntima con productos suaves y sin duchas vaginales.",
        "Reposo relativo si hay molestia pélvica o procedimiento reciente.",
        "Aumentar consumo de agua y mantener dieta equilibrada.",
        "Uso de compresas de agua tibia para aliviar cólicos leves.",
        "Aplicar gel lubricante neutro si hay sequedad vaginal y fue indicado.",
        "Continuar tratamiento hormonal solo bajo supervisión médica.",
        "Registrar la dosis exacta y la hora de administración de la medicación prescrita."
      ],
      cuidados: [
        "Evitar automedicación con antibióticos o antimicóticos sin control médico.",
        "Suspender relaciones sexuales temporalmente si fue indicado en consulta.",
        "Usar ropa interior de algodón y evitar prendas muy ajustadas.",
        "Registrar características del dolor, flujo o sangrado para seguimiento clínico.",
        "Mantener adherencia a controles preventivos y tamizajes ginecológicos.",
        "Extremar medidas de higiene y secado adecuado de la zona íntima.",
        "Evitar duchas vaginales o productos perfumados que irriten la mucosa.",
        "Tomar baños de asiento con agua tibia si hay molestias leves post-procedimiento.",
        "Mantener hábitos regulares de micción y evitar retener orina demasiado tiempo.",
        "Notificar si hay cambios en la cantidad, color u olor del flujo vaginal."
      ],
      alertas: [
        "Consultar de inmediato si presenta sangrado abundante, fiebre o dolor pélvico intenso.",
        "Acudir a urgencias si hay flujo con mal olor acompañado de dolor o malestar general.",
        "Buscar atención inmediata ante sospecha de embarazo y dolor abdominal severo.",
        "Reconsultar prontamente si aparecen signos de infección o empeora el sangrado.",
        "Acudir si hay dificultad para respirar, dolor en el hombro o presión en el abdomen.",
        "Buscar atención si hay secreción verdosa o amarilla con ardor intenso."
      ],
      seguimiento: [
        "Control por ginecología en 5 a 10 días según motivo de consulta.",
        "Asistir a revisión con resultados de exámenes si fueron solicitados.",
        "Mantener vigilancia de síntomas y reportar cualquier cambio importante.",
        "Programar cita de seguimiento para reevaluar evolución clínica y respuesta al tratamiento.",
        "Comunicarse con el especialista si hay persistencia de dolor o nueva fiebre.",
        "Revisar el plan de cuidado personal y ajustes de estilo de vida recomendados."
      ]
    }
  };

  const genericPool = [
    "No suspender ni duplicar medicamentos sin nueva valoración médica.",
    "Mantener signos de alarma explicados al paciente y su acompañante.",
    "Conservar hábitos de higiene, descanso y adecuada hidratación.",
    "Asistir puntualmente a control si no hay mejoría dentro del tiempo esperado.",
    "Evitar exposición a factores que agraven el cuadro clínico actual.",
    "Si existe empeoramiento súbito, acudir a servicio de urgencias.",
    "Registrar la evolución de los síntomas en un diario breve para la cita de seguimiento.",
    "Evitar esfuerzos físicos excesivos los primeros días de manejo clínico.",
    "Seguir las indicaciones de alimentación con atención especial al crudo o procesado.",
    "Avisar a su médico si presenta algún efecto secundario inesperado al tratamiento."
  ];

  const specialtyPlan = recommendations[cita.especialidad] || recommendations["Medicina General"];
  const availableRecommendations = [
    ...specialtyPlan.manejo,
    ...specialtyPlan.cuidados,
    ...specialtyPlan.alertas,
    ...specialtyPlan.seguimiento,
    ...genericPool,
  ];

  // Generar entre 3 y 5 recomendaciones aleatorias por paciente
  const numRecommendations = Math.floor(Math.random() * 3) + 3; // 3, 4 o 5
  const selected = pickRandomItems(availableRecommendations, numRecommendations);

  return selected.map((recommendation, index) => `${index + 1}. ${recommendation}`).join("\n");
}
