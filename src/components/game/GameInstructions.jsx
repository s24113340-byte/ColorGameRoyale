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
        <div className="space-y-3 text-lg md:text-xl mt-3 bg-slate-800/50 rounded-xl p-6">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">1 Match:</span>
            <span className="text-white font-bold">1:1 payout, +2s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">2 Match:</span>
            <span className="text-white font-bold">2:1 payout, +5s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-yellow-400 font-bold">3 Match (JACKPOT):</span>
            <span className="text-yellow-400 font-bold">3:1 payout, +10s ⚡</span>
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
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-4 text-lg md:text-xl bg-slate-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-blue-400 text-2xl">❄️</span>
              <span className="text-slate-200 font-medium">Freeze your bets</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-purple-400 text-2xl">☠️</span>
              <span className="text-slate-200 font-medium">Poison color tiles</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-2xl">⚡</span>
              <span className="text-slate-200 font-medium">Drain your score</span>
            </div>
          </div>
          <p className="text-purple-300 text-lg md:text-xl mt-6 font-bold bg-purple-900/30 rounded-xl p-4">
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
      <div className="relative w-full max-w-4xl mb-12">
        {/* Navigation Arrows */}
        <button
          onClick={prevCard}
          disabled={currentCard === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10 w-14 h-14 rounded-full bg-slate-800/90 backdrop-blur border-2 border-purple-500/50 flex items-center justify-center transition-all ${
            currentCard === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-purple-600 hover:scale-110 hover:border-purple-400'
          }`}
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>

        <button
          onClick={nextCard}
          disabled={currentCard === cards.length - 1}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10 w-14 h-14 rounded-full bg-slate-800/90 backdrop-blur border-2 border-purple-500/50 flex items-center justify-center transition-all ${
            currentCard === cards.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-purple-600 hover:scale-110 hover:border-purple-400'
          }`}
        >
          <ChevronRight className="w-7 h-7 text-white" />
        </button>

        {/* Card */}
        <AnimatePresence mode="wait">
          {(() => {
            const Icon = cards[currentCard].icon;
            return (
              <motion.div
                key={currentCard}
                initial={{ x: 100, opacity: 0, scale: 0.95 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -100, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-2 border-purple-500/40 rounded-3xl p-10 md:p-16 min-h-[500px] flex flex-col justify-center shadow-2xl shadow-purple-500/20"
              >
                <div className="flex flex-col items-center text-center gap-8">
                  <div className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl ${cards[currentCard].bgColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <Icon className={`w-14 h-14 md:w-16 md:h-16 ${cards[currentCard].iconColor}`} />
                  </div>
                  <div className="flex-1 max-w-2xl">
                    <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                      {cards[currentCard].title}
                    </h3>
                    <p className="text-slate-200 text-xl md:text-2xl leading-relaxed font-medium">
                      {cards[currentCard].description}
                    </p>
                    {cards[currentCard].extra && (
                      <div className="mt-8">
                        {cards[currentCard].extra}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCard(index)}
              className={`h-3 rounded-full transition-all ${
                index === currentCard 
                  ? 'bg-purple-500 w-12 shadow-lg shadow-purple-500/50' 
                  : 'bg-slate-600 w-3 hover:bg-slate-500 hover:w-6'
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