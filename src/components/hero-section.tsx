"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';
import { MapPin, Clock, Upload, Camera, AlertTriangle } from 'lucide-react';
import BackgroundStars from '@/assets/stars.png';

// Inline definition of Progress component
const Progress = ({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full bg-white/10 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-purple-500"
        animate={{ width: `${clampedValue}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
};

// Inline definition of ActionButton component
const ActionButton = ({
  label,
  onClick,
  disabled = false,
  className = '',
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-all disabled:opacity-50 ${className}`}
    >
      {label}
    </button>
  );
};

const Map = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => (
    <div className="h-full rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5">
      <div className="text-white/50 flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span>Loading map...</span>
      </div>
    </div>
  )
});

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: [`start end`, 'end start']
  });
  const backgroundPositionY = useTransform(scrollYProgress, [0, 1], [-300, 300]);

  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const [time, setTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);
  const [error, setError] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  const validateCoordinates = useCallback(() => {
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);

    if (!coordinates.lat || !coordinates.lng) {
      setError("Please enter both coordinates");
      return false;
    }

    if (isNaN(lat) || isNaN(lng)) {
      setError("Invalid number format");
      return false;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Latitude must be between -90° and 90°\nLongitude must be between -180° and 180°");
      return false;
    }

    setError("");
    return true;
  }, [coordinates.lat, coordinates.lng]);

  useEffect(() => {
    if (coordinates.lat && coordinates.lng && validateCoordinates()) {
      const timer = setTimeout(() => {
        setMapCenter([parseFloat(coordinates.lat), parseFloat(coordinates.lng)]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [coordinates.lat, coordinates.lng, validateCoordinates]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError("");
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setShowPlaceholder(false);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleGetSatelliteImage = async () => {
    if (!validateCoordinates()) return;

    setIsFetchingImage(true);
    setFetchProgress(0);
    setError("");

    try {
      const duration = 5000;
      const interval = 50;
      const steps = duration / interval;
      let currentStep = 0;

      await new Promise((resolve, reject) => {
        const progressInterval = setInterval(() => {
          currentStep++;
          setFetchProgress((currentStep / steps) * 100);

          if (currentStep >= steps) {
            clearInterval(progressInterval);
            resolve(true);
          }
        }, interval);
      });

      setUploadedImage('/assets/mapslogo.png');
      setShowPlaceholder(false);
    } catch (err) {
      setError(typeof err === 'string' ? err : "Failed to fetch image, please try again");
    } finally {
      setIsFetchingImage(false);
    }
  };

  const handleAnalyze = async () => {
    if (!validateCoordinates()) return;
    if (!uploadedImage && !showPlaceholder) {
      setError("Please upload a satellite image");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeProgress(0);
    setError("");

    try {
      const duration = 3000;
      const interval = 50;
      const steps = duration / interval;
      let currentStep = 0;

      await new Promise((resolve, reject) => {
        const progressInterval = setInterval(() => {
          currentStep++;
          setAnalyzeProgress((currentStep / steps) * 100);

          if (currentStep >= steps) {
            clearInterval(progressInterval);
            resolve(true);
          }
   
        }, interval);
      });

      setShowPlaceholder(true);
      setRiskScore(Math.floor(Math.random() * 101));
    } catch (err) {
      setError(typeof err === 'string' ? err : "Analysis failed, please try again");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setCoordinates({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: "Low Risk", color: "bg-green-500" };
    if (score < 70) return { label: "Moderate Risk", color: "bg-yellow-500" };
    return { label: "High Risk", color: "bg-red-500" };
  };

  return (
    <div className="min-h-screen bg-black">
      <motion.section
        animate={{ backgroundPositionX: BackgroundStars.width }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        className="min-h-screen flex flex-col overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
        style={{ backgroundImage: `url(${BackgroundStars.src})`, backgroundPositionY }} 
        ref={sectionRef}
      >
        <div className="absolute inset-0 bg-[radial-gradient(75%_75%_at_center_center,rgb(140,69,255,0.5)_15%,rgb(14,0,36,0.5)_78%,transparent)]" />
        
        <div className="container relative z-10 py-12">
          <h1 className="text-6xl md:text-[120px] font-semibold tracking-tighter bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,32,138,0.5))] bg-clip-text text-transparent text-center mb-12 px-4">
            Satellite Risk Analysis
          </h1>
          
          <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-3 space-y-6">
              <div className="h-[600px] rounded-2xl overflow-hidden border border-white/20 bg-white/5 backdrop-blur-sm shadow-xl">
                <Map center={mapCenter} onMapClick={handleMapClick} />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="number"
                    placeholder="Latitude"
                    value={coordinates.lat}
                    onChange={(e) => setCoordinates(p => ({ ...p, lat: e.target.value }))}
                    className="pl-12 pr-4 py-4 w-full rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    step="any"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="number"
                    placeholder="Longitude"
                    value={coordinates.lng}
                    onChange={(e) => setCoordinates(p => ({ ...p, lng: e.target.value }))}
                    className="pl-12 pr-4 py-4 w-full rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    step="any"
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="datetime-local"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-12 pr-4 py-4 w-full rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="mt-4">
                <ActionButton
                  label={isFetchingImage ? 'Fetching Image...' : 'Get Satellite Image'}
                  onClick={handleGetSatelliteImage}
                  disabled={isFetchingImage || isAnalyzing}
                  className="w-full hover:scale-[1.02] transition-transform"
                />
                {isFetchingImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2 mt-4"
                  >
                    <div className="flex justify-between text-sm text-white/70">
                      <span>Fetching satellite image...</span>
                      <span>{Math.round(fetchProgress)}%</span>
                    </div>
                    <Progress value={fetchProgress} className="h-2" />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div
                {...getRootProps()}
                className={`h-80 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                  ${isDragActive ? 'border-purple-500 bg-white/10' : 'border-white/20 hover:border-purple-400'}
                  ${error.includes("image") ? 'border-red-500/50 hover:border-red-500' : ''}`}
              >
                <input {...getInputProps()} />
                <AnimatePresence>
                  {uploadedImage || showPlaceholder ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <img 
                        src={showPlaceholder ? `https://placehold.co/800x600?text=${coordinates.lat},${coordinates.lng}` : uploadedImage!}
                        alt="Analysis" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-8 h-8 text-white/80 transition-transform group-hover:scale-125" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center p-4"
                    >
                      <Camera className="w-12 h-12 text-white/50 mx-auto mb-4 transition-transform group-hover:scale-110" />
                      <div className="text-white/70 mb-2">
                        {isDragActive ? 'Drop image here' : 'Drag & drop satellite image'}
                      </div>
                      <div className="text-sm text-white/50">Supports: JPEG, PNG, GIF</div>
                      <div className="text-sm text-white/50 mt-1">Max size: 10MB</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm text-white/70">
                      <span>Analyzing satellite data...</span>
                      <span>{Math.round(analyzeProgress)}%</span>
                    </div>
                    <Progress value={analyzeProgress} className="h-2" />
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                  >
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div className="whitespace-pre-line">{error}</div>
                  </motion.div>
                )}
                
                <ActionButton 
                  label={isAnalyzing ? 'Analyzing...' : 'Analyze Location'} 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || isFetchingImage}
                  className="w-full hover:scale-[1.02] transition-transform"
                />
                
                {riskScore !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 p-6 rounded-2xl text-center backdrop-blur-sm border border-white/10"
                  >
                    <div className="text-sm text-white/80 mb-2">Risk Assessment Score</div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-6xl font-bold text-white">
                        {riskScore}
                        <span className="text-2xl ml-2">/100</span>
                      </div>
                      <div className={`${getRiskLevel(riskScore).color} px-3 py-1 rounded-full text-sm font-medium`}>
                        {getRiskLevel(riskScore).label}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-white/70">
                      Analysis for coordinates: {coordinates.lat}, {coordinates.lng}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
