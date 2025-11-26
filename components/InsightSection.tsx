import React from 'react';
import { GeminiAnalysisResult } from '../types';
import { Sparkles, AlertOctagon, Lightbulb, Zap } from 'lucide-react';

interface Props {
  analysis: GeminiAnalysisResult | null;
  loading: boolean;
}

export const InsightSection: React.FC<Props> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 animate-pulse">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="text-indigo-500 animate-spin" size={20} />
          <span className="text-indigo-700 font-medium">Gemini AI analizando datos...</span>
        </div>
        <div className="h-4 bg-indigo-100 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-indigo-100 rounded w-1/2"></div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Narrative & Strategic */}
      <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center mb-4">
           <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg mr-3">
             <Zap size={20} />
           </div>
           <h3 className="text-lg font-bold text-slate-800">Resumen Ejecutivo</h3>
        </div>
        <p className="text-slate-600 mb-6 italic border-l-4 border-indigo-400 pl-3">
          "{analysis.narrative}"
        </p>

        <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
          <Lightbulb size={16} className="mr-2 text-yellow-500" /> Insights Estratégicos
        </h4>
        <ul className="space-y-2">
          {analysis.strategicInsights.map((item, i) => (
            <li key={i} className="flex items-start text-sm text-slate-600">
              <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0"></span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Risks & Recs */}
      <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6">
           <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
             <AlertOctagon size={16} className="mr-2 text-red-500" /> Análisis de Riesgo
           </h4>
           <ul className="space-y-2 mb-6">
            {analysis.riskAnalysis.map((item, i) => (
              <li key={i} className="flex items-start text-sm text-slate-600">
                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
           <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
             <Sparkles size={16} className="mr-2 text-emerald-500" /> Recomendaciones IA
           </h4>
           <ul className="space-y-2">
            {analysis.recommendations.map((item, i) => (
              <li key={i} className="flex items-start text-sm text-slate-600">
                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};