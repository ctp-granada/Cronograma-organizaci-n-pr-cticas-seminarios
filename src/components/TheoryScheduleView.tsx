import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Calendar, FlaskConical, Sparkles, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { computeTheorySchedule, ComputedTheoryWeek } from '../data/theoryScheduleData';
import { COURSE_INFO } from '../data/curriculumData';

interface TheoryScheduleViewProps {
  startMonday: Date;
  academicYear: number;
  onSelectActivity?: (activityCode: string) => void;
}

export const TheoryScheduleView: React.FC<TheoryScheduleViewProps> = ({
  startMonday,
  academicYear,
  onSelectActivity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Compute weeks dynamically based on startMonday & academicYear
  const computedWeeks = useMemo(() => {
    return computeTheorySchedule(startMonday, academicYear);
  }, [startMonday, academicYear]);

  // Group weeks by Month (Sep, Oct, Nov, Dic)
  const groupedByMonth = useMemo(() => {
    const groups: { [monthKey: string]: { label: string; weeks: ComputedTheoryWeek[] } } = {};

    computedWeeks.forEach((week) => {
      const key = week.monthNameShort;
      if (!groups[key]) {
        groups[key] = {
          label: `${week.monthNameShort} ${academicYear}`,
          weeks: [],
        };
      }
      groups[key].weeks.push(week);
    });

    return Object.entries(groups);
  }, [computedWeeks, academicYear]);

  // Filtered list when searching
  const filteredWeeks = useMemo(() => {
    if (!searchQuery.trim()) return computedWeeks;
    const q = searchQuery.toLowerCase().trim();

    return computedWeeks.filter((week) => {
      const inWeekNum = `semana ${week.weekNumber}`.includes(q);
      const inActivity = week.practicalActivity &&
        (`${week.practicalActivity.code} ${week.practicalActivity.title}`.toLowerCase().includes(q));
      const inTopics = week.topics.some(
        (t) => t.code.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      );
      return inWeekNum || inActivity || inTopics;
    });
  }, [computedWeeks, searchQuery]);

  // Calculate Christmas week days (Week 15 / days before holidays)
  const christmasDays = useMemo(() => {
    const lastWeek = computedWeeks[computedWeeks.length - 1];
    if (!lastWeek) return [];
    const mon = new Date(lastWeek.mondayDate);
    mon.setDate(mon.getDate() + 7); // Monday of week 15

    const days: Array<{ dayNum: number; fullDate: string }> = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(mon);
      d.setDate(d.getDate() + i);
      days.push({
        dayNum: d.getDate(),
        fullDate: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      });
    }
    return days;
  }, [computedWeeks]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Description */}
      <div className="no-print bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-blue-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-800/80 text-blue-200 text-[11px] font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Programación Docente Oficial</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-['Outfit']">
              Planificación Temporal de Teoría
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              Cronograma semanal de temas teóricos y su sincronización con los seminarios y prácticas de laboratorio en el <strong>Curso {academicYear} - {academicYear + 1}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-white/10 p-2.5 rounded-xl border border-white/10 backdrop-blur-xs text-xs">
            <div className="text-right">
              <span className="text-[10px] text-blue-300 block uppercase font-bold">Total Temario</span>
              <span className="font-bold text-white text-sm">16 Temas Teóricos</span>
            </div>
            <div className="h-8 w-px bg-white/20 mx-1"></div>
            <div className="text-right">
              <span className="text-[10px] text-blue-300 block uppercase font-bold">Duración</span>
              <span className="font-bold text-emerald-300 text-sm">14 Semanas</span>
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="mt-4 pt-4 border-t border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tema, práctica o concepto..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-blue-950/60 text-white placeholder-blue-300/60 text-xs border border-blue-700/60 focus:outline-hidden focus:border-blue-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <span>Seminario / Práctica sincronizada</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
              <span>Clases de Teoría</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Table / Matrix Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden">
        
        {/* Table Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between flex-wrap gap-3 border-b-2 border-slate-900">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
              Universidad de Granada • Facultad de Ciencias de la Salud
            </span>
            <h3 className="text-lg font-black tracking-tight">
              PROGRAMACIÓN TEMARIO TEÓRICO • {academicYear}-{academicYear + 1}
            </h3>
          </div>
          <div className="text-xs text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            Semanas 1 a 14 lectivas
          </div>
        </div>

        {/* Filter Alert if searching */}
        {searchQuery && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 flex items-center justify-between text-xs text-blue-900">
            <span>
              Mostrando resultados para: <strong>«{searchQuery}»</strong> ({filteredWeeks.length} semanas encontradas)
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-blue-700 font-bold hover:underline"
            >
              Restablecer
            </button>
          </div>
        )}

        {/* Schedule Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100/90 text-slate-800 text-xs uppercase font-black border-b-2 border-slate-900 tracking-wider">
                <th className="py-3 px-4 w-28 text-center border-r border-slate-300">Mes</th>
                <th className="py-3 px-4 w-64 border-r border-slate-300">Semana y Actividades Prácticas</th>
                <th className="py-3 px-6">Contenidos de Teoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-xs">
              {filteredWeeks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500">
                    No se han encontrado temas que coincidan con «{searchQuery}».
                  </td>
                </tr>
              ) : (
                filteredWeeks.map((week, idx) => {
                  // Check if this week is the first in its month for the row grouping border
                  const isFirstOfMonth = idx === 0 || filteredWeeks[idx - 1].monthNameShort !== week.monthNameShort;
                  const monthColorMap: Record<string, { bg: string; text: string; border: string }> = {
                    'Sep.': { bg: 'bg-amber-500/10 text-amber-900', text: 'text-amber-800', border: 'border-amber-300' },
                    'Oct.': { bg: 'bg-orange-500/10 text-orange-900', text: 'text-orange-800', border: 'border-orange-300' },
                    'Nov.': { bg: 'bg-blue-500/10 text-blue-900', text: 'text-blue-800', border: 'border-blue-300' },
                    'Dic.': { bg: 'bg-purple-500/10 text-purple-900', text: 'text-purple-800', border: 'border-purple-300' },
                  };

                  const monthStyle = monthColorMap[week.monthNameShort] || {
                    bg: 'bg-slate-100 text-slate-900',
                    text: 'text-slate-800',
                    border: 'border-slate-300',
                  };

                  return (
                    <tr
                      key={week.weekNumber}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        week.isCurrentWeek ? 'bg-emerald-50/60 font-medium' : ''
                      }`}
                    >
                      {/* Month Column */}
                      <td className={`py-4 px-3 text-center align-top border-r border-slate-300 ${isFirstOfMonth ? 'border-t-2 border-slate-900' : ''}`}>
                        <div className="sticky top-2">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${monthStyle.bg} border ${monthStyle.border}`}>
                            {week.monthNameShort}
                          </span>
                          <span className="block text-[11px] font-bold text-slate-500 mt-1">
                            {academicYear}
                          </span>
                          {week.isCurrentWeek && (
                            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                              Semana actual
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Dates & Practical Activity Column */}
                      <td className={`py-4 px-4 align-top border-r border-slate-300 space-y-2 ${isFirstOfMonth ? 'border-t-2 border-slate-900' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 shrink-0">
                            {week.dateRangeLabel}
                          </span>
                          <span className="font-bold text-red-600 text-xs">
                            Semana {week.weekNumber}
                          </span>
                        </div>

                        {/* Practical Activity Card (if active this week) */}
                        {week.practicalActivity ? (
                          <div
                            onClick={() => onSelectActivity && onSelectActivity(week.practicalActivity!.code)}
                            className="p-2 rounded-lg bg-amber-50/80 border border-amber-300 text-amber-950 hover:bg-amber-100/90 transition-colors cursor-pointer shadow-2xs"
                            title="Ver sesiones prácticas de esta semana"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black uppercase tracking-wide text-amber-900 flex items-center gap-1">
                                <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
                                {week.practicalActivity.code}:
                              </span>
                              <ChevronRight className="w-3 h-3 text-amber-600" />
                            </div>
                            <span className="font-bold text-xs block text-slate-900 mt-0.5">
                              {week.practicalActivity.title}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">
                            Sin prácticas de laboratorio esta semana
                          </div>
                        )}
                      </td>

                      {/* Theory Topics Column */}
                      <td className={`py-4 px-6 align-top space-y-2.5 ${isFirstOfMonth ? 'border-t-2 border-slate-900' : ''}`}>
                        {week.topics.map((topic, tIdx) => (
                          <div
                            key={tIdx}
                            className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/90 transition-colors group"
                          >
                            <div className="flex items-start gap-2">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-xs shrink-0 border border-blue-200">
                                {topic.code}
                              </span>
                              <span className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                                {topic.title}
                              </span>
                            </div>
                            {topic.description && (
                              <p className="text-[11px] text-slate-600 mt-1 pl-1 leading-relaxed">
                                {topic.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Week 15 / Final Christmas Break row as shown in official sheet */}
              <tr className="bg-slate-100/90 border-t-2 border-slate-900">
                <td className="py-3 px-3 text-center border-r border-slate-300 font-bold text-slate-600">
                  <span className="text-xs uppercase font-black text-purple-900">Dic.</span>
                </td>
                <td colSpan={2} className="py-3 px-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        Cierre lectivo del cuatrimestre y vacaciones de Navidad:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {christmasDays.map((cDay) => (
                          <span
                            key={cDay.dayNum}
                            className="w-7 h-7 rounded-md bg-white border border-slate-300 flex items-center justify-center font-mono font-bold text-xs text-slate-700 shadow-2xs"
                            title={`Día ${cDay.fullDate}`}
                          >
                            {cDay.dayNum}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 italic">
                      Período no lectivo / Preparación exámenes oficiales UGR
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer / Summary Notes */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              La docencia de teoría se imparte en el aula asignada para los Grupos B y C conforme a los horarios de la Facultad.
            </span>
          </div>
          <div className="font-semibold text-slate-700">
            {COURSE_INFO.subject} • {COURSE_INFO.degree}
          </div>
        </div>

      </div>
    </div>
  );
};
