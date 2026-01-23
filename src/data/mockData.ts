
import { Proyecto, Grupo } from '../types';

export const GRUPOS_MOCK: Grupo[] = [
    {
        id: 1,
        nombre: 'Grupo 1 – Guion',
        departamento: 'Guion',
        estado: 'En progreso',
        progreso: 60,
        interacciones_ia: 12,
        miembros: ['Ana García', 'Carlos López', 'María Fernández', 'Pedro Martínez']
    },
    {
        id: 2,
        nombre: 'Grupo 2 – Locución',
        departamento: 'Locución',
        estado: 'Casi terminado',
        progreso: 85,
        interacciones_ia: 18,
        miembros: ['Laura Sánchez', 'Diego Torres', 'Sofia Ruiz', 'Javier Gómez']
    },
    {
        id: 3,
        nombre: 'Grupo 3 – Edición',
        departamento: 'Edición',
        estado: 'Bloqueado',
        progreso: 35,
        interacciones_ia: 8,
        miembros: ['Elena Jiménez', 'Pablo Moreno', 'Carmen Díaz', 'Luis Romero']
    }
];

export const PROYECTOS_MOCK: Proyecto[] = [
    {
        id: 'p1',
        nombre: 'Radio Escolar: Voces del Futuro',
        descripcion: 'Creación de un programa de radio completo, desde el guion hasta la postproducción, abordando temas de actualidad escolar.',
        tipo: 'Radio/Podcast',
        estado: 'En curso',
        codigo_sala: 'RAD-2024',
        fases: [
            { id: 'f1', nombre: 'Investigación y Guion', estado: 'completado' },
            { id: 'f2', nombre: 'Grabación de Locuciones', estado: 'actual' },
            { id: 'f3', nombre: 'Edición y Montaje', estado: 'pendiente' },
            { id: 'f4', nombre: 'Difusión', estado: 'pendiente' }
        ],
        grupos: GRUPOS_MOCK
    },
    {
        id: 'p2',
        nombre: 'Canal Histórico en YouTube',
        descripcion: 'Producción de documentales cortos sobre la historia local para un canal de YouTube.',
        tipo: 'Video/YouTube',
        estado: 'En preparación',
        codigo_sala: 'YT-HIST',
        fases: [
            { id: 'f1', nombre: 'Investigación Documental', estado: 'actual' },
            { id: 'f2', nombre: 'Guion Técnico', estado: 'pendiente' },
            { id: 'f3', nombre: 'Rodaje', estado: 'pendiente' },
            { id: 'f4', nombre: 'Postproducción', estado: 'pendiente' }
        ],
        grupos: []
    },
    {
        id: 'p3',
        nombre: 'Huerto Ecológico Automatizado',
        descripcion: 'Diseño y construcción de un sistema de riego automático para el huerto escolar usando Arduino.',
        tipo: 'STEM/Robótica',
        estado: 'Finalizado',
        codigo_sala: 'ECO-BOT',
        fases: [
            { id: 'f1', nombre: 'Diseño del Circuito', estado: 'completado' },
            { id: 'f2', nombre: 'Programación', estado: 'completado' },
            { id: 'f3', nombre: 'Montaje Físico', estado: 'completado' },
            { id: 'f4', nombre: 'Pruebas', estado: 'completado' }
        ],
        grupos: []
    }
];
export const PASOS_TUTORIAL = [
    {
        id: 'bienvenida',
        titulo: '¡Bienvenido/a al Panel ABP + IA!',
        descripcion: 'Este es tu panel de control para gestionar proyectos de Aprendizaje Basado en Proyectos con IA como mentor. Te guiaré por las principales funciones.',
        posicion: 'center' as const
    },
    {
        id: 'navegacion',
        titulo: 'Menú de navegación',
        descripcion: 'Desde aquí puedes acceder a las diferentes secciones: resumen de clase, gestión de grupos, análisis de interacciones con la IA y sistema de evaluación.',
        targetSelector: 'aside nav',
        posicion: 'right' as const
    },
    {
        id: 'selector-clase',
        titulo: 'Selector de clase',
        descripcion: 'Selecciona la clase con la que estás trabajando. Puedes gestionar múltiples clases de forma independiente.',
        targetSelector: 'header select',
        posicion: 'bottom' as const
    },
    {
        id: 'crear-grupo',
        titulo: 'Crear grupos',
        descripcion: 'Comienza creando grupos de alumnos. Puedes organizarlos por departamentos según el tipo de proyecto que estés realizando.',
        posicion: 'center' as const
    },
    {
        id: 'ia-mentor',
        titulo: 'IA como mentor',
        descripcion: 'La IA está configurada para actuar como mentor del alumnado. Puede hacer preguntas socráticas para fomentar el pensamiento crítico, pero también dar respuestas directas cuando sea necesario.',
        posicion: 'center' as const
    },
    {
        id: 'trabajo-compartido',
        titulo: 'Trabajo Compartido',
        descripcion: 'Un espacio para que los diferentes grupos compartan recursos y colaboren entre departamentos.',
        targetSelector: '#nav-trabajo-compartido',
        posicion: 'right' as const
    },
    {
        id: 'evaluacion',
        titulo: 'Sistema de evaluación',
        descripcion: 'Utiliza las rúbricas detalladas para evaluar no solo el producto final, sino todo el proceso de aprendizaje y el uso crítico de la IA.',
        targetSelector: '#nav-evaluacion',
        posicion: 'right' as const
    }
];
