import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Droplets, Leaf, Sun, Skull, RefreshCw, Star } from 'lucide-react';

const ENDINGS = {
  fire: {
    title: 'THE FIRE ENDING',
    subtitle: 'Blaze of Glory',
    description: 'The flames of passion have consumed the shadow! The Chromatic Kingdom rises anew from the ashes, reborn in eternal fire. Ren\'s warrior spirit guides the realm into an age of strength and courage.',
    icon: Flame,
    color: '#FF3B3B',
    bgGradient: 'from-red-950 via-orange-950 to-yellow-950',
    emoji: '🔥',
  },
  water: {
    title: 'THE WATER ENDING',
    subtitle: 'Tidal Harmony',
    description: 'The cleansing waters have washed away the darkness! Rivers of light flow through the kingdom, bringing peace and tranquility. Rei\'s wisdom guides the realm into an age of harmony.',
    icon: Droplets,
    color: '#3B82F6',
    bgGradient: 'from-blue-950 via-cyan-950 to-teal-950',
    emoji: '🌊',
  },
  nature: {
    title: 'THE NATURE ENDING',
    subtitle: 'Eternal Growth',
    description: 'Life has triumphed over the void! Forests of crystal and gardens of light bloom across the kingdom. The natural order is restored, and balance returns to all things.',
    icon: Leaf,
    color: '#10B981',
    bgGradient: 'from-green-950 via-emerald-950 to-teal-950',
    emoji: '🌿',
  },
  light: {
    title: 'THE LIGHT ENDING',
    subtitle: 'Dawn Eternal',
    description: 'Pure radiance has banished the shadow forever! The kingdom basks in perpetual golden light, and hope shines in every heart. A new golden age begins.',
    icon: Sun,
    color: '#FBBF24',
    bgGradient: 'from-yellow-950 via-amber-950 to-orange-950',
    emoji: '✨',
  },
  chaos: {
    title: 'THE CHAOTIC ENDING',
    subtitle: 'Shadows Eternal',
    description: 'Umbra\'s darkness has consumed the Chromatic Kingdom... The colors fade to gray, and shadow reigns supreme. Perhaps another champion will rise to challenge the darkness...',
    icon: Skull,
    color: '#6B21A8',
    bgGradient: 'from-purple-950 via-slate-950 to-black',
    emoji: '💀',
  },
};

export default function EndingCinematic({ ending, score, champion, onRestart }) {
  const [phase, setPhase] = useState('intro');
  const endingData = ENDINGS[ending] || ENDINGS.chaos;
  const isVictory = ending !== 'chaos';

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('title'), 2000),
      setTimeout(() => setPhase('content'), 4000),
      setTimeout(() => setPhase('stats'), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen bg-gradient-to-b ${endingData.bgGradient} flex flex-col items-center justify-center px-4 py-8`}
    >
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ background: endingData.color }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * -500],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Intro phase */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl md:text-9xl mb-4"
            >
              {endingData.emoji}
            </motion.div>
            <p className="text-slate-400 text-lg tracking-widest">
              {isVictory ? 'VICTORY...' : 'DEFEAT...'}
            </p>
          </motion.div>
        )}

        {/* Title phase */}
        {phase === 'title' && (
          <motion.div
            key="title"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="mb-4"
            >
              <endingData.icon 
                className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4"
                style={{ color: endingData.color }}
              />
            </motion.div>
            <h1 
              className="text-4xl md:text-6xl font-black tracking-wider"
              style={{ 
                color: endingData.color,
                textShadow: `0 0 30px ${endingData.color}50`,
              }}
            >
              {endingData.title}
            </h1>
            <p className="text-2xl text-slate-300 mt-2 tracking-widest">
              {endingData.subtitle}
            </p>
          </motion.div>
        )}

        {/* Content phase */}
        {(phase === 'content' || phase === 'stats') && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl text-center"
          >
            {/* Icon and title */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-6"
            >
              <div 
                className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{ 
                  background: `${endingData.color}20`,
                  boxShadow: `0 0 50px ${endingData.color}30`,
                }}
              >
                <endingData.icon 
                  className="w-12 h-12"
                  style={{ color: endingData.color }}
                />
              </div>
            </motion.div>

            <h1 
              className="text-3xl md:text-5xl font-black mb-2"
              style={{ color: endingData.color }}
            >
              {endingData.title}
            </h1>
            <p className="text-xl text-slate-400 mb-8">{endingData.subtitle}</p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-slate-300 leading-relaxed mb-12 px-4"
            >
              {endingData.description}
            </motion.p>

            {/* Stats - only show in stats phase */}
            {phase === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Champion info */}
                {champion && (
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {ending === 'chaos' && champion.id === 'ren' ? (
                      <div className="relative">
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/d7e7f976c_unnamed__2_-removebg-preview.png"
                          alt="Defeated Ren"
                          className="w-48 h-48 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        {/* Defeated stars floating above */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute text-2xl"
                            initial={{ 
                              x: -24 + (i * 10),
                              y: -40 - (i % 2) * 10,
                              opacity: 1,
                              rotate: 0,
                            }}
                            animate={{ 
                              y: [-40 - (i % 2) * 10, -60 - (i % 2) * 15, -40 - (i % 2) * 10],
                              x: [-24 + (i * 10) + Math.sin(i) * 5, -24 + (i * 10) - Math.sin(i) * 5, -24 + (i * 10) + Math.sin(i) * 5],
                              opacity: [0.3, 0.8, 0.2, 0.8, 0.3],
                              rotate: [0, -15, 15, -10, 0],
                              scale: [0.8, 1, 0.7, 1, 0.8],
                            }}
                            transition={{
                              duration: 3 + i * 0.3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.2,
                            }}
                            style={{ filter: 'blur(0.5px)' }}
                          >
                            ✨
                          </motion.div>
                        ))}
                      </div>
                    ) : champion.sprite.startsWith('http') ? (
                      <img 
                        src={champion.sprite} 
                        alt={champion.name}
                        className="w-16 h-16 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <span className="text-4xl">{champion.sprite}</span>
                    )}
                    <div className="text-left">
                      <p className="text-slate-400 text-sm">Champion</p>
                      <p className="font-bold text-white text-xl">{champion.name}</p>
                    </div>
                  </div>
                )}

                {/* Score */}
                <div 
                  className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl"
                  style={{ background: `${endingData.color}20` }}
                >
                  <Trophy className="w-8 h-8" style={{ color: endingData.color }} />
                  <div className="text-left">
                    <p className="text-slate-400 text-sm">Final Score</p>
                    <p 
                      className="font-black text-4xl"
                      style={{ color: endingData.color }}
                    >
                      {score.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          i < Math.min(5, Math.floor(score / 100) + (isVictory ? 2 : 0))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Play again button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRestart}
                  className="mt-8 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto"
                  style={{
                    background: `linear-gradient(135deg, ${endingData.color}, ${endingData.color}aa)`,
                    boxShadow: `0 10px 30px ${endingData.color}40`,
                  }}
                >
                  <RefreshCw className="w-5 h-5" />
                  PLAY AGAIN
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}