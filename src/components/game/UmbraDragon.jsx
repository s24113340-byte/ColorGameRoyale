import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Zap, Snowflake } from 'lucide-react';

export default function UmbraDragon({ gameState }) {
  const { umbraActive, umbraAbility, umbraRageMode, umbraFinalBoss, shadowMeter } = gameState;
  
  // Determine dragon animation state
  const getAnimationState = () => {
    if (umbraActive) return 'attacking';
    if (umbraRageMode) return 'rage';
    if (umbraFinalBoss) return 'final';
    return 'idle';
  };

  const animState = getAnimationState();
  
  // Eye glow based on state
  const eyeColor = umbraRageMode ? '#FF0000' : umbraFinalBoss ? '#8B5CF6' : '#FF6B6B';

  return (
    <div className="fixed top-4 left-4 z-40 pointer-events-none">
      <motion.div
        animate={{
          scale: animState === 'attacking' ? [1, 1.1, 1] : animState === 'rage' ? [1, 1.05, 1] : 1,
          rotate: animState === 'attacking' ? [0, -5, 5, 0] : 0,
        }}
        transition={{ duration: 0.5, repeat: animState === 'attacking' ? 3 : 0 }}
        className="relative"
      >
        {/* Dragon pixel art container */}
        <div className="relative w-48 h-48">
          {/* Actual pixel art dragon image */}
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/ca5463876_image.png"
            alt="Umbra Dragon"
            className="w-full h-full object-contain"
            style={{
              imageRendering: 'pixelated',
              filter: umbraRageMode ? 'brightness(1.3) saturate(1.5)' : umbraFinalBoss ? 'brightness(1.2) hue-rotate(20deg)' : 'none',
            }}
          />

          {/* Ability effects */}
          <AnimatePresence>
            {umbraActive && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {umbraAbility === 'freeze' && (
                  <Snowflake className="w-12 h-12 text-blue-400" />
                )}
                {umbraAbility === 'score-drain' && (
                  <Skull className="w-12 h-12 text-purple-400" />
                )}
                {umbraAbility === 'poison' && (
                  <div className="text-4xl">☠️</div>
                )}
                {(umbraAbility === 'shadow-surge' || umbraAbility === 'elemental-drain' || umbraAbility === 'corruption') && (
                  <Zap className="w-12 h-12 text-red-500" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rage/Final boss aura */}
          {(umbraRageMode || umbraFinalBoss) && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${umbraFinalBoss ? '#8B5CF6' : '#FF0000'}40, transparent 70%)`,
                filter: 'blur(20px)',
              }}
            />
          )}

          {/* Breathing fire animation when attacking */}
          <AnimatePresence>
            {umbraActive && (
              <>
                <motion.div
                  initial={{ x: 20, opacity: 1, scale: 0.5 }}
                  animate={{ x: 120, opacity: 0, scale: 2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                >
                  <div className="text-4xl">🔥</div>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 1, scale: 0.3 }}
                  animate={{ x: 100, opacity: 0, scale: 1.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                >
                  <div className="text-3xl">🔥</div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Shadow meter bar under dragon */}
        <div className="mt-2 w-48">
          <div className="h-3 bg-slate-900 rounded-lg overflow-hidden border-2 border-purple-500/50">
            <motion.div
              animate={{ width: `${shadowMeter}%` }}
              className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"
              style={{
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.8)',
              }}
            />
          </div>
          <div className="text-center text-sm font-black text-purple-400 mt-1 tracking-wider">
            UMBRA {shadowMeter}%
          </div>
        </div>
      </motion.div>
    </div>
  );
}