import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to PVP Battle!',
    description: 'Two players compete for the highest score. Let me show you how to play.',
    position: 'center',
  },
  {
    id: 'players',
    title: 'Player Scores & Status',
    description: 'Keep track of both players\' scores, coins, and integrity here. The current player is highlighted.',
    position: 'top',
  },
  {
    id: 'turns',
    title: 'Turn-Based Gameplay',
    description: 'Players take turns betting on colors and dropping balls. You have 10 turns to outscore your opponent!',
    position: 'top-right',
  },
  {
    id: 'betting',
    title: 'Place Your Bets',
    description: 'Click on any color panel to bet 10 coins. Your bets are shown on each panel.',
    position: 'middle',
  },
  {
    id: 'dropping',
    title: 'Drop Balls',
    description: 'Once you\'ve placed your bets, click "Drop Balls" to see if you win!',
    position: 'bottom',
  },
  {
    id: 'interference',
    title: 'Interference Attacks',
    description: 'Spend coins to sabotage your opponent! Freeze their turn or drain their score.',
    position: 'bottom',
  },
  {
    id: 'winning',
    title: 'Match Colors to Score',
    description: 'When balls land on colors you bet on, you win coins and points. 3 matches = 3x payout!',
    position: 'center',
  },
  {
    id: 'strategy',
    title: 'Strategic Play',
    description: 'Balance betting, scoring, and attacking. Save coins for crucial interference attacks!',
    position: 'center',
  },
  {
    id: 'ready',
    title: 'Ready to Battle!',
    description: 'The player with the highest score after 10 turns wins. Good luck!',
    position: 'center',
  },
];

export default function PVPTutorial({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        nextStep();
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const getPositionClasses = () => {
    switch (step.position) {
      case 'top':
        return 'top-[140px] left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-[80px] right-[5%]';
      case 'middle':
        return 'top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom':
        return 'bottom-[120px] left-1/2 -translate-x-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <>
      {/* Dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[100]"
        onClick={nextStep}
      />

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onClick={onSkip}
        className="fixed top-6 right-6 z-[102] px-6 py-3 bg-slate-800/90 hover:bg-slate-700 rounded-xl text-white font-bold flex items-center gap-2 border border-slate-600 transition-colors"
      >
        <X className="w-5 h-5" />
        SKIP TUTORIAL
      </motion.button>

      {/* Tutorial card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed z-[101] ${getPositionClasses()}`}
        >
          <div className="relative max-w-md">
            {/* Card */}
            <div className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-xl border-2 border-purple-500/60 rounded-2xl p-8 shadow-2xl shadow-purple-500/30">
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-slate-200 text-lg md:text-xl leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Progress */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {TUTORIAL_STEPS.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentStep
                            ? 'bg-purple-500 w-8'
                            : index < currentStep
                            ? 'bg-purple-700 w-4'
                            : 'bg-slate-600 w-2'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-400 text-sm font-bold">
                    {currentStep + 1} / {TUTORIAL_STEPS.length}
                  </span>
                </div>

                {/* Next button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextStep}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white text-lg font-bold shadow-lg transition-all"
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? 'START BATTLE!' : 'NEXT'}
                </motion.button>

                <p className="text-slate-400 text-sm mt-3">
                  Press Enter or click to continue
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}