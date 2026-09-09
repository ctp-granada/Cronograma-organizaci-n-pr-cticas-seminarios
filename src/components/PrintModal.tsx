import React from 'react';
import { Printer, ExternalLink, X, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { COURSE_INFO } from '../data/curriculumData';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicYear: number;
  selectedGroup: string;
  generationDateStr: string;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  academicYear,
  selectedGroup,
  generationDateStr,
}) => {
  if (!isOpen) return null;

  const handleDirectPrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Direct print failed, likely due to iframe sandbox', e);
    }
  };

  // URL to open directly in a new standalone tab (bypassing any iframe/PRADO sandbox)
  const standaloneUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Outfit']">
                Imprimir o Guardar en PDF
              </h2>
              <p className="text-xs text-slate-400">
                Calendario Oficial de Prácticas y Seminarios
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Iframe Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>¿Por qué no se abría la ventana de impresión?</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Al estar la aplicación visualizándose <strong>dentro del marco de previsualización o incrustada en PRADO</strong>, los navegadores (Chrome, Edge, Firefox) bloquean por seguridad la función directa de imprimir desde un marco interno.
            </p>
          </div>

          {/* Document Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Documento preparado para impresión A4:</span>
            </div>
            <ul className="space-y-1 text-slate-600 pl-5 list-disc">
              <li><strong>Asignatura:</strong> {COURSE_INFO.subject} ({COURSE_INFO.degree})</li>
              <li><strong>Curso Académico:</strong> {academicYear} - {academicYear + 1}</li>
              <li><strong>Filtro de grupo:</strong> {selectedGroup ? `Solo Subgrupo ${selectedGroup}` : 'Todos los subgrupos (Matriz completa)'}</li>
              <li><strong>Encabezado oficial UGR:</strong> Incluye fecha y hora ({generationDateStr})</li>
            </ul>
          </div>

          {/* Recommended Action: Open standalone and print */}
          <div className="space-y-2.5 pt-1">
            <a
              href={standaloneUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                // Also give user feedback
                setTimeout(() => {
                  onClose();
                }, 800);
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 text-center"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir en Pestaña Nueva para Imprimir / PDF (Recomendado)</span>
            </a>

            <button
              type="button"
              onClick={handleDirectPrint}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Intentar imprimir directamente en esta ventana</span>
            </button>
          </div>

          {/* Keyboard tip */}
          <div className="text-center text-[11px] text-slate-500 pt-1">
            💡 Consejo: También puedes pulsar <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded font-mono font-bold text-slate-800">Ctrl + P</kbd> (o <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded font-mono font-bold text-slate-800">⌘ + P</kbd> en Mac).
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
