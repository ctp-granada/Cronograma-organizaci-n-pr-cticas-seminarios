import { TEMPLATE_WEEKS, GROUP_CONFIG, COURSE_INFO, getProfessorEmail } from '../data/curriculumData';
import { ComputedSession, AcademicYearConfig, TemplateWeek } from '../types';

/**
 * Calculates the last Monday of September for a given year.
 */
export function getDefaultStartMonday(year: number): Date {
  // Sept 30 is the last day of September (month 8, 0-indexed)
  const lastDaySept = new Date(year, 8, 30);
  const dayOfWeek = lastDaySept.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  // Number of days to subtract to get back to Monday
  const diff = (dayOfWeek + 6) % 7;
  const startMonday = new Date(year, 8, 30 - diff);
  startMonday.setHours(0, 0, 0, 0);
  return startMonday;
}

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatSpanishDate(date: Date, includeYear = false): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  };
  if (includeYear) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString('es-ES', options);
}

export function formatWeekRange(startMonday: Date, weekOffset: number): string {
  const monday = new Date(startMonday);
  monday.setDate(monday.getDate() + weekOffset * 7);

  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);

  const formatDayMonth = (d: Date) => {
    const day = d.getDate();
    const month = d.getMonth() + 1;
    return `${day}/${month < 10 ? '0' + month : month}`;
  };

  return `${formatDayMonth(monday)} - ${formatDayMonth(friday)}`;
}

/**
 * Computes all individual practice/seminar sessions based on the academic year config.
 */
export function computeAllSessions(
  startMonday: Date,
  customTemplateWeeks?: TemplateWeek[],
  customProfessorEmails?: Record<string, string>
): ComputedSession[] {
  const sessions: ComputedSession[] = [];
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const weeksToUse = customTemplateWeeks || TEMPLATE_WEEKS;

  const resolveEmail = (profName: string) => {
    if (customProfessorEmails && customProfessorEmails[profName]) {
      return customProfessorEmails[profName];
    }
    return getProfessorEmail(profName);
  };

  weeksToUse.forEach((templateWeek) => {
    if (templateWeek.isHolidayWeek) return;

    const weekMonday = new Date(startMonday);
    weekMonday.setDate(weekMonday.getDate() + templateWeek.weekOffsetFromStart * 7);

    // Morning sessions (days 1 to 5)
    for (let day = 1; day <= 5; day++) {
      const assignment = templateWeek.assignments.morning[day];
      if (assignment) {
        const sessionDate = new Date(weekMonday);
        sessionDate.setDate(sessionDate.getDate() + (day - 1));
        const groupInfo = GROUP_CONFIG[assignment.groupNumber];

        sessions.push({
          id: `w${templateWeek.weekIndex}-m-d${day}-g${assignment.groupNumber}`,
          date: sessionDate,
          dateStr: formatDateToISO(sessionDate),
          dayName: dayNames[day - 1],
          dayNumber: sessionDate.getDate(),
          monthName: sessionDate.toLocaleDateString('es-ES', { month: 'long' }),
          monthIndex: sessionDate.getMonth(),
          year: sessionDate.getFullYear(),
          weekIndex: templateWeek.weekIndex,
          weekNumberYear: getISOWeek(sessionDate),
          activityCode: templateWeek.activityCode,
          activityType: templateWeek.activityType,
          title: templateWeek.title,
          room: templateWeek.room,
          shift: 'mañana',
          timeRange: '8:30 - 11:00 h',
          startTime: '08:30',
          endTime: '11:00',
          groupNumber: assignment.groupNumber,
          groupLetter: groupInfo?.letter || 'B',
          professor: assignment.professor,
          professorEmail: resolveEmail(assignment.professor),
          credits: COURSE_INFO.creditsPerGroup,
        });
      }
    }

    // Afternoon sessions (days 1 to 4)
    for (let day = 1; day <= 4; day++) {
      const assignment = templateWeek.assignments.afternoon[day];
      if (assignment) {
        const sessionDate = new Date(weekMonday);
        sessionDate.setDate(sessionDate.getDate() + (day - 1));
        const groupInfo = GROUP_CONFIG[assignment.groupNumber];

        sessions.push({
          id: `w${templateWeek.weekIndex}-a-d${day}-g${assignment.groupNumber}`,
          date: sessionDate,
          dateStr: formatDateToISO(sessionDate),
          dayName: dayNames[day - 1],
          dayNumber: sessionDate.getDate(),
          monthName: sessionDate.toLocaleDateString('es-ES', { month: 'long' }),
          monthIndex: sessionDate.getMonth(),
          year: sessionDate.getFullYear(),
          weekIndex: templateWeek.weekIndex,
          weekNumberYear: getISOWeek(sessionDate),
          activityCode: templateWeek.activityCode,
          activityType: templateWeek.activityType,
          title: templateWeek.title,
          room: templateWeek.room,
          shift: 'tarde',
          timeRange: '15:30 - 18:00 h',
          startTime: '15:30',
          endTime: '18:00',
          groupNumber: assignment.groupNumber,
          groupLetter: groupInfo?.letter || 'C',
          professor: assignment.professor,
          professorEmail: resolveEmail(assignment.professor),
          credits: COURSE_INFO.creditsPerGroup,
        });
      }
    }
  });

  return sessions.sort((a, b) => a.date.getTime() - b.date.getTime() || (a.shift === 'mañana' ? -1 : 1));
}

export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Generates month calendar matrix (weeks and days) for a given month and year.
 * By default includeWeekends is false (Lunes a Viernes, 5 columnas), making the calendar
 * much wider and focused purely on teaching weekdays.
 */
export function getMonthDaysGrid(year: number, monthIndex: number, includeWeekends = false) {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: Array<{
    date: Date;
    dateStr: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isWeekend: boolean;
  }> = [];

  if (includeWeekends) {
    // 7-day grid: Day of week: 0 = Sun, 1 = Mon ... 6 = Sat
    let firstDayWeekday = firstDayOfMonth.getDay();
    firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1; // 0 is Monday, 6 is Sunday

    const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const prevDate = new Date(year, monthIndex - 1, prevMonthLastDay - i);
      calendarDays.push({
        date: prevDate,
        dateStr: formatDateToISO(prevDate),
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currDate = new Date(year, monthIndex, i);
      calendarDays.push({
        date: currDate,
        dateStr: formatDateToISO(currDate),
        dayNumber: i,
        isCurrentMonth: true,
        isWeekend: currDate.getDay() === 0 || currDate.getDay() === 6,
      });
    }

    const remaining = (7 - (calendarDays.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, monthIndex + 1, i);
      calendarDays.push({
        date: nextDate,
        dateStr: formatDateToISO(nextDate),
        dayNumber: i,
        isCurrentMonth: false,
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
      });
    }

    return calendarDays;
  }

  // 5-day grid (Lunes a Viernes: 5 columnas)
  // Determine how many leading workdays (Lunes=0, Martes=1, Miercoles=2, Jueves=3, Viernes=4)
  const firstDow = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  let leadingWorkdaysCount = 0;
  if (firstDow === 1) leadingWorkdaysCount = 0; // Monday
  else if (firstDow === 2) leadingWorkdaysCount = 1; // Tuesday
  else if (firstDow === 3) leadingWorkdaysCount = 2; // Wednesday
  else if (firstDow === 4) leadingWorkdaysCount = 3; // Thursday
  else if (firstDow === 5) leadingWorkdaysCount = 4; // Friday
  else if (firstDow === 6 || firstDow === 0) leadingWorkdaysCount = 0; // Month starts on weekend, working starts Monday

  // Add leading workdays from previous month
  if (leadingWorkdaysCount > 0) {
    const prevMonthWorkingDays: Date[] = [];
    let d = new Date(year, monthIndex, 0); // Last day of previous month
    while (prevMonthWorkingDays.length < leadingWorkdaysCount) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) {
        prevMonthWorkingDays.unshift(new Date(d));
      }
      d.setDate(d.getDate() - 1);
    }
    prevMonthWorkingDays.forEach((prevDate) => {
      calendarDays.push({
        date: prevDate,
        dateStr: formatDateToISO(prevDate),
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        isWeekend: false,
      });
    });
  }

  // Add current month weekdays (exclude Saturday and Sunday)
  for (let i = 1; i <= daysInMonth; i++) {
    const currDate = new Date(year, monthIndex, i);
    const dow = currDate.getDay();
    if (dow !== 0 && dow !== 6) {
      calendarDays.push({
        date: currDate,
        dateStr: formatDateToISO(currDate),
        dayNumber: i,
        isCurrentMonth: true,
        isWeekend: false,
      });
    }
  }

  // Add trailing workdays from next month until a multiple of 5
  const remainder = (5 - (calendarDays.length % 5)) % 5;
  if (remainder > 0) {
    let nextDate = new Date(year, monthIndex + 1, 1);
    while (calendarDays.length % 5 !== 0) {
      const dow = nextDate.getDay();
      if (dow !== 0 && dow !== 6) {
        calendarDays.push({
          date: new Date(nextDate),
          dateStr: formatDateToISO(nextDate),
          dayNumber: nextDate.getDate(),
          isCurrentMonth: false,
          isWeekend: false,
        });
      }
      nextDate.setDate(nextDate.getDate() + 1);
    }
  }

  return calendarDays;
}

/**
 * Generates an iCalendar (.ics) export string for all computed sessions.
 */
export function generateICS(sessions: ComputedSession[], academicYear: string): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  const formatICSDate = (d: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const dateObj = new Date(d);
    dateObj.setHours(hours, minutes, 0, 0);

    const y = dateObj.getFullYear();
    const m = pad(dateObj.getMonth() + 1);
    const day = pad(dateObj.getDate());
    const hh = pad(dateObj.getHours());
    const mm = pad(dateObj.getMinutes());
    const ss = '00';
    return `${y}${m}${day}T${hh}${mm}${ss}`;
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UGR//Calendario Bioquimica Enfermeria//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Bioquímica Enfermería (${academicYear})`,
    'X-WR-TIMEZONE:Europe/Madrid',
  ];

  sessions.forEach((s) => {
    const dtStart = formatICSDate(s.date, s.startTime);
    const dtEnd = formatICSDate(s.date, s.endTime);
    const summary = `${s.activityCode} Bioquímica (Grupo ${s.groupNumber})`;
    const emailInfo = s.professorEmail ? ` (${s.professorEmail})` : '';
    const description = `Actividad: ${s.activityCode}\\nTema: ${s.title}\\nGrupo: ${s.groupNumber} (Grupo ${s.groupLetter})\\nProfesor/a: ${s.professor}${emailInfo}\\nUbicación: ${s.room}\\nHorario: ${s.timeRange}`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:bioquimica-${s.id}-${dtStart}@ugr.es`);
    lines.push(`DTSTAMP:${formatICSDate(new Date(), '00:00')}Z`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push(`LOCATION:${s.room}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Computes teaching distribution breakdown by professor.
 */
export function computeProfessorTeachingStats(sessions: ComputedSession[]) {
  const stats: Record<string, {
    totalSessions: number;
    morningSessions: number;
    afternoonSessions: number;
    totalHours: number;
    credits: number;
    groups: Set<number>;
    activities: Set<string>;
  }> = {};

  sessions.forEach((s) => {
    if (!stats[s.professor]) {
      stats[s.professor] = {
        totalSessions: 0,
        morningSessions: 0,
        afternoonSessions: 0,
        totalHours: 0,
        credits: 0,
        groups: new Set<number>(),
        activities: new Set<string>(),
      };
    }
    stats[s.professor].totalSessions += 1;
    if (s.shift === 'mañana') {
      stats[s.professor].morningSessions += 1;
    } else {
      stats[s.professor].afternoonSessions += 1;
    }
    stats[s.professor].totalHours += 2.5; // 8:30-11:00 or 15:30-18:00 is 2.5 hours
    stats[s.professor].credits += s.credits;
    stats[s.professor].groups.add(s.groupNumber);
    stats[s.professor].activities.add(s.activityCode);
  });

  return Object.entries(stats).map(([professor, data]) => ({
    professor,
    email: getProfessorEmail(professor),
    totalSessions: data.totalSessions,
    morningSessions: data.morningSessions,
    afternoonSessions: data.afternoonSessions,
    totalHours: data.totalHours,
    credits: Number(data.credits.toFixed(3)),
    groupsList: Array.from(data.groups).sort((a, b) => a - b),
    activitiesList: Array.from(data.activities),
  })).sort((a, b) => b.totalSessions - a.totalSessions);
}
