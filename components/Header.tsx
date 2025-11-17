import React from 'react';
import { User } from '../types';
import { LogoutIcon, UserManagementIcon } from './Icons';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    isReadOnly: boolean;
    supplierName: string | null;
    onManageUsers: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, isReadOnly, supplierName, onManageUsers }) => {
  const getUserDisplayName = () => {
      if (!user) return '';
      return user.role === 'admin' ? 'Desenvolvedor' : 'Utilizador';
  }
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-emerald-600">
            Controle de Locações
            </h1>
            <p className="text-gray-500 mt-1">
                {isReadOnly ? `Relatório de locações para: ${supplierName}` : 'Gerencie suas ferramentas e itens alugados com facilidade.'}
            </p>
        </div>
        {user && !isReadOnly && (
            <div className="flex items-center gap-2">
                <div className="text-right">
                    <p className="font-semibold text-gray-700">{getUserDisplayName()}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                {user.role === 'admin' && (
                     <button 
                        onClick={onManageUsers}
                        className="flex items-center gap-2 bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
                        title="Gerenciar Usuários"
                    >
                        <UserManagementIcon />
                        <span className="hidden sm:inline">Usuários</span>
                    </button>
                )}
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                    title="Sair do sistema"
                >
                    <LogoutIcon />
                    <span className="hidden sm:inline">Sair</span>
                </button>
            </div>
        )}
      </div>
       {isReadOnly && (
        <div className="bg-yellow-100 border-t border-b border-yellow-200">
            <div className="container mx-auto px-4 md:px-8 py-2 text-center text-sm text-yellow-800 font-semibold">
                Modo de visualização. As ações de edição estão desabilitadas.
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;