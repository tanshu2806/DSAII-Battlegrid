'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface FormStep2Props {
  email: string;
  eventType: string;
  gameType?: string;
  gameMode?: string;
  teamSize?: string;
  captainName?: string;
  teamName?: string;
  onBack: () => void;
  onComplete: () => void;
  isLoading: boolean;
}

// Entry fee lookup based on event, game, and mode
function getEntryFee(eventType: string, gameType?: string, gameMode?: string): string {
  if (eventType === 'Battle grid') {
    if (gameType === 'Valorant') return '₹250';
    if (gameType === 'BGMI' || gameType === 'Free Fire') {
      if (gameMode === 'Squad') return '₹200';
      if (gameMode === 'Duo') return '₹120';
    }
    return '—';
  }
  if (eventType === 'The Spiral') return '₹299 per team';
  if (eventType === 'Innovex') return '₹399 per team';
  if (eventType === 'CineQuest') return '₹299 per team';
  if (eventType === 'Geovoyager') return '₹149 per team';
  if (eventType === 'Contentflux') return '₹149 per team';
  return '—';
}

// Events that use Payment_SS1; all others were by default SS2 unless overridden
const SS1_EVENTS = new Set(['The Spiral', 'Geovoyager']);

export function FormStep2({ email, eventType, gameType, gameMode, teamSize, captainName, teamName, onBack, onComplete, isLoading }: FormStep2Props) {
  let qrImage = '/Payment_SS2.jpeg';
  if (eventType === 'The Spiral' || eventType === 'Geovoyager') {
    qrImage = '/Payment_SS1.jpeg';
  } else if (eventType === 'Battle grid') {
    qrImage = '/BattleGridPaymentSS.jpeg';
  }
  const entryFee = getEntryFee(eventType, gameType, gameMode);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'image/jpeg' && selectedFile.type !== 'image/png') {
      setError('Please select a valid image file (JPG or PNG)');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a screenshot');
      return;
    }

    if (!transactionId.trim()) {
      setError('Please enter your Transaction ID');
      return;
    }

    if (isUploading) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email);
      formData.append('transactionId', transactionId.trim());
      formData.append('eventType', eventType);

      const response = await fetch('/api/upload-screenshot', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onComplete();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to upload screenshot');
        setIsUploading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsUploading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-50 mb-2">Upload Payment Screenshot</h2>
        <p className="text-zinc-400">Share your payment confirmation</p>
      </motion.div>

      {error && (
        <motion.div
          variants={itemVariants}
          className="mb-6 p-4 bg-red-950 border border-red-800 rounded-lg text-red-200"
        >
          {error}
        </motion.div>
      )}

      {/* Registration summary card */}
      <motion.div variants={itemVariants} className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Registration Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-sm">Event</span>
            <span className="text-zinc-200 text-sm font-medium">{eventType}</span>
          </div>
          {gameType && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Game</span>
              <span className="text-zinc-200 text-sm font-medium">{gameType}</span>
            </div>
          )}
          {teamSize && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Team Size</span>
              <span className="text-zinc-200 text-sm font-medium">{teamSize} {Number(teamSize) === 1 ? 'Player' : 'Players'}</span>
            </div>
          )}
          {captainName && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Captain</span>
              <span className="text-zinc-200 text-sm font-medium">{captainName}</span>
            </div>
          )}
          {teamName && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Team Name</span>
              <span className="text-zinc-200 text-sm font-medium">{teamName}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-zinc-800 mt-1">
            <span className="text-zinc-400 text-sm font-semibold">Entry Fee</span>
            <span className="text-green-400 text-sm font-bold">{entryFee}</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 flex flex-col items-center">
        <p className="text-zinc-400 text-sm mb-1">Scan the QR code below to make your payment</p>
        {eventType && (
          <p className="text-zinc-500 text-xs mb-3">Event: <span className="text-zinc-300 font-medium">{eventType}</span></p>
        )}
        <div className="relative w-56 h-56 rounded-xl overflow-hidden border border-zinc-700 shadow-lg">
          <Image
            key={qrImage}
            src={qrImage}
            alt={`Payment QR Code for ${eventType}`}
            fill
            className="object-contain bg-white"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Transaction ID
        </label>
        <input
          type="text"
          placeholder="Enter your payment Transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full h-12 px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-50 rounded-lg placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
        />
        <p className="text-zinc-600 text-xs mt-1">
          Enter the UTR / Transaction reference number from your payment app
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="mb-8 p-8 border-2 border-dashed border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors cursor-pointer bg-zinc-900/50"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
        />

        {preview ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-zinc-800">
              <Image
                src={preview}
                alt="Payment screenshot preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-medium">{file?.name}</p>
              <p className="text-zinc-500 text-sm">
                {(file!.size / 1024).toFixed(1)} KB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                }}
                className="text-zinc-400 hover:text-zinc-300 text-sm mt-2 underline"
              >
                Change file
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg
              className="w-12 h-12 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <div className="text-center">
              <p className="text-zinc-300 font-medium">Drag and drop your screenshot</p>
              <p className="text-zinc-500 text-sm">or click to select a file</p>
            </div>
            <p className="text-zinc-600 text-xs">JPG or PNG, max 5MB</p>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-3">
        <Button
          type="button"
          onClick={onBack}
          disabled={isUploading}
          variant="outline"
          className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50 h-12 rounded-lg"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isUploading || !file}
          className="flex-1 bg-zinc-50 text-zinc-950 hover:bg-zinc-200 font-semibold h-12 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Uploading...
            </span>
          ) : 'Complete'}
        </Button>
      </motion.div>
    </motion.form>
  );
}