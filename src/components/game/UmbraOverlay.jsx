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
    description: 'Time is frozen for 3 seconds!',
    color: '#3B82F6',
  },
  'poison': {
    icon: Biohazard,
    title: 'POISONED SQUARES',
    description: 'A color square has been cursed!',
    color: '#10B981',
  },
};

export default function UmbraOverlay({ active, ability, shadowMeter }) {
  const abilityData = ability ? UMBRA_ABILITIES[ability] : null;

  return (
    <>
      {/* Umbra warning indicator */}
      <AnimatePresence>
        {active && abilityData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-purple-950"
            />

            {/* Umbra dragon silhouette */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 50 }}
              className="relative z-10"
            >
              {/* Dragon pixelated form */}
              <div className="relative mb-8">
                <motion.div
                  animate={{ 
                    filter: ['hue-rotate(0deg)', 'hue-rotate(30deg)', 'hue-rotate(0deg)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-9xl md:text-[12rem] leading-none"
                  style={{
                    textShadow: '0 0 50px rgba(168, 85, 247, 0.8), 0 0 100px rgba(168, 85, 247, 0.5)',
                  }}
                >
                  🐉
                </motion.div>
                
                {/* Glowing eyes effect */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full bg-red-500 blur-sm"
                />
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
                  className="absolute top-1/4 right-1/3 w-4 h-4 rounded-full bg-red-500 blur-sm"
                />
              </div>

              {/* Name */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-4xl md:text-5xl font-black text-purple-400 tracking-widest mb-4"
                style={{
                  textShadow: '0 0 20px rgba(168, 85, 247, 0.8)',
                }}
              >
                UMBRA
              </motion.h2>
              <p className="text-center text-purple-300 text-sm mb-8 tracking-wider">
                THE CHROMATIC SHADOW
              </p>

              {/* Ability announcement */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center p-6 rounded-2xl bg-slate-900/80 border-2 max-w-md mx-auto"
                style={{ borderColor: abilityData.color }}
              >
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                  style={{ background: `${abilityData.color}30` }}
                >
                  <abilityData.icon className="w-8 h-8" style={{ color: abilityData.color }} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{abilityData.title}</h3>
                <p className="text-slate-400">{abilityData.description}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low shadow meter warning */}
      <AnimatePresence>
        {shadowMeter <= 30 && shadowMeter > 0 && !active && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-4 z-40"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-900/80 border border-purple-500/50 backdrop-blur"
            >
              <AlertTriangle className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-purple-300 font-bold text-sm">UMBRA WEAKENING!</p>
                <p className="text-purple-400 text-xs">Keep attacking!</p>
              </div>
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