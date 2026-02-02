import React, { useState } from 'react';
import { useData } from '../store';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Download, Package } from 'lucide-react';

export const ManufacturerPortal: React.FC = () => {
  const { addMedicine } = useData();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Tablet',
    manufactureDate: '',
    expiryDate: '',
    manufacturerName: '',
    manufacturerEmail: '',
  });
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMed = addMedicine(formData);
    setGeneratedId(newMed.id);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_${formData.name}_${generatedId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  const resetForm = () => {
    setFormData({
        name: '',
        type: 'Tablet',
        manufactureDate: '',
        expiryDate: '',
        manufacturerName: '',
        manufacturerEmail: '',
    });
    setGeneratedId(null);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Register New Medicine</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="e.g. Amoxicillin 500mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option>Tablet</option>
                <option>Syrup</option>
                <option>Injection</option>
                <option>Capsule</option>
                <option>Topical</option>
              </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer</label>
                <input
                required
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Company Name"
                value={formData.manufacturerName}
                onChange={(e) => setFormData({ ...formData, manufacturerName: e.target.value })}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mfg Date</label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.manufactureDate}
                onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exp Date</label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alert Email</label>
            <input
              required
              type="email"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="alerts@pharma.com"
              value={formData.manufacturerEmail}
              onChange={(e) => setFormData({ ...formData, manufacturerEmail: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            Generate ID & QR Code
          </button>
        </form>
      </div>

      {/* QR Output */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {generatedId ? (
          <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2 text-blue-200">Registration Successful</h3>
            <p className="text-slate-400 mb-6 text-sm">Scan this code to verify authenticity</p>
            
            <div className="bg-white p-4 rounded-xl mb-6">
              <QRCodeSVG
                id="qr-code-svg"
                value={generatedId}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-3 w-full max-w-xs">
                <div className="bg-slate-800 p-3 rounded-lg text-left">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Medicine ID</p>
                    <p className="font-mono text-sm text-green-400 break-all">{generatedId}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadQR}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                        <Download className="w-4 h-4" /> Save QR
                    </button>
                    <button
                        onClick={resetForm}
                        className="flex-1 border border-slate-600 hover:bg-slate-800 text-white py-2 px-4 rounded-lg transition"
                    >
                        New Entry
                    </button>
                </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 flex flex-col items-center">
            <Package className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Ready to Register</p>
            <p className="text-sm opacity-60 max-w-xs mt-2">Fill out the form to generate a secure blockchain-linked QR code.</p>
          </div>
        )}
      </div>
    </div>
  );
};