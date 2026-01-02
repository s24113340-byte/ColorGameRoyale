import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Target, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TimeAttackInstructions({ onStart, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4"
    >
      <div className="max-w-2xl">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-5xl font-black text-center mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
        >
          TIME ATTACK MODE
        </motion.h1>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-300 text-center text-lg mb-8"
        >
          Race against time! Score as high as you can before time runs out!
        </motion.p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-slate-800/50 border border-orange-500/30"
          >
            <Timer className="w-8 h-8 text-orange-400 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">30 Second Timer</h3>
            <p className="text-slate-400 text-sm">Start with 30 seconds. Win matches to add bonus time!</p>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-slate-800/50 border border-yellow-500/30"
          >
            <Zap className="w-8 h-8 text-yellow-400 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Bonus Time</h3>
            <p className="text-slate-400 text-sm">Jackpot: +10s | Combo: +5s | Match: +2s</p>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl bg-slate-800/50 border border-purple-500/30"
          >
            <Target className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">High Score Goal</h3>
            <p className="text-slate-400 text-sm">Match colors to score points. Build streaks for bonuses!</p>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-xl bg-slate-800/50 border border-green-500/30"
          >
            <Trophy className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Leaderboard</h3>
            <p className="text-slate-400 text-sm">Compete for the top spot on the global leaderboard!</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 justify-center"
        >
          <Button onClick={onBack} variant="outline" className="px-8 py-6 text-lg">
            Back
          </Button>
          <Button 
            onClick={onStart}
            className="px-8 py-6 text-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
          >
            START TIME ATTACK
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}