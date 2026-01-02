import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Target, Timer, Trophy, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GameInstructions({ onStart, gameMode, champion }) {
  const [currentCard, setCurrentCard] = useState(0);

  const cards = [
    {
      icon: Coins,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      title: 'Place Your Bets',
      description: 'Click on any color panel around the board to place bets. Adjust your bet amount using the + and - buttons.',
    },
    {
      icon: Target,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/20',
      title: 'Drop Balls',
      description: 'Press "DROP BALLS" to release 3 balls onto the grid. They\'ll land on random tiles.',
    },
    {
      icon: Trophy,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      title: 'Match & Win',
      description: 'Win coins and time when balls match your bet colors:',
      extra: (
        <div className="space-y-1 text-sm mt-3">
          <div className="flex justify-between">
            <span className="text-slate-400">1 Match:</span>
            <span className="text-white">1:1 payout, +2s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">2 Match:</span>
            <span className="text-white">2:1 payout, +5s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-400">3 Match (JACKPOT):</span>
            <span className="text-yellow-400">3:1 payout, +10s</span>
          </div>
        </div>
      ),
    },
    {
      icon: Timer,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/20',
      title: 'Beat the Clock',
      description: gameMode === 'normal' 
        ? "Deplete Umbra's Shadow Meter before time runs out to win!"
        : "Score as many points as you can before time runs out!",
    },
  ];

  if (gameMode === 'normal') {
    cards.push({
      icon: Shield,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/30',
      title: '⚠️ Beware of Umbra',
      description: 'Umbra the dragon will interfere with your game! He can:',
      extra: (
        <div>
          <div className="grid grid-cols-1 gap-2 text-sm mt-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">❄️</span>
              <span className="text-slate-300">Freeze your bets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">☠️</span>
              <span className="text-slate-300">Poison color tiles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚡</span>
              <span className="text-slate-300">Drain your score</span>
            </div>
          </div>
          <p className="text-purple-200 text-sm mt-3 font-bold">
            💡 Tip: When Umbra's meter is low, he gets more aggressive!
          </p>
        </div>
      ),
    });
  }

  const nextCard = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === 'ArrowLeft') prevCard();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8 flex flex-col items-center justify-center"
    >
      {/* Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
          HOW TO PLAY
        </h2>
        <p className="text-purple-300">Master the colors and defeat Umbra</p>
      </motion.div>

      {/* Champion Display */}
      {champion && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-slate-900/50 backdrop-blur border border-slate-700 rounded-xl">
            <div className="text-4xl">
              {champion.sprite.startsWith('http') ? (
                <img src={champion.sprite} alt={champion.name} className="w-16 h-16 object-contain" style={{ imageRendering: 'pixelated' }} />
              ) : (
                <span>{champion.sprite}</span>
              )}
            </div>
            <div className="text-left">
              <p className="text-slate-400 text-xs">You're playing as</p>
              <p className="text-white font-bold text-lg" style={{ color: champion.colors.primary }}>
                {champion.name}
              </p>
              <p className="text-slate-400 text-xs">{champion.title}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Card Carousel */}
      <div className="relative w-full max-w-2xl mb-8">
        {/* Navigation Arrows */}
        <button
          onClick={prevCard}
          disabled={currentCard === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-12 rounded-full bg-slate-800/80 backdrop-blur border border-slate-700 flex items-center justify-center transition-all ${
            currentCard === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-700 hover:scale-110'
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={nextCard}
          disabled={currentCard === cards.length - 1}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-12 rounded-full bg-slate-800/80 backdrop-blur border border-slate-700 flex items-center justify-center transition-all ${
            currentCard === cards.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-700 hover:scale-110'
          }`}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-slate-900/50 backdrop-blur border border-purple-500/30 rounded-2xl p-8 md:p-12 min-h-[400px] flex flex-col"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className={`w-16 h-16 rounded-xl ${cards[currentCard].bgColor} flex items-center justify-center flex-shrink-0`}>
                <cards[currentCard].icon className={`w-8 h-8 ${cards[currentCard].iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {cards[currentCard].title}
                </h3>
                <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                  {cards[currentCard].description}
                </p>
                {cards[currentCard].extra && (
                  <div className="mt-4">
                    {cards[currentCard].extra}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCard(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentCard 
                  ? 'bg-purple-500 w-8' 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Start Button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <Button
          onClick={onStart}
          size="lg"
          className="px-12 py-6 text-xl font-black bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
        >
          START BATTLE
        </Button>
        <p className="text-slate-500 text-sm mt-3">Use arrow keys ← → or click arrows to navigate</p>
      </motion.div>
    </motion.div>
  );
}