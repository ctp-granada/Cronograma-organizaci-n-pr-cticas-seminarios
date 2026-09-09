import React from 'react';
import { TEMPLATE_WEEKS, getProfessorEmail } from '../data/curriculumData';
import { formatWeekRange } from '../utils/perpetualDateUtils';
import { ComputedSession, FilterState, TemplateWeek } from '../types';
import { Clock, MapPin, User, Calendar, ExternalLink, Mail } from 'lucide-react';

interface MatrixTableViewProps {
  startMonday: Date;
  academicYear: number;
  filters: FilterState;
  onSelectSessionById: (sessionId: string) => void;
  computedSessions: ComputedSession[];
  templateWeeks?: TemplateWeek[];
}

export const MatrixTableView: React.FC<MatrixTableViewProps> = ({
  startMonday,
  academicYear,
  filters,
  onSelectSessionById,
  computedSessions,
  templateWeeks = TEMPLATE_WEEKS,
}) => {
  // Map sessions for fast lookup: key = `w${weekIndex}-${shift}-${day}`
  const sessionsMap: Record<string, ComputedSession> = {};
  computedSessions.forEach((s) => {
    // Find matching template day
    const dayMap: Record<string, number> = {
      'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5
    };
    const day = dayMap[s.dayName];
    const key = `w${s.weekIndex}-${s.shift}-${day}`;
    sessionsMap[key] = s;
  });

  // Group weeks by month section (Octubre, Noviembre, Diciembre) like in the official PDF
  const sections = [
    {
      monthName: 'Octubre',
      colorClass: 'bg-emerald-700 text-white',
      weekIndices: [1, 2, 3, 4, 5],
    },
    {
      monthName: 'Noviembre',
      colorClass: 'bg-emerald-800 text-white',
      weekIndices: [6, 7, 8, 9],
    },
    {
      monthName: 'Diciembre',
      colorClass: 'bg-emerald-900 text-white',
      weekIndices: [10, 11, 12],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* View Header Info */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
            <span>Cronograma Oficial de la Asignatura</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Estructura completa de semanas, subgrupos, aulas y profesorado para el curso {academicYear} - {academicYear + 1}.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
          Curso {academicYear} - {academicYear + 1}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
          
          {/* Main Table Headers */}
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
              <th className="p-2.5 border-r border-slate-200 w-24 text-center">Fechas</th>
              <th className="p-2.5 border-r border-slate-200 w-24 text-center">Actividad</th>
              <th className="p-2.5 border-r border-slate-200 w-24 text-center">Horario</th>
              <th className="p-2.5 border-r border-slate-200 text-center">Lunes</th>
              <th className="p-2.5 border-r border-slate-200 text-center">Martes</th>
              <th className="p-2.5 border-r border-slate-200 text-center">Miércoles</th>
              <th className="p-2.5 border-r border-slate-200 text-center">Jueves</th>
              <th className="p-2.5 border-r border-slate-200 text-center">Viernes</th>
              <th className="p-2.5 border-r border-slate-200 w-44">Contenido / Descripción</th>
              <th className="p-2.5 border-r border-slate-200 w-20 text-center">Ubicación</th>
              <th className="p-2.5 w-40">Profesor Resumen</th>
            </tr>
          </thead>

          <tbody>
            {sections.map((sec) => (
              <React.Fragment key={sec.monthName}>
                
                {/* Month Separator Banner */}
                <tr className={`${sec.colorClass} font-bold text-center`}>
                  <td colSpan={11} className="py-2 tracking-wider uppercase text-xs font-['Outfit']">
                    {sec.monthName} ({academicYear})
                  </td>
                </tr>

                {sec.weekIndices.map((weekIdx) => {
                  const week = templateWeeks.find((w) => w.weekIndex === weekIdx);
                  if (!week) return null;

                  const dateRange = formatWeekRange(startMonday, week.weekOffsetFromStart);

                  // Holiday / empty weeks
                  if (week.isHolidayWeek) {
                    return (
                      <tr key={week.weekIndex} className="bg-slate-50/70 border-b border-slate-200 text-slate-500">
                        <td className="p-2.5 text-center font-bold text-slate-700 border-r border-slate-200">
                          {dateRange}
                        </td>
                        <td colSpan={10} className="p-2.5 text-center italic text-slate-500 font-medium">
                          {week.holidayReason || 'Semana sin docencia práctica programada'}
                        </td>
                      </tr>
                    );
                  }

                  // Standard Active Week (Has Morning and Afternoon shifts)
                  return (
                    <React.Fragment key={week.weekIndex}>
                      
                      {/* Morning Shift Row */}
                      <tr className="border-t border-slate-200 bg-white hover:bg-emerald-50/20 transition-colors">
                        {/* Date range cell spanning 2 rows */}
                        <td
                          rowSpan={2}
                          className="p-2.5 text-center font-bold text-slate-800 border-r border-slate-200 align-middle bg-slate-50/60"
                        >
                          <span className="block text-slate-900">{dateRange}</span>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            Semana {week.weekIndex}
                          </span>
                        </td>

                        {/* Activity Name spanning 2 rows */}
                        <td
                          rowSpan={2}
                          className="p-2.5 text-center font-bold text-slate-900 border-r border-slate-200 align-middle"
                        >
                          <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${
                            week.activityType === 'seminario'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {week.activityCode}
                          </span>
                        </td>

                        {/* Morning Hours */}
                        <td className="p-2 text-center border-r border-slate-200 bg-emerald-50/30 font-semibold text-emerald-900">
                          8.30-11h
                        </td>

                        {/* Morning Days: Lunes (1) to Viernes (5) */}
                        {[1, 2, 3, 4, 5].map((d) => {
                          const assignment = week.assignments.morning[d];
                          const sessionKey = `w${week.weekIndex}-mañana-${d}`;
                          const session = sessionsMap[sessionKey];

                          if (!assignment) {
                            return (
                              <td key={d} className="p-2 text-center border-r border-slate-200 text-slate-300">
                                -
                              </td>
                            );
                          }

                          const profEmail = getProfessorEmail(assignment.professor);

                          return (
                            <td
                              key={d}
                              onClick={() => session && onSelectSessionById(session.id)}
                              className="p-2 border-r border-slate-200 cursor-pointer hover:bg-emerald-100/50 transition-colors"
                              title="Haz clic para ver detalles de la sesión"
                            >
                              <div className="font-bold text-slate-900">
                                Grupo {assignment.groupNumber}
                              </div>
                              <div className="flex items-center justify-between gap-1 text-[11px] text-slate-700 font-medium">
                                <span className="truncate">{assignment.professor}</span>
                                {profEmail && (
                                  <a
                                    href={`mailto:${profEmail}?subject=${encodeURIComponent(
                                      `Consulta Bioquímica Enfermería - Grupo ${assignment.groupNumber}`
                                    )}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-slate-400 hover:text-emerald-700 transition-colors p-0.5"
                                    title={`Escribir a ${assignment.professor} (${profEmail})`}
                                  >
                                    <Mail className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* Topic spanning 2 rows */}
                        <td
                          rowSpan={2}
                          className="p-2.5 font-medium text-slate-800 border-r border-slate-200 align-middle leading-snug"
                        >
                          {week.title}
                          {week.notes && (
                            <div className="mt-1 text-[10px] text-slate-500 italic">
                              {week.notes}
                            </div>
                          )}
                        </td>

                        {/* Room spanning 2 rows */}
                        <td
                          rowSpan={2}
                          className="p-2.5 text-center font-bold border-r border-slate-200 align-middle"
                        >
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            week.room.includes('Lab')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {week.room}
                          </span>
                        </td>

                        {/* Summary professor for morning or overall */}
                        <td
                          rowSpan={2}
                          className="p-2.5 text-slate-700 font-medium align-middle text-[11px] leading-relaxed"
                        >
                          {week.summaryProfessors}
                        </td>
                      </tr>

                      {/* Afternoon Shift Row */}
                      <tr className="border-b border-slate-200 bg-slate-50/30 hover:bg-amber-50/20 transition-colors">
                        <td className="p-2 text-center border-r border-slate-200 bg-amber-50/40 font-semibold text-amber-900">
                          15.30-18h
                        </td>

                        {/* Afternoon Days: Lunes (1) to Viernes (5) */}
                        {[1, 2, 3, 4, 5].map((d) => {
                          const assignment = week.assignments.afternoon[d];
                          const sessionKey = `w${week.weekIndex}-tarde-${d}`;
                          const session = sessionsMap[sessionKey];

                          if (!assignment) {
                            return (
                              <td key={d} className="p-2 text-center border-r border-slate-200 text-slate-300">
                                -
                              </td>
                            );
                          }

                          const profEmail = getProfessorEmail(assignment.professor);

                          return (
                            <td
                              key={d}
                              onClick={() => session && onSelectSessionById(session.id)}
                              className="p-2 border-r border-slate-200 cursor-pointer hover:bg-amber-100/50 transition-colors"
                              title="Haz clic para ver detalles de la sesión"
                            >
                              <div className="font-bold text-slate-900">
                                Grupo {assignment.groupNumber}
                              </div>
                              <div className="flex items-center justify-between gap-1 text-[11px] text-slate-700 font-medium">
                                <span className="truncate">{assignment.professor}</span>
                                {profEmail && (
                                  <a
                                    href={`mailto:${profEmail}?subject=${encodeURIComponent(
                                      `Consulta Bioquímica Enfermería - Grupo ${assignment.groupNumber}`
                                    )}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-slate-400 hover:text-emerald-700 transition-colors p-0.5"
                                    title={`Escribir a ${assignment.professor} (${profEmail})`}
                                  >
                                    <Mail className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                    </React.Fragment>
                  );
                })}

              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matrix Table Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
        <div>
          <strong>Nota de créditos:</strong> Cada grupo realiza 0,25 créditos ECTS de prácticas por actividad (2,5 horas presenciales).
        </div>
        <div>
          Turno Mañana: <strong>Grupo B (Subgrupos 6, 7, 8, 9, 10)</strong> • Turno Tarde: <strong>Grupo C (Subgrupos 11, 12, 13, 14)</strong>
        </div>
      </div>

    </div>
  );
};
