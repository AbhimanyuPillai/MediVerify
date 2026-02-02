
import React, { useState } from 'react';
import { useData } from '../store';
import { Medicine, MedicineStatus } from '../types';
import { QRScanner } from './QRScanner';
import { ShieldCheck, ShieldAlert, AlertTriangle, Search, Activity, Calendar, MapPin, Check, Loader2, Send } from 'lucide-react';

export const ConsumerPortal: React.FC = () => {
  const { incrementScan, reportMismatch } = useData();
  const [scannedMedicine, setScannedMedicine] = useState<Medicine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [city, setCity] = useState('');
  const [isCitySubmitted, setIsCitySubmitted] = useState(false);

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim().length > 0) {
      setIsCitySubmitted(true);
    }
  };

  const handleScan = (id: string) => {
    setLoading(true);
    setError(null);
    setScannedMedicine(null);

    // Simulate network delay for realism
    setTimeout(() => {
      const medicine = incrementScan(id);
      if (medicine) {
        setScannedMedicine(medicine);
      } else {
        setError("Invalid ID. This product is not registered in our database.");
      }
      setLoading(false);
    }, 800);
  };

  const handleReport = async () => {
    if (scannedMedicine && city) {
      const confirmation = confirm(
        `Are you sure you want to report this product? \n\nA security alert including the Medicine Name, Batch ID, and your current location (${city}) will be sent to the manufacturer via Resend.`
      );
      
      if (confirmation) {
        setIsReporting(true);
        const success = await reportMismatch(scannedMedicine.id, city);
        
        if (success) {
          // Re-fetch or update local medicine state to show "Reported" status
          setScannedMedicine(prev => prev ? { ...prev, status: MedicineStatus.SUSPICIOUS } : null);
        }
        setIsReporting(false);
      }
    }
  };

  // Explicitly check expiry date in UI to ensure warning is shown regardless of status
  const isExpired = scannedMedicine ? new Date().toISOString().split('T')[0] > scannedMedicine.expiryDate : false;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* City Input Section - Required before scanning */}
      {!isCitySubmitted ? (
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center">
          <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Location Required</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">Please enter your current city to assist with supply chain tracking and verification security.</p>
          
          <form onSubmit={handleCitySubmit} className="max-w-xs mx-auto">
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
              placeholder="Enter your city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              Start Verification <Check className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Scanner Section */
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-500"/> Verify Product
             </h2>
             <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
               <MapPin className="w-3 h-3" /> {city}
             </span>
          </div>
          
          <p className="text-slate-600 mb-6">Scan the QR code on your medicine packaging to instantly verify its authenticity and safety status.</p>
          <QRScanner onScan={handleScan} />
          
          <button 
            onClick={() => { setIsCitySubmitted(false); setScannedMedicine(null); setError(null); }}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Change Location
          </button>
        </div>
      )}

      {/* Results Section */}
      {loading && (
        <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Querying secure records...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-red-700">Verification Failed</h3>
            <p className="text-red-600">{error}</p>
        </div>
      )}

      {scannedMedicine && !loading && (
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Status Header */}
          <div className={`p-4 flex items-center justify-between ${
            scannedMedicine.status === MedicineStatus.VALID && !isExpired ? 'bg-emerald-50 border-b border-emerald-100' :
            (scannedMedicine.status === MedicineStatus.EXPIRED || isExpired) ? 'bg-red-50 border-b border-red-100' :
            'bg-red-50 border-b border-red-100'
          }`}>
            <div className="flex items-center gap-3">
                {scannedMedicine.status === MedicineStatus.VALID && !isExpired && <ShieldCheck className="w-8 h-8 text-emerald-600" />}
                {(scannedMedicine.status === MedicineStatus.EXPIRED || isExpired) && <AlertTriangle className="w-8 h-8 text-red-600" />}
                {scannedMedicine.status === MedicineStatus.SUSPICIOUS && <ShieldAlert className="w-8 h-8 text-red-600" />}
                
                <div>
                    <h3 className={`text-lg font-bold ${
                        scannedMedicine.status === MedicineStatus.VALID && !isExpired ? 'text-emerald-800' :
                        (scannedMedicine.status === MedicineStatus.EXPIRED || isExpired) ? 'text-red-800' :
                        'text-red-800'
                    }`}>
                        {scannedMedicine.status === MedicineStatus.VALID && !isExpired ? 'Authentic Product' :
                        (scannedMedicine.status === MedicineStatus.EXPIRED || isExpired) ? 'Product Expired' :
                        'Suspicious Activity Detected'}
                    </h3>
                    <p className="text-sm opacity-80">ID: {scannedMedicine.id}</p>
                </div>
            </div>
            {scannedMedicine.status === MedicineStatus.SUSPICIOUS && (
                <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">DO NOT USE</span>
            )}
            {(scannedMedicine.status === MedicineStatus.EXPIRED || isExpired) && scannedMedicine.status !== MedicineStatus.SUSPICIOUS && (
                <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">EXPIRED</span>
            )}
          </div>

          <div className="p-6">
            
            {/* Prominent Expiry Warning */}
            {isExpired && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-800 text-lg">Warning: Expired Product</h4>
                        <p className="text-red-700">
                            This medicine passed its expiry date on <span className="font-bold">{scannedMedicine.expiryDate}</span>. 
                            It may be unsafe or ineffective. Do not consume.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Medicine Name</h4>
                    <p className="text-xl font-bold text-slate-900">{scannedMedicine.name}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                        {scannedMedicine.type}
                    </span>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-500">Scan Count</p>
                            <p className={`font-semibold ${scannedMedicine.scanCount > 10 ? 'text-red-600' : 'text-slate-800'}`}>
                                {scannedMedicine.scanCount} scans recorded
                            </p>
                            {scannedMedicine.scanCount > 10 && (
                                <p className="text-xs text-red-500 mt-1">High scan volume detected. Potential cloning.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-500">Expiration</p>
                            <p className={`font-semibold ${isExpired ? 'text-red-600' : 'text-slate-800'}`}>{scannedMedicine.expiryDate}</p>
                            <p className="text-xs text-slate-400">Mfg: {scannedMedicine.manufactureDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Manufacturer</p>
                        <p className="font-medium">{scannedMedicine.manufacturerName}</p>
                    </div>
                    
                    <button
                        onClick={handleReport}
                        disabled={scannedMedicine.status === MedicineStatus.SUSPICIOUS || isReporting}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                            scannedMedicine.status === MedicineStatus.SUSPICIOUS
                             ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                             : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm'
                        } ${isReporting ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isReporting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : scannedMedicine.status === MedicineStatus.SUSPICIOUS ? (
                          <>
                            <Check className="w-4 h-4" />
                            Alert Sent
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Report Mismatch
                          </>
                        )}
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
