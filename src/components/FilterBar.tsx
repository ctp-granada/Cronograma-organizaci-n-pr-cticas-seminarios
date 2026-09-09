import React from 'react';
import { Search, Filter, X, User, Users, MapPin, Sparkles } from 'lucide-react';
import { FilterState } from '../types';
import { PROFESSORS_LIST, PROFESSOR_EMAILS } from '../data/curriculumData';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  selectedMonthIndex: number | null; // null = all months, or 8 (Sep), 9 (Oct), 10 (Nov), 11 (Dec)
  onMonthSelect: (monthIndex: number | null) => void;
  totalSessionsCount: number;
  filteredSessionsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  selectedMonthIndex,
  onMonthSelect,
  totalSessionsCount,
  filteredSessionsCount,
}) => {
  const months = [
    { label: 'Todos los Meses', index: null },
    { label: 'Septiembre', index: 8 },
    { label: 'Octubre', index: 9 },
    { label: 'Noviembre', index: 10 },
    { label: 'Diciembre', index: 11 },
  ];

  const groupsList = [
    { label: 'Todos los grupos', value: '' },
    { label: 'Grupo B (Mañana: 6, 7, 8, 9, 10)', value: 'B' },
    { label: 'Grupo C (Tarde: 11, 12, 13, 14)', value: 'C' },
    { label: 'Subgrupo 6 (Viernes M)', value: '6' },
    { label: 'Subgrupo 7 (Lunes M)', value: '7' },
    { label: 'Subgrupo 8 (Martes M)', value: '8' },
    { label: 'Subgrupo 9 (Miércoles M)', value: '9' },
    { label: 'Subgrupo 10 (Jueves M)', value: '10' },
    { label: 'Subgrupo 11 (Miércoles T)', value: '11' },
    { label: 'Subgrupo 12 (Martes T)', value: '12' },
    { label: 'Subgrupo 13 (Lunes T)', value: '13' },
    { label: 'Subgrupo 14 (Jueves T)', value: '14' },
  ];

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    Boolean(filters.selectedProfessor) ||
    Boolean(filters.selectedGroup) ||
    Boolean(filters.selectedShift) ||
    Boolean(filters.selectedRoom) ||
    Boolean(filters.selectedActivityType) ||
    selectedMonthIndex !== null;

  const resetFilters = () => {
    onFilterChange({
      searchQuery: '',
      selectedProfessor: '',
      selectedGroup: '',
      selectedShift: '',
      selectedActivityType: '',
      selectedRoom: '',
    });
    onMonthSelect(null);
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        
        {/* Month Quick Select Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-semibold text-slate-500 mr-1.5 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Mes:
            </span>
            {months.map((m) => {
              const isActive = selectedMonthIndex === m.index;
              return (
                <button
                  key={m.label}
                  type="button"
                  id={`btn-month-${m.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onMonthSelect(m.index)}
                  className={`px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Results Badge & Reset button */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">
              Mostrando <strong className="text-slate-900">{filteredSessionsCount}</strong> de {totalSessionsCount} sesiones
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                id="btn-reset-filters"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-medium transition-colors"
              >
                <X className="w-3 h-3" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              id="filter-search-input"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Buscar tema, práctica..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500 text-slate-800 transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Professor Filter */}
          <div className="relative">
            <select
              id="filter-professor-select"
              value={filters.selectedProfessor}
              onChange={(e) => onFilterChange({ ...filters, selectedProfessor: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500 text-slate-800 transition-colors cursor-pointer"
            >
              <option value="">👨‍🏫 Todos los Profesores</option>
              {PROFESSORS_LIST.map((prof) => (
                <option key={prof} value={prof}>
                  {prof} {PROFESSOR_EMAILS[prof] ? `(${PROFESSOR_EMAILS[prof]})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Group Filter */}
          <div className="relative">
            <select
              id="filter-group-select"
              value={filters.selectedGroup}
              onChange={(e) => onFilterChange({ ...filters, selectedGroup: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500 text-slate-800 transition-colors cursor-pointer"
            >
              {groupsList.map((g) => (
                <option key={g.label} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div className="relative">
            <select
              id="filter-shift-select"
              value={filters.selectedShift}
              onChange={(e) => onFilterChange({ ...filters, selectedShift: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500 text-slate-800 transition-colors cursor-pointer"
            >
              <option value="">⏰ Todos los Turnos</option>
              <option value="mañana">Mañana (8:30 - 11:00 h)</option>
              <option value="tarde">Tarde (15:30 - 18:00 h)</option>
            </select>
          </div>

          {/* Room Filter */}
          <div className="relative">
            <select
              id="filter-room-select"
              value={filters.selectedRoom}
              onChange={(e) => onFilterChange({ ...filters, selectedRoom: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500 text-slate-800 transition-colors cursor-pointer"
            >
              <option value="">📍 Todas las Ubicaciones</option>
              <option value="Lab 2.21">Laboratorio 2.21</option>
              <option value="Aula 2.15">Aula 2.15</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};
