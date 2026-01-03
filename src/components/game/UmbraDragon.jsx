import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Zap, Snowflake } from 'lucide-react';

const ENEMY_SPRITES = {
  1: { sprite: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/c46751887_goblin.png', name: 'Goblin', color: '#10B981' },
  2: { emoji: '🧚', name: 'Little Fairies', color: '#22C55E' },
  3: { emoji: '⚔️', name: 'Dark Knights', color: '#84CC16' },
  4: { emoji: '👹', name: 'Ogres', color: '#78716C' },
  5: { emoji: '🦅', name: 'Rukh', color: '#57534E' },
  6: { emoji: '🧙', name: 'Mystical Magi', color: '#F59E0B' },
  7: { emoji: '🦎', name: 'Giant Fire Lizard', color: '#D97706' },
  8: { emoji: '🧊', name: 'Huge Ice Guardian', color: '#06B6D4' },
  9: { emoji: '👑', name: 'Ice Queen', color: '#3B82F6' },
  10: { emoji: '🐉', name: 'UMBRA', color: '#1E1B4B' },
};

export default function UmbraDragon({ gameState }) {
  const currentLevel = gameState.selectedLevel || 10;
  const enemy = ENEMY_SPRITES[currentLevel] || ENEMY_SPRITES[10];
  const isUmbra = currentLevel === 10;
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
    <div className="fixed top-4 left-4 z-40 pointer-events-none umbra-dragon">
      <motion.div
        animate={{
          scale: animState === 'attacking' ? [1, 1.1, 1] : animState === 'rage' ? [1, 1.05, 1] : 1,
          rotate: animState === 'attacking' ? [0, -5, 5, 0] : 0,
        }}
        transition={{ duration: 0.5, repeat: animState === 'attacking' ? 3 : 0 }}
        className="relative"
      >
        {/* Enemy sprite container */}
        <motion.div 
          className="relative w-48 h-48"
          animate={{
            y: animState === 'idle' ? [0, -8, 0] : animState === 'attacking' ? [0, -12, 0] : [0, -10, 0],
            x: animState === 'idle' ? [0, 3, 0, -3, 0] : 0,
          }}
          transition={{
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {isUmbra ? (
            /* Pixel art dragon for Umbra */
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/6b6773e3e_Umbra-removebg-preview.png"
              alt="Umbra Dragon"
              className="w-full h-full object-contain"
              style={{
                imageRendering: 'pixelated',
                filter: umbraRageMode ? 'brightness(1.3) saturate(1.5) drop-shadow(0 0 20px #FF0000)' : umbraFinalBoss ? 'brightness(1.2) hue-rotate(20deg) drop-shadow(0 0 20px #8B5CF6)' : 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))',
                mixBlendMode: 'normal',
              }}
            />
          ) : enemy.sprite ? (
            /* Image sprite for enemies with custom assets */
            <img 
              src={enemy.sprite}
              alt={enemy.name}
              className="w-full h-full object-contain"
              style={{
                imageRendering: 'pixelated',
                filter: `drop-shadow(0 0 20px ${enemy.color})`,
              }}
            />
          ) : (
            /* Emoji sprite for minions */
            <div 
              className="w-full h-full flex items-center justify-center text-9xl"
              style={{
                filter: `drop-shadow(0 0 20px ${enemy.color})`,
              }}
            >
              {enemy.emoji}
            </div>
          )}
        </motion.div>

        {/* Ability effects */}
        <AnimatePresence>
          {umbraActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute top-24 left-24"
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
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-0 left-0 w-48 h-48 rounded-full -z-10"
            style={{
              background: `radial-gradient(circle, ${umbraFinalBoss ? '#8B5CF6' : '#FF0000'}60, transparent 70%)`,
              filter: 'blur(30px)',
            }}
          />
        )}

        {/* Breathing fire animation when attacking */}
        <AnimatePresence>
          {umbraActive && (
            <>
              <motion.div
                initial={{ x: 40, opacity: 1, scale: 0.5 }}
                animate={{ x: 150, opacity: 0, scale: 2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute left-0 top-20"
              >
                <div className="text-4xl">🔥</div>
              </motion.div>
              <motion.div
                initial={{ x: 40, opacity: 1, scale: 0.3 }}
                animate={{ x: 130, opacity: 0, scale: 1.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="absolute left-0 top-24"
              >
                <div className="text-3xl">🔥</div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* HP/Shadow meter bar under enemy */}
        <div className="mt-2 w-48">
          <div 
            className="h-3 bg-slate-900 rounded-lg overflow-hidden border-2"
            style={{ borderColor: `${enemy.color}80` }}
          >
            <motion.div
              animate={{ width: `${shadowMeter}%` }}
              className="h-full"
              style={{
                background: isUmbra 
                  ? 'linear-gradient(to right, #9333ea, #ec4899, #9333ea)' 
                  : `linear-gradient(to right, ${enemy.color}, ${enemy.color}aa)`,
                boxShadow: `0 0 15px ${enemy.color}`,
              }}
            />
          </div>
          <div 
            className="text-center text-sm font-black mt-1 tracking-wider"
            style={{ color: enemy.color }}
          >
            {enemy.name.toUpperCase()} {shadowMeter}%
          </div>
        </div>
      </motion.div>
    </div>
  );
}