import React, { useState } from 'react';
import { DataProvider } from './store';
import { Layout } from './components/Layout';
import { ManufacturerPortal } from './components/ManufacturerPortal';
import { ConsumerPortal } from './components/ConsumerPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { Lock } from 'lucide-react';

const LoginPrompt = ({ onLogin, title, errorMsg }: { onLogin: (p: string) => void, title: string, errorMsg: string | null }) => {
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 mt-10">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="bg-slate-100 p-3 rounded-full mb-4">
          <Lock className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="text-slate-500 text-sm mt-1">Please enter the access password to continue.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        
        {errorMsg && (
          <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{errorMsg}</p>
        )}

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Access Portal
        </button>
      </form>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState<'manufacturer' | 'consumer' | 'admin'>('manufacturer');
  const [isManufacturerAuth, setIsManufacturerAuth] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTabSwitch = (tab: 'manufacturer' | 'consumer' | 'admin') => {
    setActiveTab(tab);
    setErrorMsg(null);
  };

  const handleManufacturerLogin = (password: string) => {
    if (password === 'merchant123') {
      setIsManufacturerAuth(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Incorrect password. Please try again.');
    }
  };

  const handleAdminLogin = (password: string) => {
    if (password === 'Pass@123') {
      setIsAdminAuth(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Invalid admin credentials.');
    }
  };

  return (
    <DataProvider>
      <Layout activeTab={activeTab} setActiveTab={handleTabSwitch}>
        <div className="animate-in fade-in duration-500">
          {activeTab === 'manufacturer' && (
            <>
              {!isManufacturerAuth ? (
                <LoginPrompt 
                  title="Manufacturer Restricted Access" 
                  onLogin={handleManufacturerLogin} 
                  errorMsg={errorMsg} 
                />
              ) : (
                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Manufacturer Portal</h2>
                    <p className="text-slate-500">Securely register new pharmaceutical batches and generate tracking IDs.</p>
                  </div>
                  <ManufacturerPortal />
                </div>
              )}
            </>
          )}
          
          {activeTab === 'consumer' && (
             <div className="space-y-4">
               <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Consumer Verification</h2>
                <p className="text-slate-500">Ensure your medicine is authentic and safe to use.</p>
              </div>
              <ConsumerPortal />
            </div>
          )}
          
          {activeTab === 'admin' && (
             <>
               {!isAdminAuth ? (
                 <LoginPrompt 
                   title="Admin Restricted Access" 
                   onLogin={handleAdminLogin} 
                   errorMsg={errorMsg} 
                 />
               ) : (
                 <div className="space-y-4">
                   <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
                    <p className="text-slate-500">Monitor system integrity, flagged items, and automated security alerts.</p>
                  </div>
                  <AdminDashboard />
                </div>
               )}
             </>
          )}
        </div>
      </Layout>
    </DataProvider>
  );
}

export default App;