import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function TimeAttackLeaderboard({ isOpen, onClose, currentScore = null }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.TimeAttackScore.list('-score', 10);
      setScores(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-orange-500/50 p-8 max-w-2xl w-full max-h-[80vh] overflow-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-black text-white">TIME ATTACK LEADERBOARD</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No scores yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map((score, index) => {
                const isCurrentScore = currentScore && score.score === currentScore;
                const rankIcons = [
                  <Trophy className="w-6 h-6 text-yellow-400" />,
                  <Medal className="w-6 h-6 text-slate-300" />,
                  <Award className="w-6 h-6 text-orange-400" />,
                ];

                return (
                  <motion.div
                    key={score.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl flex items-center gap-4 ${
                      isCurrentScore
                        ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500'
                        : 'bg-slate-800/50 border border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-center w-12">
                      {index < 3 ? (
                        rankIcons[index]
                      ) : (
                        <span className="text-slate-400 font-bold text-lg">#{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">{score.player_name}</p>
                      <div className="flex gap-4 text-sm text-slate-400">
                        <span>Score: {score.score}</span>
                        {score.coins && <span>💰 {score.coins}</span>}
                        {score.time_survived && <span>⏱️ {score.time_survived}s</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-orange-400">{score.score}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mt-6 text-center">
            <Button onClick={onClose} className="px-6 py-3">
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}