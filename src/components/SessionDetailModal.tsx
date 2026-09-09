import React, { useState } from 'react';
import { ComputedSession } from '../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Award,
  BookOpen,
  Download,
  Building2,
  GraduationCap,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import { formatSpanishDate, generateICS } from '../utils/perpetualDateUtils';

interface SessionDetailModalProps {
  session: ComputedSession | null;
  onClose: () => void;
  academicYear: number;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  onClose,
  academicYear,
}) => {
  const [copied, setCopied] = useState(false);

  if (!session) return null;

  const handleCopyEmail = () => {
    if (session.professorEmail) {
      navigator.clipboard.writeText(session.professorEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSingleICS = () => {
    const icsContent = generateICS([session], `${academicYear}-${academicYear + 1}`);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Bioquimica-${session.activityCode.replace(/\s+/g, '_')}-Gr${session.groupNumber}.ics`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isMorning = session.shift === 'mañana';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-emerald-50/50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  session.activityType === 'seminario'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {session.activityCode}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Semana {session.weekIndex} • Curso {academicYear}-{academicYear + 1}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
              {session.title}
            </h3>
          </div>

          <button
            type="button"
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Info Cards */}
        <div className="p-6 space-y-4">
          
          {/* Main Grid Details */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Date & Day */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Fecha</span>
              </div>
              <p className="text-sm font-bold text-slate-900 capitalize">
                {session.dayName}, {formatSpanishDate(session.date, true)}
              </p>
            </div>

            {/* Time & Shift */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Horario y Turno</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {session.timeRange}
              </p>
              <span className="text-[11px] text-slate-500 capitalize">
                Turno de {session.shift}
              </span>
            </div>

            {/* Location / Room */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Ubicación</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {session.room}
              </p>
              <span className="text-[11px] text-slate-500">
                {session.room.includes('Lab') ? 'Laboratorio Departamental' : 'Aula Docente'}
              </span>
            </div>

            {/* Group */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Subgrupo y Grupo</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                Subgrupo {session.groupNumber}
              </p>
              <span className="text-[11px] text-slate-500">
                Grupo {session.groupLetter} (Grado Enfermería)
              </span>
            </div>

          </div>

          {/* Teacher in Charge Card with Direct Email Action */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                {session.professor.charAt(0)}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Profesor(a) Responsable
                </span>
                <span className="text-base font-bold text-slate-900 block">
                  {session.professor}
                </span>
                {session.professorEmail && (
                  <span className="text-xs text-emerald-900 font-mono flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-emerald-700" />
                    {session.professorEmail}
                  </span>
                )}
              </div>
            </div>

            {/* Email contact buttons */}
            {session.professorEmail && (
              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-200/60">
                <a
                  href={`mailto:${session.professorEmail}?subject=${encodeURIComponent(
                    `Consulta Bioquímica Enfermería - Grupo ${session.groupNumber} (${session.activityCode})`
                  )}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors"
                  title="Abrir cliente de correo"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Enviar correo</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 border border-emerald-300 transition-colors"
                  title="Copiar dirección de correo"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Student guidance note */}
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p>
              <strong>Información para el alumnado:</strong> Consulta en PRADO el guión correspondiente antes de la sesión. Para el laboratorio es obligatorio el uso de bata.
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownloadSingleICS}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Añadir a mi Calendario (.ics)
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
