export interface TheoryTopicItem {
  code: string; // e.g. "Tema 1", "Tema 3", "Temas 12-13"
  title: string; // e.g. "Introducción a la Bioquímica. Química del C y grupos funcionales"
  description?: string;
}

export interface TheoryWeekDefinition {
  weekNumber: number; // 1 to 14
  weekOffsetFromPracticeStart: number; // Offset from startMonday of practicals (e.g. -2 for week 1, 0 for week 3)
  monthNameShort: string; // "Sep.", "Oct.", "Nov.", "Dic."
  practicalActivity?: {
    code: string; // e.g. "SEMINARIO 1", "PRÁCTICA 1"
    title: string; // e.g. "Cálculos e Introducción al lab", "pH"
    type: 'seminario' | 'practica';
  };
  topics: TheoryTopicItem[];
  notes?: string;
}

export interface ComputedTheoryWeek extends TheoryWeekDefinition {
  mondayDate: Date;
  fridayDate: Date;
  dateRangeLabel: string; // e.g. "15-19", "29-3 oct", "14-18"
  fullDateRange: string; // e.g. "14 al 18 de Septiembre de 2026"
  monthGroupLabel: string; // e.g. "Sep. 2026"
  isCurrentWeek?: boolean;
}

export const THEORY_WEEKS_DEFINITION: TheoryWeekDefinition[] = [
  // --- SEPTIEMBRE ---
  {
    weekNumber: 1,
    weekOffsetFromPracticeStart: -2,
    monthNameShort: 'Sep.',
    topics: [
      {
        code: 'Tema 1',
        title: 'Introducción a la Bioquímica. Química del C y grupos funcionales',
        description: 'Fundamentos químicos de la vida, enlaces de carbono, bioelementos y biomoléculas principales.',
      },
      {
        code: 'Tema 3',
        title: 'El agua',
        description: 'Estructura molecular, propiedades fisicoquímicas, puentes de hidrógeno y relevancia biológica.',
      },
    ],
  },
  {
    weekNumber: 2,
    weekOffsetFromPracticeStart: -1,
    monthNameShort: 'Sep.',
    topics: [
      {
        code: 'Tema 4',
        title: 'Hidratos de Carbono',
        description: 'Monosacáridos, disacáridos y polisacáridos. Enlace glucosídico y funciones energéticas y estructurales.',
      },
    ],
  },
  {
    weekNumber: 3,
    weekOffsetFromPracticeStart: 0,
    monthNameShort: 'Sep.',
    practicalActivity: {
      code: 'SEMINARIO 1',
      title: 'Cálculos e Introducción al lab',
      type: 'seminario',
    },
    topics: [
      {
        code: 'Tema 5',
        title: 'Lípidos',
        description: 'Ácidos grasos, triglicéridos, fosfolípidos, colesterol y bicapas lipídicas en membranas biológicas.',
      },
    ],
  },

  // --- OCTUBRE ---
  {
    weekNumber: 4,
    weekOffsetFromPracticeStart: 1,
    monthNameShort: 'Oct.',
    practicalActivity: {
      code: 'PRÁCTICA 1',
      title: 'pH',
      type: 'practica',
    },
    topics: [
      {
        code: 'Tema 6',
        title: 'Nucleótidos y ácidos nucleicos',
        description: 'Estructura del ADN y ARN, bases nitrogenadas, enlaces fosfodiéster y flujo de información genética.',
      },
    ],
  },
  {
    weekNumber: 5,
    weekOffsetFromPracticeStart: 2,
    monthNameShort: 'Oct.',
    topics: [
      {
        code: 'Tema 7',
        title: 'Proteínas',
        description: 'Aminoácidos, enlace peptídico, niveles de estructura (primaria, secundaria, terciaria y cuaternaria).',
      },
    ],
  },
  {
    weekNumber: 6,
    weekOffsetFromPracticeStart: 3,
    monthNameShort: 'Oct.',
    practicalActivity: {
      code: 'PRÁCTICA 2',
      title: 'Espectrofotometría',
      type: 'practica',
    },
    topics: [
      {
        code: 'Tema 7',
        title: 'Proteínas (Continuación)',
        description: 'Relación estructura-función en proteínas globulares y fibrosas, desnaturalización y plegamiento.',
      },
    ],
  },
  {
    weekNumber: 7,
    weekOffsetFromPracticeStart: 4,
    monthNameShort: 'Oct.',
    practicalActivity: {
      code: 'PRÁCTICA 3',
      title: 'Proteínas sanguíneas',
      type: 'practica',
    },
    topics: [
      {
        code: 'Tema 8',
        title: 'Enzimas',
        description: 'Catálisis enzimática, cinética michaeliana, factores que afectan la actividad y cofactores/coenzimas.',
      },
    ],
  },

  // --- NOVIEMBRE ---
  {
    weekNumber: 8,
    weekOffsetFromPracticeStart: 5,
    monthNameShort: 'Nov.',
    practicalActivity: {
      code: 'SEMINARIO 2',
      title: 'El aceite de Lorenzo',
      type: 'seminario',
    },
    topics: [
      {
        code: 'Tema 8',
        title: 'Enzimas (Continuación)',
        description: 'Inhibición enzimática (competitiva, no competitiva), regulación alostérica e isoenzimas de interés clínico.',
      },
    ],
  },
  {
    weekNumber: 9,
    weekOffsetFromPracticeStart: 6,
    monthNameShort: 'Nov.',
    topics: [
      {
        code: 'Tema 9',
        title: 'Señalización celular',
        description: 'Receptores de membrana, transducción de señales, segundos mensajeros (AMPc, Ca2+) e integración hormonal.',
      },
    ],
  },
  {
    weekNumber: 10,
    weekOffsetFromPracticeStart: 7,
    monthNameShort: 'Nov.',
    practicalActivity: {
      code: 'PRÁCTICA 4',
      title: 'Glucemia',
      type: 'practica',
    },
    topics: [
      {
        code: 'Tema 10',
        title: 'Bioenergética e introducción al metabolismo',
        description: 'Leyes de la termodinámica en sistemas vivos, compuestos ricos en energía (ATP) y panorama metabólico.',
      },
    ],
  },
  {
    weekNumber: 11,
    weekOffsetFromPracticeStart: 8,
    monthNameShort: 'Nov.',
    practicalActivity: {
      code: 'PRÁCTICA 5',
      title: 'Perfil Lipídico',
      type: 'practica',
    },
    topics: [
      {
        code: 'Tema 11',
        title: 'Metabolismo H d C',
        description: 'Glucólisis, fermentación, destino del piruvato y regulación de la vía glucolítica en el músculo y el hígado.',
      },
    ],
  },

  // --- DICIEMBRE ---
  {
    weekNumber: 12,
    weekOffsetFromPracticeStart: 9,
    monthNameShort: 'Dic.',
    practicalActivity: {
      code: 'SEMINARIO 3',
      title: 'Errores del metabolismo',
      type: 'seminario',
    },
    topics: [
      {
        code: 'Tema 11',
        title: 'Metabolismo H d C (Continuación)',
        description: 'Gluconeogénesis, metabolismo del glucógeno (glucogenólisis y glucogenogénesis) y vía de pentosas fosfato.',
      },
      {
        code: 'Temas 12-13',
        title: 'Ciclo de Krebs y cadena de transporte electrónico',
        description: 'Complejo piruvato deshidrogenasa, ciclo del ácido cítrico, fosforilación oxidativa y síntesis mitocondrial de ATP.',
      },
    ],
  },
  {
    weekNumber: 13,
    weekOffsetFromPracticeStart: 10,
    monthNameShort: 'Dic.',
    topics: [
      {
        code: 'Tema 14',
        title: 'Catabolismo de lípidos',
        description: 'Movilización de triacilgliceroles, beta-oxidación de ácidos grasos y formación de cuerpos cetónicos.',
      },
    ],
  },
  {
    weekNumber: 14,
    weekOffsetFromPracticeStart: 11,
    monthNameShort: 'Dic.',
    topics: [
      {
        code: 'Tema 15',
        title: 'Biosíntesis de ácidos grasos',
        description: 'Complejo ácido graso sintasa, síntesis de novo de palmitato y regulación por insulina y glucagón.',
      },
      {
        code: 'Tema 16',
        title: 'Biosíntesis de PL y TG',
        description: 'Rutas biosintéticas de fosfolípidos y triglicéridos, transporte de lipoproteínas plasmáticas.',
      },
    ],
  },
];

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_SHORT_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

/**
 * Computes exact dates for all theory weeks dynamically for any academic year.
 * @param startMonday Date of the first Monday of practicals / Seminario 1 (Week 3 of theory)
 * @param academicYear The starting year of the academic course (e.g. 2025, 2026, 2027)
 */
export function computeTheorySchedule(startMonday: Date, academicYear: number): ComputedTheoryWeek[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return THEORY_WEEKS_DEFINITION.map((def) => {
    // Calculate Monday
    const monday = new Date(startMonday);
    monday.setDate(monday.getDate() + def.weekOffsetFromPracticeStart * 7);
    monday.setHours(0, 0, 0, 0);

    // Calculate Friday
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    const mDay = monday.getDate();
    const mMonth = monday.getMonth();
    const fDay = friday.getDate();
    const fMonth = friday.getMonth();

    // Create date range string (e.g. "15-19", "29 Sep - 3 Oct", etc.)
    let dateRangeLabel = '';
    if (mMonth === fMonth) {
      dateRangeLabel = `${mDay}-${fDay}`;
    } else {
      dateRangeLabel = `${mDay} ${MONTH_SHORT_ES[mMonth].toLowerCase()} - ${fDay} ${MONTH_SHORT_ES[fMonth].toLowerCase()}`;
    }

    const fullDateRange = mMonth === fMonth
      ? `${mDay} al ${fDay} de ${MONTH_NAMES_ES[mMonth]} de ${monday.getFullYear()}`
      : `${mDay} de ${MONTH_NAMES_ES[mMonth]} al ${fDay} de ${MONTH_NAMES_ES[fMonth]} de ${friday.getFullYear()}`;

    // Month group label (using the month of the Thursday/middle of week)
    const midWeek = new Date(monday);
    midWeek.setDate(midWeek.getDate() + 2);
    const midMonthName = MONTH_SHORT_ES[midWeek.getMonth()];
    const monthGroupLabel = `${midMonthName}. ${midWeek.getFullYear()}`;

    const isCurrentWeek = now >= monday && now <= friday;

    return {
      ...def,
      mondayDate: monday,
      fridayDate: friday,
      dateRangeLabel,
      fullDateRange,
      monthGroupLabel,
      isCurrentWeek,
    };
  });
}
