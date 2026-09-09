import { TemplateWeek } from '../types';

export const COURSE_INFO = {
  subject: 'Bioquímica',
  degree: 'Grado en Enfermería',
  groups: 'Grupos B y C',
  university: 'Universidad de Granada (UGR)',
  creditsPerGroup: 0.25,
  creditsGroupBTotal: 1.25, // 5 subgrupos x 0.25
  creditsGroupCTotal: 1.0,  // 4 subgrupos x 0.25
  creditsBothTotal: 2.25,
};

export const GROUP_CONFIG: Record<number, { letter: 'B' | 'C'; shift: 'mañana' | 'tarde'; dayOfWeek: 1 | 2 | 3 | 4 | 5; dayName: string; time: string }> = {
  7: { letter: 'B', shift: 'mañana', dayOfWeek: 1, dayName: 'Lunes', time: '8:30 - 11:00 h' },
  8: { letter: 'B', shift: 'mañana', dayOfWeek: 2, dayName: 'Martes', time: '8:30 - 11:00 h' },
  9: { letter: 'B', shift: 'mañana', dayOfWeek: 3, dayName: 'Miércoles', time: '8:30 - 11:00 h' },
  10: { letter: 'B', shift: 'mañana', dayOfWeek: 4, dayName: 'Jueves', time: '8:30 - 11:00 h' },
  6: { letter: 'B', shift: 'mañana', dayOfWeek: 5, dayName: 'Viernes', time: '8:30 - 11:00 h' },
  13: { letter: 'C', shift: 'tarde', dayOfWeek: 1, dayName: 'Lunes', time: '15:30 - 18:00 h' },
  12: { letter: 'C', shift: 'tarde', dayOfWeek: 2, dayName: 'Martes', time: '15:30 - 18:00 h' },
  11: { letter: 'C', shift: 'tarde', dayOfWeek: 3, dayName: 'Miércoles', time: '15:30 - 18:00 h' },
  14: { letter: 'C', shift: 'tarde', dayOfWeek: 4, dayName: 'Jueves', time: '15:30 - 18:00 h' },
};

export const PROFESSORS_LIST = [
  'Ana Ariza',
  'Carolina Torres',
  'Alicia Torres',
  'Sergio Martínez',
  'Francisco Hernández',
  'Raquel Sanabria',
];

export const PROFESSOR_EMAILS: Record<string, string> = {
  'Carolina Torres': 'ctp@ugr.es',
  'Francisco Hernández': 'fhtorres@ugr.es',
  'Sergio Martínez': 'sergio@ugr.es',
  'Ana Ariza': 'anacosano@ugr.es',
  'Raquel Sanabria': 'raquelsdlt@ugr.es',
  'Alicia Torres': 'alicia.torres@ugr.es',
};

export function getProfessorEmail(name: string): string {
  return PROFESSOR_EMAILS[name] || '';
}

export const TEMPLATE_WEEKS: TemplateWeek[] = [
  // Semana 1: Seminario 1 (28/09 - 02/10)
  {
    weekIndex: 1,
    weekOffsetFromStart: 0,
    activityCode: 'Seminario 1',
    activityType: 'seminario',
    title: 'Cálculos e Introducción al Laboratorio',
    room: 'Lab 2.21',
    morningHours: '8:30 - 11:00 h',
    afternoonHours: '15:30 - 18:00 h',
    summaryProfessors: 'Carolina Torres (Mañana), Ana Ariza (Tarde)',
    assignments: {
      morning: {
        1: { groupNumber: 7, professor: 'Carolina Torres' },
        2: { groupNumber: 8, professor: 'Carolina Torres' },
        3: { groupNumber: 9, professor: 'Carolina Torres' },
        4: { groupNumber: 10, professor: 'Carolina Torres' },
        5: { groupNumber: 6, professor: 'Carolina Torres' },
      },
      afternoon: {
        1: { groupNumber: 13, professor: 'Ana Ariza' },
        2: { groupNumber: 12, professor: 'Ana Ariza' },
        3: { groupNumber: 11, professor: 'Ana Ariza' },
        4: { groupNumber: 14, professor: 'Ana Ariza' },
      },
    },
  },

  // Semana 2: Práctica 1 (5 - 9 Octubre)
  {
    weekIndex: 2,
    weekOffsetFromStart: 1,
    activityCode: 'Práctica 1',
    activityType: 'practica',
    title: 'pH y Presión Osmótica',
    room: 'Lab 2.21',
    morningHours: '8:30 - 11:00 h',
    afternoonHours: '15:30 - 18:00 h',
    summaryProfessors: 'Raquel Sanabria (Lunes M), Alicia Torres (4 M), Ana Ariza (Tarde)',
    assignments: {
      morning: {
        1: { groupNumber: 7, professor: 'Raquel Sanabria' },
        2: { groupNumber: 8, professor: 'Alicia Torres' },
        3: { groupNumber: 9, professor: 'Alicia Torres' },
        4: { groupNumber: 10, professor: 'Alicia Torres' },
        5: { groupNumber: 6, professor: 'Alicia Torres' },
      },
      afternoon: {
        1: { groupNumber: 13, professor: 'Ana Ariza' },
        2: { groupNumber: 12, professor: 'Ana Ariza' },
        3: { groupNumber: 11, professor: 'Ana Ariza' },
        4: { groupNumber: 14, professor: 'Ana Ariza' },
      },
    },
  },

  // Semana 3: Sin prácticas (12 - 16 Octubre)
  {
    weekIndex: 3,
    weekOffsetFromStart: 2,
    activityCode: 'Semana sin prácticas',
    activityType: 'practica',
    title: 'Semana Festiva (Fiesta Nacional de España)',
    room: '-',
    morningHours: '-',
    afternoonHours: '-',
    isHolidayWeek: true,
    holidayReason: 'Semana del 12 de Octubre (Fiesta Nacional)',
    summaryProfessors: 'Sin docencia práctica',
    assignments: { morning: {}, afternoon: {} },
  },

  // Semana 4: Práctica 2 (19 - 23 Octubre)
  {
    weekIndex: 4,
    weekOffsetFromStart: 3,
    activityCode: 'Práctica 2',
    activityType: 'practica',
    title: 'Espectrofotometría',
    room: 'Lab 2.21',
    morningHours: '8:30 - 11:00 h',
    afternoonHours: '15:30 - 18:00 h',
    summaryProfessors: 'Sergio Martínez (Mañana y Tarde)',
    assignments: {
      morning: {
        1: { groupNumber: 7, professor: 'Sergio Martínez' },
        2: { groupNumber: 8, professor: 'Sergio Martínez' },
        3: { groupNumber: 9, professor: 'Sergio Martínez' },
        4: { groupNumber: 10, professor: 'Sergio Martínez' },
        5: { groupNumber: 6, professor: 'Sergio Martínez' },
      },
      afternoon: {
        1: { groupNumber: 13, professor: 'Sergio Martínez' },
        2: { groupNumber: 12, professor: 'Sergio Martínez' },
        3: { groupNumber: 11, professor: 'Sergio Martínez' },
        4: { groupNumber: 14, professor: 'Sergio Martínez' },
      },
    },
  },

  // Semana 5: Práctica 3 (26 - 30 Octubre)
  {
    weekIndex: 5,
    weekOffsetFromStart: 4,
    activityCode: 'Práctica 3',
    activityType: 'practica',
    title: 'Proteínas Sanguíneas (Proteinograma)',
    room: 'Lab 2.21',
    morningHours: '8:30 - 11:00 h',
    afternoonHours: '15:30 - 18:00 h',
    notes: 'Ana Ariza imparte 3 grupos (lunes tarde, martes mañana y martes tarde). Alicia Torres imparte 6 grupos.',
    summaryProfessors: 'Ana Ariza (3 grupos: Lunes T, Martes M y T), Alicia Torres (6 grupos)',
    assignments: {
      morning: {
        1: { groupNumber: 7, professor: 'Alicia Torres' },
        2: { groupNumber: 8, professor: 'Ana Ariza' },
        3: { groupNumber: 9, professor: 'Alicia Torres' },
        4: { groupNumber: 10, professor: 'Alicia Torres' },
        5: { groupNumber: 6, professor: 'Alicia Torres' },
      },
      afternoon: {
        1: { groupNumber: 13, professor: 'Ana Ariza' },
        2: { groupNumber: 12, professor: 'Ana Ariza' },
        3: { groupNumber: 11, professor: 'Alicia Torres' },
        4: { groupNumber: 14, professor: 'Alicia Torres' },
      },
    },
  },

  // Semana 6: Sin prácticas (2 - 6 Noviembre)
  {
    weekIndex: 6,
    weekOffsetFromStart: 5,
    activityCode: 'Semana sin prácticas',
    activityType: 'practica',
    title: 'Semana Festiva (Todos los Santos)',
    room: '-',
    morningHours: '-',
    afternoonHours: '-',
    isHolidayWeek: true,
    holidayReason: 'Semana festiva de inicio de Noviembre',
    summaryProfessors: 'Sin docencia práctica',
    assignments: { morning: {}, afternoon: {} },
  },

  // Semana 7: Práctica 4 (9 - 13 Noviembre)
  {
    weekIndex: 7,
    weekOffsetFromStart: 6,
    activityCode: 'Práctica 4',
    activityType: 'practica',
    title: 'Determinación de Glucemia. Perfil y Significación',
    room: 'Aula 2.15',
    morningHours: '8:30 - 11:00 h',
    afternoonHours: '15:30 - 18:00 h',
    summaryProfessors: 'Carolina Torres (Mañana), Ana Ariza (Tarde)',
    assignments: {
      morning: {
        1: { groupNumber: 7, professor: 'Carolina Torres' },
        2: { groupNumber: 8, professor: 'Carolina Torres' },
        3: { groupNumber: 9, professor: 'Carolina Torres' },
        4: { groupNumber: 10, professor: 'Carolina Torres' },
        5: { groupNumber: 6, professor: 'Carolina Torres' },
      },
      afternoon: {
        1: { groupNumber: 13, professor: 'Ana Ariza' },
        2: { groupNumber: 12, professor: 'Ana Ariza' },
        3: { groupNumber: 11, professor: 'Ana Ariza' },
        4: { groupNumber: 14, professor: 'Ana Ariza' },
      },
    },
  },

  // Semana 8: Seminario 2 (16 - 20 Noviembre)
  {
    weekIndex: 8,
    weekOffsetFromStart: 7,
    activityCode: 'Seminario 2',
    activityType: 'seminario',
    title: 'Adrenoleucodistrofia',
    room: 'Aula 2.15',
    morningHours: '8:30 - 11:00 h',
    afternoonHours: '15:30 - 18:00 h',
    summaryProfessors: 'Ana Ariza (Mañana y Tarde)',
    assignments: {
      morning: {
        1: { groupNumber: 7, professor: 'Ana Ariza' },
        2: { groupNumber: 8, professor: 'Ana Ariza' },
        3: { groupNumber: 9, professor: 'Ana Ariza' },
        4: { groupNumber: 10, professor: 'Ana Ariza' },
        5: { groupNumber: 6, professor: 'Ana Ariza' },
      },
      afternoon: {
        1: { groupNumber: 13, professor: 'Ana Ariza' },
        2: { groupNumber: 12, professor: 'Ana Ariza' },
        3: { groupNumber: 11, professor: 'Ana Ariza' },
        4: { groupNumber: 14, professor: 'Ana Ariza' },
      },
    },
  },

  // Semana 9: Práctica 5 (23 - 27 Noviembre)
  {
    weekIndex: 9,
    weekOffsetFromStart: 8,
    activityCode: 'Práctica 5',
    activityType: 'practica',
    title: 'Determinación de Perfil Lipídico. Significación',
    room: 'Lab 2.21',
    morningHours: '8:30 - 11:00 h',
    afternoonHours: '15:30 - 18:00 h',
    summaryProfessors: 'Francisco Hernández (5 grupos: Lunes M y todas las tardes), Ana Ariza (4 grupos)',
    assignments: {
      morning: {
        1: { groupNumber: 7, professor: 'Francisco Hernández' },
        2: { groupNumber: 8, professor: 'Ana Ariza' },
        3: { groupNumber: 9, professor: 'Ana Ariza' },
        4: { groupNumber: 10, professor: 'Ana Ariza' },
        5: { groupNumber: 6, professor: 'Ana Ariza' },
      },
      afternoon: {
        1: { groupNumber: 13, professor: 'Francisco Hernández' },
        2: { groupNumber: 12, professor: 'Francisco Hernández' },
        3: { groupNumber: 11, professor: 'Francisco Hernández' },
        4: { groupNumber: 14, professor: 'Francisco Hernández' },
      },
    },
  },

  // Semana 10: Seminario 3 (30 Noviembre - 4 Diciembre)
  {
    weekIndex: 10,
    weekOffsetFromStart: 9,
    activityCode: 'Seminario 3',
    activityType: 'seminario',
    title: 'Nutrición y Nutrientes',
    room: 'Aula 2.15',
    morningHours: '8:30 - 11:00 h',
    afternoonHours: '15:30 - 18:00 h',
    summaryProfessors: 'Ana Ariza (Mañana y Tarde)',
    assignments: {
      morning: {
        1: { groupNumber: 7, professor: 'Ana Ariza' },
        2: { groupNumber: 8, professor: 'Ana Ariza' },
        3: { groupNumber: 9, professor: 'Ana Ariza' },
        4: { groupNumber: 10, professor: 'Ana Ariza' },
        5: { groupNumber: 6, professor: 'Ana Ariza' },
      },
      afternoon: {
        1: { groupNumber: 13, professor: 'Ana Ariza' },
        2: { groupNumber: 12, professor: 'Ana Ariza' },
        3: { groupNumber: 11, professor: 'Ana Ariza' },
        4: { groupNumber: 14, professor: 'Ana Ariza' },
      },
    },
  },

  // Semana 11: Sin prácticas (7 - 11 Diciembre)
  {
    weekIndex: 11,
    weekOffsetFromStart: 10,
    activityCode: 'Semana sin prácticas',
    activityType: 'practica',
    title: 'Semana Festiva (Puente de la Constitución e Inmaculada)',
    room: '-',
    morningHours: '-',
    afternoonHours: '-',
    isHolidayWeek: true,
    holidayReason: 'Festivos nacionales de la Constitución e Inmaculada',
    summaryProfessors: 'Sin docencia práctica',
    assignments: { morning: {}, afternoon: {} },
  },

  // Semana 12: Sin prácticas (14 - 18 Diciembre)
  {
    weekIndex: 12,
    weekOffsetFromStart: 11,
    activityCode: 'Semana sin prácticas',
    activityType: 'practica',
    title: 'Cierre del Cuatrimestre',
    room: '-',
    morningHours: '-',
    afternoonHours: '-',
    isHolidayWeek: true,
    holidayReason: 'Sin sesiones de laboratorio programadas',
    summaryProfessors: 'Sin docencia práctica',
    assignments: { morning: {}, afternoon: {} },
  },
];
