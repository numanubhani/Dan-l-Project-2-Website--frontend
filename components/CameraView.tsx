import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CameraView: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Auto-start camera when component mounts
    startCamera('photo');
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (mode: 'photo' | 'video') => {
    try {
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: mode === 'video' 
      });
      streamRef.current = stream;
      setCameraMode(mode);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraMode(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        console.log('Photo captured:', dataUrl);
        alert('Photo captured! (Check console for data)');
        navigate('/feed');
      }
    }
  };

  const startVideoRecording = () => {
    setIsRecording(true);
    // Video recording logic would go here
    alert('Video recording started! (Implementation needed)');
  };

  const handleLive = () => {
    navigate('/live');
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('File selected:', file);
        alert('File selected! (Check console)');
        navigate('/feed');
      }
    };
    input.click();
  };

  const handleReel = () => {
    startCamera('video');
  };

  return (
    <div className="fixed inset-0 bg-black z-[10000] flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Top bar with close button */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button
          onClick={() => navigate('/feed')}
          className="p-2 bg-black/50 rounded-full backdrop-blur-md"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
        {/* Three options in a row */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <button
            onClick={handleLive}
            className="flex flex-col items-center space-y-2"
          >
            <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white text-xs font-bold">Live</span>
          </button>
          
          <button
            onClick={handleUpload}
            className="flex flex-col items-center space-y-2"
          >
            <div className="w-14 h-14 bg-gray-500 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="text-white text-xs font-bold">Upload</span>
          </button>
          
          <button
            onClick={handleReel}
            className="flex flex-col items-center space-y-2"
          >
            <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white text-xs font-bold">Reel</span>
          </button>
        </div>

        {/* Camera controls */}
        <div className="flex items-center justify-center space-x-8">
          <button
            onClick={() => {
              // Switch camera (front/back)
              stopCamera();
              setTimeout(() => startCamera(cameraMode || 'photo'), 100);
            }}
            className="p-4 bg-white/20 rounded-full backdrop-blur-md"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {cameraMode === 'photo' ? (
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-white/50"
            />
          ) : (
            <button
              onClick={startVideoRecording}
              className={`w-16 h-16 ${isRecording ? 'bg-red-600' : 'bg-red-500'} rounded-full border-4 border-white/50`}
            />
          )}
          
          <button
            onClick={() => {
              const newMode = cameraMode === 'photo' ? 'video' : 'photo';
              startCamera(newMode);
            }}
            className="p-4 bg-white/20 rounded-full backdrop-blur-md"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cameraMode === 'photo' ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" : "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"} />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraView;

