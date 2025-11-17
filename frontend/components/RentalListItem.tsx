
import React from 'react';
import { RentalItem, RentalStatus, Role } from '../types';
import { EditIcon, DeleteIcon, CheckIcon, ReturnIcon, PaperclipIcon } from './Icons';

interface RentalListItemProps {
  rental: RentalItem;
  onEdit: (rental: RentalItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  calculateCost: (rental: RentalItem) => number;
  isReadOnly: boolean;
  userRole?: Role;
}

const RentalListItem: React.FC<RentalListItemProps> = ({ rental, onEdit, onDelete, onToggleStatus, calculateCost, isReadOnly, userRole }) => {
  const cost = calculateCost(rental);
  const statusClasses = rental.status === RentalStatus.Rented
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800';

  return (
    <div className="block md:grid md:grid-cols-12 gap-4 p-4 border rounded-lg md:border-t-0 md:rounded-none md:border-b last:border-b-0 bg-white hover:bg-gray-50 transition-colors duration-200">
      
      {/* Fornecedor */}
      <div className="md:col-span-2 flex items-center">
         <div className="md:hidden font-bold mr-2">Fornecedor:</div>
        <span className="font-semibold text-gray-800">{rental.supplier}</span>
      </div>

      {/* Item / Projeto */}
      <div className="md:col-span-3 mt-2 md:mt-0">
        <p className="font-medium text-emerald-600">{rental.description}</p>
        <p className="text-sm text-gray-500">{rental.project}</p>
        <p className="text-xs text-gray-400 italic">{rental.sector}</p>
        {rental.receiptName && rental.receiptUrl && (
            <a
              href={rental.receiptUrl}
              download={rental.receiptName}
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
              title={`Baixar recibo: ${rental.receiptName}`}
            >
              <PaperclipIcon />
              <span>{rental.receiptName}</span>
            </a>
        )}
      </div>

      {/* Datas */}
      <div className="md:col-span-2 text-sm text-gray-600 mt-2 md:mt-0">
        <p><span className="font-semibold">Locado em:</span> {new Date(`${rental.rentalDate}T00:00:00`).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
        <p>
          <span className="font-semibold">Devolvido em:</span>
          {rental.returnDate ? (
            ` ${new Date(`${rental.returnDate}T00:00:00`).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
          ) : (
            <span className="text-gray-400 italic"> Pendente</span>
          )}
        </p>
      </div>
      
      {/* Status */}
      <div className="md:col-span-1 flex items-center justify-center mt-2 md:mt-0">
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusClasses}`}>
          {rental.status === RentalStatus.Rented ? 'Alugado' : 'Devolvido'}
        </span>
      </div>

      {/* Custo */}
      <div className="md:col-span-2 flex items-center justify-end font-mono text-lg text-gray-800 mt-2 md:mt-0">
        R$ {cost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {/* Ações */}
      <div className="md:col-span-2 flex items-center justify-center space-x-2 mt-4 md:mt-0">
        {!isReadOnly && (
          <>
            <button
              onClick={() => onToggleStatus(rental.id)}
              className={`p-2 rounded-full transition-colors duration-200 ${rental.status === RentalStatus.Rented ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'}`}
              title={rental.status === RentalStatus.Rented ? 'Marcar como Devolvido' : 'Marcar como Alugado'}
            >
              {rental.status === RentalStatus.Rented ? <CheckIcon /> : <ReturnIcon />}
            </button>
            <button
              onClick={() => onEdit(rental)}
              className="p-2 rounded-full hover:bg-emerald-100 text-emerald-600 transition-colors duration-200"
              title="Editar"
            >
              <EditIcon />
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => onDelete(rental.id)}
                className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors duration-200"
                title="Excluir"
              >
                <DeleteIcon />
              </button>
            )}
          </>
        )}
         {isReadOnly && (
            <span className="text-xs text-gray-400 italic">Somente Leitura</span>
        )}
      </div>
    </div>
  );
};

export default RentalListItem;