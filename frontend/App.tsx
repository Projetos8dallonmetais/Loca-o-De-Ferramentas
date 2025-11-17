import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { RentalItem, User, StoredUser } from './types';
import Header from './components/Header';
import RentalList from './components/RentalList';
import RentalFormModal from './components/RentalFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import FilterControls from './components/FilterControls';
import LoginScreen from './components/LoginScreen';
import ShareLinkModal from './components/ShareLinkModal';
import UserManagementModal from './components/UserManagementModal';
import ProjectReport from './components/ProjectReport';
import { PlusIcon } from './components/Icons';
import * as api from './services/api';

const App: React.FC = () => {
  // App Data State
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalItem | null>(null);
  const [deletingRentalId, setDeletingRentalId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [view, setView] = useState<'list' | 'report'>('list');

  // Filter State
  const [filterSupplier, setFilterSupplier] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDatePreset, setFilterDatePreset] = useState<'all' | 'last30days'>('all');
  const [filterCustomDate, setFilterCustomDate] = useState<string>('');

  // Auth & View Mode State
  const [user, setUser] = useState<User | null>(null);
  const [isReadOnlyView, setIsReadOnlyView] = useState(false);
  const [readOnlySupplierName, setReadOnlySupplierName] = useState<string | null>(null);

  const fetchAppData = async (currentUser: User | null) => {
    setLoading(true);
    try {
      const storedRentals = await api.getRentals();
      setRentals(storedRentals);
      if (currentUser?.role === 'admin') {
        const storedUsers = await api.getUsers();
        setUsers(storedUsers);
      }
    } catch (error) {
      console.error("Failed to fetch app data:", error);
      alert('Não foi possível carregar os dados da aplicação. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeApp = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/view?supplier=')) {
        const supplierName = decodeURIComponent(hash.substring('#/view?supplier='.length));
        setIsReadOnlyView(true);
        setReadOnlySupplierName(supplierName);
        setFilterSupplier(supplierName);
        setUser(null);
        fetchAppData(null);
      } else {
        setIsReadOnlyView(false);
        setReadOnlySupplierName(null);
        const sessionUser = api.getSession();
        if (sessionUser) {
          setUser(sessionUser);
          fetchAppData(sessionUser);
        } else {
          setLoading(false);
        }
      }
    };
    initializeApp();
    window.addEventListener('hashchange', initializeApp);
    return () => window.removeEventListener('hashchange', initializeApp);
  }, []);

  const handleLogin = async (email: string, password_very_insecure: string): Promise<boolean> => {
    setLoading(true);
    const loggedInUser = await api.login(email, password_very_insecure);
    if (loggedInUser) {
      setUser(loggedInUser);
      await fetchAppData(loggedInUser);
      return true;
    }
    setLoading(false);
    return false;
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setRentals([]);
    setUsers([]);
    window.location.hash = '';
  };

  const handleAddUser = async (newUser: StoredUser) => {
    try {
      await api.addUser(newUser);
      const updatedUsers = await api.getUsers();
      setUsers(updatedUsers);
    } catch (error) {
      alert(`Erro ao adicionar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDeleteUser = async (email: string) => {
    try {
      await api.deleteUser(email);
      setUsers(currentUsers => currentUsers.filter(u => u.email !== email));
    } catch (error) {
      alert('Falha ao deletar usuário.');
    }
  };

  const handleOpenModal = useCallback((rental: RentalItem | null = null) => {
    setEditingRental(rental);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingRental(null);
    setIsModalOpen(false);
  }, []);

  const handleSaveRental = useCallback(async (rentalData: Omit<RentalItem, 'id' | 'status' | 'receiptUrl'> & { id?: string }) => {
    try {
      const savedRental = await api.saveRental(rentalData);
      setRentals(currentRentals => {
        const exists = currentRentals.some(r => r.id === savedRental.id);
        if (exists) {
          return currentRentals.map(r => r.id === savedRental.id ? savedRental : r);
        }
        return [savedRental, ...currentRentals];
      });
      handleCloseModal();
    } catch (error) {
      alert('Falha ao salvar a locação.');
    }
  }, [handleCloseModal]);

  const handleDeleteRequest = useCallback((id: string) => {
    if (user?.role !== 'admin') return;
    setDeletingRentalId(id);
  }, [user]);

  const handleConfirmDelete = useCallback(async () => {
    if (deletingRentalId) {
      await api.deleteRental(deletingRentalId);
      setRentals(prevRentals => prevRentals.filter(r => r.id !== deletingRentalId));
      setDeletingRentalId(null);
    }
  }, [deletingRentalId]);

  const handleToggleStatus = useCallback(async (id: string) => {
    const updatedRental = await api.toggleRentalStatus(id);
    if (updatedRental) {
      setRentals(prevRentals => prevRentals.map(r => r.id === id ? updatedRental : r));
    }
  }, []);

  const handleShareRequest = () => {
    if (filterSupplier === 'all') {
      alert('Por favor, selecione um fornecedor para compartilhar.');
      return;
    }
    const baseUrl = window.location.href.split('#')[0];
    const link = `${baseUrl}#/view?supplier=${encodeURIComponent(filterSupplier)}`;
    setShareLink(link);
    setIsShareModalOpen(true);
  };

  const suppliers = useMemo(() => ['all', ...Array.from(new Set(rentals.map(r => r.supplier)))], [rentals]);
  const projects = useMemo(() => ['all', ...Array.from(new Set(rentals.map(r => r.project)))], [rentals]);

  const filteredRentals = useMemo(() => {
    return rentals.filter(rental => {
      const supplierMatch = filterSupplier === 'all' || rental.supplier === filterSupplier;
      const projectMatch = filterProject === 'all' || rental.project === filterProject;
      const statusMatch = filterStatus === 'all' || rental.status === filterStatus;
      const dateMatch = () => {
        if (filterCustomDate) {
          const selectedDate = new Date(`${filterCustomDate}T00:00:00`);
          const rentalStartDate = new Date(`${rental.rentalDate}T00:00:00`);
          const rentalEndDate = rental.returnDate ? new Date(`${rental.returnDate}T00:00:00`) : null;
          return rentalStartDate <= selectedDate && (!rentalEndDate || rentalEndDate >= selectedDate);
        }
        if (filterDatePreset === 'last30days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setHours(0, 0, 0, 0);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const rentalDate = new Date(`${rental.rentalDate}T00:00:00`);
          return rentalDate >= thirtyDaysAgo;
        }
        return true;
      };
      return supplierMatch && projectMatch && statusMatch && dateMatch();
    });
  }, [rentals, filterSupplier, filterProject, filterStatus, filterDatePreset, filterCustomDate]);

  const calculateCost = useCallback((rental: RentalItem): number => api.calculateCost(rental), []);

  const handleExportCSV = useCallback(() => {
    if (filteredRentals.length === 0) return alert('Não há dados para exportar.');
    const headers = ['Fornecedor', 'Item', 'Setor', 'Projeto', 'Solicitante', 'Uso', 'Data Locação', 'Data Devolução', 'Status', 'Opção Tarifa', 'Valor Diária (R$)', 'Valor Semanal (R$)', 'Valor Mensal (R$)', 'Custo Total (R$)', 'Observações'];
    const escapeCSV = (field: any) => `"${String(field ?? '').replace(/"/g, '""')}"`;
    const rows = filteredRentals.map(r => [
      escapeCSV(r.supplier), escapeCSV(r.description), escapeCSV(r.sector), escapeCSV(r.project), escapeCSV(r.requester), escapeCSV(r.usageType),
      new Date(`${r.rentalDate}T00:00:00`).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
      r.returnDate ? new Date(`${r.returnDate}T00:00:00`).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
      escapeCSV(r.status), escapeCSV(r.rateOption), escapeCSV(r.dailyRate.toFixed(2)), escapeCSV(r.weeklyRate.toFixed(2)), escapeCSV(r.monthlyRate.toFixed(2)),
      escapeCSV(calculateCost(r).toFixed(2)), escapeCSV(r.observations)
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_locacoes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [filteredRentals, calculateCost]);

  const totalCost = useMemo(() => filteredRentals.reduce((sum, rental) => sum + calculateCost(rental), 0), [filteredRentals, calculateCost]);
  const projectCosts = useMemo(() => Object.entries(rentals.reduce((acc, rental) => {
    acc[rental.project] = (acc[rental.project] || 0) + calculateCost(rental);
    return acc;
  }, {} as { [key: string]: number })).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total), [rentals, calculateCost]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-lg font-semibold">Carregando...</p></div>;
  if (!user && !isReadOnlyView) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <Header user={user} onLogout={handleLogout} isReadOnly={isReadOnlyView} supplierName={readOnlySupplierName} onManageUsers={() => setIsUserManagementOpen(true)} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-700">Painel de Locações {isReadOnlyView && `- ${readOnlySupplierName}`}</h2>
              {view === 'report' && <p className="text-sm text-gray-500">Análise de custos agregados por projeto</p>}
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-2">
              {!isReadOnlyView && (
                <div className="flex items-center border rounded-lg p-1 bg-gray-100">
                  <button onClick={() => setView('list')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${view === 'list' ? 'bg-white text-emerald-600 shadow' : 'text-gray-600'}`}>Lista</button>
                  <button onClick={() => setView('report')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${view === 'report' ? 'bg-white text-emerald-600 shadow' : 'text-gray-600'}`}>Relatório</button>
                </div>
              )}
              {!isReadOnlyView && view === 'list' && (
                <button onClick={() => handleOpenModal()} className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-emerald-700 transition">
                  <PlusIcon /> Nova Locação
                </button>
              )}
            </div>
          </div>
          {view === 'list' ? (
            <>
              <FilterControls suppliers={suppliers} filterSupplier={filterSupplier} setFilterSupplier={setFilterSupplier} projects={projects} filterProject={filterProject} setFilterProject={setFilterProject} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterDatePreset={filterDatePreset} setFilterDatePreset={setFilterDatePreset} filterCustomDate={filterCustomDate} setFilterCustomDate={setFilterCustomDate} onShareRequest={handleShareRequest} onExportCSV={handleExportCSV} isActionsDisabled={isReadOnlyView} isExportDisabled={filteredRentals.length === 0} />
              <RentalList rentals={filteredRentals} onEdit={handleOpenModal} onDelete={handleDeleteRequest} onToggleStatus={handleToggleStatus} calculateCost={calculateCost} totalCost={totalCost} isReadOnly={isReadOnlyView} userRole={user?.role} />
            </>
          ) : <ProjectReport projectCosts={projectCosts} />}
        </div>
      </main>
      {!isReadOnlyView && isModalOpen && <RentalFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveRental} rental={editingRental} />}
      {!isReadOnlyView && <ConfirmationModal isOpen={!!deletingRentalId} onClose={() => setDeletingRentalId(null)} onConfirm={handleConfirmDelete} title="Confirmar Exclusão" message="Você tem certeza que deseja excluir este item? Esta ação não pode ser desfeita." />}
      <ShareLinkModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} link={shareLink} />
      {!isReadOnlyView && user?.role === 'admin' && <UserManagementModal isOpen={isUserManagementOpen} onClose={() => setIsUserManagementOpen(false)} users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />}
    </div>
  );
};

export default App;
