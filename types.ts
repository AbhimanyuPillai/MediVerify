export enum MedicineStatus {
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
  SUSPICIOUS = 'SUSPICIOUS',
}

export interface Medicine {
  id: string; // UUID
  name: string;
  type: string;
  manufactureDate: string;
  expiryDate: string;
  manufacturerName: string;
  manufacturerEmail: string;
  scanCount: number;
  status: MedicineStatus;
  createdAt: number;
}

export interface Alert {
  id: string;
  medicineId: string;
  issueType: string;
  timestamp: number;
  message: string;
}

// Simple internal type for toast notifications
export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}