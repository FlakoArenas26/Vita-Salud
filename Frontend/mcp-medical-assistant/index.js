import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "vitasalud-medical-assistant",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Aquí registramos las herramientas (Tools) del MCP que expondremos ante IAs
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generar_recomendacion_medica",
        description: "Genera una recomendación médica estándar y detallada, orientada al paciente, basándose en la especialidad y el diagnóstico textual provisto.",
        inputSchema: {
          type: "object",
          properties: {
            pacienteNombre: { type: "string" },
            especialidad: { type: "string" },
            diagnostico: { type: "string", description: "Breve descripción de los síntomas e impresiones clínicas." },
          },
          required: ["pacienteNombre", "especialidad", "diagnostico"],
        },
      },
    ],
  };
});

// Este handler captura la invocación por parte de un modelo como Claude
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "generar_recomendacion_medica") {
    // Si la request invoca la tool específica
    const args = request.params.arguments;
    
    // Generador mock inteligente de texto médico:
    let texto = `RECOMENDACIONES PARA EL PACIENTE: ${args.pacienteNombre}\nESPECIALIDAD A CARGO: ${args.especialidad}\n---\n`;
    texto += `Teniendo en cuenta el cuadro clínico diagnosticado sobre: ${args.diagnostico}, te indico las siguientes pautas médicas de recuperación:\n\n`;
    texto += `1. Tratar de mantener un reposo relativo evitando la sobreexposición y los cambios bruscos de temperatura.\n`;
    texto += `2. Aplicar el tratamiento farmacológico en los horarios estrictos descritos en la receta anexada, no interrumpir la toma aunque los síntomas mejoren temporalmente.\n`;
    texto += `3. Aumentar moderadamente el consumo hídrico diario (+2 Litros).\n`;
    texto += `4. Te solicito gestionar una nueva evaluación ("Agendar Cita") de seguimiento si en la ventana de 5 a 7 días no presentas al menos un 80% de mejoría anatómica o funcional.\n\n`;
    texto += `El protocolo ha sido diseñado para preservar tu bienestar.\nAtentamente,\nEl Equipo Profesional de VitaSalud.`;
    
    return {
      content: [{ type: "text", text: texto }],
    };
  }

  // Prevención de Tools inexistentes
  throw new Error(`Tool not found: ${request.params.name}`);
});

// Inicializador de las vías de comunicación (stdio = local console pipe)
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 VitaSalud MCP - El Agente Médico está ejecutándose en stdio!");
}

run().catch((error) => console.error("Error fatal en el MCP Server:", error));
