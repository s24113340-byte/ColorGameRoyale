import React from 'react';
import { motion } from 'framer-motion';

export function ScanlineOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[200] mix-blend-overlay opacity-10">
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.15) 3px)',
          animation: 'scanline 8s linear infinite',
        }}
      />
    </div>
  );
}

export function CRTEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[199]">
      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)',
        }}
      />
      {/* Screen curvature glow */}
      <div 
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0,100,255,0.1)',
        }}
      />
    </div>
  );
}

export function PixelBurst({ x, y, color, onComplete }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[150]" style={{ left: x, top: y }}>
      {[...Array(12)].map((_, i) => {
        const angle = (i * 360) / 12;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-sm"
            style={{ 
              background: color,
              boxShadow: `0 0 10px ${color}`,
            }}
            initial={{ 
              x: 0, 
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{ 
              x: Math.cos(angle * Math.PI / 180) * 100,
              y: Math.sin(angle * Math.PI / 180) * 100,
              opacity: 0,
              scale: 0,
            }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut",
            }}
            onAnimationComplete={i === 0 ? onComplete : undefined}
          />
        );
      })}
    </div>
  );
}

export function ScreenFlash({ color = '#ffffff', duration = 0.2 }) {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[180]"
      style={{ background: color }}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 0 }}
      transition={{ duration }}
    />
  );
}

export function PowerUpAnimation({ x, y, text, onComplete }) {
  return (
    <motion.div
      className="fixed pointer-events-none z-[160] font-black text-4xl"
      style={{ 
        left: x - 100, 
        top: y - 50,
        textShadow: '0 0 20px currentColor, 0 0 40px currentColor',
      }}
      initial={{ 
        opacity: 0,
        scale: 0.5,
        y: 0,
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8],
        y: -80,
      }}
      transition={{ 
        duration: 1.5,
        ease: "easeOut",
      }}
      onAnimationComplete={onComplete}
    >
      <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
        {text}
      </span>
    </motion.div>
  );
}

export function FloatingNumbers({ value, x, y, color, onComplete }) {
  return (
    <motion.div
      className="fixed pointer-events-none z-[160] font-black text-3xl"
      style={{ 
        left: x, 
        top: y,
        color: color,
        textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
      }}
      initial={{ 
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      animate={{ 
        opacity: 0,
        y: -60,
        scale: 1.5,
      }}
      transition={{ 
        duration: 1,
        ease: "easeOut",
      }}
      onAnimationComplete={onComplete}
    >
      +{value}
    </motion.div>
  );
}

export function LightningEffect({ from, to, onComplete }) {
  const segments = 8;
  const points = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * 50;
    const y = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * 50;
    points.push({ x, y });
  }
  
  return (
    <svg className="fixed inset-0 pointer-events-none z-[170]" style={{ width: '100vw', height: '100vh' }}>
      <motion.path
        d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`}
        stroke="#a855f7"
        strokeWidth="4"
        fill="none"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={onComplete}
      />
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}