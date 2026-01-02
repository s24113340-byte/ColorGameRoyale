import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Coins, Trophy, Flame, Droplets, Leaf, Sun, Zap, Target, Shield } from 'lucide-react';

export default function GameHUD({ gameState, colors }) {
  const {
    score,
    coins,
    timer,
    streak,
    round,
    maxRounds,
    shadowMeter,
    championHP,
    elementalBalance,
    factionBuffActive,
    payoutMultiplier,
    champion,
    gameMode,
  } = gameState;

  const factionIcons = {
    fire: Flame,
    water: Droplets,
    nature: Leaf,
    light: Sun,
  };

  const factionColors = {
    fire: '#FF3B3B',
    water: '#3B82F6',
    nature: '#10B981',
    light: '#FBBF24',
  };

  return (
    <>
      {/* Top HUD: Timer, Umbra's HP, and Champion HP */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1" />

          {/* Center: Timer */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-xl backdrop-blur border
              ${timer <= 10 
                ? 'bg-red-900/50 border-red-500/50' 
                : 'bg-slate-900/80 border-slate-700'
              }
            `}
          >
            <Timer className={`w-6 h-6 ${timer <= 10 ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
            <div className="text-center">
              <p className="text-xs text-slate-400">Time</p>
              <motion.p 
                key={timer}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`font-black text-2xl ${timer <= 10 ? 'text-red-400' : 'text-white'}`}
              >
                {timer}s
              </motion.p>
            </div>
          </motion.div>

          {/* Right: Champion HP */}
          {champion && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 max-w-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-cyan-300 font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {champion.name.toUpperCase()}
                </span>
                <span className="text-xs text-cyan-400">{championHP}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
                <motion.div
                  animate={{ width: `${championHP}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    championHP > 50 
                      ? 'bg-gradient-to-r from-green-500 to-cyan-500' 
                      : championHP > 25
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{
                    boxShadow: championHP > 50 
                      ? '0 0 10px rgba(6, 182, 212, 0.5)' 
                      : '0 0 10px rgba(239, 68, 68, 0.5)',
                  }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Shadow Meter (Umbra health) - below timer */}
        {gameMode === 'normal' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mt-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-purple-300 font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" /> UMBRA'S SHADOW
              </span>
              <span className="text-xs text-purple-400">{shadowMeter}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-purple-500/30">
              <motion.div
                animate={{ width: `${shadowMeter}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500"
                style={{
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom HUD: Champion, Score, Coins, Streak, Elemental Balance */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Bottom bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left: Score */}
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-700"
              >
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-xs text-slate-400">Score</p>
                  <p className="font-bold text-white text-lg">{score.toLocaleString()}</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur border border-yellow-500/30"
              >
                <Coins className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-xs text-slate-400">Coins</p>
                  <p className="font-bold text-yellow-400 text-lg">{coins}</p>
                </div>
              </motion.div>
            </div>

            {/* Right: Streak */}
            <div className="flex items-center gap-4">
              <AnimatePresence>
                {streak > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur border border-orange-500/50"
                  >
                    <Zap className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-xs text-orange-300">Streak</p>
                      <p className="font-bold text-orange-400 text-lg">x{streak}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Second row: Elemental Balance */}
          <div className="mt-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-xs text-slate-400 mb-2 font-medium">ELEMENTAL BALANCE</p>
              <div className="flex h-4 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                {Object.entries(elementalBalance).map(([element, value]) => {
                  const Icon = factionIcons[element];
                  return (
                    <motion.div
                      key={element}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.5 }}
                      className="relative flex items-center justify-center"
                      style={{ background: factionColors[element] }}
                    >
                      {value >= 15 && (
                        <Icon className="w-3 h-3 text-white/80" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                {Object.entries(elementalBalance).map(([element, value]) => (
                  <span 
                    key={element} 
                    className="text-xs font-medium"
                    style={{ color: factionColors[element] }}
                  >
                    {Math.round(value)}%
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Faction Buff Active */}
        <AnimatePresence>
          {factionBuffActive && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50"
            >
              <div 
                className="px-8 py-4 rounded-xl backdrop-blur-lg border-2 text-center"
                style={{
                  background: `${factionColors[factionBuffActive]}30`,
                  borderColor: factionColors[factionBuffActive],
                  boxShadow: `0 0 30px ${factionColors[factionBuffActive]}50`,
                }}
              >
                <p className="text-white font-black text-xl uppercase">
                  {factionBuffActive} FACTION ACTIVATED!
                </p>
                <p className="text-white/80 text-sm mt-1">
                  x{payoutMultiplier} Multiplier • UMBRA HIT!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}