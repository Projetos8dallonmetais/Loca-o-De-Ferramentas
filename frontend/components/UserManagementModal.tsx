import React, { useState } from 'react';
import { StoredUser, Role, User } from '../types';
import { DeleteIcon } from './Icons';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[]; // Agora recebe User, não StoredUser
  onAddUser: (user: StoredUser) => void;
  onDeleteUser: (email: string) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose, users, onAddUser, onDeleteUser }) => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('user');
  const [error, setError] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newUserEmail || !newUserPassword) {
        setError('Email e senha são obrigatórios.');
        return;
    }
    
    // A verificação de email duplicado agora é feita pelo backend
    
    const newUser: StoredUser = {
      email: newUserEmail,
      password_very_insecure: newUserPassword,
      role: newUserRole,
    };

    onAddUser(newUser);
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('user');
  };
  
  const handleDeleteUser = (emailToDelete: string) => {
    // Prevent admin from deleting themselves
    if (emailToDelete === 'projetos8.metais@dallon.com.br') {
        alert('Não é possível remover o administrador principal.');
        return;
    }
    if (window.confirm(`Tem certeza que deseja remover o usuário ${emailToDelete}?`)) {
        onDeleteUser(emailToDelete);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h2>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {/* Add user form */}
          <form onSubmit={handleAddUser} className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Adicionar Novo Usuário</h3>
            {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-3">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                    type="email" 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <input 
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="********"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Nível de Acesso</label>
                <select 
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="user">Utilizador</option>
                  <option value="admin">Desenvolvedor</option>
                </select>
              </div>
            </div>
             <button type="submit" className="mt-4 w-full md:w-auto py-2 px-4 bg-emerald-600 text-white font-semibold rounded-md shadow-sm hover:bg-emerald-700">
                Adicionar Usuário
            </button>
          </form>

          {/* Users list */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Usuários Cadastrados</h3>
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.email} className="flex justify-between items-center p-3 bg-white border rounded-md">
                  <div>
                    <p className="font-semibold text-gray-800">{user.email}</p>
                    <p className="text-sm text-gray-500">{user.role === 'admin' ? 'Desenvolvedor' : 'Utilizador'}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteUser(user.email)} 
                    className="p-2 rounded-full hover:bg-red-100 text-red-600"
                    title={`Excluir ${user.email}`}
                    disabled={user.email === 'projetos8.metais@dallon.com.br'}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;
