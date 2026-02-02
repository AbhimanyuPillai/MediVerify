import React from 'react';
import { useData } from '../store';
import { MedicineStatus } from '../types';
import { AlertCircle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { medicines, alerts } = useData();

  const flaggedMedicines = medicines.filter(m => m.status === MedicineStatus.SUSPICIOUS);
  const expiredMedicines = medicines.filter(m => m.status === MedicineStatus.EXPIRED);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-sm font-medium">Total Registered</span>
                <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{medicines.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-sm font-medium">Flagged Suspicious</span>
                <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{flaggedMedicines.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-sm font-medium">Total Scans</span>
                <ActivityIcon className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
                {medicines.reduce((acc, curr) => acc + curr.scanCount, 0)}
            </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-sm font-medium">Alerts Triggered</span>
                <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{alerts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Alerts Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-96">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" /> Live Security Alerts
                </h3>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 flex-1">
                {alerts.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">No security alerts recorded.</div>
                ) : (
                    alerts.slice().reverse().map(alert => (
                        <div key={alert.id} className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="mt-1">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{alert.issueType}</p>
                                <p className="text-xs text-slate-600 mb-1">{alert.message}</p>
                                <p className="text-xs text-slate-400 font-mono">ID: {alert.medicineId}</p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    {new Date(alert.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Flagged Items List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-96">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" /> Suspicious Inventory
                </h3>
            </div>
            <div className="overflow-y-auto p-0">
                 {flaggedMedicines.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">No suspicious items found.</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-4 py-3">Medicine</th>
                                <th className="px-4 py-3">Scans</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {flaggedMedicines.map(med => (
                                <tr key={med.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-800">{med.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">{med.id.slice(0, 8)}...</div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-red-600 font-bold">{med.scanCount}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                            {med.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);