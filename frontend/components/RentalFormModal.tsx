
import React, { useState, useEffect } from 'react';
import { RentalItem, RentalRateOption, UsageType } from '../types';

interface RentalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rental: Omit<RentalItem, 'id' | 'status' | 'receiptUrl'> & { id?: string }) => void;
  rental: RentalItem | null;
}

const RentalFormModal: React.FC<RentalFormModalProps> = ({ isOpen, onClose, onSave, rental }) => {
  const [formData, setFormData] = useState({
    supplier: '',
    description: '',
    sector: '',
    dailyRate: '0',
    weeklyRate: '0',
    monthlyRate: '0',
    rateOption: RentalRateOption.Daily,
    rentalDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    project: '',
    requester: '',
    usageType: UsageType.Internal,
    receiptName: '',
    observations: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    if (rental) {
      setFormData({
        supplier: rental.supplier,
        description: rental.description,
        sector: rental.sector,
        dailyRate: String(rental.dailyRate),
        weeklyRate: String(rental.weeklyRate),
        monthlyRate: String(rental.monthlyRate),
        rateOption: rental.rateOption,
        rentalDate: rental.rentalDate,
        returnDate: rental.returnDate || '',
        project: rental.project,
        requester: rental.requester,
        usageType: rental.usageType,
        receiptName: rental.receiptName || '',
        observations: rental.observations || '',
      });
      setReceiptFile(rental.receipt || null);
    } else {
      // Reset form for new entry
      setFormData({
        supplier: '',
        description: '',
        sector: '',
        dailyRate: '0',
        weeklyRate: '0',
        monthlyRate: '0',
        rateOption: RentalRateOption.Daily,
        rentalDate: new Date().toISOString().split('T')[0],
        returnDate: '',
        project: '',
        requester: '',
        usageType: UsageType.Internal,
        receiptName: '',
        observations: '',
      });
      setReceiptFile(null);
    }
  }, [rental, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setFormData(prev => ({ ...prev, receiptName: file.name }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: rental?.id,
      ...formData,
      dailyRate: parseFloat(formData.dailyRate) || 0,
      weeklyRate: parseFloat(formData.weeklyRate) || 0,
      monthlyRate: parseFloat(formData.monthlyRate) || 0,
      receipt: receiptFile || undefined,
      returnDate: formData.returnDate || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{rental ? 'Editar Locação' : 'Nova Locação'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Fornecedor</label>
                <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição do Item/Ferramenta</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Setor</label>
                <input type="text" name="sector" value={formData.sector} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor Diária (R$)</label>
                    <input type="number" name="dailyRate" value={formData.dailyRate} onChange={handleChange} step="0.01" min="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor Semanal (R$)</label>
                    <input type="number" name="weeklyRate" value={formData.weeklyRate} onChange={handleChange} step="0.01" min="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor Mensal (R$)</label>
                    <input type="number" name="monthlyRate" value={formData.monthlyRate} onChange={handleChange} step="0.01" min="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700">Opção Escolhida</label>
                    <select name="rateOption" value={formData.rateOption} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
                      <option value={RentalRateOption.Daily}>Diária</option>
                      <option value={RentalRateOption.Weekly}>Semanal</option>
                      <option value={RentalRateOption.Monthly}>Mensal</option>
                    </select>
                  </div>
              </div>
              
               <div>
                <label className="block text-sm font-medium text-gray-700">Data de Locação</label>
                <input type="date" name="rentalDate" value={formData.rentalDate} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700">Data de Devolução</label>
                <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700">Projeto / Descrição</label>
                <input type="text" name="project" value={formData.project} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Solicitante</label>
                <input type="text" name="requester" value={formData.requester} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Uso</label>
                <select name="usageType" value={formData.usageType} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                  <option value={UsageType.Internal}>Interno</option>
                  <option value={UsageType.ThirdParty}>Terceiro</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Anexo (Nota de Locação)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                                <span>Carregar um arquivo</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                        </div>
                        {formData.receiptName && <p className="text-sm text-gray-500">{formData.receiptName}</p>}
                    </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Observações / Comentários</label>
                <textarea name="observations" value={formData.observations} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
              </div>

            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="py-2 px-4 bg-emerald-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-emerald-700">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentalFormModal;