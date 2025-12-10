import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Play, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GameBoard({ gameState, colors, onPlaceBet, onDrop }) {
  const [betAmount, setBetAmount] = useState(10);
  const { bets, droppedBalls, isDropping, coins, frozen, poisonedSquares } = gameState;

  const adjustBet = (delta) => {
    setBetAmount(Math.max(5, Math.min(50, betAmount + delta)));
  };

  return (
    <div className="pt-48 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Metallic Bowl / Ball Drop Area */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          {/* Bowl container */}
          <div className="relative mx-auto w-full max-w-md">
            {/* Metallic bowl visual */}
            <div className="relative h-32 rounded-b-[100%] bg-gradient-to-b from-slate-600 via-slate-500 to-slate-700 border-4 border-slate-400 overflow-hidden">
              {/* Metallic sheen */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              {/* Ball drop zone */}
              <div className="absolute inset-x-4 bottom-4 flex justify-center items-end gap-4 h-16">
                <AnimatePresence>
                  {droppedBalls.map((ball, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: -150, opacity: 0 }}
                      animate={{ 
                        y: 0, 
                        opacity: 1,
                        rotate: [0, 360],
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                        delay: index * 0.3,
                      }}
                      className="relative"
                    >
                      <div 
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center text-2xl"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${ball.hex}, ${ball.hex}88)`,
                          boxShadow: `0 0 20px ${ball.hex}80, inset 0 -5px 10px rgba(0,0,0,0.3)`,
                        }}
                      >
                        {ball.emoji}
                      </div>
                      {/* Ball shine */}
                      <div className="absolute top-1 left-2 w-4 h-4 bg-white/40 rounded-full blur-sm" />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Placeholder balls when not dropping */}
                {droppedBalls.length === 0 && !isDropping && (
                  <div className="flex gap-4">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-600/50 border-2 border-dashed border-slate-500 flex items-center justify-center"
                      >
                        <CircleDot className="w-6 h-6 text-slate-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bowl rim */}
            <div className="absolute -top-2 left-0 right-0 h-4 bg-gradient-to-b from-slate-400 to-slate-500 rounded-t-xl" />
          </div>

          {/* Title */}
          <div className="text-center mt-4">
            <h3 className="text-slate-300 font-medium">
              {isDropping ? 'BALLS DROPPING...' : 'PLACE YOUR BETS'}
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