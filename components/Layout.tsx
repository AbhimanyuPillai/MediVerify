import React from 'react';
import { Pill, Shield, LayoutDashboard, Menu } from 'lucide-react';
import { ToastContainer } from './ToastContainer';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'manufacturer' | 'consumer' | 'admin';
  setActiveTab: (tab: 'manufacturer' | 'consumer' | 'admin') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ToastContainer />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              MediVerify
            </h1>
          </div>

          <nav className="hidden md:flex gap-1 bg-slate-100 p-1 rounded-lg">
            <NavButton 
                active={activeTab === 'manufacturer'} 
                onClick={() => setActiveTab('manufacturer')}
                icon={<Pill className="w-4 h-4" />}
                label="Manufacturer"
            />
            <NavButton 
                active={activeTab === 'consumer'} 
                onClick={() => setActiveTab('consumer')}
                icon={<Shield className="w-4 h-4" />}
                label="Consumer Verify"
            />
            <NavButton 
                active={activeTab === 'admin'} 
                onClick={() => setActiveTab('admin')}
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Admin Portal"
            />
          </nav>
          
          {/* Mobile Menu Placeholder (simplified) */}
          <button className="md:hidden p-2 text-slate-500">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
             <MobileNavButton active={activeTab === 'manufacturer'} onClick={() => setActiveTab('manufacturer')} label="Manufacturer" />
             <MobileNavButton active={activeTab === 'consumer'} onClick={() => setActiveTab('consumer')} label="Consumer" />
             <MobileNavButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} label="Admin" />
        </div>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 MediVerify Platform. Secure Blockchain Prototype.</p>
        </div>
      </footer>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
      active 
        ? 'bg-white text-blue-600 shadow-sm' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

const MobileNavButton = ({ active, onClick, label }: any) => (
    <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
      active 
        ? 'bg-blue-600 text-white border-blue-600' 
        : 'bg-white text-slate-600 border-slate-200'
    }`}
  >
    {label}
  </button>
);