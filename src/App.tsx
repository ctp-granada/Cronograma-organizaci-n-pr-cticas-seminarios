import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { MonthCalendarView } from './components/MonthCalendarView';
import { MatrixTableView } from './components/MatrixTableView';
import { SessionDetailModal } from './components/SessionDetailModal';
import { CoordinatorModal } from './components/CoordinatorModal';
import { PrintModal } from './components/PrintModal';
import { TheoryScheduleView } from './components/TheoryScheduleView';
import { FilterState, ComputedSession, TemplateWeek } from './types';
import {
  getDefaultStartMonday,
  formatDateToISO,
  parseISODate,
  computeAllSessions,
  generateICS,
} from './utils/perpetualDateUtils';
import { COURSE_INFO, PROFESSORS_LIST, PROFESSOR_EMAILS, TEMPLATE_WEEKS } from './data/curriculumData';
import { Check, Calendar, Download, GraduationCap, Info, ShieldCheck, Settings, LogOut } from 'lucide-react';

export default function App() {
  // Current academic year default: 2026
  const [academicYear, setAcademicYear] = useState<number>(2026);

  // Coordinator Authentication & Modal State
  const [coordinatorEmail, setCoordinatorEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ugr_coordinator_email');
    } catch {
      return null;
    }
  });
  const [isCoordinatorModalOpen, setIsCoordinatorModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Dynamic Teaching Staff & Assignments per academic year
  const [professorsList, setProfessorsList] = useState<string[]>(() => {
    try {
      // 1. Check URL hash for shared configuration
      if (window.location.hash.startsWith('#docencia=')) {
        const encoded = decodeURIComponent(window.location.hash.replace('#docencia=', ''));
        const parsed = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        if (parsed.professorsList) return parsed.professorsList;
      }
      // 2. Check localStorage
      const saved = localStorage.getItem('ugr_professors_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading stored professors', e);
    }
    return PROFESSORS_LIST;
  });

  const [professorEmails, setProfessorEmails] = useState<Record<string, string>>(() => {
    try {
      if (window.location.hash.startsWith('#docencia=')) {
        const encoded = decodeURIComponent(window.location.hash.replace('#docencia=', ''));
        const parsed = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        if (parsed.professorEmails) return parsed.professorEmails;
      }
      const saved = localStorage.getItem('ugr_professor_emails');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading stored emails', e);
    }
    return PROFESSOR_EMAILS;
  });

  const [templateWeeks, setTemplateWeeks] = useState<TemplateWeek[]>(() => {
    try {
      if (window.location.hash.startsWith('#docencia=')) {
        const encoded = decodeURIComponent(window.location.hash.replace('#docencia=', ''));
        const parsed = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        if (parsed.templateWeeks) return parsed.templateWeeks;
      }
      const saved = localStorage.getItem(`ugr_template_weeks_${2026}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading stored template weeks', e);
    }
    return TEMPLATE_WEEKS;
  });

  // Persist coordinator changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ugr_professors_list', JSON.stringify(professorsList));
      localStorage.setItem('ugr_professor_emails', JSON.stringify(professorEmails));
      localStorage.setItem(`ugr_template_weeks_${academicYear}`, JSON.stringify(templateWeeks));
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }
  }, [professorsList, professorEmails, templateWeeks, academicYear]);

  // Handle coordinator login & logout
  const handleCoordinatorLogin = (email: string) => {
    setCoordinatorEmail(email);
    try {
      localStorage.setItem('ugr_coordinator_email', email);
    } catch {}
    showToast(`Identificado como coordinador: ${email}`);
  };

  const handleCoordinatorLogout = () => {
    setCoordinatorEmail(null);
    try {
      localStorage.removeItem('ugr_coordinator_email');
    } catch {}
    showToast('Sesión de coordinación cerrada.');
  };

  const handleResetToDefaults = () => {
    setProfessorsList(PROFESSORS_LIST);
    setProfessorEmails(PROFESSOR_EMAILS);
    setTemplateWeeks(TEMPLATE_WEEKS);
    try {
      localStorage.removeItem('ugr_professors_list');
      localStorage.removeItem('ugr_professor_emails');
      localStorage.removeItem(`ugr_template_weeks_${academicYear}`);
    } catch {}
    showToast('Asignaciones restablecidas a los valores iniciales oficiales de la UGR.');
  };

  // Reassign professor directly from session modal
  const handleReassignSessionProfessor = (
    weekIndex: number,
    shift: 'morning' | 'afternoon',
    groupNumber: number,
    newProfessor: string
  ) => {
    const updatedWeeks = templateWeeks.map((week) => {
      if (week.weekIndex !== weekIndex) return week;

      const shiftAssignments = { ...week.assignments[shift] };
      Object.keys(shiftAssignments).forEach((d) => {
        const dayNum = Number(d);
        if (shiftAssignments[dayNum]?.groupNumber === groupNumber) {
          shiftAssignments[dayNum] = {
            ...shiftAssignments[dayNum],
            professor: newProfessor,
          };
        }
      });

      return {
        ...week,
        assignments: {
          ...week.assignments,
          [shift]: shiftAssignments,
        },
      };
    });

    setTemplateWeeks(updatedWeeks);
    showToast(`Profesor de Subgrupo ${groupNumber} actualizado a ${newProfessor}.`);
  };

  // Generation date formatted for printable document
  const generationDateStr = useMemo(() => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  }, []);

  // Start Monday date state
  const defaultMonday = useMemo(() => getDefaultStartMonday(academicYear), [academicYear]);
  const [startMondayStr, setStartMondayStr] = useState<string>(() => formatDateToISO(getDefaultStartMonday(2026)));

  // Active navigation view: 'month' (default), 'matrix', or 'theory'
  const [activeView, setActiveView] = useState<'month' | 'matrix' | 'theory'>('month');

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

    // Check if there is already a saved template for the new year
    try {
      const savedForYear = localStorage.getItem(`ugr_template_weeks_${newYear}`);
      if (savedForYear) {
        setTemplateWeeks(JSON.parse(savedForYear));
      }
    } catch {}

    showToast(`Curso actualizado a ${newYear} - ${newYear + 1}`);
  };

  // Compute all sessions dynamically using templateWeeks and professorEmails
  const allComputedSessions = useMemo(() => {
    const parsedStart = parseISODate(startMondayStr);
    return computeAllSessions(parsedStart, templateWeeks, professorEmails);
  }, [startMondayStr, templateWeeks, professorEmails]);

  // Keep selectedSession in sync if reallocated
  useEffect(() => {
    if (selectedSession) {
      const updated = allComputedSessions.find((s) => s.id === selectedSession.id);
      if (updated && updated.professor !== selectedSession.professor) {
        setSelectedSession(updated);
      }
    }
  }, [allComputedSessions, selectedSession]);

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
    // Attempt standard print first
    try {
      window.print();
    } catch (e) {
      console.warn('Direct window.print() failed', e);
    }

    // If running in an iframe (e.g. AI Studio preview, PRADO LMS),
    // modern browsers block or suppress print dialogs from frames.
    // We open PrintModal so the user can open it in a clean tab or get assistance.
    const isInsideIframe = window.self !== window.top;
    if (isInsideIframe) {
      setIsPrintModalOpen(true);
    }
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
        coordinatorEmail={coordinatorEmail}
        onOpenCoordinator={() => setIsCoordinatorModalOpen(true)}
      />

      {/* Coordinator Active Bar */}
      {coordinatorEmail && (
        <div className="no-print bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-4 py-2 text-xs shadow-xs border-b border-emerald-700">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>
                <strong>Modo Coordinación Docente:</strong> Conectado como <span className="font-mono underline">{coordinatorEmail}</span>. Puedes reasignar profesores, añadir docentes o guardar cambios para años siguientes.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCoordinatorModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-2xs"
              >
                Panel de Coordinación
              </button>
              <button
                type="button"
                onClick={handleCoordinatorLogout}
                className="px-2 py-1 rounded-lg bg-black/30 hover:bg-black/40 text-emerald-200 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Printable Document Header (Appears only on print / PDF export) */}
        <div className="print-only print-header hidden mb-6 pb-4 border-b-2 border-slate-900">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Universidad de Granada • Facultad de Ciencias de la Salud
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                {COURSE_INFO.subject} • {COURSE_INFO.degree}
              </h1>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 mt-1">
                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  Grupos Oficiales: {COURSE_INFO.groups}
                </span>
                <span>•</span>
                <span>Laboratorio 2.21 (Prácticas) / Aula 2.15 (Seminarios)</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-sm font-black text-emerald-950 bg-emerald-50 px-3 py-1 rounded border border-emerald-300 inline-block">
                Curso Académico: {academicYear} - {academicYear + 1}
              </div>
              <div className="text-[11px] text-slate-600 mt-1.5 font-medium">
                Fecha de generación: <strong className="text-slate-900">{generationDateStr}</strong>
              </div>
              {filters.selectedGroup && (
                <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                  Filtro aplicado: Subgrupo {filters.selectedGroup}
                </div>
              )}
            </div>
          </div>
        </div>
        
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
            <button
              type="button"
              id="banner-btn-theory"
              onClick={() => setActiveView('theory')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                activeView === 'theory'
                  ? 'bg-indigo-700 text-white border-indigo-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Planificación Teoría
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
            templateWeeks={templateWeeks}
          />
        )}

        {activeView === 'theory' && (
          <TheoryScheduleView
            startMonday={currentStartMondayDate}
            academicYear={academicYear}
            onSelectActivity={(activityCode) => {
              setFilters((prev) => ({ ...prev, searchQuery: activityCode }));
              setActiveView('matrix');
            }}
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
          isCoordinator={!!coordinatorEmail}
          professorsList={professorsList}
          onReassignSessionProfessor={handleReassignSessionProfessor}
        />
      )}

      {/* Coordinator Management Modal */}
      <CoordinatorModal
        isOpen={isCoordinatorModalOpen}
        onClose={() => setIsCoordinatorModalOpen(false)}
        coordinatorEmail={coordinatorEmail}
        onLogin={handleCoordinatorLogin}
        onLogout={handleCoordinatorLogout}
        professorsList={professorsList}
        professorEmails={professorEmails}
        templateWeeks={templateWeeks}
        academicYear={academicYear}
        onUpdateProfessorList={(newList, newEmails) => {
          setProfessorsList(newList);
          setProfessorEmails(newEmails);
        }}
        onUpdateTemplateWeeks={setTemplateWeeks}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* Print Assistant Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        academicYear={academicYear}
        selectedGroup={filters.selectedGroup}
        generationDateStr={generationDateStr}
      />

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
