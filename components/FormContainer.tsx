'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FormStep1 } from './FormStep1';
import { FormStep2 } from './FormStep2';
import { SuccessScreen } from './SuccessScreen';

type Step = 'step1' | 'step2' | 'success';

export function FormContainer() {
  const [step, setStep] = useState<Step>('step1');
  const [formData, setFormData] = useState({ eventType: 'Battle grid', gameType: '', gameMode: '', teamSize: '1', collegeName: '', referredBy: '', teamName: '', members: [{ name: '', contact: '', email: '', gameId: '' }] });
  const [isLoading, setIsLoading] = useState(false);

  const handleStep1Next = (data: { name: string; contact: string; email: string; eventType: string; gameType: string; gameMode: string; teamSize: string; collegeName: string; referredBy?: string; teamName: string }) => {
    setFormData((prev) => ({
      ...prev,
      eventType: data.eventType,
      gameType: data.gameType,
      gameMode: data.gameMode,
      teamSize: data.teamSize,
      collegeName: data.collegeName,
      referredBy: data.referredBy || '',
      teamName: data.teamName,
      members: [{ name: data.name, contact: data.contact, email: data.email, gameId: '' }, ...prev.members.slice(1)]
    }));
    setStep('step2');
  };

  const handleStep2Back = () => {
    setStep('step1');
  };

  const handleStep2Complete = () => {
    setStep('success');
  };

  const handleReset = () => {
    setStep('step1');
    setFormData({ eventType: 'Battle grid', gameType: '', gameMode: '', teamSize: '1', collegeName: '', referredBy: '', teamName: '', members: [{ name: '', contact: '', email: '', gameId: '' }] });
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: { width: '100%', transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-900 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-zinc-900 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Main container */}
      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-8 h-8 rounded-full bg-zinc-50 text-zinc-950 flex items-center justify-center font-semibold text-sm"
                animate={{
                  scale: step === 'step1' || step === 'step2' || step === 'success' ? 1 : 1,
                }}
              >
                1
              </motion.div>
              <span className="text-zinc-400">Your Details</span>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step === 'step2' || step === 'success'
                    ? 'bg-zinc-50 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-500'
                  }`}
              >
                2
              </motion.div>
              <span
                className={step === 'step2' || step === 'success' ? 'text-zinc-400' : 'text-zinc-600'}
              >
                Payment
              </span>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step === 'success'
                    ? 'bg-green-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-500'
                  }`}
              >
                {step === 'success' ? '✓' : '3'}
              </motion.div>
              <span className={step === 'success' ? 'text-zinc-400' : 'text-zinc-600'}>
                Complete
              </span>
            </div>
          </div>

          {/* Progress line */}
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-zinc-50 to-zinc-300"
              variants={progressVariants}
              initial="hidden"
              animate={
                step === 'step1'
                  ? { width: '33.33%' }
                  : step === 'step2'
                    ? { width: '66.66%' }
                    : { width: '100%' }
              }
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 'step2' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: step === 'step2' ? -20 : 20 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          {step === 'step1' && (
            <FormStep1 onNext={handleStep1Next} isLoading={isLoading} />
          )}
          {step === 'step2' && (
          <FormStep2
              email={formData.members[0].email}
              eventType={formData.eventType}
              gameType={formData.gameType}
              gameMode={formData.gameMode}
              teamSize={formData.teamSize}
              captainName={formData.members[0].name}
              teamName={formData.teamName}
              onBack={handleStep2Back}
              onComplete={handleStep2Complete}
              isLoading={isLoading}
            />
          )}
          {step === 'success' && (
            <SuccessScreen
              onReset={handleReset}
              eventType={formData.eventType}
              gameType={formData.gameType}
              gameMode={formData.gameMode}
              teamSize={formData.teamSize}
              captainName={formData.members[0].name}
              teamName={formData.teamName}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}


