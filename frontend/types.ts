export enum RentalRateOption {
  Daily = 'diaria',
  Weekly = 'semanal',
  Monthly = 'mensal',
}

export enum UsageType {
  Internal = 'interno',
  ThirdParty = 'terceiro',
}

export enum RentalStatus {
  Rented = 'alugado',
  Returned = 'devolvido',
}

export type Role = 'admin' | 'user';

export interface User {
  email: string;
  role: Role;
}

export interface StoredUser extends User {
  password_very_insecure: string; 
}

export interface RentalItem {
  id: string;
  supplier: string;
  description: string;
  sector: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  rateOption: RentalRateOption;
  rentalDate: string;
  returnDate?: string;
  project: string;
  requester: string;
  usageType: UsageType;
  receipt?: File;
  receiptName?: string;
  receiptUrl?: string;
  observations?: string;
  status: RentalStatus;
}
