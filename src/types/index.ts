
export interface MensajeIA {
    id: string;
    tipo: 'alumno' | 'ia';
    contenido: string;
    categoria: 'Metacognitiva' | 'Técnica' | 'Organizativa' | 'Creativa';
    timestamp: Date;
}

export interface Conversacion {
    id: string;
    grupoId: number;
    mensajes: MensajeIA[];
    fechaInicio: Date;
    fechaUltima: Date;
}

export interface Grupo {
    id: number;
    nombre: string;
    departamento: string;
    estado: 'En progreso' | 'Casi terminado' | 'Bloqueado' | 'Completado';
    progreso: number;
    interacciones_ia: number;
    miembros: string[];
    proyecto_id?: string;
    conversacionesIA?: Conversacion[];
}

export type ProyectoEstado = 'En preparación' | 'En curso' | 'Finalizado';

export interface ProyectoFase {
    id: string;
    nombre: string;
    estado: 'completado' | 'actual' | 'pendiente';
}

export interface Proyecto {
    id: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    estado: ProyectoEstado;
    fases: ProyectoFase[];
    codigo_sala: string;
    clase?: string;
    grupos?: Grupo[];
}

export interface AlumnoConectado {
    id: string;
    proyecto_id: string;
    nombre_alumno: string;
    last_active: string;
}

export type DashboardSection = 'resumen' | 'grupos' | 'interacciones' | 'evaluacion' | 'trabajo-compartido';

export interface ProyectoActivo {
    id: string;
    nombre: string;
    tipo: string;
    codigo_sala: string;
    clase?: string;
}
