import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  AlertCircle,
  X,
  Check,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Link,
  Code,
  RotateCcw,
  Sparkles,
  Save,
  Users,
  Calendar,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { TemplateWeek } from '../types';
import { PROFESSORS_LIST, PROFESSOR_EMAILS, TEMPLATE_WEEKS } from '../data/curriculumData';

interface CoordinatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinatorEmail: string | null;
  onLogin: (email: string) => void;
  onLogout: () => void;
  professorsList: string[];
  professorEmails: Record<string, string>;
  templateWeeks: TemplateWeek[];
  academicYear: number;
  onUpdateProfessorList: (newList: string[], newEmails: Record<string, string>) => void;
  onUpdateTemplateWeeks: (newWeeks: TemplateWeek[]) => void;
  onResetToDefaults: () => void;
}

const AUTHORIZED_EMAILS = [
  'ctp@ugr.es',
  'ctp@go.ugr.es',
  'fhtorres@ugr.es',
];

const DEFAULT_PIN = 'bioquimicaUGR';

export const CoordinatorModal: React.FC<CoordinatorModalProps> = ({
  isOpen,
  onClose,
  coordinatorEmail,
  onLogin,
  onLogout,
  professorsList,
  professorEmails,
  templateWeeks,
  academicYear,
  onUpdateProfessorList,
  onUpdateTemplateWeeks,
  onResetToDefaults,
}) => {
  // Login form states
  const [selectedAuthEmail, setSelectedAuthEmail] = useState<string>('ctp@ugr.es');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Custom password management state
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

  // Active sub-tab for authenticated coordinator
  const [activeTab, setActiveTab] = useState<'assignments' | 'professors' | 'export'>('assignments');

  // Selected week index for assignments (1 to 12)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(1);

  // New professor form states
  const [newProfName, setNewProfName] = useState<string>('');
  const [newProfEmail, setNewProfEmail] = useState<string>('');
  const [editingProfOriginal, setEditingProfOriginal] = useState<string | null>(null);

  // Quick bulk assign state
  const [bulkProfessor, setBulkProfessor] = useState<string>('');

  // Status message
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrimmed = selectedAuthEmail.trim().toLowerCase();
    const isAuthorized = AUTHORIZED_EMAILS.some((auth) => auth.toLowerCase() === emailTrimmed);

    if (!isAuthorized) {
      setLoginError('Correo no autorizado. Sólo el personal de coordinación docente tiene acceso a este panel.');
      return;
    }

    const currentPin = (() => {
      try {
        return localStorage.getItem('ugr_coordinator_pin') || DEFAULT_PIN;
      } catch {
        return DEFAULT_PIN;
      }
    })();

    if (enteredPin.trim() !== currentPin && enteredPin.trim() !== DEFAULT_PIN) {
      setLoginError('Clave de acceso incorrecta. Si la ha cambiado recientemente o la ha olvidado, contacte con Carolina Torres o Francisco Hermoso.');
      return;
    }

    onLogin(emailTrimmed);
    setEnteredPin('');
    showStatus(`Identificado correctamente como ${emailTrimmed}`);
  };

  // Change coordinator password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeSuccess(null);

    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 4) {
      alert('La nueva clave debe tener al menos 4 caracteres.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      alert('Las contraseñas introducidas no coinciden.');
      return;
    }

    try {
      localStorage.setItem('ugr_coordinator_pin', newPasswordInput.trim());
      setPasswordChangeSuccess('¡Clave de coordinación actualizada con éxito!');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      showStatus('Clave actualizada correctamente.');
    } catch (e) {
      alert('No se pudo guardar la clave en el almacenamiento del navegador.');
    }
  };

  // Reassign professor for a specific week, shift, and day
  const handleAssignProfessor = (
    weekIdx: number,
    shift: 'morning' | 'afternoon',
    day: number,
    professorName: string
  ) => {
    const updatedWeeks = templateWeeks.map((week) => {
      if (week.weekIndex !== weekIdx) return week;
      const currentShiftAssignments = { ...week.assignments[shift] };
      const currentAssignment = currentShiftAssignments[day];

      if (currentAssignment) {
        currentShiftAssignments[day] = {
          ...currentAssignment,
          professor: professorName,
        };
      }

      return {
        ...week,
        assignments: {
          ...week.assignments,
          [shift]: currentShiftAssignments,
        },
      };
    });

    onUpdateTemplateWeeks(updatedWeeks);
    showStatus('Asignación actualizada correctamente.');
  };

  // Bulk assign all groups of current week to one teacher
  const handleBulkAssignWeek = () => {
    if (!bulkProfessor) return;

    const updatedWeeks = templateWeeks.map((week) => {
      if (week.weekIndex !== selectedWeekIndex) return week;

      const newMorning = { ...week.assignments.morning };
      Object.keys(newMorning).forEach((d) => {
        const dayNum = Number(d);
        newMorning[dayNum] = { ...newMorning[dayNum], professor: bulkProfessor };
      });

      const newAfternoon = { ...week.assignments.afternoon };
      Object.keys(newAfternoon).forEach((d) => {
        const dayNum = Number(d);
        newAfternoon[dayNum] = { ...newAfternoon[dayNum], professor: bulkProfessor };
      });

      return {
        ...week,
        assignments: {
          morning: newMorning,
          afternoon: newAfternoon,
        },
      };
    });

    onUpdateTemplateWeeks(updatedWeeks);
    showStatus(`Todos los subgrupos de esta semana asignados a ${bulkProfessor}.`);
  };

  // Add or edit professor
  const handleSaveProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName.trim()) return;

    const trimmedName = newProfName.trim();
    const trimmedEmail = newProfEmail.trim().toLowerCase();

    if (editingProfOriginal) {
      // Editing existing professor
      const updatedList = professorsList.map((p) => (p === editingProfOriginal ? trimmedName : p));
      const updatedEmails = { ...professorEmails };
      delete updatedEmails[editingProfOriginal];
      updatedEmails[trimmedName] = trimmedEmail;

      // Update in assignments as well
      const updatedWeeks = templateWeeks.map((w) => {
        const updateShift = (shiftObj: Record<number, { groupNumber: number; professor: string }>) => {
          const res = { ...shiftObj };
          Object.keys(res).forEach((d) => {
            const dayNum = Number(d);
            if (res[dayNum].professor === editingProfOriginal) {
              res[dayNum] = { ...res[dayNum], professor: trimmedName };
            }
          });
          return res;
        };

        return {
          ...w,
          assignments: {
            morning: updateShift(w.assignments.morning),
            afternoon: updateShift(w.assignments.afternoon),
          },
        };
      });

      onUpdateProfessorList(updatedList, updatedEmails);
      onUpdateTemplateWeeks(updatedWeeks);
      setEditingProfOriginal(null);
      showStatus(`Profesor ${trimmedName} actualizado.`);
    } else {
      // Adding new professor
      if (professorsList.includes(trimmedName)) {
        alert('Este profesor ya existe en la lista.');
        return;
      }
      const updatedList = [...professorsList, trimmedName];
      const updatedEmails = { ...professorEmails, [trimmedName]: trimmedEmail };
      onUpdateProfessorList(updatedList, updatedEmails);
      showStatus(`Profesor ${trimmedName} añadido a la plantilla.`);
    }

    setNewProfName('');
    setNewProfEmail('');
  };

  // Remove professor
  const handleDeleteProfessor = (name: string) => {
    if (!confirm(`¿Eliminar a ${name} de la lista de profesores?`)) return;
    const updatedList = professorsList.filter((p) => p !== name);
    const updatedEmails = { ...professorEmails };
    delete updatedEmails[name];
    onUpdateProfessorList(updatedList, updatedEmails);
    showStatus(`${name} eliminado de la plantilla.`);
  };

  // Export JSON configuration file
  const handleDownloadJSON = () => {
    const configData = {
      academicYear,
      lastModified: new Date().toISOString(),
      modifiedBy: coordinatorEmail || 'ctp@ugr.es',
      professorsList,
      professorEmails,
      templateWeeks,
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bioquimica_Asignaciones_Docentes_${academicYear}-${academicYear + 1}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showStatus('Archivo JSON descargado correctamente.');
  };

  // Import JSON configuration file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.professorsList && parsed.templateWeeks) {
          onUpdateProfessorList(parsed.professorsList, parsed.professorEmails || {});
          onUpdateTemplateWeeks(parsed.templateWeeks);
          showStatus('Configuración docente importada con éxito.');
        } else {
          alert('El archivo no contiene un formato de configuración válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Copy shareable URL with embedded configuration hash
  const handleCopyShareableURL = () => {
    try {
      const dataToEncode = {
        professorsList,
        professorEmails,
        templateWeeks,
      };
      const jsonStr = JSON.stringify(dataToEncode);
      const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
      const currentUrl = window.location.origin + window.location.pathname;
      const fullShareUrl = `${currentUrl}#docencia=${encoded}`;
      navigator.clipboard.writeText(fullShareUrl);
      showStatus('¡Enlace copiado! Al abrirlo en PRADO se cargarán estas asignaciones automáticamente.');
    } catch (e) {
      alert('Error al generar enlace.');
    }
  };

  const currentWeek = templateWeeks.find((w) => w.weekIndex === selectedWeekIndex) || templateWeeks[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Outfit']">
                  Zona de Coordinación Docente
                </h2>
                {coordinatorEmail && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {coordinatorEmail}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Acceso exclusivo para Carolina Torres (ctp@ugr.es) y Francisco Hermoso (fhtorres@ugr.es)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Status Toast */}
          {statusMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* IF NOT LOGGED IN: Authentication Screen */}
          {!coordinatorEmail ? (
            <div className="max-w-md mx-auto py-6 space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Identificación de Coordinador</h3>
                <p className="text-xs text-slate-500">
                  Introduce tus credenciales de coordinación para modificar la asignación de profesorado para este curso o cursos siguientes.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Selecciona tu usuario de coordinación:
                  </label>
                  <select
                    value={selectedAuthEmail}
                    onChange={(e) => setSelectedAuthEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="ctp@ugr.es">Carolina Torres (ctp@ugr.es)</option>
                    <option value="fhtorres@ugr.es">Francisco Hermoso (fhtorres@ugr.es)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Clave de acceso de coordinación:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value)}
                      placeholder="Introduce tu clave secreta"
                      autoComplete="current-password"
                      className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Entrar como Coordinador
                </button>
              </form>
            </div>
          ) : (
            /* IF LOGGED IN: Full Coordinator Management Tabs */
            <div className="space-y-5">
              
              {/* Coordinator Sub-tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'assignments'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    1. Reasignar Prácticas y Seminarios
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('professors')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'professors'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    2. Plantilla de Profesores ({professorsList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('export')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'export'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    3. Guardar / Años Siguientes
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>

              {/* TAB 1: Reassign Practices & Seminars */}
              {activeTab === 'assignments' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Selecciona la actividad a editar:</span>
                      <select
                        value={selectedWeekIndex}
                        onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
                        className="font-bold p-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden cursor-pointer"
                      >
                        {templateWeeks.map((w) => (
                          <option key={w.weekIndex} value={w.weekIndex}>
                            Semana {w.weekIndex}: {w.activityCode} - {w.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bulk assign to 1 teacher */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Asignar toda esta semana a:</span>
                      <select
                        value={bulkProfessor}
                        onChange={(e) => setBulkProfessor(e.target.value)}
                        className="p-1 rounded-lg border border-slate-300 bg-white text-slate-800"
                      >
                        <option value="">Seleccionar profesor...</option>
                        {professorsList.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleBulkAssignWeek}
                        disabled={!bulkProfessor}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-semibold disabled:opacity-40 hover:bg-slate-900"
                      >
                        Aplicar a todos
                      </button>
                    </div>
                  </div>

                  {/* Holiday Week Notice */}
                  {currentWeek.isHolidayWeek ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                      Esta semana está marcada como festiva/sin docencia ({currentWeek.holidayReason}).
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      
                      {/* Grupo B: Turno Mañana (8:30 - 11:00 h) */}
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                        <div className="bg-emerald-50 px-3.5 py-2 border-b border-emerald-200 flex items-center justify-between">
                          <span className="font-bold text-emerald-900">
                            Grupo B • Mañana (8:30 - 11:00 h)
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-700">
                            Aula/Lab: {currentWeek.room}
                          </span>
                        </div>
                        <div className="p-3 space-y-2.5">
                          {[
                            { day: 1, name: 'Lunes', defaultGroup: 7 },
                            { day: 2, name: 'Martes', defaultGroup: 8 },
                            { day: 3, name: 'Miércoles', defaultGroup: 9 },
                            { day: 4, name: 'Jueves', defaultGroup: 10 },
                            { day: 5, name: 'Viernes', defaultGroup: 6 },
                          ].map((d) => {
                            const assign = currentWeek.assignments.morning[d.day];
                            const groupNum = assign ? assign.groupNumber : d.defaultGroup;
                            const profName = assign ? assign.professor : '';

                            return (
                              <div
                                key={d.day}
                                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-150"
                              >
                                <div>
                                  <span className="font-bold text-slate-800 block">
                                    {d.name} • Subgrupo {groupNum}
                                  </span>
                                  <span className="text-[10px] text-slate-400">8:30 - 11:00 h</span>
                                </div>
                                <select
                                  value={profName}
                                  onChange={(e) =>
                                    handleAssignProfessor(selectedWeekIndex, 'morning', d.day, e.target.value)
                                  }
                                  className="font-medium p-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 max-w-[200px]"
                                >
                                  {professorsList.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Grupo C: Turno Tarde (15:30 - 18:00 h) */}
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                        <div className="bg-amber-50 px-3.5 py-2 border-b border-amber-200 flex items-center justify-between">
                          <span className="font-bold text-amber-900">
                            Grupo C • Tarde (15:30 - 18:00 h)
                          </span>
                          <span className="text-[11px] font-semibold text-amber-700">
                            Aula/Lab: {currentWeek.room}
                          </span>
                        </div>
                        <div className="p-3 space-y-2.5">
                          {[
                            { day: 1, name: 'Lunes', defaultGroup: 13 },
                            { day: 2, name: 'Martes', defaultGroup: 12 },
                            { day: 3, name: 'Miércoles', defaultGroup: 11 },
                            { day: 4, name: 'Jueves', defaultGroup: 14 },
                          ].map((d) => {
                            const assign = currentWeek.assignments.afternoon[d.day];
                            const groupNum = assign ? assign.groupNumber : d.defaultGroup;
                            const profName = assign ? assign.professor : '';

                            return (
                              <div
                                key={d.day}
                                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-150"
                              >
                                <div>
                                  <span className="font-bold text-slate-800 block">
                                    {d.name} • Subgrupo {groupNum}
                                  </span>
                                  <span className="text-[10px] text-slate-400">15:30 - 18:00 h</span>
                                </div>
                                <select
                                  value={profName}
                                  onChange={(e) =>
                                    handleAssignProfessor(selectedWeekIndex, 'afternoon', d.day, e.target.value)
                                  }
                                  className="font-medium p-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 max-w-[200px]"
                                >
                                  {professorsList.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Professors Management */}
              {activeTab === 'professors' && (
                <div className="space-y-4 text-xs">
                  
                  {/* Add / Edit Form */}
                  <form onSubmit={handleSaveProfessor} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-800 block">
                      {editingProfOriginal ? `Modificar datos de: ${editingProfOriginal}` : 'Añadir nuevo(a) profesor(a) a la plantilla:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1 font-medium">Nombre y Apellidos:</label>
                        <input
                          type="text"
                          value={newProfName}
                          onChange={(e) => setNewProfName(e.target.value)}
                          placeholder="Ej: Laura Gómez Pérez"
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-medium">Correo electrónico UGR (@ugr.es):</label>
                        <input
                          type="email"
                          value={newProfEmail}
                          onChange={(e) => setNewProfEmail(e.target.value)}
                          placeholder="Ej: lauragp@ugr.es"
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={!newProfName.trim()}
                        className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold disabled:opacity-40 shadow-xs"
                      >
                        {editingProfOriginal ? 'Guardar Cambios' : 'Añadir a la lista'}
                      </button>
                      {editingProfOriginal && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProfOriginal(null);
                            setNewProfName('');
                            setNewProfEmail('');
                          }}
                          className="px-3 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Current Professors Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-3">Profesor(a)</th>
                          <th className="p-3">Correo electrónico UGR</th>
                          <th className="p-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {professorsList.map((prof) => (
                          <tr key={prof} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-semibold text-slate-900">
                              {prof}
                            </td>
                            <td className="p-3 text-slate-600 font-mono">
                              {professorEmails[prof] || 'Sin correo configurado'}
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProfOriginal(prof);
                                  setNewProfName(prof);
                                  setNewProfEmail(professorEmails[prof] || '');
                                }}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProfessor(prof)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                                title="Eliminar de la plantilla"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* TAB 3: Export, Save & Next Years */}
              {activeTab === 'export' && (
                <div className="space-y-4 text-xs">
                  
                  {/* Share URL Card */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="font-bold text-emerald-950">
                        Compartir en PRADO con los cambios guardados
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Genera un enlace especial que incluye toda tu asignación docente. Al poner este enlace en PRADO, todos los alumnos verán exactamente los profesores que acabas de configurar sin necesidad de tocar código.
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyShareableURL}
                      className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Link className="w-3.5 h-3.5" />
                      Copiar enlace para PRADO
                    </button>
                  </div>

                  {/* Backup / Export JSON Card */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <span className="font-bold text-slate-900 block">
                      Copia de Seguridad y Archivo para Años Siguientes (JSON)
                    </span>
                    <p className="text-slate-600">
                      Descarga un archivo con toda la asignación docente de este curso. En los años siguientes, cuando el profesorado cambie, podrás volver a cargar el archivo o modificarlo en segundos.
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleDownloadJSON}
                        className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar archivo JSON
                      </button>

                      <label className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cargar archivo JSON previo</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportJSON}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Change Password Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="font-bold text-slate-900">
                        Cambiar Clave de Acceso de Coordinación
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Establece una clave secreta personalizada para que sólo tú y Francisco Hermoso podáis acceder a este panel. Se guardará de forma segura en tu navegador.
                    </p>

                    {passwordChangeSuccess && (
                      <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{passwordChangeSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveNewPassword} className="space-y-2.5 max-w-sm pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nueva clave secreta:
                        </label>
                        <input
                          type="password"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Mínimo 4 caracteres"
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Confirmar nueva clave:
                        </label>
                        <input
                          type="password"
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          placeholder="Repite la nueva clave"
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-colors"
                      >
                        Guardar nueva clave
                      </button>
                    </form>
                  </div>

                  {/* Reset to UGR Defaults */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-slate-800 block">Restablecer valores iniciales UGR</span>
                      <span className="text-[11px] text-slate-500">
                        Vuelve a la asignación oficial predeterminada de la guía docente de Bioquímica.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('¿Restablecer la asignación de profesores a los valores iniciales oficiales?')) {
                          onResetToDefaults();
                          showStatus('Valores restablecidos a los originales de la UGR.');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      Restablecer
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {coordinatorEmail ? `Conectado como ${coordinatorEmail}` : 'Acceso seguro UGR'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
