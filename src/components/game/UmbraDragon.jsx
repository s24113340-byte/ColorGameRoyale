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
        {/* Pixel Art Dragon */}
        <div className="relative w-40 h-40">
          {/* Dragon body - pixel art style */}
          <svg viewBox="0 0 160 160" className="w-full h-full">
            {/* Body */}
            <rect x="40" y="80" width="60" height="50" fill="#5A9FCB" />
            
            {/* Legs */}
            <rect x="45" y="125" width="15" height="25" fill="#4A7FA8" />
            <rect x="80" y="125" width="15" height="25" fill="#4A7FA8" />
            
            {/* Claws */}
            <rect x="42" y="145" width="4" height="5" fill="#2C4A5C" />
            <rect x="48" y="145" width="4" height="5" fill="#2C4A5C" />
            <rect x="54" y="145" width="4" height="5" fill="#2C4A5C" />
            <rect x="78" y="145" width="4" height="5" fill="#2C4A5C" />
            <rect x="84" y="145" width="4" height="5" fill="#2C4A5C" />
            <rect x="90" y="145" width="4" height="5" fill="#2C4A5C" />
            
            {/* Belly */}
            <rect x="48" y="90" width="44" height="35" fill="#E8C49A" />
            
            {/* Neck */}
            <rect x="30" y="50" width="30" height="35" fill="#5A9FCB" />
            
            {/* Head */}
            <rect x="15" y="30" width="35" height="30" fill="#6BB0D9" />
            
            {/* Snout */}
            <rect x="5" y="40" width="15" height="15" fill="#7AC0E8" />
            
            {/* Horns */}
            <rect x="20" y="20" width="6" height="12" fill="#2C4A5C" />
            <rect x="34" y="20" width="6" height="12" fill="#2C4A5C" />
            
            {/* Spikes on head - magenta */}
            <rect x="28" y="25" width="4" height="8" fill="#E63E8B" />
            <rect x="34" y="28" width="4" height="8" fill="#E63E8B" />
            <rect x="40" y="32" width="4" height="8" fill="#E63E8B" />
            
            {/* Back spikes */}
            <rect x="50" y="75" width="5" height="8" fill="#E63E8B" />
            <rect x="60" y="73" width="5" height="10" fill="#E63E8B" />
            <rect x="70" y="75" width="5" height="8" fill="#E63E8B" />
            <rect x="80" y="77" width="5" height="6" fill="#E63E8B" />
            
            {/* Tail */}
            <path d="M 100 100 Q 120 90, 140 85 Q 145 83, 150 80" 
                  stroke="#5A9FCB" strokeWidth="12" fill="none"/>
            
            {/* Eyes - glowing */}
            <motion.g
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <circle cx="25" cy="42" r="3" fill={eyeColor} />
              <circle cx="35" cy="42" r="3" fill={eyeColor} />
              
              {/* Eye glow */}
              <circle cx="25" cy="42" r="5" fill={eyeColor} opacity="0.4" />
              <circle cx="35" cy="42" r="5" fill={eyeColor} opacity="0.4" />
            </motion.g>
            
            {/* Teeth */}
            <rect x="8" y="50" width="3" height="4" fill="#FFFFFF" />
            <rect x="12" y="50" width="3" height="4" fill="#FFFFFF" />
            <rect x="16" y="50" width="3" height="4" fill="#FFFFFF" />
          </svg>

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
        <div className="mt-2 w-40">
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