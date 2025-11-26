
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { KPICards } from './components/KPICards';
import { ChartsContainer } from './components/ChartsContainer';
import { HeatmapGrid } from './components/HeatmapGrid';
import { InsightSection } from './components/InsightSection';
import { DataTable } from './components/DataTable';
import { DataModelView } from './components/DataModelView';
import { IDPRecord, KPIStats, GeminiAnalysisResult, StarSchemaDB } from './types';
import { MOCK_DATA } from './mockData';
import { analyzeIDPData } from './services/geminiService';
import { parseCSV, generateTemplateCSV } from './utils/csvHelpers';
import { normalizeToStarSchema } from './utils/normalization';
import { generatePortableReport } from './utils/reportGenerator';
import { Upload, Filter, RefreshCw, AlertCircle, Database, FileDown, Table, Trash2, LayoutDashboard, BarChart2, Share2 } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<IDPRecord[]>(MOCK_DATA);
  const [isCustomData, setIsCustomData] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [filterCountry, setFilterCountry] = useState<string>('Todos');
  const [filterManager, setFilterManager] = useState<string>('Todos');
  const [aiError, setAiError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'model'>('dashboard');

  // 1. Calculate Stats derived from filtered Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchCountry = filterCountry === 'Todos' || item.pais === filterCountry;
      const matchManager = filterManager === 'Todos' || item.jefe === filterManager;
      return matchCountry && matchManager;
    });
  }, [data, filterCountry, filterManager]);

  const stats: KPIStats = useMemo(() => {
    if (filteredData.length === 0) return { avgProgress: 0, completedPercentage: 0, totalActivities: 0, uniqueCollaborators: 0, criticalRiskCount: 0, topCategory: '-', topCountry: '-' };
    
    const total = filteredData.length;
    // Count unique IDs (Collaborators)
    const uniqueCollaborators = new Set(filteredData.map(d => d.codigo)).size;

    const avgProg = filteredData.reduce((acc, curr) => acc + curr.progreso, 0) / total;
    const completed = filteredData.filter(d => (d.estatus && d.estatus.toLowerCase().includes('completado')) || d.progreso === 100).length;
    const risks = filteredData.filter(d => d.progreso < 40 && (!d.estatus || !d.estatus.toLowerCase().includes('pendiente'))).length;
    
    // Mode calculations
    const catCount = filteredData.reduce((acc, curr) => { acc[curr.categoria] = (acc[curr.categoria] || 0) + 1; return acc; }, {} as any);
    const topCat = Object.keys(catCount).length ? Object.keys(catCount).reduce((a, b) => catCount[a] > catCount[b] ? a : b) : '-';
    
    const countryCount = filteredData.reduce((acc, curr) => { acc[curr.pais] = (acc[curr.pais] || 0) + 1; return acc; }, {} as any);
    const topCountry = Object.keys(countryCount).length ? Object.keys(countryCount).reduce((a, b) => countryCount[a] > countryCount[b] ? a : b) : '-';

    return {
      avgProgress: avgProg,
      completedPercentage: (completed / total) * 100,
      totalActivities: total,
      uniqueCollaborators: uniqueCollaborators,
      criticalRiskCount: risks,
      topCategory: topCat,
      topCountry: topCountry
    };
  }, [filteredData]);

  // Derived Star Schema (Normalized)
  const starSchema: StarSchemaDB = useMemo(() => {
    return normalizeToStarSchema(filteredData);
  }, [filteredData]);

  // 2. Trigger AI Analysis
  const runAnalysis = async () => {
    if (filteredData.length === 0 && data.length === 0) return;

    setLoadingAI(true);
    setAiError(false);
    try {
      // Send filtered data if it represents a meaningful subset, otherwise send all for full context
      const datasetToAnalyze = filteredData.length > 5 ? filteredData : data; 
      if (datasetToAnalyze.length === 0) {
         setLoadingAI(false);
         return;
      }
      const result = await analyzeIDPData(datasetToAnalyze);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setAiError(true);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    // Initial analysis on mount if data exists
    if (data.length > 0) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 3. Handlers
  const handleDownloadTemplate = () => {
    const csvContent = generateTemplateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_idp_2025.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = () => {
    if (window.confirm('¿Estás seguro de borrar los datos actuales?')) {
      setData(MOCK_DATA); // This is now empty
      setIsCustomData(false);
      setFilterCountry('Todos');
      setFilterManager('Todos');
      setAnalysis(null);
    }
  };

  const handleShareReport = () => {
    generatePortableReport(filteredData, stats, analysis, { country: filterCountry, manager: filterManager });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          const parsedData = parseCSV(text);
          if (parsedData.length > 0) {
            setData(parsedData);
            setIsCustomData(true);
            
            // Critical: Reset filters to 'Todos' whenever new data loads to prevent mismatch
            setFilterCountry('Todos');
            setFilterManager('Todos');

            // Re-run analysis automatically for the new dataset
            setAnalysis(null); // Clear old analysis
            setTimeout(() => {
               analyzeIDPData(parsedData).then(res => setAnalysis(res)).catch(() => setAiError(true));
            }, 500);
          } else {
            alert("No se encontraron registros válidos en el CSV. Asegúrate de usar la Plantilla o verificar los encabezados.");
          }
        } catch (err) {
          console.error(err);
          alert("Error al procesar el archivo CSV.");
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    e.target.value = '';
  };

  // Filter Options Logic (Dependent Filters)
  // 1. Country options come from ALL data
  const uniqueCountries = useMemo(() => {
    const countries = new Set(data.map(d => d.pais).filter(Boolean));
    return Array.from(countries).sort();
  }, [data]);

  // 2. Manager options depend on the SELECTED Country (if any)
  const uniqueManagers = useMemo(() => {
    let sourceData = data;
    // If a specific country is selected, only show managers from that country
    if (filterCountry !== 'Todos') {
      sourceData = data.filter(d => d.pais === filterCountry);
    }
    const managers = new Set(sourceData.map(d => d.jefe).filter(Boolean));
    return Array.from(managers).sort();
  }, [data, filterCountry]);

  // Effect to reset Manager filter if the selected manager doesn't exist in the new country selection
  useEffect(() => {
    if (filterManager !== 'Todos' && !uniqueManagers.includes(filterManager)) {
      setFilterManager('Todos');
    }
  }, [filterCountry, uniqueManagers, filterManager]);


  return (
    <Layout>
      {/* Header Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col xl:flex-row justify-between items-center gap-4">
        
        {/* View Switcher & Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button
               onClick={() => setActiveTab('dashboard')}
               className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <BarChart2 size={16} className="mr-2" />
               Dashboard
             </button>
             <button
               onClick={() => setActiveTab('model')}
               className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'model' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <Database size={16} className="mr-2" />
               Modelo de Datos
             </button>
          </div>

          <div className="h-6 w-px bg-slate-300 hidden md:block"></div>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto">
            <div className="flex items-center gap-2 text-slate-600 whitespace-nowrap">
              <Filter size={18} />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <select 
              className="form-select text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              disabled={data.length === 0}
            >
              <option value="Todos">Todos los Países ({uniqueCountries.length})</option>
              {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              className="form-select text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
              value={filterManager}
              onChange={(e) => setFilterManager(e.target.value)}
              disabled={data.length === 0}
            >
              <option value="Todos">Todos los Jefes</option>
              {uniqueManagers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Info & Actions */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end flex-wrap">
           {/* Stats Indicator */}
           <div className="px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 flex items-center whitespace-nowrap mr-2">
             <Table size={14} className="mr-1.5 text-slate-400" />
             Registros: <span className="ml-1 font-bold text-slate-800">{data.length}</span>
           </div>

           {/* Source Indicator */}
           <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${isCustomData ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
             <Database size={12} className="mr-1.5" />
             {isCustomData ? 'Dataset Propio' : 'Sin Datos'}
           </div>

           {/* Share Button (New) */}
           {data.length > 0 && (
             <button
               onClick={handleShareReport}
               className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
               title="Exportar Reporte HTML para compartir"
             >
               <Share2 size={16} className="mr-2 text-indigo-500" />
               Compartir
             </button>
           )}

           {isCustomData && (
             <button
               onClick={handleResetData}
               className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
               title="Borrar dataset"
             >
               <Trash2 size={16} className="mr-2" />
               Borrar
             </button>
           )}

           {!isCustomData && (
             <button
               onClick={handleDownloadTemplate}
               className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
               title="Descargar plantilla CSV"
             >
                <FileDown size={16} className="mr-2" />
                Plantilla
             </button>
           )}

           <label className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-900 cursor-pointer transition-colors shadow-sm">
             <Upload size={16} className="mr-2" />
             Cargar CSV
             <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
           </label>

           <button 
             onClick={runAnalysis} 
             disabled={loadingAI || data.length === 0}
             className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200 whitespace-nowrap"
           >
             <RefreshCw size={16} className={`mr-2 ${loadingAI ? 'animate-spin' : ''}`} />
             {loadingAI ? 'Analizando...' : 'Insights IA'}
           </button>
        </div>
      </div>

      {/* Empty State / Welcome */}
      {data.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed mb-8">
           <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard size={32} className="text-slate-400" />
           </div>
           <h2 className="text-xl font-bold text-slate-800 mb-2">Tablero de Control IDP Vacío</h2>
           <p className="text-slate-500 max-w-md mx-auto mb-6">
             Actualmente no hay datos cargados. Por favor, descarga la plantilla o carga tu archivo CSV (Excel) para comenzar el análisis.
           </p>
           <div className="flex justify-center space-x-4">
              <button 
                onClick={handleDownloadTemplate}
                className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <FileDown size={16} className="mr-2" />
                Descargar Plantilla
              </button>
              <label className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer transition-colors shadow-sm">
                 <Upload size={16} className="mr-2" />
                 Cargar Datos
                 <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
               </label>
           </div>
        </div>
      )}

      {/* Main Content (Only visible when data exists) */}
      {data.length > 0 && (
        <>
          {activeTab === 'dashboard' ? (
             <>
                {/* AI Error Warning */}
                {aiError && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-center">
                      <AlertCircle size={20} className="mr-2" />
                      <span>No se pudo conectar con Gemini AI. Asegúrese de que la API Key esté configurada. (Mostrando solo visualización de datos)</span>
                  </div>
                )}

                {/* Main Stats */}
                <KPICards stats={stats} />

                {/* AI Insights Section */}
                <InsightSection analysis={analysis} loading={loadingAI} />

                {/* Charts Grid */}
                <ChartsContainer data={filteredData} />

                {/* Heatmap Grid */}
                <HeatmapGrid data={filteredData} />

                {/* Data Detail Table */}
                <DataTable data={filteredData} />
             </>
          ) : (
            <DataModelView schema={starSchema} />
          )}
        </>
      )}

    </Layout>
  );
};

export default App;
