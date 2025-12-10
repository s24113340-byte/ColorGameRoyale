import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Skull, Snowflake, Biohazard } from 'lucide-react';

const UMBRA_ABILITIES = {
  'score-drain': {
    icon: Skull,
    title: 'SCORE DRAIN',
    description: 'Umbra steals half your winnings!',
    color: '#A855F7',
  },
  'freeze': {
    icon: Snowflake,
    title: 'FREEZE TURN',
    description: 'Time is frozen!',
    color: '#3B82F6',
  },
  'poison': {
    icon: Biohazard,
    title: 'POISONED SQUARES',
    description: 'A color square has been cursed!',
    color: '#10B981',
  },
  'shadow-surge': {
    icon: Skull,
    title: 'SHADOW SURGE',
    description: 'Devastating attack drains score and time!',
    color: '#6B21A8',
  },
  'elemental-drain': {
    icon: AlertTriangle,
    title: 'ELEMENTAL DRAIN',
    description: 'All elemental balance weakened!',
    color: '#DC2626',
  },
  'corruption': {
    icon: Biohazard,
    title: 'TOTAL CORRUPTION',
    description: 'All squares temporarily poisoned!',
    color: '#059669',
  },
};

export default function UmbraOverlay({ active, ability, shadowMeter, rageMode, finalBoss }) {
  const abilityData = ability ? UMBRA_ABILITIES[ability] : null;

  return (
    <>
      {/* Umbra warning indicator - COMPACT VERSION (1 second duration) */}
      <AnimatePresence>
        {active && abilityData && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 right-4 -translate-y-1/2 z-50 pointer-events-none"
          >
            {/* Compact Umbra attack card */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`
                relative p-4 rounded-xl border-2 backdrop-blur-xl
                ${rageMode ? 'animate-pulse' : ''}
                ${finalBoss ? 'shadow-2xl' : 'shadow-lg'}
              `}
              style={{ 
                background: `${abilityData.color}30`,
                borderColor: rageMode ? '#DC2626' : abilityData.color,
                boxShadow: rageMode 
                  ? `0 0 40px ${abilityData.color}80, 0 0 20px #DC262680` 
                  : `0 0 20px ${abilityData.color}50`,
                maxWidth: '280px',
              }}
            >
              {/* Rage/Final Boss indicator */}
              {(rageMode || finalBoss) && (
                <div className="absolute -top-2 -left-2 px-2 py-1 rounded-lg text-xs font-black bg-red-600 text-white">
                  {finalBoss ? '⚡ FINAL BOSS' : '🔥 RAGE MODE'}
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Dragon avatar - smaller */}
                <motion.div
                  animate={{ 
                    rotate: rageMode ? [0, -5, 5, 0] : 0,
                    scale: rageMode ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="text-4xl leading-none">🐉</div>
                  {/* Glowing eyes */}
                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 0.3, repeat: 2 }}
                    className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-red-500 blur-[1px]"
                  />
                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 0.3, repeat: 2, delay: 0.15 }}
                    className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 blur-[1px]"
                  />
                </motion.div>

                {/* Ability info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <abilityData.icon className="w-5 h-5 flex-shrink-0" style={{ color: abilityData.color }} />
                    <h3 
                      className="text-sm font-black uppercase leading-tight"
                      style={{ color: abilityData.color }}
                    >
                      {abilityData.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-tight">
                    {abilityData.description}
                  </p>
                </div>
              </div>

              {/* Power indicator for rage/final boss */}
              {(rageMode || finalBoss) && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-red-600 to-orange-500"
                      />
                    </div>
                    <span className="text-red-400 font-bold">
                      {rageMode && !finalBoss ? '+50%' : '+100%'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rage Mode warning indicator */}
      <AnimatePresence>
        {rageMode && shadowMeter > 0 && !active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 right-4 -translate-y-1/2 z-40"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 20px rgba(220, 38, 38, 0.5)',
                  '0 0 40px rgba(220, 38, 38, 0.8)',
                  '0 0 20px rgba(220, 38, 38, 0.5)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/90 border-2 border-red-500 backdrop-blur"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </motion.div>
              <div>
                <p className="text-red-300 font-black text-sm">⚠️ RAGE MODE</p>
                <p className="text-red-400 text-xs">Umbra's power increased!</p>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Final Boss warning */}
        {finalBoss && !active && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-900/90 to-red-900/90 border-2 border-purple-500 backdrop-blur"
            >
              <p className="text-center font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-red-300">
                ⚡ FINAL ARC - UMBRA UNLEASHED ⚡
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient shadow particles when Umbra is strong */}
      {shadowMeter > 50 && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 rounded-full bg-purple-900/20 blur-3xl"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 100,
              }}
              animate={{
                y: -200,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: i * 2,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}