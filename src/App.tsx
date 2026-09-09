import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { MonthCalendarView } from './components/MonthCalendarView';
import { MatrixTableView } from './components/MatrixTableView';
import { SessionDetailModal } from './components/SessionDetailModal';
import { FilterState, ComputedSession } from './types';
import {
  getDefaultStartMonday,
  formatDateToISO,
  parseISODate,
  computeAllSessions,
  generateICS,
} from './utils/perpetualDateUtils';
import { COURSE_INFO } from './data/curriculumData';
import { Check, Calendar, Download, GraduationCap, Info } from 'lucide-react';

export default function App() {
  // Current academic year default: 2026
  const [academicYear, setAcademicYear] = useState<number>(2026);

  // Start Monday date state
  const defaultMonday = useMemo(() => getDefaultStartMonday(academicYear), [academicYear]);
  const [startMondayStr, setStartMondayStr] = useState<string>(() => formatDateToISO(getDefaultStartMonday(2026)));

  // Active navigation view: 'month' (default) or 'matrix' (simplified for students)
  const [activeView, setActiveView] = useState<'month' | 'matrix'>('month');

  // Selected month for Month Calendar view (October is 9)
  const [calendarMonthIndex, setCalendarMonthIndex] = useState<number>(9);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedProfessor: '',
    selectedGroup: '',
    selectedShift: '',
    selectedActivityType: '',
    selectedRoom: '',
  });

  // Selected session for detail modal
  const [selectedSession, setSelectedSession] = useState<ComputedSession | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleYearChange = (newYear: number) => {
    setAcademicYear(newYear);
    const newDefaultMonday = getDefaultStartMonday(newYear);
    setStartMondayStr(formatDateToISO(newDefaultMonday));
    showToast(`Curso actualizado a ${newYear} - ${newYear + 1}`);
  };

  // Compute all sessions for the semester
  const allComputedSessions = useMemo(() => {
    const parsedStart = parseISODate(startMondayStr);
    return computeAllSessions(parsedStart);
  }, [startMondayStr]);

  // Apply filters
  const filteredSessions = useMemo(() => {
    return allComputedSessions.filter((s) => {
      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery =
          s.title.toLowerCase().includes(q) ||
          s.activityCode.toLowerCase().includes(q) ||
          s.professor.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q) ||
          `grupo ${s.groupNumber}`.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Professor filter
      if (filters.selectedProfessor && s.professor !== filters.selectedProfessor) {
        return false;
      }

      // Group filter
      if (filters.selectedGroup) {
        if (filters.selectedGroup === 'B' || filters.selectedGroup === 'C') {
          if (s.groupLetter !== filters.selectedGroup) return false;
        } else {
          if (String(s.groupNumber) !== filters.selectedGroup) return false;
        }
      }

      // Shift filter
      if (filters.selectedShift && s.shift !== filters.selectedShift) {
        return false;
      }

      // Activity Type
      if (filters.selectedActivityType && s.activityType !== filters.selectedActivityType) {
        return false;
      }

      // Room
      if (filters.selectedRoom && s.room !== filters.selectedRoom) {
        return false;
      }

      return true;
    });
  }, [allComputedSessions, filters]);

  // Export calendar ICS
  const handleExportICS = () => {
    const icsContent = generateICS(filteredSessions, `${academicYear}-${academicYear + 1}`);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bioquimica_Practicas_Enfermeria_${academicYear}-${academicYear + 1}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Calendario iCal descargado para añadir a tu móvil o gestor de calendario.');
  };

  const handlePrint = () => {
    window.print();
  };

  const currentStartMondayDate = useMemo(() => parseISODate(startMondayStr), [startMondayStr]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Header */}
      <Header
        academicYear={academicYear}
        onYearChange={handleYearChange}
        activeView={activeView}
        onViewChange={setActiveView}
        onExportICS={handleExportICS}
        onPrint={handlePrint}
      />

      {/* Filter and Search Bar for Students */}
      <div id="filter-bar-container">
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          selectedMonthIndex={activeView === 'month' ? calendarMonthIndex : null}
          onMonthSelect={(mIdx) => {
            if (mIdx !== null) {
              setCalendarMonthIndex(mIdx);
              setActiveView('month');
            }
          }}
          totalSessionsCount={allComputedSessions.length}
          filteredSessionsCount={filteredSessions.length}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Student Welcome & Navigation Quick Bar */}
        <div className="no-print bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800">
                  Guía para el alumnado en PRADO
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Curso <strong className="text-slate-900">{academicYear} - {academicYear + 1}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Filtra por tu subgrupo arriba para ver únicamente tus prácticas, o haz clic en cualquier sesión para ver el aula y contactar con el profesor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="banner-btn-october"
              onClick={() => {
                setCalendarMonthIndex(9); // Octubre
                setActiveView('month');
              }}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                activeView === 'month' && calendarMonthIndex === 9
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Octubre
            </button>
            <button
              type="button"
              id="banner-btn-november"
              onClick={() => {
                setCalendarMonthIndex(10); // Noviembre
                setActiveView('month');
              }}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                activeView === 'month' && calendarMonthIndex === 10
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Noviembre
            </button>
            <button
              type="button"
              id="banner-btn-december"
              onClick={() => {
                setCalendarMonthIndex(11); // Diciembre
                setActiveView('month');
              }}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                activeView === 'month' && calendarMonthIndex === 11
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Diciembre
            </button>
            <button
              type="button"
              id="banner-btn-matrix"
              onClick={() => setActiveView('matrix')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                activeView === 'matrix'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Cronograma Completo
            </button>
          </div>
        </div>

        {/* View Component Switcher */}
        {activeView === 'month' && (
          <MonthCalendarView
            year={academicYear}
            monthIndex={calendarMonthIndex}
            onMonthChange={setCalendarMonthIndex}
            sessions={filteredSessions}
            filters={filters}
            onSelectSession={setSelectedSession}
          />
        )}

        {activeView === 'matrix' && (
          <MatrixTableView
            startMonday={currentStartMondayDate}
            academicYear={academicYear}
            filters={filters}
            onSelectSessionById={(id) => {
              const session = allComputedSessions.find((s) => s.id === id);
              if (session) setSelectedSession(session);
            }}
            computedSessions={filteredSessions}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-800">
              Universidad de Granada • Departamento de Bioquímica y Biología Molecular
            </span>
            <span>•</span>
            <span>{COURSE_INFO.degree}</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Ubicaciones: Lab 2.21 y Aula 2.15</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleExportICS}
              className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Descargar calendario (.ics)
            </button>
          </div>
        </div>
      </footer>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          academicYear={academicYear}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
