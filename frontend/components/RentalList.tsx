
import React from 'react';
import { RentalItem, Role } from '../types';
import RentalListItem from './RentalListItem';

interface RentalListProps {
  rentals: RentalItem[];
  onEdit: (rental: RentalItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  calculateCost: (rental: RentalItem) => number;
  totalCost: number;
  isReadOnly: boolean;
  userRole?: Role;
}

const RentalList: React.FC<RentalListProps> = ({ rentals, onEdit, onDelete, onToggleStatus, calculateCost, totalCost, isReadOnly, userRole }) => {
  if (rentals.length === 0) {
    return <p className="text-center text-gray-500 py-10">Nenhum item de locação encontrado. Tente ajustar os filtros ou adicione um novo item.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full align-middle">
        {/* Desktop Header */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 font-semibold text-left text-sm text-gray-500 uppercase tracking-wider p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="md:col-span-2">Fornecedor</div>
            <div className="md:col-span-3">Item / Projeto</div>
            <div className="md:col-span-2">Datas</div>
            <div className="md:col-span-1 text-center">Status</div>
            <div className="md:col-span-2 text-right">Custo Estimado</div>
            <div className="md:col-span-2 text-center">Ações</div>
        </div>
        <div className="space-y-4 md:space-y-0">
            {rentals.map(rental => (
                <RentalListItem
                key={rental.id}
                rental={rental}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                calculateCost={calculateCost}
                isReadOnly={isReadOnly}
                userRole={userRole}
                />
            ))}
        </div>
         {rentals.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            {/* Desktop Total */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 font-bold text-lg text-gray-800 bg-gray-100 rounded-b-lg">
                <div className="md:col-span-8 text-right pr-4">Total Estimado:</div>
                <div className="md:col-span-2 text-right font-mono">
                  R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="md:col-span-2"></div> {/* Spacer for Ações column */}
            </div>
            {/* Mobile Total */}
            <div className="md:hidden flex justify-between items-center p-4 bg-gray-100 rounded-lg font-bold text-lg mt-4">
                <span>Total Estimado:</span>
                <span className="font-mono">
                  R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalList;