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
      <div className="max-w-5xl mx-auto">
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

        {/* Game Board with Perimeter Betting */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="relative mx-auto">
            {/* Board container with betting panels on all sides */}
            <div className="relative bg-gradient-to-br from-pink-200 to-pink-300 p-6 rounded-3xl border-8 border-pink-400 shadow-2xl">

              {/* Top betting panels */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {colors.filter(c => c && c.id).map((color) => {
                  const currentBet = bets[color.id] || 0;
                  const isPoisoned = poisonedSquares.includes(color.id);
                  return (
                    <button 
                      key={`top-${color.id}`}
                      onClick={() => onPlaceBet(color.id, betAmount)}
                      disabled={frozen || isDropping || coins < betAmount}
                      className={`p-3 rounded-lg border-3 font-bold text-sm transition-all ${frozen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                      style={{
                        background: color.hex,
                        borderColor: currentBet > 0 ? '#FFD700' : `${color.hex}dd`,
                        boxShadow: currentBet > 0 ? '0 0 15px rgba(255, 215, 0, 0.6)' : 'none',
                      }}
                    >
                      <div className="text-white text-shadow-lg flex items-center justify-center gap-2">
                        {color.emoji} {color.name.toUpperCase()}
                      </div>
                      {currentBet > 0 && (
                        <div className="text-yellow-200 text-xs mt-1">💰 {currentBet}</div>
                      )}
                      {isPoisoned && (
                        <div className="text-purple-300 text-xs">☠️</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Main grid with side betting panels */}
              <div className="flex gap-3">
                {/* Left betting panels */}
                <div className="flex flex-col gap-2">
                  {colors.filter(c => c && c.id).map((color) => {
                    const currentBet = bets[color.id] || 0;
                    const isPoisoned = poisonedSquares.includes(color.id);
                    return (
                      <button 
                        key={`left-${color.id}`}
                        onClick={() => onPlaceBet(color.id, betAmount)}
                        disabled={frozen || isDropping || coins < betAmount}
                        className={`w-16 h-24 rounded-lg border-3 font-bold text-xs transition-all flex flex-col items-center justify-center ${frozen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                        style={{
                          background: color.hex,
                          borderColor: currentBet > 0 ? '#FFD700' : `${color.hex}dd`,
                          boxShadow: currentBet > 0 ? '0 0 15px rgba(255, 215, 0, 0.6)' : 'none',
                        }}
                      >
                        <div className="text-white text-shadow-lg writing-mode-vertical text-2xl mb-1">
                          {color.emoji}
                        </div>
                        {currentBet > 0 && (
                          <div className="text-yellow-200 text-xs">💰{currentBet}</div>
                        )}
                        {isPoisoned && (
                          <div className="text-purple-300 text-xs">☠️</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Center 6x6 Grid */}
                <div className="relative bg-white/90 p-3 rounded-xl flex-1">
                  <div className="grid grid-cols-6 gap-1.5 relative">
                    {[...Array(36)].map((_, i) => {
                      const colorIndex = i % colors.length;
                      const gridColor = colors[colorIndex];
                      if (!gridColor || !gridColor.hex) return null;

                      // Check if any ball landed on this square
                      const ballOnSquare = droppedBalls.find(ball => ball.landedSquare === i);

                      return (
                        <div 
                          key={i}
                          className="aspect-square rounded-md shadow-md relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${gridColor.hex}, ${gridColor.hex}dd)`,
                            border: `2px solid ${gridColor.hex}aa`,
                          }}
                        >
                          {/* Ball landing animation */}
                          <AnimatePresence>
                            {ballOnSquare && (
                              <motion.div
                                initial={{ scale: 0, rotate: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                exit={{ scale: 0 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="absolute inset-0 flex items-center justify-center z-10"
                              >
                                <div 
                                  className="w-10 h-10 rounded-full shadow-2xl flex items-center justify-center text-xl"
                                  style={{
                                    background: `radial-gradient(circle at 30% 30%, ${ballOnSquare.color?.hex || ballOnSquare.hex}, ${(ballOnSquare.color?.hex || ballOnSquare.hex)}88)`,
                                    boxShadow: `0 0 20px ${ballOnSquare.color?.hex || ballOnSquare.hex}`,
                                  }}
                                >
                                  {ballOnSquare.color?.emoji || ballOnSquare.emoji}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Metal Ring in Center with Balls */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="relative w-32 h-24">
                      {/* Metal ring with gradient */}
                      <div 
                        className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 border-4 border-slate-600"
                        style={{
                          boxShadow: 'inset 0 -8px 15px rgba(0,0,0,0.4), 0 8px 25px rgba(0,0,0,0.3)',
                        }}
                      />
                      {/* Inner ring shadow */}
                      <div className="absolute inset-3 rounded-[50%] border-2 border-slate-700 bg-gradient-to-b from-slate-500 to-slate-600" />

                      {/* Balls in the ring ready to drop */}
                      <AnimatePresence>
                        {isDropping && droppedBalls.length < 3 && (
                          <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="text-3xl">🎱</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Right betting panels */}
                <div className="flex flex-col gap-2">
                  {colors.filter(c => c && c.id).map((color) => {
                    const currentBet = bets[color.id] || 0;
                    const isPoisoned = poisonedSquares.includes(color.id);
                    return (
                      <button 
                        key={`right-${color.id}`}
                        onClick={() => onPlaceBet(color.id, betAmount)}
                        disabled={frozen || isDropping || coins < betAmount}
                        className={`w-16 h-24 rounded-lg border-3 font-bold text-xs transition-all flex flex-col items-center justify-center ${frozen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                        style={{
                          background: color.hex,
                          borderColor: currentBet > 0 ? '#FFD700' : `${color.hex}dd`,
                          boxShadow: currentBet > 0 ? '0 0 15px rgba(255, 215, 0, 0.6)' : 'none',
                        }}
                      >
                        <div className="text-white text-shadow-lg text-2xl mb-1">
                          {color.emoji}
                        </div>
                        {currentBet > 0 && (
                          <div className="text-yellow-200 text-xs">💰{currentBet}</div>
                        )}
                        {isPoisoned && (
                          <div className="text-purple-300 text-xs">☠️</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom betting panels */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {colors.filter(c => c && c.id).map((color) => {
                  const currentBet = bets[color.id] || 0;
                  const isPoisoned = poisonedSquares.includes(color.id);
                  return (
                    <button 
                      key={`bottom-${color.id}`}
                      onClick={() => onPlaceBet(color.id, betAmount)}
                      disabled={frozen || isDropping || coins < betAmount}
                      className={`p-3 rounded-lg border-3 font-bold text-sm transition-all ${frozen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                      style={{
                        background: color.hex,
                        borderColor: currentBet > 0 ? '#FFD700' : `${color.hex}dd`,
                        boxShadow: currentBet > 0 ? '0 0 15px rgba(255, 215, 0, 0.6)' : 'none',
                      }}
                    >
                      <div className="text-white text-shadow-lg flex items-center justify-center gap-2">
                        {color.emoji} {color.name.toUpperCase()}
                      </div>
                      {currentBet > 0 && (
                        <div className="text-yellow-200 text-xs mt-1">💰 {currentBet}</div>
                      )}
                      {isPoisoned && (
                        <div className="text-purple-300 text-xs">☠️</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status text */}
          <div className="text-center mt-4">
            <h3 className="text-slate-300 font-medium">
              {isDropping ? '🎲 BALLS DROPPING...' : '💰 PLACE YOUR BETS ON THE PERIMETER'}
            </h3>
          </div>
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