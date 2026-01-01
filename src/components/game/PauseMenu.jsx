import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PauseMenu({ isOpen, onResume, onRetry, onEnd, musicOn, soundOn, onToggleMusic, onToggleSound }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onResume}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative p-12 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #4a4a4a 0%, #6b6b6b 50%, #4a4a4a 100%)',
            boxShadow: `
              inset 0 0 0 8px #8b8b8b,
              inset 0 0 0 12px #5a5a5a,
              0 20px 60px rgba(0,0,0,0.5)
            `,
            border: '4px solid #9a9a9a',
          }}
        >
          {/* Decorative corners */}
          {[
            'top-0 left-0',
            'top-0 right-0',
            'bottom-0 left-0',
            'bottom-0 right-0',
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-12 h-12`}
              style={{
                background: 'linear-gradient(135deg, #7a7a7a, #5a5a5a)',
                clipPath: i === 0 ? 'polygon(0 0, 100% 0, 0 100%)' :
                          i === 1 ? 'polygon(100% 0, 100% 100%, 0 0)' :
                          i === 2 ? 'polygon(0 0, 100% 100%, 0 100%)' :
                          'polygon(100% 0, 100% 100%, 0 100%)',
              }}
            />
          ))}

          {/* Title */}
          <h1 
            className="text-6xl font-black text-center mb-8 tracking-wider"
            style={{
              color: '#FCD34D',
              textShadow: `
                3px 3px 0 #000,
                -1px -1px 0 #000,
                1px -1px 0 #000,
                -1px 1px 0 #000,
                1px 1px 0 #000,
                0 0 20px rgba(252, 211, 77, 0.5)
              `,
            }}
          >
            PAUSED
          </h1>

          {/* Toggles */}
          <div className="space-y-4 mb-8">
            <button
              onClick={onToggleMusic}
              className="w-full py-4 text-4xl font-black tracking-wider transition-all hover:scale-105"
              style={{
                color: '#FCD34D',
                textShadow: `
                  2px 2px 0 #000,
                  -1px -1px 0 #000,
                  1px -1px 0 #000,
                  -1px 1px 0 #000,
                  1px 1px 0 #000
                `,
              }}
            >
              MUSIC {musicOn ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={onToggleSound}
              className="w-full py-4 text-4xl font-black tracking-wider transition-all hover:scale-105"
              style={{
                color: '#FCD34D',
                textShadow: `
                  2px 2px 0 #000,
                  -1px -1px 0 #000,
                  1px -1px 0 #000,
                  -1px 1px 0 #000,
                  1px 1px 0 #000
                `,
              }}
            >
              SOUND {soundOn ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-8 mt-8">
            {[
              { label: 'END', onClick: onEnd },
              { label: 'RETRY', onClick: onRetry },
              { label: 'RESUME', onClick: onResume },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className="px-8 py-4 text-3xl font-black tracking-wider transition-all hover:scale-110"
                style={{
                  color: '#FCD34D',
                  textShadow: `
                    2px 2px 0 #000,
                    -1px -1px 0 #000,
                    1px -1px 0 #000,
                    -1px 1px 0 #000,
                    1px 1px 0 #000
                  `,
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}