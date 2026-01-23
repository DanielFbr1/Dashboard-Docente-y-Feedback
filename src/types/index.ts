
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
    interaccionesIA: number;
    miembros: string[];
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
    codigoSala: string;
    grupos: Grupo[];
}

export type DashboardSection = 'resumen' | 'grupos' | 'interacciones' | 'evaluacion' | 'trabajo-compartido';

export interface ProyectoActivo {
    id: string;
    nombre: string;
    tipo: string;
    codigoSala: string;
}
