
export interface IDPRecord {
  codigo: string;
  nombre: string;
  jefe: string;
  pais: string;
  funcion: string;
  objetivo: string;
  competencia: string;
  tipoHabilidad: string; // New Field
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estatus: string; 
  categoria: string; 
  progreso: number; 
}

export interface KPIStats {
  avgProgress: number;
  completedPercentage: number;
  totalActivities: number;
  uniqueCollaborators: number; 
  criticalRiskCount: number; 
  topCategory: string;
  topCountry: string;
  topCompletionCountry: string; // New KPI
}

export interface GeminiAnalysisResult {
  strategicInsights: string[];
  riskAnalysis: string[];
  recommendations: string[];
  narrative: string;
}

export enum FilterType {
  ALL = 'Todos',
}

// --- STAR SCHEMA INTERFACES ---

export interface Dim_Pais {
  id_pais: number;
  codigo_iso: string;
}

export interface Dim_Jefe {
  id_jefe: number;
  nombre: string;
}

export interface Dim_Categoria {
  id_categoria: number;
  nombre: string;
}

export interface Dim_Competencia {
  id_competencia: number;
  nombre: string;
}

export interface Dim_TipoHabilidad {
  id_tipo_habilidad: number;
  nombre: string;
}

export interface Dim_Colaborador {
  id_colaborador: string; 
  nombre: string;
  funcion: string;
  id_pais: number; // FK
}

export interface Fact_Desarrollo {
  id_hecho: number;
  id_colaborador: string; // FK
  id_jefe: number; // FK
  id_competencia: number; // FK
  id_categoria: number; // FK
  id_pais: number; // FK 
  id_tipo_habilidad: number; // FK - New Dimension Link
  objetivo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estatus: string;
  progreso: number;
}

export interface StarSchemaDB {
  facts: Fact_Desarrollo[];
  dimPais: Dim_Pais[];
  dimJefe: Dim_Jefe[];
  dimCategoria: Dim_Categoria[];
  dimCompetencia: Dim_Competencia[];
  dimTipoHabilidad: Dim_TipoHabilidad[]; // New Table
  dimColaborador: Dim_Colaborador[];
}
