
import React, { useState } from 'react';
import { IDPRecord } from '../types';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Props {
  data: IDPRecord[];
}

export const DataTable: React.FC<Props> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const filtered = data.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.competencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('completado') || s.includes('finalizado')) return 'bg-emerald-100 text-emerald-700';
    if (s.includes('progreso') || s.includes('curso')) return 'bg-blue-100 text-blue-700';
    if (s.includes('pendiente')) return 'bg-slate-100 text-slate-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-slate-800">Detalle de Registros</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, código..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">País</th>
              <th className="px-4 py-3">Competencia</th>
              <th className="px-4 py-3">Tipo Hab.</th>
              <th className="px-4 py-3">Objetivo</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-center">Progreso</th>
              <th className="px-4 py-3">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentData.length > 0 ? (
              currentData.map((row, idx) => (
                <tr key={`${row.codigo}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.codigo}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.nombre} <br/> <span className="text-xs text-slate-400 font-normal">{row.funcion}</span></td>
                  <td className="px-4 py-3">{row.pais}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={row.competencia}>{row.competencia}</td>
                  <td className="px-4 py-3">
                     <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium whitespace-nowrap">
                       {row.tipoHabilidad}
                     </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-500" title={row.objetivo}>{row.objetivo}</td>
                  <td className="px-4 py-3">{row.categoria}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                       <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500" style={{ width: `${row.progreso}%` }}></div>
                       </div>
                       <span className="text-xs font-bold">{row.progreso}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.estatus)}`}>
                      {row.estatus}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
        <span className="text-xs text-slate-500">
          Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} de {filtered.length}
        </span>
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-white disabled:opacity-50 border border-transparent hover:border-slate-200"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             disabled={currentPage === totalPages}
             className="p-1 rounded hover:bg-white disabled:opacity-50 border border-transparent hover:border-slate-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
