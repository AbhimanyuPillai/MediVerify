import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medicine, MedicineStatus, Alert, ToastNotification } from './types';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  medicines: Medicine[];
  alerts: Alert[];
  addMedicine: (data: Omit<Medicine, 'id' | 'scanCount' | 'status' | 'createdAt'>) => Medicine;
  getMedicine: (id: string) => Medicine | undefined;
  incrementScan: (id: string) => Medicine | undefined;
  reportMismatch: (id: string, city: string) => void;
  toasts: ToastNotification[];
  addToast: (message: string, type: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to simulate email sending
const sendAlertEmail = (manufacturerEmail: string, issueType: string, medicineId: string, addToast: any) => {
  const message = `URGENT: Your product [${medicineId}] has been flagged for [${issueType}]. Please investigate.`;
  
  // 1. Console Log (as requested)
  console.log(`%c[EMAIL SIMULATION] To: ${manufacturerEmail}`, 'color: yellow; background: black; padding: 4px;');
  console.log(`%cSubject: Medicine Security Alert`, 'font-weight: bold;');
  console.log(`%cBody: ${message}`, 'color: cyan;');

  // 2. Toast Notification
  addToast(`Alert sent to ${manufacturerEmail}: ${issueType}`, 'error');
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedMedicines = localStorage.getItem('mediVerify_medicines');
    const storedAlerts = localStorage.getItem('mediVerify_alerts');
    
    if (storedMedicines) setMedicines(JSON.parse(storedMedicines));
    if (storedAlerts) setAlerts(JSON.parse(storedAlerts));
  }, []);

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('mediVerify_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('mediVerify_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const addToast = (message: string, type: ToastNotification['type']) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addMedicine = (data: Omit<Medicine, 'id' | 'scanCount' | 'status' | 'createdAt'>) => {
    const newMedicine: Medicine = {
      ...data,
      id: uuidv4(),
      scanCount: 0,
      status: MedicineStatus.VALID,
      createdAt: Date.now(),
    };
    setMedicines((prev) => [...prev, newMedicine]);
    addToast('Medicine registered successfully', 'success');
    return newMedicine;
  };

  const getMedicine = (id: string) => {
    return medicines.find((m) => m.id === id);
  };

  const incrementScan = (id: string) => {
    const medicine = medicines.find((m) => m.id === id);
    if (!medicine) return undefined;

    const today = new Date().toISOString().split('T')[0];
    const isExpired = today > medicine.expiryDate;
    
    let newStatus = medicine.status;
    // Check Expiry
    if (isExpired) {
      newStatus = MedicineStatus.EXPIRED;
    }

    const newScanCount = medicine.scanCount + 1;
    
    // Check Cloning (Scan Count > 10)
    if (newScanCount > 10 && newStatus !== MedicineStatus.SUSPICIOUS) {
      newStatus = MedicineStatus.SUSPICIOUS;
      const issue = "Potential Cloning (High Scan Count)";
      
      // Trigger Alert Logic
      const newAlert: Alert = {
        id: uuidv4(),
        medicineId: id,
        issueType: issue,
        timestamp: Date.now(),
        message: `System flagged ID ${id} due to excessive scans (${newScanCount}).`
      };
      setAlerts((prev) => [...prev, newAlert]);
      sendAlertEmail(medicine.manufacturerEmail, issue, id, addToast);
    }

    const updatedMedicine = {
      ...medicine,
      scanCount: newScanCount,
      status: newStatus,
    };

    setMedicines((prev) => prev.map((m) => (m.id === id ? updatedMedicine : m)));
    return updatedMedicine;
  };

  const reportMismatch = (id: string, city: string) => {
    const medicine = medicines.find((m) => m.id === id);
    if (!medicine) return;

    const issue = `User Reported Mismatch (Location: ${city})`;
    
    // Trigger Alert Logic
    const newAlert: Alert = {
      id: uuidv4(),
      medicineId: id,
      issueType: issue,
      timestamp: Date.now(),
      message: `User reported mismatch for ID ${id} from city: ${city}.`
    };
    setAlerts((prev) => [...prev, newAlert]);
    
    const updatedMedicine = {
      ...medicine,
      status: MedicineStatus.SUSPICIOUS
    };

    setMedicines((prev) => prev.map((m) => (m.id === id ? updatedMedicine : m)));
    sendAlertEmail(medicine.manufacturerEmail, issue, id, addToast);
  };

  return (
    <DataContext.Provider value={{ medicines, alerts, addMedicine, getMedicine, incrementScan, reportMismatch, toasts, addToast, removeToast }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};