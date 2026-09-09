import React from 'react';
import {
  Calendar,
  Download,
  Printer,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  CalendarDays,
  Mail,
} from 'lucide-react';
import { COURSE_INFO } from '../data/curriculumData';
import { ShieldCheck, Lock } from 'lucide-react';

interface HeaderProps {
  academicYear: number;
  onYearChange: (year: number) => void;
  activeView: 'month' | 'matrix';
  onViewChange: (view: 'month' | 'matrix') => void;
  onExportICS: () => void;
  onPrint: () => void;
  coordinatorEmail?: string | null;
  onOpenCoordinator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  academicYear,
  onYearChange,
  activeView,
  onViewChange,
  onExportICS,
  onPrint,
  coordinatorEmail,
  onOpenCoordinator,
}) => {
  const yearsOptions = [
    2024, 2025, 2026, 2027, 2028,
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Subject Header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-['Outfit']">
                  Calendario de prácticas y seminarios de Bioquímica
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {COURSE_INFO.degree} • {COURSE_INFO.groups}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Year Selector and Calendar Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Year Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                id="btn-prev-year"
                onClick={() => onYearChange(academicYear - 1)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                title="Curso anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="px-2 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">
                  Curso
                </span>
                <select
                  id="select-academic-year"
                  value={academicYear}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className="bg-transparent font-bold text-xs text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  {yearsOptions.map((y) => (
                    <option key={y} value={y}>
                      {y} - {y + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                id="btn-next-year"
                onClick={() => onYearChange(academicYear + 1)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                title="Curso siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export and Print */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-export-ics"
                onClick={onExportICS}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-xs"
                title="Descargar para añadir a Google Calendar, Apple Calendar u Outlook"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Añadir a mi calendario</span>
              </button>

              <button
                type="button"
                id="btn-print-view"
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                title="Imprimir o guardar en PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>

              <button
                type="button"
                id="btn-open-coordinator"
                onClick={onOpenCoordinator}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                  coordinatorEmail
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200 shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border-slate-200'
                }`}
                title="Acceso restringido para el profesorado coordinador"
              >
                {coordinatorEmail ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Coordinación</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Coordinación</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* View Switcher Tabs (Simplified to 2 views for students) */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-medium">
            <button
              type="button"
              id="tab-view-month"
              onClick={() => onViewChange('month')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'month'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vista Mensual</span>
            </button>

            <button
              type="button"
              id="tab-view-matrix"
              onClick={() => onViewChange('matrix')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Cronograma Completo</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <strong>Mañana:</strong> 8:30 - 11:00 h (Gr. B: 6 al 10)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <strong>Tarde:</strong> 15:30 - 18:00 h (Gr. C: 11 al 14)
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
