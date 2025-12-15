
import React from 'react';
import { KPIStats } from '../types';
import { TrendingUp, CheckCircle, AlertTriangle, Globe, UserCheck, Layers, Award } from 'lucide-react';

interface KPICardsProps {
  stats: KPIStats;
}

const Card: React.FC<{ title: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }> = ({ title, value, sub, icon, color }) => (
  <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-slate-200 p-5 flex items-start justify-between transition-all hover:shadow-md">
    <div>
      <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color} text-white`}>
      {icon}
    </div>
  </div>
);

export const KPICards: React.FC<KPICardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      <Card
        title="Progreso Promedio"
        value={`${stats.avgProgress.toFixed(1)}%`}
        sub="Objetivo anual"
        icon={<TrendingUp size={20} />}
        color="bg-blue-500"
      />
      <Card
        title="Completados"
        value={`${stats.completedPercentage.toFixed(1)}%`}
        sub={`${stats.totalActivities} Actividades Totales`}
        icon={<CheckCircle size={20} />}
        color="bg-emerald-500"
      />
      <Card
        title="Líder Completados"
        value={stats.topCompletionCountry}
        sub="Mayor Cumplimiento"
        icon={<Award size={20} />}
        color="bg-orange-500"
      />
      <Card
        title="En Riesgo (<40%)"
        value={stats.criticalRiskCount}
        sub="Necesitan atención"
        icon={<AlertTriangle size={20} />}
        color="bg-amber-500"
      />
      <Card
        title="Top Categoría"
        value={stats.topCategory}
        sub="Mayor volumen"
        icon={<Layers size={20} />}
        color="bg-indigo-500"
      />
      <Card
        title="País Líder"
        value={stats.topCountry}
        sub="Más actividad asignada"
        icon={<Globe size={20} />}
        color="bg-violet-500"
      />
       <Card
        title="Colaboradores"
        value={stats.uniqueCollaborators}
        sub="En plan activo"
        icon={<UserCheck size={20} />}
        color="bg-slate-500"
      />
    </div>
  );
};
