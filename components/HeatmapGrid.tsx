import React, { useMemo } from 'react';
import { IDPRecord } from '../types';

export const HeatmapGrid: React.FC<{ data: IDPRecord[] }> = ({ data }) => {
  // Dynamically extract countries present in the dataset
  const countries = useMemo(() => {
    const unique = Array.from(new Set(data.map(d => d.pais))).filter(Boolean);
    return unique.sort();
  }, [data]);

  // Categories specifically requested by user
  const categories = [
    'Cursos talleres y lecturas',
    'Experiencia critica',
    'Mentoring / Coaching'
  ];

  const getHeatColor = (avg: number) => {
    if (avg === 0) return 'bg-slate-100 text-slate-400';
    if (avg < 40) return 'bg-red-100 text-red-700';
    if (avg < 70) return 'bg-amber-100 text-amber-700';
    if (avg < 100) return 'bg-blue-100 text-blue-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  // Helper to map raw CSV values to the requested buckets
  // This ensures that if the CSV says "Curso React", it falls under "Cursos talleres y lecturas"
  const mapCategory = (raw: string) => {
    const r = (raw || '').toLowerCase();
    
    if (r.includes('curso') || r.includes('taller') || r.includes('lectura') || r.includes('training') || r.includes('capacitacion')) {
      return 'Cursos talleres y lecturas';
    }
    if (r.includes('experiencia') || r.includes('critica') || r.includes('crítica') || r.includes('proyecto') || r.includes('asignacion')) {
      return 'Experiencia critica';
    }
    if (r.includes('mentor') || r.includes('coach') || r.includes('acompañamiento')) {
      return 'Mentoring / Coaching';
    }
    
    return 'Otros';
  };

  const calculateCell = (country: string, targetCategory: string) => {
    const filtered = data.filter(d => 
      d.pais === country && 
      mapCategory(d.categoria) === targetCategory
    );
    
    if (filtered.length === 0) return { avg: 0, count: 0 };
    const avg = filtered.reduce((acc, curr) => acc + curr.progreso, 0) / filtered.length;
    return { avg, count: filtered.length };
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Mapa de Calor: Progreso por País y Categoría</h3>
        <div className="flex space-x-2 text-xs text-slate-500">
           <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span> Crítico</span>
           <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span> En Proceso</span>
           <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-1"></span> Alto</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-slate-400 font-medium w-1/4">Categoría \ País</th>
              {countries.map(c => <th key={c} className="px-4 py-2 text-center text-slate-700 font-bold">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-700">{cat}</td>
                {countries.map(country => {
                  const stats = calculateCell(country, cat);
                  return (
                    <td key={`${cat}-${country}`} className="px-2 py-2">
                      <div className={`rounded-lg py-2 px-3 text-center transition-all hover:scale-105 cursor-default ${getHeatColor(stats.avg)}`}>
                        <div className="font-bold">{stats.avg > 0 ? `${stats.avg.toFixed(0)}%` : '-'}</div>
                        <div className="text-[10px] opacity-80">{stats.count} act.</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}