import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Mail,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ComputedSession, FilterState } from '../types';
import { getMonthDaysGrid } from '../utils/perpetualDateUtils';

interface MonthCalendarViewProps {
  year: number;
  monthIndex: number; // 0-11. For Octubre it is 9.
  onMonthChange: (newMonthIndex: number) => void;
  sessions: ComputedSession[];
  filters: FilterState;
  onSelectSession: (session: ComputedSession) => void;
}

export const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  year,
  monthIndex,
  onMonthChange,
  sessions,
  filters,
  onSelectSession,
}) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Strictly weekdays (Lunes a Viernes) for clean, spacious layout
  const daysGrid = getMonthDaysGrid(year, monthIndex, false);

  // Group sessions by date string YYYY-MM-DD
  const sessionsByDate: Record<string, ComputedSession[]> = {};
  sessions.forEach((s) => {
    if (!sessionsByDate[s.dateStr]) {
      sessionsByDate[s.dateStr] = [];
    }
    sessionsByDate[s.dateStr].push(s);
  });

  // Check holiday highlights for Spanish academic calendar
  const getDaySpecialNotice = (dateStr: string, date: Date) => {
    const m = date.getMonth();
    const d = date.getDate();
    if (m === 9 && d === 12) {
      return '12 Octubre • Fiesta Nacional de España';
    }
    if (m === 10 && d === 1) {
      return '1 Noviembre • Día de Todos los Santos';
    }
    if (m === 11 && d === 6) {
      return '6 Diciembre • Día de la Constitución';
    }
    if (m === 11 && d === 8) {
      return '8 Diciembre • Día de la Inmaculada';
    }
    return null;
  };

  const handlePrevMonth = () => {
    if (monthIndex === 8) {
      onMonthChange(11);
    } else {
      onMonthChange(monthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (monthIndex === 11) {
      onMonthChange(8);
    } else {
      onMonthChange(monthIndex + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Month Navigation & Title Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50/40 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              id="btn-cal-prev-month"
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              id="btn-cal-next-month"
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <span>{monthNames[monthIndex]}</span>
              <span className="text-slate-400 font-normal">{year}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Lunes a Viernes • Horarios, profesorado responsable y aulas
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Month Switch Buttons */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs">
            {[8, 9, 10, 11].map((mIdx) => (
              <button
                key={mIdx}
                type="button"
                id={`quick-month-btn-${mIdx}`}
                onClick={() => onMonthChange(mIdx)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  monthIndex === mIdx
                    ? 'bg-emerald-700 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {monthNames[mIdx]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weekday Column Headers (Lunes a Viernes) */}
      <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50/90 text-center text-xs font-bold text-slate-700">
        <div className="py-2.5 px-1 border-r border-slate-200">Lunes</div>
        <div className="py-2.5 px-1 border-r border-slate-200">Martes</div>
        <div className="py-2.5 px-1 border-r border-slate-200">Miércoles</div>
        <div className="py-2.5 px-1 border-r border-slate-200">Jueves</div>
        <div className="py-2.5 px-1">Viernes</div>
      </div>

      {/* Calendar Grid Matrix (Lunes a Viernes) */}
      <div className="grid grid-cols-5 auto-rows-fr divide-x divide-y divide-slate-200 bg-slate-100">
        {daysGrid.map((dayItem, index) => {
          const daySessions = sessionsByDate[dayItem.dateStr] || [];
          const specialNotice = getDaySpecialNotice(dayItem.dateStr, dayItem.date);
          const isCurrentMonth = dayItem.isCurrentMonth;
          const isWeekend = dayItem.isWeekend;

          return (
            <div
              key={dayItem.dateStr + index}
              className={`min-h-[145px] sm:min-h-[185px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors ${
                !isCurrentMonth
                  ? 'bg-slate-50/40 text-slate-300'
                  : isWeekend
                  ? 'bg-slate-50/60 text-slate-400'
                  : 'bg-white text-slate-800 hover:bg-slate-50/60'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    daySessions.length > 0 && isCurrentMonth
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : isCurrentMonth
                      ? 'text-slate-700'
                      : 'text-slate-300'
                  }`}
                >
                  {dayItem.dayNumber}
                </span>

                {specialNotice && isCurrentMonth && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 truncate max-w-[130px]">
                    Festivo
                  </span>
                )}
              </div>

              {/* Special notice full banner if holiday */}
              {specialNotice && isCurrentMonth && daySessions.length === 0 && (
                <div className="my-auto py-1 px-1.5 rounded-md bg-rose-50/80 border border-rose-200/70 text-[10px] text-rose-700 font-medium text-center">
                  {specialNotice}
                </div>
              )}

              {/* Sessions container */}
              <div className="space-y-2 flex-1">
                {daySessions.map((session) => {
                  const isMorning = session.shift === 'mañana';

                  return (
                    <div
                      key={session.id}
                      onClick={() => onSelectSession(session)}
                      className={`w-full text-left p-2 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-xs group cursor-pointer ${
                        isMorning
                          ? 'bg-emerald-50/90 hover:bg-emerald-100/90 border-emerald-200/90 text-emerald-950'
                          : 'bg-amber-50/90 hover:bg-amber-100/90 border-amber-200/90 text-amber-950'
                      }`}
                    >
                      {/* Top row: Shift Time & Room */}
                      <div className="flex items-center justify-between gap-1 text-[10px] font-semibold">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          {session.startTime} - {session.endTime}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            session.room.includes('Lab')
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-purple-100 text-purple-800 border-purple-200'
                          }`}
                        >
                          {session.room}
                        </span>
                      </div>

                      {/* Middle row: Activity & Group */}
                      <div className="mt-1 font-bold text-xs">
                        <span className="text-slate-900">{session.activityCode}</span>
                        <span className="ml-1 text-[11px] font-semibold text-slate-600">
                          (Grupo {session.groupNumber})
                        </span>
                      </div>

                      {/* Topic Title */}
                      <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 font-medium leading-snug">
                        {session.title}
                      </div>

                      {/* Bottom row: Professor Responsible + Direct Mail Action */}
                      <div className="mt-1.5 pt-1.5 border-t border-black/5 flex items-center justify-between gap-1 text-[11px] text-slate-700">
                        <div className="flex items-center gap-1 font-semibold truncate">
                          <User className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate group-hover:text-slate-950">
                            {session.professor}
                          </span>
                        </div>

                        {session.professorEmail && (
                          <a
                            href={`mailto:${session.professorEmail}?subject=${encodeURIComponent(
                              `Consulta Bioquímica Enfermería - Grupo ${session.groupNumber} (${session.activityCode})`
                            )}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-0.5 p-1 rounded-md text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200/70 transition-colors shrink-0"
                            title={`Enviar correo directo a ${session.professor} (${session.professorEmail})`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom day indicator if empty weekday in current month */}
              {isCurrentMonth && !isWeekend && daySessions.length === 0 && !specialNotice && (
                <div className="text-[10px] text-slate-300 text-center py-1">
                  Sin prácticas programadas
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Month Footer Legend & Details */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 inline-block"></span>
            <span>Turno Mañana: 8:30 - 11:00 h (Grupos B: 6, 7, 8, 9, 10)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300 inline-block"></span>
            <span>Turno Tarde: 15:30 - 18:00 h (Grupos C: 11, 12, 13, 14)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Lab 2.21</span>
            <span>Laboratorio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Aula 2.15</span>
            <span>Aula de Seminarios / Prácticas</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <Mail className="w-3.5 h-3.5 text-emerald-700" />
          <span>Haz clic en el icono de correo en cada tarjeta para escribir directamente al profesor/a responsable.</span>
        </div>
      </div>

    </div>
  );
};
