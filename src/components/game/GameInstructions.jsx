import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Target, Timer, Zap, Trophy, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GameInstructions({ onStart, gameMode, champion }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8 flex items-center justify-center"
    >
      <div className="max-w-4xl w-full">
        {/* Title */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
            HOW TO PLAY
          </h2>
          <p className="text-purple-300">Master the colors and defeat Umbra</p>
        </motion.div>

        {/* Instructions Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Betting */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 backdrop-blur border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Coins className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Place Your Bets</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Click on any color panel around the board to place bets. Adjust your bet amount using the + and - buttons.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Dropping */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Drop Balls</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Press "DROP BALLS" to release 3 balls onto the grid. They'll land on random tiles.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Winning */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 backdrop-blur border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Match & Win</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-2">
                  Win coins and time when balls match your bet colors:
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">1 Match:</span>
                    <span className="text-white">1:1 payout, +2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">2 Match:</span>
                    <span className="text-white">2:1 payout, +5s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">3 Match (JACKPOT):</span>
                    <span className="text-yellow-400">3:1 payout, +10s</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timer */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 backdrop-blur border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Timer className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Beat the Clock</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {gameMode === 'normal' 
                    ? "Deplete Umbra's Shadow Meter before time runs out to win!"
                    : "Score as many points as you can before time runs out!"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Umbra Warning (Campaign only) */}
        {gameMode === 'normal' && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-purple-900/30 backdrop-blur border border-purple-500/50 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-300 mb-2">⚠️ Beware of Umbra</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-2">
                  Umbra the dragon will interfere with your game! He can:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">❄️</span>
                    <span className="text-slate-300">Freeze your bets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">☠️</span>
                    <span className="text-slate-300">Poison color tiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">⚡</span>
                    <span className="text-slate-300">Drain your score</span>
                  </div>
                </div>
                <p className="text-purple-200 text-xs mt-3 font-bold">
                  💡 Tip: Watch Umbra's Shadow Meter - when it's low, he gets more aggressive!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Champion Display */}
        {champion && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-4 px-6 py-4 bg-slate-900/50 backdrop-blur border border-slate-700 rounded-xl">
              <div className="text-4xl">
                {champion.sprite.startsWith('http') ? (
                  <img src={champion.sprite} alt={champion.name} className="w-16 h-16 object-contain" style={{ imageRendering: 'pixelated' }} />
                ) : (
                  <span>{champion.sprite}</span>
                )}
              </div>
              <div className="text-left">
                <p className="text-slate-400 text-xs">You're playing as</p>
                <p className="text-white font-bold text-lg" style={{ color: champion.colors.primary }}>
                  {champion.name}
                </p>
                <p className="text-slate-400 text-xs">{champion.title}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Button
            onClick={onStart}
            size="lg"
            className="px-12 py-6 text-xl font-black bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
          >
            START BATTLE
          </Button>
          <p className="text-slate-500 text-sm mt-3">Press PAUSE (⏸️) anytime to view instructions again</p>
        </motion.div>
      </div>
    </motion.div>
  );
}