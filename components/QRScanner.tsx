import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, Upload, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            onScan(code.data);
          } else {
            alert('No QR code found in image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Camera Scanning Logic
  useEffect(() => {
    let animationFrameId: number;

    const scan = () => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            setIsScanning(false); // Stop scanning on success
            onScan(code.data);
            return; // Exit loop
          }
        }
        animationFrameId = requestAnimationFrame(scan);
      }
    };

    if (isScanning) {
      scan();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning, onScan]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Required for iOS to play video inline
        videoRef.current.setAttribute('playsinline', 'true'); 
        videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Could not access camera. Please check permissions or use file upload.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={isScanning ? stopCamera : startCamera}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
            isScanning 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isScanning ? <X className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
          {isScanning ? 'Stop Camera' : 'Scan via Camera'}
        </button>
        
        <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer transition">
          <Upload className="w-5 h-5" />
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {cameraError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {cameraError}
        </div>
      )}

      {/* Camera Viewfinder */}
      <div className={`relative overflow-hidden rounded-xl bg-black aspect-video flex items-center justify-center ${!isScanning ? 'hidden' : ''}`}>
         <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
         <canvas ref={canvasRef} className="hidden" />
         <div className="absolute inset-0 border-2 border-white/30 flex items-center justify-center">
             <div className="w-48 h-48 border-2 border-blue-400 rounded-lg relative">
                 <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                 <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
             </div>
         </div>
      </div>
    </div>
  );
};