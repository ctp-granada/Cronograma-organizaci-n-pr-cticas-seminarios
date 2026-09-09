export type ShiftType = 'mañana' | 'tarde';

export type ActivityType = 'seminario' | 'practica';

export interface GroupAssignment {
  groupNumber: number; // e.g. 7, 8, 9, 10, 6, 13, 12, 11, 14
  groupLetter: 'B' | 'C';
  dayOfWeek: 1 | 2 | 3 | 4 | 5; // 1 = Lunes, 5 = Viernes
  shift: ShiftType;
  timeRange: string; // e.g. "8:30 - 11:00 h" or "15:30 - 18:00 h"
  professor: string;
  room: string; // "Lab 2.21" or "Aula 2.15"
}

export interface TemplateWeek {
  weekIndex: number; // 0 = Semana 1 (Seminario 1), 1 = Semana 2 (Práctica 1), etc.
  weekOffsetFromStart: number; // number of weeks from semester start Monday (0, 1, 3, 4, 6, 7, 8, 9)
  activityCode: string; // "Seminario 1", "Práctica 1", "Seminario 2", etc.
  activityType: ActivityType;
  title: string; // "Cálculos e introducción al laboratorio", "pH / presión osmótica", etc.
  room: string; // "Lab 2.21" or "Aula 2.15"
  morningHours: string;
  afternoonHours: string;
  isHolidayWeek?: boolean;
  holidayReason?: string;
  notes?: string;
  // Day-by-day group assignments (1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes)
  assignments: {
    morning: {
      [day: number]: { groupNumber: number; professor: string };
    };
    afternoon: {
      [day: number]: { groupNumber: number; professor: string };
    };
  };
  summaryProfessors: string;
}

export interface ComputedSession {
  id: string;
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayName: string; // "Lunes", "Martes", etc.
  dayNumber: number;
  monthName: string; // "Octubre", etc.
  monthIndex: number; // 0-11
  year: number;
  weekIndex: number;
  weekNumberYear: number;
  activityCode: string;
  activityType: ActivityType;
  title: string;
  room: string;
  shift: ShiftType;
  timeRange: string;
  startTime: string; // "08:30"
  endTime: string; // "11:00"
  groupNumber: number;
  groupLetter: 'B' | 'C';
  professor: string;
  professorEmail: string;
  credits: number;
}

export interface AcademicYearConfig {
  label: string; // e.g. "2025 - 2026"
  startMondayDate: string; // YYYY-MM-DD of the first Monday of the semester
}

export interface FilterState {
  searchQuery: string;
  selectedProfessor: string; // "" = todos
  selectedGroup: string; // "" = todos, or "6", "7", etc., or "B", "C"
  selectedShift: string; // "" = todos, "mañana", "tarde"
  selectedActivityType: string; // "" = todos, "seminario", "practica"
  selectedRoom: string; // "" = todos
}

export interface CoordinatorConfig {
  professorsList: string[];
  professorEmails: Record<string, string>;
  templateWeeks: TemplateWeek[];
  lastModified?: string;
  modifiedBy?: string;
}
