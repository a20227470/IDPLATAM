
import { IDPRecord, KPIStats, GeminiAnalysisResult } from '../types';

export const generatePortableReport = (
  data: IDPRecord[],
  stats: KPIStats,
  analysis: GeminiAnalysisResult | null,
  filters: { country: string; manager: string }
) => {
  // 1. Prepare Data for Charts (Chart.js format)
  const categoryCounts = data.reduce((acc, curr) => {
    acc[curr.categoria] = (acc[curr.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const skillCounts: Record<string, { tecnico: number; cloud: number; soft: number }> = {};
  data.forEach(d => {
      if (!skillCounts[d.pais]) skillCounts[d.pais] = { tecnico: 0, cloud: 0, soft: 0 };
      const type = d.tipoHabilidad || 'Técnico/Core';
      if (type.includes('Cloud')) skillCounts[d.pais].cloud++;
      else if (type.includes('Soft')) skillCounts[d.pais].soft++;
      else skillCounts[d.pais].tecnico++;
  });

  const countries = Object.keys(skillCounts).sort();
  const datasetTecnico = countries.map(c => skillCounts[c].tecnico);
  const datasetCloud = countries.map(c => skillCounts[c].cloud);
  const datasetSoft = countries.map(c => skillCounts[c].soft);

  // 2. Build HTML Content
  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte IDP 2025 - Talento TI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }</style>
</head>
<body class="pb-10">

  <!-- Header -->
  <div class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Reporte Ejecutivo IDP 2025</h1>
        <p class="text-xs text-slate-500">Generado automáticamente • Filtros: País [${filters.country}] - Jefe [${filters.manager}]</p>
      </div>
      <div class="text-right">
        <div class="text-sm font-bold text-indigo-600">${new Date().toLocaleDateString()}</div>
      </div>
    </div>
  </div>

  <main class="max-w-7xl mx-auto px-4 mt-8">
    
    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-slate-500 text-xs uppercase font-bold">Progreso</div>
        <div class="text-2xl font-bold text-blue-600">${stats.avgProgress.toFixed(1)}%</div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-slate-500 text-xs uppercase font-bold">Completados</div>
        <div class="text-2xl font-bold text-emerald-600">${stats.completedPercentage.toFixed(1)}%</div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-slate-500 text-xs uppercase font-bold">Actividades</div>
        <div class="text-2xl font-bold text-slate-800">${stats.totalActivities}</div>
      </div>
       <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-slate-500 text-xs uppercase font-bold">Colaboradores</div>
        <div class="text-2xl font-bold text-slate-800">${stats.uniqueCollaborators}</div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-slate-500 text-xs uppercase font-bold">Riesgo (<40%)</div>
        <div class="text-2xl font-bold text-amber-600">${stats.criticalRiskCount}</div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-slate-500 text-xs uppercase font-bold">Top Categoría</div>
        <div class="text-sm font-bold text-indigo-600 truncate" title="${stats.topCategory}">${stats.topCategory}</div>
      </div>
    </div>

    <!-- AI Insights -->
    ${analysis ? `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
        <h3 class="font-bold text-indigo-800 mb-2 flex items-center">💡 Resumen Ejecutivo & Estrategia</h3>
        <p class="text-sm text-slate-700 italic mb-4">"${analysis.narrative}"</p>
        <ul class="space-y-2">
          ${analysis.strategicInsights.map(i => `<li class="text-xs text-slate-600 flex"><span class="mr-2 text-yellow-500">●</span> ${i}</li>`).join('')}
        </ul>
      </div>
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 class="font-bold text-slate-800 mb-2 flex items-center">⚠️ Riesgos & Recomendaciones</h3>
        <div class="mb-4">
          <ul class="space-y-1">
            ${analysis.riskAnalysis.map(i => `<li class="text-xs text-slate-600 flex"><span class="mr-2 text-red-500">●</span> ${i}</li>`).join('')}
          </ul>
        </div>
        <div>
          <ul class="space-y-1">
            ${analysis.recommendations.map(i => `<li class="text-xs text-slate-600 flex"><span class="mr-2 text-emerald-500">●</span> ${i}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 class="font-bold text-slate-700 mb-4 text-sm">Distribución por Categoría</h3>
        <canvas id="chartCategory"></canvas>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 class="font-bold text-slate-700 mb-4 text-sm">Tipos de Habilidad por País</h3>
        <canvas id="chartSkills"></canvas>
      </div>
    </div>

    <!-- Data Table Sample -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div class="px-6 py-4 border-b border-slate-100 font-bold text-slate-700">Detalle de Registros (Top 50)</div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-4 py-2">Colaborador</th>
              <th class="px-4 py-2">País</th>
              <th class="px-4 py-2">Competencia</th>
              <th class="px-4 py-2">Categoría</th>
              <th class="px-4 py-2">Progreso</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${data.slice(0, 50).map(row => `
              <tr>
                <td class="px-4 py-2 font-medium">${row.nombre}</td>
                <td class="px-4 py-2">${row.pais}</td>
                <td class="px-4 py-2">${row.competencia}</td>
                <td class="px-4 py-2">${row.categoria}</td>
                <td class="px-4 py-2">
                  <div class="flex items-center">
                    <div class="w-12 h-1.5 bg-slate-200 rounded-full mr-2">
                      <div class="h-1.5 bg-blue-500 rounded-full" style="width: ${row.progreso}%"></div>
                    </div>
                    ${row.progreso}%
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </main>

  <script>
    // 1. Category Chart
    const ctxCat = document.getElementById('chartCategory');
    new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: ${JSON.stringify(Object.keys(categoryCounts))},
        datasets: [{
          data: ${JSON.stringify(Object.values(categoryCounts))},
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // 2. Skills Stacked Bar
    const ctxSkills = document.getElementById('chartSkills');
    new Chart(ctxSkills, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(countries)},
        datasets: [
          { label: 'Técnico/Core', data: ${JSON.stringify(datasetTecnico)}, backgroundColor: '#3b82f6' },
          { label: 'Cloud/DevOps', data: ${JSON.stringify(datasetCloud)}, backgroundColor: '#8b5cf6' },
          { label: 'Soft Skills/Agile', data: ${JSON.stringify(datasetSoft)}, backgroundColor: '#f59e0b' }
        ]
      },
      options: {
        responsive: true,
        scales: { x: { stacked: true }, y: { stacked: true } },
        plugins: { legend: { position: 'bottom' } }
      }
    });
  </script>
</body>
</html>
  `;

  // 3. Trigger Download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Reporte_IDP_2025.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
