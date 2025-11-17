import React from 'react';
import { RentalStatus } from '../types';
import { ShareIcon, ExportIcon } from './Icons';

interface FilterControlsProps {
  suppliers: string[];
  filterSupplier: string;
  setFilterSupplier: (supplier: string) => void;
  projects: string[];
  filterProject: string;
  setFilterProject: (project: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterDatePreset: 'all' | 'last30days';
  setFilterDatePreset: (preset: 'all' | 'last30days') => void;
  filterCustomDate: string;
  setFilterCustomDate: (date: string) => void;
  onShareRequest: () => void;
  onExportCSV: () => void;
  isActionsDisabled: boolean;
  isExportDisabled: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  suppliers,
  filterSupplier,
  setFilterSupplier,
  projects,
  filterProject,
  setFilterProject,
  filterStatus,
  setFilterStatus,
  filterDatePreset,
  setFilterDatePreset,
  filterCustomDate,
  setFilterCustomDate,
  onShareRequest,
  onExportCSV,
  isActionsDisabled,
  isExportDisabled
}) => {

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterDatePreset(e.target.value as 'all' | 'last30days');
    setFilterCustomDate('');
  };
  
  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterCustomDate(e.target.value);
    setFilterDatePreset('all');
  };

  const commonClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500";
  const disabledClasses = "disabled:bg-gray-200 disabled:cursor-not-allowed";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
      <div>
        <label htmlFor="supplier-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Fornecedor
        </label>
        <select
          id="supplier-filter"
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.target.value)}
          className={`${commonClasses} ${disabledClasses}`}
          disabled={isActionsDisabled}
        >
          {suppliers.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'Todos Fornecedores' : s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Projeto
        </label>
        <select
          id="project-filter"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className={`${commonClasses} ${disabledClasses}`}
          disabled={isActionsDisabled}
        >
          {projects.map(p => (
            <option key={p} value={p}>{p === 'all' ? 'Todos Projetos' : p}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${commonClasses} ${disabledClasses}`}
            disabled={isActionsDisabled}
        >
            <option value="all">Todos</option>
            <option value={RentalStatus.Rented}>Alugado</option>
            <option value={RentalStatus.Returned}>Devolvido</option>
        </select>
      </div>
      <div>
        <label htmlFor="date-preset-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Período
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
            <select
              id="date-preset-filter"
              value={filterDatePreset}
              onChange={handlePresetChange}
              className={`${commonClasses} ${disabledClasses}`}
              disabled={isActionsDisabled}
            >
              <option value="all">Todos</option>
              <option value="last30days">Últimos 30 dias</option>
            </select>
            <input
              type="date"
              value={filterCustomDate}
              onChange={handleCustomDateChange}
              aria-label="Selecionar dia específico"
              className={`${commonClasses} ${disabledClasses}`}
              disabled={isActionsDisabled}
            />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0 md:opacity-100 pointer-events-none">
          Ações
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
              onClick={onShareRequest}
              disabled={isActionsDisabled || filterSupplier === 'all'}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-teal-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title={filterSupplier === 'all' ? 'Selecione um fornecedor para compartilhar' : 'Compartilhar relatório do fornecedor'}
          >
              <ShareIcon />
              Compartilhar
          </button>
          <button
              onClick={onExportCSV}
              disabled={isActionsDisabled || isExportDisabled}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-emerald-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title={isExportDisabled ? 'Não há dados para exportar' : 'Exportar dados filtrados para CSV'}
          >
              <ExportIcon />
              Exportar CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;