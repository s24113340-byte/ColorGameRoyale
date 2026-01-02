import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Play, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GameBoard({ gameState, colors, onPlaceBet, onDrop, onSkipResults }) {
  const [betAmount, setBetAmount] = useState(10);
  const { bets, droppedBalls, isDropping, coins, frozen, poisonedSquares, canSkipResults, umbraBets } = gameState;

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
            <div 
              className="relative p-6 rounded-3xl shadow-2xl"
              style={{
                backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/bc9d64f2e_image.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            >

              {/* Top betting panels - UMBRA'S BETS */}
              <div className="grid grid-cols-4 gap-3 mb-4 px-3">
                {colors.filter(c => c && c.id).map((color) => {
                  const umbraBet = umbraBets?.[color.id] || 0;
                  const isPoisoned = poisonedSquares.includes(color.id);
                  return (
                    <div
                      key={`top-${color.id}`}
                      className="p-4 rounded-xl font-bold text-sm relative backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})`,
                        boxShadow: umbraBet > 0 ? '0 0 15px rgba(139, 92, 246, 0.6)' : `0 4px 10px ${color.hex}40`,
                      }}
                    >
                      <div className="text-white text-shadow-lg flex items-center justify-center gap-2 font-black tracking-wider">
                        {color.emoji} {color.name.toUpperCase()}
                      </div>
                      {umbraBet > 0 && (
                        <div className="text-purple-300 text-xs mt-1 font-bold flex items-center justify-center gap-1">
                          🐉 {umbraBet}
                        </div>
                      )}
                      {isPoisoned && (
                        <div className="text-purple-300 text-xs">☠️</div>
                      )}
                      {/* Umbra indicator */}
                      <div className="absolute -top-1 -right-1 text-xs">👿</div>
                    </div>
                  );
                })}
              </div>

              {/* Main grid with side betting panels */}
              <div className="flex gap-4 px-3">
                {/* Left betting panels */}
                <div className="flex flex-col gap-3">
                  {colors.filter(c => c && c.id).map((color) => {
                    const currentBet = bets[color.id] || 0;
                    const isPoisoned = poisonedSquares.includes(color.id);
                    return (
                      <button 
                        key={`left-${color.id}`}
                        onClick={() => onPlaceBet(color.id, betAmount)}
                        disabled={frozen || isDropping || coins < betAmount}
                        className={`w-20 h-28 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center backdrop-blur-sm ${frozen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                        style={{
                          background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})`,
                          boxShadow: currentBet > 0 ? '0 0 20px rgba(255, 215, 0, 0.8)' : `0 4px 10px ${color.hex}40`,
                        }}
                      >
                        <div className="text-white text-shadow-lg text-3xl mb-1">
                          {color.emoji}
                        </div>
                        {currentBet > 0 && (
                          <div className="text-yellow-200 text-xs font-bold">💰{currentBet}</div>
                        )}
                        {isPoisoned && (
                          <div className="text-purple-300 text-xs">☠️</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Center 6x6 Grid */}
                <div className="relative bg-gradient-to-br from-cyan-100/20 to-white/30 backdrop-blur-md p-4 rounded-2xl flex-1 border-2 border-white/50">
                  <div className="grid grid-cols-6 gap-2 relative">
                    {[...Array(36)].map((_, i) => {
                      const colorIndex = i % colors.length;
                      const gridColor = colors[colorIndex];
                      if (!gridColor || !gridColor.hex) return null;

                      // Check if any ball landed on this square
                      const ballOnSquare = droppedBalls.find(ball => ball.landedSquare === i);

                      return (
                        <div 
                          key={i}
                          className="aspect-square rounded-lg shadow-lg relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${gridColor.hex}, ${gridColor.hex}dd)`,
                            border: `3px solid white`,
                            boxShadow: `0 2px 8px ${gridColor.hex}40, inset 0 0 20px ${gridColor.hex}20`,
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

                  {/* Futuristic Wireframe Hopper in Center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="relative w-48 h-48">
                      {/* Top glowing ring */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8">
                        <div 
                          className="absolute inset-0 rounded-[50%] border-2 backdrop-blur-sm"
                          style={{
                            borderColor: 'rgba(255, 255, 255, 0.8)',
                            background: 'linear-gradient(135deg, rgba(255, 59, 59, 0.15), rgba(59, 130, 246, 0.15), rgba(251, 191, 36, 0.15))',
                            boxShadow: `
                              0 0 20px rgba(255, 255, 255, 0.8),
                              0 0 40px rgba(255, 59, 59, 0.3),
                              0 0 40px rgba(59, 130, 246, 0.3),
                              0 0 40px rgba(251, 191, 36, 0.3),
                              inset 0 0 20px rgba(255, 255, 255, 0.2)
                            `,
                          }}
                        />
                        {/* Inner glow */}
                        <div 
                          className="absolute inset-1 rounded-[50%]"
                          style={{
                            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1), transparent)',
                          }}
                        />
                      </div>

                      {/* Bottom glowing ring */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-6">
                        <div 
                          className="absolute inset-0 rounded-[50%] border-2 backdrop-blur-sm"
                          style={{
                            borderColor: 'rgba(255, 255, 255, 0.8)',
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15), rgba(251, 191, 36, 0.15))',
                            boxShadow: `
                              0 0 20px rgba(255, 255, 255, 0.8),
                              0 0 40px rgba(59, 130, 246, 0.3),
                              0 0 40px rgba(16, 185, 129, 0.3),
                              0 0 40px rgba(251, 191, 36, 0.3),
                              inset 0 0 20px rgba(255, 255, 255, 0.2)
                            `,
                          }}
                        />
                      </div>

                      {/* Vertical spindles connecting the rings */}
                      {[...Array(8)].map((_, i) => {
                        const angle = (i * 360) / 8;
                        const topRadius = 62;
                        const bottomRadius = 46;
                        const topX = Math.cos((angle * Math.PI) / 180) * topRadius;
                        const topY = Math.sin((angle * Math.PI) / 180) * 16;
                        const bottomX = Math.cos((angle * Math.PI) / 180) * bottomRadius;
                        const bottomY = Math.sin((angle * Math.PI) / 180) * 12;

                        return (
                          <div
                            key={i}
                            className="absolute left-1/2 top-8 origin-top"
                            style={{
                              width: '1px',
                              height: '128px',
                              background: `linear-gradient(180deg, 
                                rgba(255, 255, 255, 0.6), 
                                rgba(255, 59, 59, 0.3),
                                rgba(59, 130, 246, 0.3),
                                rgba(251, 191, 36, 0.3),
                                rgba(255, 255, 255, 0.6)
                              )`,
                              transform: `translateX(${topX}px) translateY(${topY}px)`,
                              boxShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
                            }}
                          />
                        );
                      })}

                      {/* Frosted glass center effect */}
                      <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-32 rounded-[50%]"
                        style={{
                          background: `
                            radial-gradient(ellipse at center, 
                              rgba(255, 255, 255, 0.05),
                              rgba(255, 59, 59, 0.08),
                              rgba(59, 130, 246, 0.08),
                              rgba(251, 191, 36, 0.08),
                              transparent
                            )
                          `,
                          backdropFilter: 'blur(4px)',
                        }}
                      />

                      {/* Spinning white glowing balls before drop */}
                      <AnimatePresence>
                        {!isDropping && Object.keys(bets).length > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="absolute"
                                animate={{
                                  rotate: 360,
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                  delay: i * 0.33,
                                }}
                                style={{
                                  transformOrigin: '0 0',
                                }}
                              >
                                <motion.div
                                  className="w-8 h-8 rounded-full"
                                  animate={{
                                    x: Math.cos((i * 120 * Math.PI) / 180) * 30,
                                    y: Math.sin((i * 120 * Math.PI) / 180) * 30,
                                  }}
                                  style={{
                                    background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0)',
                                    boxShadow: `
                                      0 0 20px rgba(255, 255, 255, 0.8),
                                      0 0 40px rgba(255, 255, 255, 0.5),
                                      inset 0 0 10px rgba(255, 255, 255, 0.5)
                                    `,
                                  }}
                                />
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>

                      {/* Ambient light reflections */}
                      <motion.div
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0"
                        style={{
                          background: `
                            radial-gradient(circle at 30% 30%, rgba(255, 59, 59, 0.15), transparent 40%),
                            radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.15), transparent 40%),
                            radial-gradient(circle at 50% 70%, rgba(251, 191, 36, 0.15), transparent 40%)
                          `,
                          filter: 'blur(20px)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right betting panels */}
                <div className="flex flex-col gap-3">
                  {colors.filter(c => c && c.id).map((color) => {
                    const currentBet = bets[color.id] || 0;
                    const isPoisoned = poisonedSquares.includes(color.id);
                    return (
                      <button 
                        key={`right-${color.id}`}
                        onClick={() => onPlaceBet(color.id, betAmount)}
                        disabled={frozen || isDropping || coins < betAmount}
                        className={`w-20 h-28 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center backdrop-blur-sm ${frozen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                        style={{
                          background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})`,
                          boxShadow: currentBet > 0 ? '0 0 20px rgba(255, 215, 0, 0.8)' : `0 4px 10px ${color.hex}40`,
                        }}
                      >
                        <div className="text-white text-shadow-lg text-3xl mb-1">
                          {color.emoji}
                        </div>
                        {currentBet > 0 && (
                          <div className="text-yellow-200 text-xs font-bold">💰{currentBet}</div>
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
              <div className="grid grid-cols-4 gap-3 mt-4 px-3">
                {colors.filter(c => c && c.id).map((color) => {
                  const currentBet = bets[color.id] || 0;
                  const isPoisoned = poisonedSquares.includes(color.id);
                  return (
                    <button 
                      key={`bottom-${color.id}`}
                      onClick={() => onPlaceBet(color.id, betAmount)}
                      disabled={frozen || isDropping || coins < betAmount}
                      className={`p-4 rounded-xl font-bold text-sm transition-all backdrop-blur-sm ${frozen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                      style={{
                        background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})`,
                        boxShadow: currentBet > 0 ? '0 0 20px rgba(255, 215, 0, 0.8)' : `0 4px 10px ${color.hex}40`,
                      }}
                    >
                      <div className="text-white text-shadow-lg flex items-center justify-center gap-2 font-black tracking-wider">
                        {color.emoji} {color.name.toUpperCase()}
                      </div>
                      {currentBet > 0 && (
                        <div className="text-yellow-200 text-xs mt-1 font-bold">💰 {currentBet}</div>
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