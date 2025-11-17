import React, { useState } from 'react';
import { CheckIcon } from './Icons';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, an API call would be made here to send a reset email.
    // For this simulation, we'll just display a confirmation message.
    console.log(`Password reset link requested for: ${email}`);
    setRequestSent(true);
  };

  const handleClose = () => {
    // Reset state on close
    setEmail('');
    setRequestSent(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
            Redefinir Senha
          </h3>
          {!requestSent ? (
            <>
              <p className="mt-2 text-sm text-gray-500">
                Digite seu email e enviaremos um link para você voltar a acessar sua conta.
              </p>
              <form onSubmit={handleSubmit} className="mt-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="seuemail@exemplo.com"
                  />
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Enviar Link de Recuperação
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="mt-4 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <CheckIcon />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mt-3">Verifique seu email</h4>
                <p className="mt-2 text-sm text-gray-600">
                    Se uma conta com o email <strong>{email}</strong> existir, um link para redefinir sua senha foi enviado.
                </p>
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 text-right rounded-b-lg">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto sm:text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;