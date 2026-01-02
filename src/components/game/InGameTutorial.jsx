import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Color Game Royale!',
    description: 'Let me show you how to play. You can skip this tutorial anytime.',
    position: 'center',
    arrow: null,
  },
  {
    id: 'hud',
    title: 'Your Resources',
    description: 'Keep an eye on your Coins (for betting), Timer, and Score at the top.',
    position: 'top',
    arrow: 'down',
    highlightSelector: '.game-hud',
  },
  {
    id: 'shadow-meter',
    title: 'Umbra\'s Shadow Meter',
    description: 'Defeat Umbra by reducing his shadow meter to zero! Win matches to damage him.',
    position: 'top-right',
    arrow: 'down',
    highlightSelector: '.shadow-meter',
  },
  {
    id: 'betting',
    title: 'Place Your Bets',
    description: 'Click on any color panel around the board to place a bet. Each bet costs coins.',
    position: 'left',
    arrow: 'right',
    highlightSelector: '.betting-panel',
  },
  {
    id: 'bet-amount',
    title: 'Adjust Bet Amount',
    description: 'Use these buttons to increase or decrease your bet size (5-50 coins).',
    position: 'bottom',
    arrow: 'up',
    highlightSelector: '.bet-controls',
  },
  {
    id: 'drop',
    title: 'Drop the Balls',
    description: 'Once you\'ve placed bets, click DROP BALLS to see where they land!',
    position: 'bottom',
    arrow: 'up',
    highlightSelector: '.drop-button',
  },
  {
    id: 'winning',
    title: 'Match Colors to Win',
    description: 'If balls land on colors you bet on, you win! 3 matches = JACKPOT with bonus time.',
    position: 'center',
    arrow: null,
  },
  {
    id: 'umbra',
    title: 'Beware of Umbra',
    description: 'Umbra will interfere with freeze, poison, and score drain abilities. Stay sharp!',
    position: 'bottom-left',
    arrow: 'left',
    highlightSelector: '.umbra-dragon',
  },
  {
    id: 'ready',
    title: 'You\'re Ready!',
    description: 'Win by depleting Umbra\'s shadow meter before time runs out. Good luck!',
    position: 'center',
    arrow: null,
  },
];

const ARROW_COMPONENTS = {
  down: ArrowDown,
  up: ArrowUp,
  left: ArrowLeft,
  right: ArrowRight,
};

export default function InGameTutorial({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const Arrow = step.arrow ? ARROW_COMPONENTS[step.arrow] : null;

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
        return 'top-32 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-32 right-8';
      case 'bottom':
        return 'bottom-32 left-1/2 -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-32 left-8';
      case 'left':
        return 'left-8 top-1/2 -translate-y-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  const getArrowClasses = () => {
    switch (step.arrow) {
      case 'down':
        return '-top-8 left-1/2 -translate-x-1/2';
      case 'up':
        return '-bottom-8 left-1/2 -translate-x-1/2';
      case 'left':
        return '-left-8 top-1/2 -translate-y-1/2';
      case 'right':
        return '-right-8 top-1/2 -translate-y-1/2';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
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
            {/* Animated arrow */}
            {Arrow && (
              <motion.div
                animate={{ 
                  y: step.arrow === 'down' ? [0, 8, 0] : step.arrow === 'up' ? [0, -8, 0] : 0,
                  x: step.arrow === 'left' ? [0, -8, 0] : step.arrow === 'right' ? [0, 8, 0] : 0,
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`absolute ${getArrowClasses()}`}
              >
                <Arrow className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
              </motion.div>
            )}

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
                  {currentStep === TUTORIAL_STEPS.length - 1 ? 'START PLAYING!' : 'NEXT'}
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