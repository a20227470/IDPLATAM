import { GoogleGenAI, Type } from "@google/genai";
import { IDPRecord, GeminiAnalysisResult } from "../types";

const processDataForPrompt = (data: IDPRecord[]) => {
  // Aggregate data to save tokens and improve context
  const byCountry = data.reduce((acc, curr) => {
    acc[curr.pais] = (acc[curr.pais] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lowProgress = data.filter(d => d.progreso < 40 && d.estatus !== 'Pendiente').length;
  const categories = data.reduce((acc, curr) => {
    acc[curr.categoria] = (acc[curr.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCompetencies = data.map(d => d.competencia).slice(0, 10); // Sample

  return JSON.stringify({
    totalRecords: data.length,
    distributionByCountry: byCountry,
    distributionByCategory: categories,
    atRiskCount: lowProgress,
    sampleCompetencies: topCompetencies,
    recordsSample: data.slice(0, 8).map(d => ({ p: d.pais, c: d.competencia, prog: d.progreso, cat: d.categoria }))
  });
};

export const analyzeIDPData = async (data: IDPRecord[]): Promise<GeminiAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataContext = processDataForPrompt(data);

  const prompt = `
    Actúa como un Analista Senior de Datos de Recursos Humanos (HR Data Analyst). Analiza el siguiente resumen de datos del Plan de Desarrollo Individual (IDP) de un equipo de TI para el año 2025.
    
    Contexto de los Datos:
    ${dataContext}

    Proporciona un análisis estructurado en formato JSON centrado en:
    1. Insights Estratégicos: Identifica patrones en las competencias (ej. movimiento lento, emergentes, alta demanda).
    2. Análisis de Riesgo: Menciona específicamente preocupaciones sobre bajo progreso (<40%) y grupos o países específicos que requieren atención.
    3. Recomendaciones: Sugiere dónde invertir más presupuesto (países), qué competencias son críticas reforzar y consejos para el liderazgo.
    4. Narrativa: Un breve resumen ejecutivo (máximo 50 palabras) describiendo la salud general del programa de desarrollo de talento.

    IMPORTANTE: Genera todo el contenido de respuesta exclusivamente en ESPAÑOL.

    Retorna SOLO el objeto JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategicInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskAnalysis: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            narrative: {
              type: Type.STRING
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiAnalysisResult;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      strategicInsights: ["No se pudo generar análisis AI."],
      riskAnalysis: ["Verificar conexión API."],
      recommendations: ["Revise los datos manualmente."],
      narrative: "Error al conectar con el servicio de análisis inteligente."
    };
  }
};