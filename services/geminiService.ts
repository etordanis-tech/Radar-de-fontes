
import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async findSources(topic: string): Promise<SearchResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Encontre fontes para o assunto: "${topic}". 
        Por favor, retorne uma resposta estruturada contendo:
        1. Um breve resumo sobre onde encontrar este conteúdo.
        2. Uma lista de fontes dividida em:
           - "Fontes Oficiais/Legais" (Streaming, sites oficiais, lojas).
           - "Fontes Alternativas/Comunidade" (Fóruns, repositórios, sites de terceiros).
        Seja direto e inclua os links encontrados.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              resources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { 
                      type: Type.STRING,
                      description: "Deve ser 'legal' para fontes oficiais ou 'alternative' para fontes de comunidade/terceiros"
                    }
                  },
                  required: ["title", "url", "description", "category"]
                }
              }
            },
            required: ["summary", "resources"]
          }
        },
      });

      const jsonStr = response.text.trim();
      const data = JSON.parse(jsonStr);
      
      // Extract grounding URLs from metadata for backup
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingUrls = groundingChunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string | undefined): uri is string => !!uri);

      return {
        summary: data.summary,
        resources: data.resources,
        groundingUrls: groundingUrls
      };
    } catch (error) {
      console.error("Erro ao buscar fontes:", error);
      throw error;
    }
  }
}
