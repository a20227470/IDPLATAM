
import { IDPRecord } from '../types';

const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Classification Keywords
const CLOUD_KEYWORDS = ['cloud', 'aws', 'azure', 'gcp', 'devops', 'docker', 'kubernetes', 'k8s', 'terraform', 'ci/cd', 'pipeline', 'infraestructura', 'linux', 'server'];
const SOFT_KEYWORDS = ['liderazgo', 'gestión', 'gestion', 'management', 'comunicación', 'agile', 'scrum', 'kanban', 'negociación', 'feedback', 'coaching', 'soft', 'blanda', 'equipo', 'presentación', 'inteligencia emocional'];

export const parseCSV = (csvText: string): IDPRecord[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  // Handle BOM
  if (lines[0].charCodeAt(0) === 0xFEFF) {
    lines[0] = lines[0].substr(1);
  }

  // Auto-detect delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';

  const splitCSVLine = (line: string, delim: string) => {
    const res: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuote && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (char === delim && !inQuote) {
        res.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    res.push(current);
    return res.map(val => val.trim().replace(/^"|"$/g, ''));
  };

  const headers = splitCSVLine(lines[0], delimiter);

  const getKey = (header: string): keyof IDPRecord | null => {
    const h = header.toLowerCase().trim();
    
    if (h.includes('código') || h.includes('codigo')) return 'codigo';
    if (h.includes('nombre')) return 'nombre';
    if (h.includes('jefe')) return 'jefe';
    if (h.includes('país') || h.includes('pais')) return 'pais';
    if (h.includes('función') || h.includes('funcion') || h.includes('cargo')) return 'funcion';
    
    if (h.includes('objetivo de desarrollo') || h.includes('objetivo')) return 'objetivo';
    if (h.includes('competencia a desarrollar') || h.includes('competencia')) return 'competencia';
    // New Column Mapping
    if (h.includes('tipo habilidad') || h.includes('tipo de habilidad') || h.includes('skill type')) return 'tipoHabilidad';

    if (h.includes('descripción') || h.includes('descripcion')) return 'descripcion';
    
    if (h.includes('fecha inicio') || h.includes('inicio')) return 'fechaInicio';
    if (h.includes('fecha fin') || h.includes('fin')) return 'fechaFin';
    
    if (h.includes('estatus') || h.includes('estado')) return 'estatus';
    if (h.includes('categoría') || h.includes('categoria')) return 'categoria';
    if (h.includes('progreso') || h.includes('%')) return 'progreso';
    
    return null;
  };

  const headerMap: Record<number, keyof IDPRecord> = {};
  headers.forEach((h, i) => {
    const key = getKey(h);
    if (key) headerMap[i] = key;
  });

  return lines.slice(1).map(line => {
    const values = splitCSVLine(line, delimiter);
    const row: any = {
       codigo: '',
       nombre: '',
       jefe: '',
       pais: '',
       funcion: '',
       objetivo: '',
       competencia: '',
       tipoHabilidad: '', // Default empty
       descripcion: '',
       fechaInicio: '',
       fechaFin: '',
       estatus: 'Pendiente',
       categoria: 'General',
       progreso: 0
    };

    values.forEach((val, i) => {
      if (headerMap[i]) {
        if (headerMap[i] === 'progreso') {
           const cleanVal = val.replace('%', '').replace(',', '.').trim();
           const num = parseFloat(cleanVal);
           row[headerMap[i]] = isNaN(num) ? 0 : num;
        } else if (headerMap[i] === 'jefe') {
           row[headerMap[i]] = toTitleCase(val.trim());
        } else {
           row[headerMap[i]] = val.trim();
        }
      }
    });

    // Country Normalization
    let p = (row.pais || '').trim().toUpperCase();
    if (p.includes('PER') || p === 'PERU') p = 'PE';
    else if (p.includes('ECU') || p === 'ECUADOR') p = 'EC';
    else if (p.includes('COS') || (p.includes('RICA') && p.includes('COSTA'))) p = 'CR';
    else if (p.includes('DOM') || p === 'REPUBLICA DOMINICANA') p = 'RD';
    if (p.length > 0) row.pais = p;

    // Fallback ID
    if (!row.codigo) row.codigo = `IDP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Auto-Classify "Tipo Habilidad" if missing or empty
    if (!row.tipoHabilidad) {
      const compLower = (row.competencia || '').toLowerCase();
      if (CLOUD_KEYWORDS.some(k => compLower.includes(k))) {
        row.tipoHabilidad = 'Cloud/DevOps';
      } else if (SOFT_KEYWORDS.some(k => compLower.includes(k))) {
        row.tipoHabilidad = 'Soft Skills/Agile';
      } else {
        row.tipoHabilidad = 'Técnico/Core';
      }
    }

    return row as IDPRecord;
  });
};

export const generateTemplateCSV = () => {
  const headers = [
    "Código", "Nombre", "Jefe", "País", "Función", 
    "Objetivo de Desarrollo", "Competencia a desarrollar", "Tipo Habilidad", "Descripción", 
    "Fecha Inicio", "Fecha Fin", "Estatus", "Categoría", "Progreso (%)"
  ];
  
  const exampleRow = [
    "IDP001", "Juan Perez", "Maria Lopez", "PE", "Desarrollador",
    "Mejorar Skills", "React Avanzado", "Técnico/Core", "Curso online completo",
    "01/01/2025", "30/03/2025", "En Progreso", "Cursos", "45%"
  ];

  const csvContent = [
    headers.join(','),
    exampleRow.join(',')
  ].join('\n');

  return csvContent;
};
