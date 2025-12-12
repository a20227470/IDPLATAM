
import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { IDPRecord } from '../types';
import { Info } from 'lucide-react';

interface ChartsProps {
  data: IDPRecord[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ChartsContainer: React.FC<ChartsProps> = ({ data }) => {

  // 1. Prepare Data for "Progress by Category"
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(d => { counts[d.categoria] = (counts[d.categoria] || 0) + 1 });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [data]);

  // 2. Prepare Data for "Top 5 Requested Skills" (New Indicator)
  const topSkillsData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(d => {
      // Normalize slightly to avoid duplicates like "React" vs "react "
      const key = d.competencia.trim(); 
      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [data]);

  // 3. Prepare Data for "Competency Heatmap Proxy" (Competencies per Country)
  const countryCompetencyData = useMemo(() => {
    const mapping: Record<string, any> = {};
    
    data.forEach(d => {
      if (!mapping[d.pais]) mapping[d.pais] = { name: d.pais, Tecnico: 0, Cloud: 0, SoftSkills: 0 };
      
      const type = d.tipoHabilidad; 

      if (type === 'Cloud/DevOps') {
        mapping[d.pais]['Cloud'] += 1;
      } else if (type === 'Soft Skills/Agile') {
        mapping[d.pais]['SoftSkills'] += 1;
      } else {
        mapping[d.pais]['Tecnico'] += 1; 
      }
    });
    return Object.values(mapping);
  }, [data]);

  // 4. Prepare Ranking (Top Colaboradores)
  const rankingData = useMemo(() => {
    const collaboratorMap = new Map<string, { name: string; total: number; count: number; country: string }>();

    data.forEach(d => {
      const key = d.codigo || d.nombre;
      const entry = collaboratorMap.get(key) || { name: d.nombre, total: 0, count: 0, country: d.pais };
      entry.total += d.progreso;
      entry.count += 1;
      collaboratorMap.set(key, entry);
    });

    const aggregated = Array.from(collaboratorMap.values()).map(c => ({
      name: c.name,
      progress: Math.round(c.total / c.count),
      country: c.country
    }));

    return aggregated
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 7)
      .map(d => {
        const parts = d.name.trim().split(/\s+/);
        const displayName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
        return { 
          name: displayName, 
          fullName: d.name,
          progress: d.progress, 
          country: d.country 
        };
      });
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Chart 1: Categories Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Actividades por Categoría</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Top Skills (New) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Top 5 Habilidades Solicitadas</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topSkillsData}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                interval={0} 
                tick={{fontSize: 11}} 
              />
              <Tooltip 
                 cursor={{fill: '#f1f5f9'}}
                 content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border border-slate-200 shadow-md rounded text-xs">
                        <p className="font-bold">{data.name}</p>
                        <p className="text-emerald-600 font-semibold">{data.value} solicitudes</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} name="Solicitudes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Competency Type Distribution by Country */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Tipos de Habilidad por País</h3>
          <div className="group relative">
             <Info className="text-slate-400 cursor-help hover:text-indigo-600 transition-colors" size={20} />
             <div className="absolute right-0 top-6 w-72 bg-white border border-slate-200 p-3 rounded-lg shadow-xl z-50 text-xs hidden group-hover:block">
                <p className="font-bold mb-1 border-b pb-1">Clasificación:</p>
                <p className="text-slate-500 mb-2">Basado en la columna <strong>"Tipo Habilidad"</strong>.</p>
             </div>
          </div>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={countryCompetencyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Tecnico" stackId="a" fill="#3b82f6" name="Técnico/Core" />
              <Bar dataKey="Cloud" stackId="a" fill="#8b5cf6" name="Cloud/DevOps" />
              <Bar dataKey="SoftSkills" stackId="a" fill="#f59e0b" name="Soft Skills" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Chart 4: Ranking Top Talent */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Líderes de Avance (Progreso %)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={rankingData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={90} interval={0} fontSize={12} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border border-slate-200 shadow-md rounded text-xs">
                        <p className="font-bold">{data.fullName}</p>
                        <p className="text-slate-500">País: {data.country}</p>
                        <p className="text-blue-600 font-semibold">Progreso: {data.progress}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="progress" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                 {rankingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
