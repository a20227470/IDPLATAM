
import { IDPRecord, StarSchemaDB, Dim_Pais, Dim_Jefe, Dim_Categoria, Dim_Competencia, Dim_Colaborador, Dim_TipoHabilidad, Fact_Desarrollo } from '../types';

export const normalizeToStarSchema = (flatData: IDPRecord[]): StarSchemaDB => {
  const dimPaisMap = new Map<string, number>();
  const dimJefeMap = new Map<string, number>();
  const dimCategoriaMap = new Map<string, number>();
  const dimCompetenciaMap = new Map<string, number>();
  const dimTipoHabilidadMap = new Map<string, number>();
  const dimColaboradorMap = new Map<string, Dim_Colaborador>();
  
  const facts: Fact_Desarrollo[] = [];

  let idPaisCounter = 1;
  let idJefeCounter = 1;
  let idCategoriaCounter = 1;
  let idCompetenciaCounter = 1;
  let idTipoHabilidadCounter = 1;
  let idFactCounter = 1;

  flatData.forEach(record => {
    // 1. Resolve Dimensions
    
    // Pais
    if (!dimPaisMap.has(record.pais)) {
      dimPaisMap.set(record.pais, idPaisCounter++);
    }
    const idPais = dimPaisMap.get(record.pais)!;

    // Jefe
    if (!dimJefeMap.has(record.jefe)) {
      dimJefeMap.set(record.jefe, idJefeCounter++);
    }
    const idJefe = dimJefeMap.get(record.jefe)!;

    // Categoria
    if (!dimCategoriaMap.has(record.categoria)) {
      dimCategoriaMap.set(record.categoria, idCategoriaCounter++);
    }
    const idCategoria = dimCategoriaMap.get(record.categoria)!;

    // Competencia
    if (!dimCompetenciaMap.has(record.competencia)) {
      dimCompetenciaMap.set(record.competencia, idCompetenciaCounter++);
    }
    const idCompetencia = dimCompetenciaMap.get(record.competencia)!;

    // Tipo Habilidad (New Dimension)
    // Default fallback if somehow empty
    const tipoHab = record.tipoHabilidad || 'No Clasificado';
    if (!dimTipoHabilidadMap.has(tipoHab)) {
      dimTipoHabilidadMap.set(tipoHab, idTipoHabilidadCounter++);
    }
    const idTipoHabilidad = dimTipoHabilidadMap.get(tipoHab)!;

    // Colaborador
    if (!dimColaboradorMap.has(record.codigo)) {
      dimColaboradorMap.set(record.codigo, {
        id_colaborador: record.codigo,
        nombre: record.nombre,
        funcion: record.funcion,
        id_pais: idPais
      });
    }

    // 2. Create Fact
    facts.push({
      id_hecho: idFactCounter++,
      id_colaborador: record.codigo,
      id_jefe: idJefe,
      id_competencia: idCompetencia,
      id_categoria: idCategoria,
      id_pais: idPais,
      id_tipo_habilidad: idTipoHabilidad, // FK Link
      objetivo: record.objetivo,
      descripcion: record.descripcion,
      fecha_inicio: record.fechaInicio,
      fecha_fin: record.fechaFin,
      estatus: record.estatus,
      progreso: record.progreso
    });
  });

  // Convert Maps to Arrays
  return {
    facts,
    dimPais: Array.from(dimPaisMap.entries()).map(([code, id]) => ({ id_pais: id, codigo_iso: code })),
    dimJefe: Array.from(dimJefeMap.entries()).map(([name, id]) => ({ id_jefe: id, nombre: name })),
    dimCategoria: Array.from(dimCategoriaMap.entries()).map(([name, id]) => ({ id_categoria: id, nombre: name })),
    dimCompetencia: Array.from(dimCompetenciaMap.entries()).map(([name, id]) => ({ id_competencia: id, nombre: name })),
    dimTipoHabilidad: Array.from(dimTipoHabilidadMap.entries()).map(([name, id]) => ({ id_tipo_habilidad: id, nombre: name })),
    dimColaborador: Array.from(dimColaboradorMap.values())
  };
};
