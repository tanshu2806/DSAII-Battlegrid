'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const WHATSAPP_LINK = 'https://chat.whatsapp.com/K4Y0GeS3dyhFF7qXPGJZih?mode=gi_t';

interface SuccessScreenProps {
  onReset: () => void;
  eventType?: string;
  gameType?: string;
  gameMode?: string;
  teamSize?: string;
  captainName?: string;
}

function getEntryFee(eventType?: string, gameType?: string, gameMode?: string): string {
  if (eventType === 'Battle grid') {
    if (gameType === 'Valorant') return '₹250';
    if (gameType === 'BGMI' || gameType === 'Free Fire') {
      if (gameMode === 'Squad') return '₹200';
      if (gameMode === 'Duo') return '₹120';
    }
    return '—';
  }
  if (eventType === 'Innovex') return '₹399 per team';
  if (eventType === 'CineQuest') return '₹299 per team';
  if (eventType === 'Geovoyager') return '₹149 per team';
  if (eventType === 'Contentflux') return '₹149 per team';
  return '—';
}

export function SuccessScreen({ onReset, eventType, gameType, gameMode, teamSize, captainName }: SuccessScreenProps) {
  const entryFee = getEntryFee(eventType, gameType, gameMode);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.div
      className="w-full max-w-md flex flex-col items-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Success icon */}
      <motion.div
        variants={itemVariants}
        className="w-24 h-24 rounded-full bg-green-950 border-2 border-green-500 flex items-center justify-center mb-6"
      >
        <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </motion.div>

      {/* Heading */}
      <motion.div variants={itemVariants} className="text-center mb-6">
        <h2 className="text-3xl font-bold text-zinc-50 mb-2">Registration Complete!</h2>
        <p className="text-zinc-400 text-sm">
          Your registration and payment have been received successfully.
        </p>
      </motion.div>

      {/* Registration Summary */}
      <motion.div variants={itemVariants} className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl mb-5">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Registration Summary</h3>
        <div className="space-y-2">
          {eventType && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Event</span>
              <span className="text-zinc-200 text-sm font-medium">{eventType}</span>
            </div>
          )}
          {gameType && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Game</span>
              <span className="text-zinc-200 text-sm font-medium">{gameType}</span>
            </div>
          )}
          {gameMode && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Mode</span>
              <span className="text-zinc-200 text-sm font-medium">{gameMode}</span>
            </div>
          )}
          {teamSize && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Team Size</span>
              <span className="text-zinc-200 text-sm font-medium">
                {teamSize} {Number(teamSize) === 1 ? 'Player' : 'Players'}
              </span>
            </div>
          )}
          {captainName && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Captain</span>
              <span className="text-zinc-200 text-sm font-medium">{captainName}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-zinc-800 mt-1">
            <span className="text-zinc-400 text-sm font-semibold">Entry Fee</span>
            <span className="text-green-400 text-sm font-bold">{entryFee}</span>
          </div>
        </div>
      </motion.div>

      {/* WhatsApp Group Section */}
      <motion.div variants={itemVariants} className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl mb-5">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-1">Join the WhatsApp Group</h3>
        <p className="text-zinc-500 text-xs mb-4">
          Get further information, updates, and announcements by joining our participant group.
          Click on the QR code or the button below to join.
        </p>

        {/* Clickable QR Code */}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center mb-4 group"
          title="Click to join WhatsApp group"
        >
          <div className="relative w-[220px] h-[220px] rounded-xl overflow-hidden border-2 border-zinc-700 group-hover:border-green-500 transition-colors duration-200 shadow-lg">
            <Image
              src="/QR.png"
              alt="WhatsApp Group QR Code"
              fill
              className="object-contain bg-white p-2"
            />
            <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/10 transition-colors duration-200 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold transition-opacity">
                Click to Join
              </span>
            </div>
          </div>
        </a>

        {/* Join button */}
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
          <button className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold h-11 rounded-lg transition-colors duration-200">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Join WhatsApp Group
          </button>
        </a>
      </motion.div>

      {/* Reset button */}
      <motion.div variants={itemVariants} className="w-full">
        <Button
          onClick={onReset}
          className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200 font-semibold h-12 rounded-lg transition-colors"
        >
          Submit Another Form
        </Button>
      </motion.div>
    </motion.div>
  );
}
