
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medicine, MedicineStatus, Alert, ToastNotification } from './types';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  medicines: Medicine[];
  alerts: Alert[];
  addMedicine: (data: Omit<Medicine, 'id' | 'scanCount' | 'status' | 'createdAt'>) => Medicine;
  getMedicine: (id: string) => Medicine | undefined;
  incrementScan: (id: string) => Medicine | undefined;
  reportMismatch: (id: string, city: string) => Promise<boolean>;
  toasts: ToastNotification[];
  addToast: (message: string, type: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Mocking the Resend API Route call.
 * In a production environment, this would call a serverless endpoint like /api/send-email
 * which uses the 'resend' npm package on the server.
 */
const triggerResendEmail = async (params: {
  to: string;
  medicineName: string;
  batchNumber: string;
  issue: string;
  location: string;
}) => {
  console.log(`%c[RESEND API CALL] Initiating serverless route...`, 'color: #ff69b4; font-weight: bold; border: 1px solid #ff69b4; padding: 2px 4px; border-radius: 4px;');
  
  // Simulation of the server-side payload
  const emailPayload = {
    from: 'MediVerify Security <alerts@mediverify.io>',
    to: params.to,
    subject: `URGENT: Security Alert for Batch ${params.batchNumber}`,
    react: `
      Medicine Name: ${params.medicineName}
      Batch Number: ${params.batchNumber}
      Issue Reported: ${params.issue}
      Incident Location: ${params.location}
      Timestamp: ${new Date().toISOString()}
    `
  };

  console.log('%c[PAYLOAD PREPARED]', 'color: #888; font-style: italic;', emailPayload);

  // Simulate network latency for the serverless function execution
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log(`%c[RESEND SUCCESS] Security alert email delivered to ${params.to} via Resend Infrastructure.`, 'color: #00ff00; font-weight: bold;');
  return true;
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
    if (isExpired) {
      newStatus = MedicineStatus.EXPIRED;
    }

    const newScanCount = medicine.scanCount + 1;
    
    if (newScanCount > 10 && newStatus !== MedicineStatus.SUSPICIOUS) {
      newStatus = MedicineStatus.SUSPICIOUS;
      const issue = "Potential Cloning (High Scan Count)";
      
      const newAlert: Alert = {
        id: uuidv4(),
        medicineId: id,
        issueType: issue,
        timestamp: Date.now(),
        message: `System flagged ID ${id} due to excessive scans (${newScanCount}).`
      };
      setAlerts((prev) => [...prev, newAlert]);
      
      // Auto-trigger email alert for high scan counts
      triggerResendEmail({
        to: medicine.manufacturerEmail,
        medicineName: medicine.name,
        batchNumber: medicine.id,
        issue: issue,
        location: "System Global Monitor"
      });
    }

    const updatedMedicine = {
      ...medicine,
      scanCount: newScanCount,
      status: newStatus,
    };

    setMedicines((prev) => prev.map((m) => (m.id === id ? updatedMedicine : m)));
    return updatedMedicine;
  };

  const reportMismatch = async (id: string, city: string) => {
    const medicine = medicines.find((m) => m.id === id);
    if (!medicine) return false;

    const issue = `User Reported Mismatch`;
    
    // 1. Create Alert Record
    const newAlert: Alert = {
      id: uuidv4(),
      medicineId: id,
      issueType: `${issue} (Location: ${city})`,
      timestamp: Date.now(),
      message: `Manual report for ID ${id} from city: ${city}.`
    };
    setAlerts((prev) => [...prev, newAlert]);
    
    // 2. Update Medicine Status
    const updatedMedicine = {
      ...medicine,
      status: MedicineStatus.SUSPICIOUS
    };
    setMedicines((prev) => prev.map((m) => (m.id === id ? updatedMedicine : m)));

    // 3. Call Serverless Resend API (Simulated)
    try {
      await triggerResendEmail({
        to: medicine.manufacturerEmail,
        medicineName: medicine.name,
        batchNumber: medicine.id,
        issue: issue,
        location: city
      });
      addToast(`Security alert sent to ${medicine.manufacturerName}.`, 'success');
      return true;
    } catch (err) {
      addToast(`Failed to dispatch security email. System alert logged.`, 'error');
      return false;
    }
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
