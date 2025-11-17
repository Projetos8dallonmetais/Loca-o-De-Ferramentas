import { RentalItem, StoredUser, User, RentalStatus, RentalRateOption, UsageType } from '../types';

// --- SIMULATED DATABASE ---
// In a real app, this data would come from a backend server connected to a database.
// For now, we use localStorage for users and mock data for rentals.

const MOCK_DATA: RentalItem[] = [
  {
    id: '1',
    supplier: 'Fornecedor A',
    description: 'Martelo Demolidor',
    sector: 'Construção Pesada',
    dailyRate: 50,
    weeklyRate: 250,
    monthlyRate: 800,
    rateOption: RentalRateOption.Daily,
    rentalDate: '2024-07-10',
    project: 'Obra 123 - Torre Norte',
    requester: 'João Silva',
    usageType: UsageType.Internal,
    observations: 'Ferramenta em bom estado.',
    status: RentalStatus.Rented,
  },
  {
    id: '2',
    supplier: 'Fornecedor B',
    description: 'Andaime Tubular 2m',
    sector: 'Estruturas',
    dailyRate: 20,
    weeklyRate: 100,
    monthlyRate: 350,
    rateOption: RentalRateOption.Monthly,
    rentalDate: '2024-06-15',
    returnDate: '2024-07-15',
    project: 'Reforma Fachada Ed. Central',
    requester: 'Maria Oliveira',
    usageType: UsageType.ThirdParty,
    status: RentalStatus.Returned,
  },
  {
    id: '3',
    supplier: 'Fornecedor A',
    description: 'Betoneira 400L',
    sector: 'Fundação',
    dailyRate: 80,
    weeklyRate: 400,
    monthlyRate: 1200,
    rateOption: RentalRateOption.Weekly,
    rentalDate: '2024-07-20',
    project: 'Fundação Bloco C',
    requester: 'Carlos Pereira',
    usageType: UsageType.Internal,
    status: RentalStatus.Rented,
  },
];

// Let's use an in-memory store for rentals for this simulation, which resets on page load.
// A real backend would persist this.
let rentalDataStore: RentalItem[] = MOCK_DATA;


// --- HELPER FUNCTIONS ---

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- USERS API ---

export const getUsers = async (): Promise<StoredUser[]> => {
    await simulateDelay(200);
    try {
        const storedUsers = localStorage.getItem('rental_users');
        if (storedUsers) {
            return JSON.parse(storedUsers);
        } else {
            const defaultAdmin: StoredUser = {
                email: 'projetos8.metais@dallon.com.br',
                password_very_insecure: 'Dallon-25',
                role: 'admin',
            };
            localStorage.setItem('rental_users', JSON.stringify([defaultAdmin]));
            return [defaultAdmin];
        }
    } catch (error) {
        console.error("Failed to access localStorage for users:", error);
        return [];
    }
};

export const saveUsers = async (users: StoredUser[]): Promise<void> => {
    await simulateDelay(200);
    localStorage.setItem('rental_users', JSON.stringify(users));
};

export const login = async (email: string, password_very_insecure: string): Promise<User | null> => {
    await simulateDelay(500);
    const users = await getUsers();
    const foundUser = users.find(u => u.email === email && u.password_very_insecure === password_very_insecure);
    if (foundUser) {
        const activeUser: User = { email: foundUser.email, role: foundUser.role };
        sessionStorage.setItem('rental_session', JSON.stringify(activeUser));
        return activeUser;
    }
    return null;
};

export const logout = (): void => {
    sessionStorage.removeItem('rental_session');
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

export const getRentals = async (): Promise<RentalItem[]> => {
    await simulateDelay(500); // Simulate network latency
    // In a real app, this would be: `const response = await fetch('/api/rentals'); return response.json();`
    return [...rentalDataStore];
};

export const saveRental = async (rentalData: Omit<RentalItem, 'id' | 'status' | 'receiptUrl'> & { id?: string }): Promise<RentalItem> => {
    await simulateDelay(300);
    const newStatus = rentalData.returnDate ? RentalStatus.Returned : RentalStatus.Rented;
    const receiptUrl = rentalData.receipt ? URL.createObjectURL(rentalData.receipt) : undefined;

    if (rentalData.id) {
        const index = rentalDataStore.findIndex(r => r.id === rentalData.id);
        if (index > -1) {
            const oldRental = rentalDataStore[index];
            if (oldRental.receiptUrl && rentalData.receipt) {
                URL.revokeObjectURL(oldRental.receiptUrl);
            }
            const updatedRental = { ...oldRental, ...rentalData, status: newStatus, receiptUrl: receiptUrl ?? oldRental.receiptUrl };
            rentalDataStore[index] = updatedRental;
            return updatedRental;
        }
    }
    
    const newRental: RentalItem = {
        ...rentalData,
        id: crypto.randomUUID(),
        status: newStatus,
        receiptUrl: receiptUrl,
    };
    rentalDataStore = [newRental, ...rentalDataStore];
    return newRental;
};

export const deleteRental = async (id: string): Promise<void> => {
    await simulateDelay(300);
    const rentalToDelete = rentalDataStore.find(r => r.id === id);
    if (rentalToDelete?.receiptUrl) {
      URL.revokeObjectURL(rentalToDelete.receiptUrl);
    }
    rentalDataStore = rentalDataStore.filter(r => r.id !== id);
};

export const toggleRentalStatus = async (id: string): Promise<RentalItem | null> => {
    await simulateDelay(100);
    const index = rentalDataStore.findIndex(r => r.id === id);
    if (index > -1) {
        const rental = rentalDataStore[index];
        const isReturning = rental.status === RentalStatus.Rented;
        const updatedRental = {
            ...rental,
            status: isReturning ? RentalStatus.Returned : RentalStatus.Rented,
            returnDate: isReturning ? new Date().toISOString().split('T')[0] : undefined,
        };
        rentalDataStore[index] = updatedRental;
        return updatedRental;
    }
    return null;
};

// --- BUSINESS LOGIC --- (Can also be in its own file)

export const calculateCost = (rental: RentalItem): number => {
    const startDate = new Date(rental.rentalDate);
    const endDate = rental.returnDate ? new Date(rental.returnDate) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (startDate.getTime() === endDate.getTime()) diffDays = 1;
    if (diffDays <= 0) diffDays = 1;

    switch (rental.rateOption) {
      case RentalRateOption.Daily:
        return diffDays * rental.dailyRate;
      case RentalRateOption.Weekly:
        return Math.ceil(diffDays / 7) * rental.weeklyRate;
      case RentalRateOption.Monthly:
        return Math.ceil(diffDays / 30) * rental.monthlyRate;
      default:
        return 0;
    }
};
