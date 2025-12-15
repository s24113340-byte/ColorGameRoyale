import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Play, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GameBoard({ gameState, colors, onPlaceBet, onDrop, onSkipResults }) {
  const [betAmount, setBetAmount] = useState(10);
  const { bets, droppedBalls, isDropping, coins, frozen, poisonedSquares, canSkipResults } = gameState;

  const adjustBet = (delta) => {
    setBetAmount(Math.max(5, Math.min(50, betAmount + delta)));
  };

  return (
    <div 
      className="pt-48 pb-8 px-4"
      onClick={() => canSkipResults && onSkipResults()}
    >
      <div className="max-w-4xl mx-auto">
        {/* Skip indicator */}
        <AnimatePresence>
          {canSkipResults && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-32 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-yellow-500/90 text-black rounded-full text-sm font-bold cursor-pointer"
              onClick={onSkipResults}
            >
              CLICK ANYWHERE TO SKIP ⏩
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Board (like reference image) */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          {/* Game board container */}
          <div className="relative mx-auto w-full max-w-2xl bg-gradient-to-br from-pink-200 to-pink-300 p-6 rounded-2xl border-8 border-pink-400 shadow-2xl">
            {/* Main grid area - 6x6 grid of colored squares */}
            <div className="relative bg-white/90 p-4 rounded-xl mb-4">
              <div className="grid grid-cols-6 gap-2">
                {[...Array(36)].map((_, i) => {
                  const colorIndex = Math.floor(Math.random() * colors.length);
                  const gridColor = colors[colorIndex];
                  return (
                    <div 
                      key={i}
                      className="aspect-square rounded-md shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${gridColor.hex}, ${gridColor.hex}dd)`,
                        border: `2px solid ${gridColor.hex}aa`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Balls bouncing on grid with twist animation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <AnimatePresence>
                  {droppedBalls.map((ball, index) => (
                    <motion.div
                      key={ball.id}
                      initial={{ 
                        y: -200, 
                        x: (index - 1) * 80,
                        scale: 0.5,
                        opacity: 0,
                        rotate: 0,
                      }}
                      animate={ball.bouncing ? {
                        y: [
                          -200, // Start above
                          -50,  // First bounce
                          -100, // Go up
                          0,    // Second bounce
                          -40,  // Small bounce
                          10,   // Final landing
                        ],
                        x: [
                          (index - 1) * 80,
                          (index - 1) * 80 + 30,
                          (index - 1) * 80 - 20,
                          (index - 1) * 80 + 10,
                          (index - 1) * 80 - 5,
                          (index - 1) * 80,
                        ],
                        rotate: [0, 180, 360, 540, 720],
                        scale: [0.5, 1, 1.1, 1, 1, 1.2],
                        opacity: [0, 1, 1, 1, 1, 1],
                      } : {
                        y: 10,
                        scale: 1.2,
                      }}
                      transition={{ 
                        duration: 1,
                        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                        ease: "easeOut",
                      }}
                      className="absolute"
                    >
                      <div 
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${ball.color.hex}, ${ball.color.hex}88)`,
                          boxShadow: `0 0 25px ${ball.color.hex}, inset 0 -5px 15px rgba(0,0,0,0.4)`,
                        }}
                      >
                        {ball.color.emoji}
                      </div>
                      {/* Ball shine */}
                      <div className="absolute top-2 left-3 w-5 h-5 bg-white/50 rounded-full blur-sm" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Color betting areas (like reference) */}
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => {
                const currentBet = bets[color.id] || 0;
                return (
                  <div 
                    key={color.id}
                    className="text-center p-3 rounded-lg border-4 font-bold text-sm"
                    style={{
                      background: color.hex,
                      borderColor: currentBet > 0 ? '#FFD700' : `${color.hex}dd`,
                      boxShadow: currentBet > 0 ? '0 0 15px rgba(255, 215, 0, 0.6)' : 'none',
                    }}
                  >
                    <div className="text-white text-shadow-lg">{color.name.toUpperCase()}</div>
                    {currentBet > 0 && (
                      <div className="text-yellow-200 text-xs mt-1">BET: {currentBet}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status text */}
          <div className="text-center mt-4">
            <h3 className="text-slate-300 font-medium">
              {isDropping ? '🎲 BALLS DROPPING...' : '💰 PLACE YOUR BETS'}
            </h3>
          </div>
        </motion.div>

        {/* Betting Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {colors.map((color, index) => {
            const isPoisoned = poisonedSquares.includes(color.id);
            const currentBet = bets[color.id] || 0;
            
            return (
              <motion.button
                key={color.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: frozen || isDropping ? 1 : 1.03 }}
                whileTap={{ scale: frozen || isDropping ? 1 : 0.97 }}
                onClick={() => onPlaceBet(color.id, betAmount)}
                disabled={frozen || isDropping || coins < betAmount}
                className={`
                  relative p-6 rounded-2xl transition-all duration-300
                  ${frozen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${isPoisoned ? 'ring-2 ring-purple-500 animate-pulse' : ''}
                `}
                style={{
                  background: `linear-gradient(135deg, ${color.hex}30, ${color.hex}10)`,
                  border: `3px solid ${color.hex}`,
                  boxShadow: currentBet > 0 ? `0 0 20px ${color.hex}50, inset 0 0 30px ${color.hex}20` : 'none',
                }}
              >
                {/* Color indicator */}
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-xl mb-3 flex items-center justify-center text-4xl"
                  style={{
                    background: `linear-gradient(135deg, ${color.hex}, ${color.hex}aa)`,
                    boxShadow: `0 4px 15px ${color.hex}50`,
                  }}
                >
                  {color.emoji}
                </div>

                {/* Label */}
                <p className="text-white font-bold text-lg">{color.name}</p>
                <p className="text-slate-400 text-xs uppercase tracking-wider">{color.id}</p>

                {/* Current bet */}
                <AnimatePresence>
                  {currentBet > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 font-bold text-sm"
                    >
                      {currentBet}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Poison overlay */}
                {isPoisoned && (
                  <div className="absolute inset-0 rounded-2xl bg-purple-900/50 flex items-center justify-center">
                    <span className="text-purple-300 font-bold text-sm">POISONED</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Bet Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-6 flex-wrap"
        >
          {/* Bet amount adjuster */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 text-sm">BET:</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => adjustBet(-5)}
              disabled={betAmount <= 5}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-yellow-400 font-bold text-xl w-12 text-center">{betAmount}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => adjustBet(5)}
              disabled={betAmount >= 50}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Drop button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDrop}
            disabled={Object.keys(bets).length === 0 || isDropping || frozen}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3
              ${Object.keys(bets).length === 0 || isDropping || frozen
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50'
              }
            `}
          >
            <Play className="w-5 h-5" />
            {isDropping ? 'DROPPING...' : 'DROP BALLS'}
          </motion.button>

          {/* Total bet display */}
          <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 text-sm">TOTAL: </span>
            <span className="text-yellow-400 font-bold">
              {Object.values(bets).reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </motion.div>

        {/* Frozen overlay */}
        <AnimatePresence>
          {frozen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-blue-900/30 z-30 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl"
              >
                ❄️
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payout info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 rounded-xl bg-slate-900/50 border border-slate-700"
        >
          <h4 className="text-center text-sm font-bold text-slate-400 mb-3">PAYOUT RATES</h4>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-purple-400 font-bold">1 Match</p>
              <p className="text-white">1:1</p>
              <p className="text-slate-500 text-xs">+10 pts</p>
            </div>
            <div className="text-center">
              <p className="text-purple-400 font-bold">2 Match</p>
              <p className="text-white">2:1</p>
              <p className="text-slate-500 text-xs">+20 pts</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 font-bold">3 Match</p>
              <p className="text-yellow-400">3:1</p>
              <p className="text-yellow-500 text-xs">+30 pts JACKPOT!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}