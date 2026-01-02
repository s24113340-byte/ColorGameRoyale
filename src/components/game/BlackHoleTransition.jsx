import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BlackHoleTransition({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Black hole center */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 2, 4], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative w-32 h-32">
          {/* Core black hole */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-950 via-black to-purple-950"
            style={{ boxShadow: '0 0 100px 50px rgba(0, 0, 0, 0.9)' }}
          />
          
          {/* Event horizon ring */}
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ 
              rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
            className="absolute inset-0 rounded-full border-4 border-purple-500/50"
            style={{ boxShadow: '0 0 50px rgba(139, 92, 246, 0.8)' }}
          />
        </div>
      </motion.div>

      {/* Sucking colors - Red */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`red-${i}`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 2.5,
            delay: Math.random() * 0.5,
            ease: "easeIn"
          }}
          className="absolute w-8 h-8 rounded-full bg-red-500"
          style={{ boxShadow: '0 0 20px #FF3B3B' }}
        />
      ))}

      {/* Sucking colors - Blue */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`blue-${i}`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 2.5,
            delay: Math.random() * 0.5,
            ease: "easeIn"
          }}
          className="absolute w-8 h-8 rounded-full bg-blue-500"
          style={{ boxShadow: '0 0 20px #3B82F6' }}
        />
      ))}

      {/* Sucking colors - Green */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`green-${i}`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 2.5,
            delay: Math.random() * 0.5,
            ease: "easeIn"
          }}
          className="absolute w-8 h-8 rounded-full bg-green-500"
          style={{ boxShadow: '0 0 20px #10B981' }}
        />
      ))}

      {/* Sucking colors - Yellow */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`yellow-${i}`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 2.5,
            delay: Math.random() * 0.5,
            ease: "easeIn"
          }}
          className="absolute w-8 h-8 rounded-full bg-yellow-500"
          style={{ boxShadow: '0 0 20px #FBBF24' }}
        />
      ))}

      {/* Vortex lines */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`vortex-${i}`}
          initial={{ rotate: i * 45, scale: 3, opacity: 0.6 }}
          animate={{ 
            rotate: i * 45 + 360,
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 2,
            delay: 0.5,
            ease: "easeIn"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-96 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent"
          style={{ transformOrigin: 'center' }}
        />
      ))}

      {/* Darkness spreading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.5 }}
        className="absolute inset-0 bg-black"
      />

      {/* Warning text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 1.5] }}
        transition={{ duration: 3, times: [0, 0.2, 0.8, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
      >
        <p className="text-6xl font-black text-red-500 mb-4" style={{ textShadow: '0 0 30px rgba(239, 68, 68, 0.8)' }}>
          DEFEAT
        </p>
        <p className="text-2xl text-purple-400 font-bold">
          The colors fade to darkness...
        </p>
      </motion.div>
    </div>
  );
}