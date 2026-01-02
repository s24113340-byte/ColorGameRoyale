import React from 'react';
import { motion } from 'framer-motion';

export default function ChampionDisplay({ champion }) {
  if (!champion) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center gap-4"
      >
        {/* Champion name beside sprite */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
          }}
          className="text-right"
        >
          <p 
            className="text-4xl font-black tracking-wider mb-1"
            style={{ 
              color: champion.colors.primary,
              textShadow: `0 0 20px ${champion.colors.primary}80, 0 0 40px ${champion.colors.primary}40`,
            }}
          >
            {champion.name}
          </p>
          <p className="text-slate-300 text-sm font-medium">{champion.title}</p>
          <p 
            className="text-xs font-bold mt-1"
            style={{ color: champion.colors.secondary }}
          >
            {champion.class.toUpperCase()}
          </p>
        </motion.div>

        {/* Champion sprite */}
        <motion.div 
          className="relative w-48 h-48"
          animate={{
            y: [0, -8, 0],
            x: [0, 3, 0, -3, 0],
          }}
          transition={{
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {/* Actual champion sprite */}
          {champion.sprite.startsWith('http') ? (
            <img 
              src={champion.sprite}
              alt={champion.name}
              className="w-full h-full object-contain"
              style={{
                imageRendering: 'pixelated',
                filter: `drop-shadow(0 0 20px ${champion.colors.primary}) drop-shadow(0 0 40px ${champion.colors.primary}80)`,
              }}
            />
          ) : (
            <span 
              className="text-8xl"
              style={{
                filter: `drop-shadow(0 0 20px ${champion.colors.primary})`,
              }}
            >
              {champion.sprite}
            </span>
          )}

          {/* Glowing aura effect */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-0 left-0 w-48 h-48 rounded-full -z-10"
            style={{
              background: `radial-gradient(circle, ${champion.colors.primary}60, transparent 70%)`,
              filter: 'blur(30px)',
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}