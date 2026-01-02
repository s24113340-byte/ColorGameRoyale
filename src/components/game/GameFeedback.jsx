import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameFeedback({ message, type = 'default', onComplete }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          onComplete?.();
        }, 500); // Wait for exit animation
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [message, onComplete]);

  const getStyles = () => {
    switch (type) {
      case 'jackpot':
        return {
          gradient: 'from-yellow-400 via-orange-400 to-yellow-400',
          shadow: 'drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]',
          scale: 1.5,
        };
      case 'streak':
        return {
          gradient: 'from-purple-400 via-pink-400 to-purple-400',
          shadow: 'drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]',
          scale: 1.3,
        };
      case 'negative':
        return {
          gradient: 'from-red-400 via-orange-400 to-red-400',
          shadow: 'drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]',
          scale: 1.2,
        };
      case 'idle':
        return {
          gradient: 'from-blue-400 via-cyan-400 to-blue-400',
          shadow: 'drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]',
          scale: 1.1,
        };
      case 'umbra-low':
        return {
          gradient: 'from-green-400 via-emerald-400 to-green-400',
          shadow: 'drop-shadow-[0_0_25px_rgba(16,185,129,0.8)]',
          scale: 1.4,
        };
      case 'victory':
        return {
          gradient: 'from-yellow-300 via-yellow-400 to-orange-400',
          shadow: 'drop-shadow-[0_0_40px_rgba(251,191,36,1)]',
          scale: 1.8,
        };
      default:
        return {
          gradient: 'from-white to-slate-200',
          shadow: 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]',
          scale: 1.2,
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence mode="wait">
      {show && message && (
        <motion.div
          initial={{ scale: 0, rotate: -10, opacity: 0 }}
          animate={{ 
            scale: [0, styles.scale * 1.2, styles.scale],
            rotate: [10, -5, 0],
            opacity: 1,
            y: [-20, 0, 0],
          }}
          exit={{ 
            scale: 0.8,
            opacity: 0,
            y: -50,
          }}
          transition={{ 
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
        >
          {/* Sparkle effects */}
          {(type === 'jackpot' || type === 'victory') && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                  initial={{ 
                    x: 0, 
                    y: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / 8) * 100,
                    y: Math.sin((i * Math.PI * 2) / 8) * 100,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2,
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </>
          )}

          {/* Main text */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className={`
              text-5xl md:text-7xl font-black
              bg-gradient-to-r ${styles.gradient}
              bg-clip-text text-transparent
              ${styles.shadow}
              px-8 py-4
            `}
            style={{
              WebkitTextStroke: '3px rgba(0,0,0,0.3)',
              paintOrder: 'stroke fill',
              textShadow: '0 4px 8px rgba(0,0,0,0.5)',
            }}
          >
            {message}
          </motion.div>

          {/* Glow effect */}
          <div 
            className="absolute inset-0 blur-2xl opacity-50"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.3), transparent)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}