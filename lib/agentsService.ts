/**
 * Servicio para interactuar con los agentes de LangGraph
 *
 * Este servicio usa el SDK de LangGraph para comunicarse con los 3 agentes:
 * 1. agente-astro: Genera perfiles astrológicos
 * 2. agente-filtro-viajes: Recomienda viajes basados en preferencias
 * 3. agente-chatbot: Asistente conversacional personalizado
 */

import { Client } from "@langchain/langgraph-sdk";

// URL del servidor de LangGraph
// IMPORTANTE: En Android, usar 10.0.2.2 en lugar de localhost
// En iOS y web, usar localhost funciona correctamente
const LANGGRAPH_API_URL = process.env.EXPO_PUBLIC_LANGGRAPH_URL || "http://10.0.2.2:2024";

// Cliente singleton de LangGraph
let client: Client | null = null;

/**
 * Obtiene o crea el cliente de LangGraph
 */
function getClient(): Client {
  if (!client) {
    client = new Client({
      apiUrl: LANGGRAPH_API_URL,
    });
  }
  return client;
}

/**
 * IDs de los agentes (deben coincidir con los nombres en langgraph.json)
 */
export const AGENT_IDS = {
  ASTRO: "agente-astro",
  FILTER: "agente-filtro-viajes",
  CHATBOT: "agente-chatbot",
} as const;

// ==================== TIPOS ====================

export interface AstroProfileRequest {
  user_id: string;
  nombre?: string;
  experiencias_viaje?: string;  // Tipo de experiencias que busca
  transformacion_viaje?: string; // Qué quiere descubrir/transformar
  fecha_nacimiento: string;  // "YYYY-MM-DD" o "DD-MM-YYYY"
  hora_nacimiento?: string;  // "HH:MM"
  lugar_nacimiento?: string; // "Ciudad, País"
}

export interface AstroProfileResponse {
  perfil: string;
  user_id: string;
}

export interface TravelRecommendationRequest {
  user_id: string;
  cuestionario: Record<string, any>; // Las 9 respuestas del cuestionario
}

export interface TravelRecommendationResponse {
  viajes_recomendados: number[];
  total_recomendados: number;
  criterios_aplicados: {
    temas_principales?: string[];
    preferencias?: string[];
    rango_precio?: string;
  };
}

export interface ChatMessageRequest {
  user_id: string;
  message: string;
  thread_id?: string; // Para mantener contexto de conversación
}

export interface ChatMessageResponse {
  message: string;
  thread_id: string;
}

// ==================== SERVICIO ====================

class AgentsService {
  /**
   * Genera un perfil astrológico basado en datos de nacimiento
   *
   * @param data Datos de nacimiento del usuario
   * @returns Perfil astrológico generado
   */
  static async generateAstroProfile(
    data: AstroProfileRequest
  ): Promise<AstroProfileResponse> {
    try {
      const client = getClient();

      // Crear un thread para esta interacción
      const thread = await client.threads.create();

      // Preparar el input para el agente
      const mensaje = `Genera un perfil astrológico para el usuario con los siguientes datos:

- Nombre: ${data.nombre || "Usuario"}
- Tipo de experiencias de viaje que busca: ${data.experiencias_viaje || "No especificado"}
- Qué quiere descubrir/transformar: ${data.transformacion_viaje || "No especificado"}
- Fecha de nacimiento: ${data.fecha_nacimiento}
- Hora de nacimiento: ${data.hora_nacimiento || "No proporcionada"}
- Lugar de nacimiento: ${data.lugar_nacimiento || "No proporcionado"}

DATOS_JSON: ${JSON.stringify({
        user_id: data.user_id,
        nombre: data.nombre || "Usuario",
        experiencias_viaje: data.experiencias_viaje || "No especificado",
        transformacion_viaje: data.transformacion_viaje || "No especificado",
        fecha_nacimiento: data.fecha_nacimiento,
        hora_nacimiento: data.hora_nacimiento || "No proporcionada",
        lugar_nacimiento: data.lugar_nacimiento || "No proporcionado",
      })}`;

      const input = {
        messages: [
          {
            role: "user",
            content: mensaje,
          },
        ],
      };

      // Ejecutar el agente con stream
      const streamResponse = client.runs.stream(
        thread.thread_id,
        AGENT_IDS.ASTRO,
        {
          input,
          streamMode: "values",
        }
      );

      let lastMessage = "";

      // Procesar el stream
      for await (const chunk of streamResponse) {
        if (chunk.data && chunk.data.messages) {
          const messages = chunk.data.messages;
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.content) {
            lastMessage = lastMsg.content;
          }
        }
        else if (chunk.messages) {
          const messages = chunk.messages;
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.content) {
            lastMessage = lastMsg.content;
          }
        }
      }

      // Extraer el perfil generado
      let perfil = lastMessage;
      if (perfil.includes("PERFIL_GENERADO:")) {
        perfil = perfil.replace("PERFIL_GENERADO:", "").trim();
      }

      return {
        perfil,
        user_id: data.user_id,
      };
    } catch (error) {
      console.error("❌ [Astro Agent] Error:", error);
      console.error("❌ [Astro Agent] Detalles:", {
        message: error instanceof Error ? error.message : "Error desconocido",
        url: LANGGRAPH_API_URL,
        agentId: AGENT_IDS.ASTRO,
      });
      throw new Error(
        `No se pudo generar el perfil astral: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene recomendaciones de viajes basadas en el cuestionario del usuario
   *
   * @param data Datos del cuestionario
   * @returns IDs de viajes recomendados
   */
  static async getTravelRecommendations(
    data: TravelRecommendationRequest
  ): Promise<TravelRecommendationResponse> {
    try {
      console.log('🟢 [Filter Agent] Iniciando recomendaciones...');
      console.log('🟢 [Filter Agent] URL:', LANGGRAPH_API_URL);

      const client = getClient();

      // Crear un thread para esta interacción
      console.log('🟢 [Filter Agent] Creando thread...');
      const thread = await client.threads.create();
      console.log('✅ [Filter Agent] Thread creado:', thread.thread_id);

      // Preparar el mensaje para el agente
      const mensaje = `Analiza este cuestionario y recomienda viajes:

Usuario ID: ${data.user_id}

Respuestas del cuestionario:
${JSON.stringify(data.cuestionario, null, 2)}`;

      const input = {
        messages: [
          {
            role: "user",
            content: mensaje,
          },
        ],
      };

      // Ejecutar el agente y esperar resultado
      console.log('🟢 [Filter Agent] Ejecutando agente:', AGENT_IDS.FILTER);

      const result = await client.runs.wait(thread.thread_id, AGENT_IDS.FILTER, {
        input,
      });

      console.log('✅ [Filter Agent] Ejecución completada');

      // Extraer el último mensaje
      let lastMessage = "";
      const messages = result.values?.messages || result.messages || [];

      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.content) {
          lastMessage = lastMsg.content;
          console.log(`🟢 [Filter Agent] Mensaje recibido (${lastMessage.length} caracteres)`);
        }
      }

      // Parsear el JSON de recomendaciones
      console.log('🟢 [Filter Agent] Procesando respuesta...');

      try {
        // Intentar parsear directamente
        const recomendaciones = JSON.parse(lastMessage);
        console.log('✅ [Filter Agent] JSON parseado exitosamente');
        console.log('✅ [Filter Agent] Viajes recomendados:', recomendaciones.viajes_recomendados);
        return recomendaciones;
      } catch (jsonError) {
        console.log('⚠️ [Filter Agent] Intentando extraer JSON del texto...');
        // Si falla, intentar extraer JSON del texto
        const jsonMatch = lastMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const recomendaciones = JSON.parse(jsonMatch[0]);
          console.log('✅ [Filter Agent] JSON extraído exitosamente');
          return recomendaciones;
        }
        console.error('❌ [Filter Agent] No se pudo parsear JSON');
        console.error('❌ [Filter Agent] Mensaje recibido:', lastMessage);
        throw new Error("El agente no retornó un JSON válido");
      }
    } catch (error) {
      console.error("❌ [Filter Agent] Error:", error);
      console.error("❌ [Filter Agent] Detalles:", {
        message: error instanceof Error ? error.message : "Error desconocido",
        url: LANGGRAPH_API_URL,
        agentId: AGENT_IDS.FILTER,
      });
      throw new Error(
        `No se pudieron obtener recomendaciones: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Envía un mensaje al chatbot y obtiene una respuesta personalizada
   *
   * @param data Mensaje del usuario y contexto
   * @returns Respuesta del chatbot
   */
  static async sendChatMessage(
    data: ChatMessageRequest
  ): Promise<ChatMessageResponse> {
    try {
      const client = getClient();

      // Si hay thread_id, usarlo; sino crear uno nuevo
      let threadId = data.thread_id;
      if (!threadId) {
        const thread = await client.threads.create();
        threadId = thread.thread_id;
      }

      // Preparar el mensaje
      const mensaje = `Usuario ID: ${data.user_id}

Mensaje del usuario: ${data.message}`;

      const input = {
        messages: [
          {
            role: "user",
            content: mensaje,
          },
        ],
      };

      // Ejecutar el agente y esperar resultado
      const result = await client.runs.wait(threadId, AGENT_IDS.CHATBOT, {
        input,
      });

      // Extraer el último mensaje
      let lastMessage = "";
      const messages = result.values?.messages || result.messages || [];

      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.content) {
          lastMessage = lastMsg.content;
        }
      }

      return {
        message: lastMessage,
        thread_id: threadId,
      };
    } catch (error) {
      console.error("❌ [Chat Agent] Error:", error);
      console.error("❌ [Chat Agent] Detalles:", {
        message: error instanceof Error ? error.message : "Error desconocido",
        url: LANGGRAPH_API_URL,
        agentId: AGENT_IDS.CHATBOT,
      });
      throw new Error(
        `No se pudo enviar el mensaje: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene el estado de un thread (útil para debugging)
   *
   * @param threadId ID del thread
   * @returns Estado del thread
   */
  static async getThreadState(threadId: string) {
    try {
      const client = getClient();
      const state = await client.threads.getState(threadId);
      return state;
    } catch (error) {
      console.error("Error al obtener estado del thread:", error);
      throw error;
    }
  }

  /**
   * Lista todos los threads (útil para historial de conversaciones)
   *
   * @returns Lista de threads
   */
  static async listThreads() {
    try {
      const client = getClient();
      const threads = await client.threads.search({});
      return threads;
    } catch (error) {
      console.error("Error al listar threads:", error);
      throw error;
    }
  }
}

export default AgentsService;
