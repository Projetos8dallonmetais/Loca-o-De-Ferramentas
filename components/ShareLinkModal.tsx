import React, { useState, useCallback } from 'react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: string;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ isOpen, onClose, link }) => {
  const [copySuccess, setCopySuccess] = useState('');

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess('Link copiado!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Falha ao copiar.');
       setTimeout(() => setCopySuccess(''), 2000);
    });
  }, [link]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Compartilhar Relatório do Fornecedor
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Envie este link para o fornecedor. Ele terá acesso a um relatório somente leitura com os itens alugados.
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={link}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition"
            >
              {copySuccess ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          {copySuccess && <p className="text-sm text-green-600 mt-2">{copySuccess}</p>}
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;