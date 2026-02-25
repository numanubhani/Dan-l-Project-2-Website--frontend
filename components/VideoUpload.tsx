import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

interface VideoUploadProps {
  user: User;
}

interface BetMarker {
  id: string;
  timestamp: number; // in seconds
  question: string;
  options: { id: string; text: string; odds: number }[];
  totalPool: number;
  participants: number;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ user }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [betMarkers, setBetMarkers] = useState<BetMarker[]>([]);
  const [showAddBet, setShowAddBet] = useState(false);
  const [newBet, setNewBet] = useState({
    question: '',
    options: ['', ''],
    timestamp: 0,
  });
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoType, setVideoType] = useState<'short' | 'long'>('short');

  useEffect(() => {
    if (videoPreviewRef.current && videoUrl) {
      videoPreviewRef.current.addEventListener('loadedmetadata', () => {
        setVideoDuration(videoPreviewRef.current?.duration || 0);
      });
      videoPreviewRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(videoPreviewRef.current?.currentTime || 0);
      });
    }
  }, [videoUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        // Set default title from filename
        const defaultTitle = file.name.replace(/\.[^/.]+$/, '') || 'My Video';
        setVideoTitle(defaultTitle);
        showSuccess('Video selected!');
      } else {
        showError('Please select a video file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Please select a video file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    if (!videoTitle.trim()) {
      showError('Please enter a video title');
      setIsUploading(false);
      return;
    }

    try {
      // Convert bet markers to API format
      const betMarkersForAPI = betMarkers.map(marker => ({
        timestamp: marker.timestamp,
        question: marker.question,
        options: marker.options.map(opt => ({
          text: opt.text,
          odds: opt.odds,
        })),
      }));

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      const formData = new FormData();
      formData.append('title', videoTitle.trim());
      formData.append('description', videoDescription.trim() || `Video uploaded on ${new Date().toLocaleDateString()}`);
      formData.append('video_file', selectedFile);
      formData.append('video_type', videoType);
      formData.append('is_live', 'false');
      if (betMarkersForAPI.length > 0) {
        formData.append('bet_markers', JSON.stringify(betMarkersForAPI));
      }

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.min(percentComplete, 99));
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 201) {
          setUploadProgress(100);
          showSuccess('Video uploaded successfully!');
          setTimeout(() => {
            navigate('/profile');
          }, 1000);
        } else {
          const error = JSON.parse(xhr.responseText);
          showError(error.detail || error.message || 'Failed to upload video');
          setIsUploading(false);
        }
      });

      xhr.addEventListener('error', () => {
        showError('Upload failed. Please try again.');
        setIsUploading(false);
      });

      const token = localStorage.getItem('auth_token');
      xhr.open('POST', 'http://localhost:8000/api/videos/upload/');
      xhr.setRequestHeader('Authorization', `Token ${token}`);
      xhr.send(formData);

    } catch (err: any) {
      showError(err.message || 'Failed to upload video');
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addBetMarker = () => {
    if (!newBet.question || newBet.options.some(opt => !opt.trim())) {
      showError('Please fill in all bet fields');
      return;
    }

    const marker: BetMarker = {
      id: Math.random().toString(36).substring(7),
      timestamp: currentTime,
      question: newBet.question,
      options: newBet.options.map((opt, idx) => ({
        id: idx === 0 ? 'yes' : 'no',
        text: opt,
        odds: 2.0,
      })),
      totalPool: 0,
      participants: 0,
    };

    setBetMarkers([...betMarkers, marker]);
    setNewBet({ question: '', options: ['', ''], timestamp: 0 });
    setShowAddBet(false);
    showSuccess('Bet marker added!');
  };

  const seekToTimestamp = (timestamp: number) => {
    if (videoPreviewRef.current) {
      videoPreviewRef.current.currentTime = timestamp;
    }
  };

  const removeBetMarker = (id: string) => {
    setBetMarkers(betMarkers.filter(m => m.id !== id));
    showSuccess('Bet marker removed');
  };

  return (
    <div className="w-full min-h-screen bg-white pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Upload Video</h1>
            <p className="text-sm text-gray-500">Add betting markers at specific timestamps</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-900 transition"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Video Preview & Upload */}
          <div className="lg:col-span-2 space-y-4">
            {/* File Selection */}
            {!videoUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Select Video File</h3>
                <p className="text-sm text-gray-500 mb-4">Choose a video file to upload</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition"
                >
                  Choose File
                </button>
              </div>
            )}

            {/* Video Preview */}
            {videoUrl && (
              <div className="bg-black rounded-xl overflow-hidden relative">
                <video
                  ref={videoPreviewRef}
                  src={videoUrl}
                  controls
                  className="w-full h-auto max-h-[600px]"
                />
                {/* Bet Markers Overlay - Visual Indicators on Video */}
                {betMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    className="absolute top-4 left-4 bg-purple-500/90 text-white px-3 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-purple-600 transition shadow-lg z-10"
                    onClick={() => seekToTimestamp(marker.timestamp)}
                    title={`Bet at ${formatTime(marker.timestamp)}: ${marker.question}`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <span>{formatTime(marker.timestamp)}</span>
                    </div>
                  </div>
                ))}
                
                {/* Bet Markers Timeline - Below Video Controls */}
                {videoDuration > 0 && betMarkers.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800/50 z-20">
                    {betMarkers.map((marker) => (
                      <div
                        key={`timeline-${marker.id}`}
                        className="absolute top-0 bottom-0 w-1 bg-purple-500 cursor-pointer hover:bg-purple-400 transition group"
                        style={{
                          left: `${(marker.timestamp / videoDuration) * 100}%`,
                        }}
                        onClick={() => seekToTimestamp(marker.timestamp)}
                        title={`${formatTime(marker.timestamp)}: ${marker.question}`}
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {formatTime(marker.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Video Title and Description */}
            {videoUrl && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Video Title *</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter video title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe your video..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Video Type</label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setVideoType('short')}
                      className={`flex-1 px-4 py-2 rounded-lg font-bold transition ${
                        videoType === 'short'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Reel (Short)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoType('long')}
                      className={`flex-1 px-4 py-2 rounded-lg font-bold transition ${
                        videoType === 'long'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Video (Long)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">Uploading...</span>
                  <span className="text-sm font-bold text-purple-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {videoUrl && !isUploading && uploadProgress === 0 && (
              <button
                onClick={handleUpload}
                disabled={!videoTitle.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-bold hover:from-purple-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Video
              </button>
            )}

            {/* Video Info */}
            {videoUrl && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3">Video Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-bold text-gray-900">{formatTime(videoDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Time:</span>
                    <span className="font-bold text-gray-900">{formatTime(currentTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bet Markers:</span>
                    <span className="font-bold text-purple-600">{betMarkers.length}</span>
                  </div>
                </div>
                
                {/* Bet Markers Timeline Visualization */}
                {videoDuration > 0 && betMarkers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-bold text-gray-700 mb-2">Bet Markers Timeline</h4>
                    <div className="relative h-8 bg-gray-200 rounded overflow-hidden">
                      {betMarkers.map((marker) => (
                        <div
                          key={`viz-${marker.id}`}
                          className="absolute top-0 bottom-0 bg-purple-500 cursor-pointer hover:bg-purple-600 transition group"
                          style={{
                            left: `${(marker.timestamp / videoDuration) * 100}%`,
                            width: '4px',
                          }}
                          onClick={() => seekToTimestamp(marker.timestamp)}
                          title={`${formatTime(marker.timestamp)}: ${marker.question}`}
                        >
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                              <div className="font-bold">{formatTime(marker.timestamp)}</div>
                              <div className="text-xs text-gray-300 mt-0.5">{marker.question}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Current time indicator */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
                        style={{
                          left: `${(currentTime / videoDuration) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0:00</span>
                      <span>{formatTime(videoDuration)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Betting Panel */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900">Betting Markers</h3>
                {videoUrl && (
                  <button
                    onClick={() => setShowAddBet(!showAddBet)}
                    className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-bold hover:bg-purple-600 transition"
                  >
                    + Add Bet
                  </button>
                )}
              </div>

              {/* Add Bet Form */}
              {showAddBet && videoUrl && (
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Question</label>
                    <input
                      type="text"
                      value={newBet.question}
                      onChange={(e) => setNewBet({ ...newBet, question: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Will this happen?"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Option 1</label>
                    <input
                      type="text"
                      value={newBet.options[0]}
                      onChange={(e) => setNewBet({ ...newBet, options: [e.target.value, newBet.options[1]] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Yes"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Option 2</label>
                    <input
                      type="text"
                      value={newBet.options[1]}
                      onChange={(e) => setNewBet({ ...newBet, options: [newBet.options[0], e.target.value] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="No"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Timestamp: {formatTime(currentTime)}
                    </label>
                    <button
                      onClick={() => setNewBet({ ...newBet, timestamp: currentTime })}
                      className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-900 transition"
                    >
                      Use Current Time
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={addBetMarker}
                      className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold hover:bg-purple-600 transition"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddBet(false)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Bet Markers List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {betMarkers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {videoUrl ? 'No betting markers yet. Add one to get started!' : 'Upload a video first'}
                  </p>
                ) : (
                  betMarkers.map((marker) => (
                    <div
                      key={marker.id}
                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-300 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                              {formatTime(marker.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 mb-2">{marker.question}</p>
                          <div className="flex space-x-2">
                            {marker.options.map((opt) => (
                              <span
                                key={opt.id}
                                className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-bold"
                              >
                                {opt.text}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => removeBetMarker(marker.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => seekToTimestamp(marker.timestamp)}
                        className="text-xs text-purple-600 hover:text-purple-700 font-bold mt-2"
                      >
                        Jump to timestamp →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;

