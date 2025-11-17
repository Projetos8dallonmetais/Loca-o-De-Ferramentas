import { RentalItem, StoredUser, User, RentalStatus, RentalRateOption, UsageType } from '../types';

// URL base do seu servidor backend.
// Em um ambiente de produção, isso viria de uma variável de ambiente.
const API_BASE_URL = 'http://localhost:3001/api';

// --- HELPER FUNCTIONS ---

// Função para armazenar a sessão do usuário no sessionStorage do navegador
const setSession = (user: User | null) => {
    if (user) {
        sessionStorage.setItem('rental_session', JSON.stringify(user));
    } else {
        sessionStorage.removeItem('rental_session');
    }
};


// --- USERS API ---

export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Falha ao buscar usuários');
    return response.json();
};

export const addUser = async (user: StoredUser): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: user.email,
            password: user.password_very_insecure, // O backend irá hashear
            role: user.role,
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao adicionar usuário');
    }
};


export const deleteUser = async (email: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        throw new Error('Falha ao deletar usuário');
    }
};


export const login = async (email: string, password_very_insecure: string): Promise<User | null> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password_very_insecure }),
    });

    if (response.ok) {
        const user: User = await response.json();
        setSession(user);
        return user;
    }

    setSession(null);
    return null;
};

export const logout = (): void => {
    setSession(null);
};

export const getSession = (): User | null => {
    try {
        const sessionUserJson = sessionStorage.getItem('rental_session');
        return sessionUserJson ? JSON.parse(sessionUserJson) : null;
    } catch (error) {
        return null;
    }
};


// --- RENTALS API ---

// Mapeia os dados do backend (com receiptUrl já montado) para o tipo RentalItem do frontend
const mapApiToRentalItem = (apiRental: any): RentalItem => ({
    id: apiRental.id,
    supplier: apiRental.supplier,
    description: apiRental.description,
    sector: apiRental.sector,
    dailyRate: parseFloat(apiRental.daily_rate || apiRental.dailyRate),
    weeklyRate: parseFloat(apiRental.weekly_rate || apiRental.weeklyRate),
    monthlyRate: parseFloat(apiRental.monthly_rate || apiRental.monthlyRate),
    rateOption: apiRental.rate_option || apiRental.rateOption,
    rentalDate: new Date(apiRental.rental_date || apiRental.rentalDate).toISOString().split('T')[0],
    returnDate: (apiRental.return_date || apiRental.returnDate) ? new Date(apiRental.return_date || apiRental.returnDate).toISOString().split('T')[0] : undefined,
    project: apiRental.project,
    requester: apiRental.requester,
    usageType: apiRental.usage_type || apiRental.usageType,
    receiptName: apiRental.receipt_name || apiRental.receiptName,
    receiptUrl: apiRental.receiptUrl ? `${API_BASE_URL.replace('/api', '')}${apiRental.receiptUrl}` : undefined,
    observations: apiRental.observations,
    status: apiRental.status,
});

export const getRentals = async (): Promise<RentalItem[]> => {
    const response = await fetch(`${API_BASE_URL}/rentals`);
    if (!response.ok) throw new Error('Falha ao buscar locações');
    const data = await response.json();
    return data.map(mapApiToRentalItem);
};

export const saveRental = async (rentalData: Omit<RentalItem, 'id' | 'status' | 'receiptUrl'> & { id?: string }): Promise<RentalItem> => {
    const formData = new FormData();
    // Adiciona todos os campos ao FormData
    Object.entries(rentalData).forEach(([key, value]) => {
        if (key === 'receipt' && value instanceof File) {
            formData.append(key, value);
        } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });

    const url = rentalData.id ? `${API_BASE_URL}/rentals/${rentalData.id}` : `${API_BASE_URL}/rentals`;
    const method = rentalData.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method: method,
        body: formData, // Não defina Content-Type, o navegador fará isso por você para multipart/form-data
    });

    if (!response.ok) {
        throw new Error('Falha ao salvar locação');
    }
    const savedData = await response.json();
    return mapApiToRentalItem(savedData);
};


export const deleteRental = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/rentals/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        throw new Error('Falha ao deletar locação');
    }
};

export const toggleRentalStatus = async (id: string): Promise<RentalItem | null> => {
    const response = await fetch(`${API_BASE_URL}/rentals/${id}/toggle-status`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Falha ao alterar status');
    }
    const updatedData = await response.json();
    return mapApiToRentalItem(updatedData);
};


// --- BUSINESS LOGIC --- (Pode continuar aqui, pois é lógica pura)

export const calculateCost = (rental: RentalItem): number => {
    // A data de devolução agora é a data atual se não estiver definida
    const startDate = new Date(`${rental.rentalDate}T00:00:00`);
    const endDate = rental.returnDate ? new Date(`${rental.returnDate}T00:00:00`) : new Date();
    
    // Zera as horas para garantir que a diferença seja em dias completos
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    // Se a data de devolução for antes da data de locação (erro de entrada), não calcula custo
    if (endDate < startDate) {
        return 0;
    }

    const diffTime = endDate.getTime() - startDate.getTime();
    // Adiciona 1 para incluir o dia de início na contagem
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    switch (rental.rateOption) {
      case RentalRateOption.Daily:
        return diffDays * rental.dailyRate;
      case RentalRateOption.Weekly:
        // Calcula o número de "semanas cheias" ou parciais
        return Math.ceil(diffDays / 7) * rental.weeklyRate;
      case RentalRateOption.Monthly:
        // Usa uma média de 30.44 dias por mês para um cálculo mais justo
        return Math.ceil(diffDays / 30.44) * rental.monthlyRate;
      default:
        return 0;
    }
};