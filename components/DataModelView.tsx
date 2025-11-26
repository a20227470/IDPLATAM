
import React, { useState } from 'react';
import { StarSchemaDB } from '../types';
import { Database, User, Globe, Briefcase, Layers, Users, FileDown, Download, Cpu } from 'lucide-react';

interface Props {
  schema: StarSchemaDB;
}

export const DataModelView: React.FC<Props> = ({ schema }) => {
  const [activeTab, setActiveTab] = useState<'fact' | 'dim'>('fact');

  const downloadTableAsCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("No hay datos para exportar en esta tabla.");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        const val = row[fieldName];
        const stringVal = String(val === null || val === undefined ? '' : val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      }).join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
              <Database className="mr-2 text-indigo-600" />
              Modelo Estrella (Star Schema)
            </h3>
            <p className="text-slate-500 text-sm">
              Datos normalizados listos para exportar a SQL o PowerBI.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => downloadTableAsCSV(schema.facts, 'Fact_Desarrollo')}
              className="flex items-center px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <FileDown size={14} className="mr-2" />
              Exportar Hechos
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
            <button 
              onClick={() => downloadTableAsCSV(schema.dimColaborador, 'Dim_Colaborador')}
              className="flex items-center px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors"
            >
              <Download size={14} className="mr-1" /> Colaboradores
            </button>
             <button 
              onClick={() => downloadTableAsCSV(schema.dimPais, 'Dim_Pais')}
              className="flex items-center px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors"
            >
              <Download size={14} className="mr-1" /> Países
            </button>
          </div>
        </div>

        {/* Schema Diagram Representation */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 p-6 bg-slate-50 rounded-xl border border-slate-200 border-dashed relative">
          <div className="absolute top-2 right-2 text-xs text-slate-400 font-mono">Esquema Lógico</div>
          
          {/* Dimensions Left */}
          <div className="space-y-4 flex flex-col justify-center">
             <div className="p-3 bg-white rounded shadow-sm border border-emerald-200 w-48 text-center group cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab('dim')}>
                <div className="font-bold text-emerald-700 text-sm flex justify-center items-center"><Globe size={14} className="mr-1"/> Dim_Pais</div>
                <div className="text-xs text-slate-400 mt-1">{schema.dimPais.length} registros</div>
             </div>
             <div className="p-3 bg-white rounded shadow-sm border border-emerald-200 w-48 text-center group cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab('dim')}>
                <div className="font-bold text-emerald-700 text-sm flex justify-center items-center"><Users size={14} className="mr-1"/> Dim_Jefe</div>
                <div className="text-xs text-slate-400 mt-1">{schema.dimJefe.length} registros</div>
             </div>
          </div>

          {/* Fact Table (Center) */}
          <div className="flex items-center">
             <div className="p-4 bg-indigo-600 text-white rounded-lg shadow-md w-56 text-center z-10 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('fact')}>
                <div className="font-bold mb-1 flex justify-center items-center"><Database size={16} className="mr-2"/> Fact_Desarrollo</div>
                <div className="text-xs opacity-80 border-t border-indigo-400 pt-1 mt-1 text-left px-4">
                   FK_Colaborador<br/>
                   FK_Jefe<br/>
                   FK_Competencia<br/>
                   FK_TipoHabilidad<br/>
                   FK_Categoria<br/>
                   FK_Pais
                </div>
                <div className="mt-2 text-xs font-mono bg-indigo-800 rounded px-2 py-1 inline-block">
                  {schema.facts.length} registros
                </div>
             </div>
          </div>

          {/* Dimensions Right */}
          <div className="space-y-4 flex flex-col justify-center">
             <div className="p-3 bg-white rounded shadow-sm border border-emerald-200 w-48 text-center group cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab('dim')}>
                <div className="font-bold text-emerald-700 text-sm flex justify-center items-center"><User size={14} className="mr-1"/> Dim_Colaborador</div>
                <div className="text-xs text-slate-400 mt-1">{schema.dimColaborador.length} registros</div>
             </div>
             <div className="p-3 bg-white rounded shadow-sm border border-emerald-200 w-48 text-center group cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab('dim')}>
                <div className="font-bold text-emerald-700 text-sm flex justify-center items-center"><Layers size={14} className="mr-1"/> Dim_Categoria</div>
                <div className="text-xs text-slate-400 mt-1">{schema.dimCategoria.length} registros</div>
             </div>
             <div className="p-3 bg-white rounded shadow-sm border border-emerald-200 w-48 text-center group cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab('dim')}>
                <div className="font-bold text-emerald-700 text-sm flex justify-center items-center"><Cpu size={14} className="mr-1"/> Dim_TipoHabilidad</div>
                <div className="text-xs text-slate-400 mt-1">{schema.dimTipoHabilidad.length} registros</div>
             </div>
          </div>
        </div>

        {/* Data Tables */}
        <div>
          <div className="border-b border-slate-200 mb-4 flex justify-between items-end">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('fact')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'fact'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Tabla de Hechos (Facts)
              </button>
              <button
                onClick={() => setActiveTab('dim')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dim'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Tablas de Dimensiones
              </button>
            </nav>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'fact' && (
              <table className="min-w-full text-xs text-left text-slate-600 font-mono">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="px-3 py-2">ID_Hecho</th>
                    <th className="px-3 py-2 text-indigo-600">ID_Colab</th>
                    <th className="px-3 py-2 text-indigo-600">ID_Comp</th>
                    <th className="px-3 py-2 text-indigo-600">ID_TipoHab</th>
                    <th className="px-3 py-2 text-indigo-600">ID_Cat</th>
                    <th className="px-3 py-2">Progreso</th>
                    <th className="px-3 py-2">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schema.facts.slice(0, 10).map((row) => (
                    <tr key={row.id_hecho}>
                      <td className="px-3 py-2">{row.id_hecho}</td>
                      <td className="px-3 py-2">{row.id_colaborador}</td>
                      <td className="px-3 py-2">{row.id_competencia}</td>
                      <td className="px-3 py-2">{row.id_tipo_habilidad}</td>
                      <td className="px-3 py-2">{row.id_categoria}</td>
                      <td className="px-3 py-2 font-bold">{row.progreso}%</td>
                      <td className="px-3 py-2">{row.estatus}</td>
                    </tr>
                  ))}
                   <tr>
                    <td colSpan={7} className="px-3 py-2 text-center text-slate-400 italic bg-slate-50">
                      Mostrando los primeros 10 registros de {schema.facts.length}...
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeTab === 'dim' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Dim Pais */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-emerald-50 px-3 py-2 font-bold text-emerald-800 text-xs border-b flex justify-between">
                    <span>Dim_Pais</span>
                    <button onClick={() => downloadTableAsCSV(schema.dimPais, 'Dim_Pais')} className="text-emerald-600 hover:text-emerald-900"><Download size={14}/></button>
                  </div>
                  <table className="w-full text-xs">
                     <thead className="bg-slate-50"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Código ISO</th></tr></thead>
                     <tbody>
                        {schema.dimPais.map(d => (
                          <tr key={d.id_pais} className="border-t border-slate-100">
                            <td className="p-2">{d.id_pais}</td>
                            <td className="p-2">{d.codigo_iso}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>

                {/* Dim Tipo Habilidad (New) */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-emerald-50 px-3 py-2 font-bold text-emerald-800 text-xs border-b flex justify-between">
                    <span>Dim_TipoHabilidad</span>
                    <button onClick={() => downloadTableAsCSV(schema.dimTipoHabilidad, 'Dim_TipoHabilidad')} className="text-emerald-600 hover:text-emerald-900"><Download size={14}/></button>
                  </div>
                  <table className="w-full text-xs">
                     <thead className="bg-slate-50"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Nombre</th></tr></thead>
                     <tbody>
                        {schema.dimTipoHabilidad.map(d => (
                          <tr key={d.id_tipo_habilidad} className="border-t border-slate-100">
                            <td className="p-2">{d.id_tipo_habilidad}</td>
                            <td className="p-2">{d.nombre}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>

                {/* Dim Competencia */}
                <div className="border rounded-lg overflow-hidden col-span-2">
                  <div className="bg-emerald-50 px-3 py-2 font-bold text-emerald-800 text-xs border-b flex justify-between">
                     <span>Dim_Competencia (Top 5)</span>
                     <button onClick={() => downloadTableAsCSV(schema.dimCompetencia, 'Dim_Competencia')} className="text-emerald-600 hover:text-emerald-900"><Download size={14}/></button>
                  </div>
                  <table className="w-full text-xs">
                     <thead className="bg-slate-50"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Competencia</th></tr></thead>
                     <tbody>
                        {schema.dimCompetencia.slice(0, 5).map(d => (
                          <tr key={d.id_competencia} className="border-t border-slate-100">
                            <td className="p-2">{d.id_competencia}</td>
                            <td className="p-2">{d.nombre}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
