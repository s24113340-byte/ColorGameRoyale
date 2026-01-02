import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, Skull, Crown, Star, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CAMPAIGN_LEVELS = [
  { id: 1, name: 'Peaceful Village', difficulty: 'Easy', boss: null, color: '#10B981', emoji: '🏘️' },
  { id: 2, name: 'Mystic Forest', difficulty: 'Easy', boss: null, color: '#22C55E', emoji: '🌲' },
  { id: 3, name: 'Verdant Grassland', difficulty: 'Normal', boss: 'Plains Walker', color: '#84CC16', emoji: '🌾' },
  { id: 4, name: 'Rocky Mountains', difficulty: 'Normal', boss: null, color: '#78716C', emoji: '⛰️' },
  { id: 5, name: 'Mountain Peak', difficulty: 'Normal', boss: 'Stone Guardian', color: '#57534E', emoji: '🏔️' },
  { id: 6, name: 'Scorching Desert', difficulty: 'Hard', boss: null, color: '#F59E0B', emoji: '🏜️' },
  { id: 7, name: 'Endless Dunes', difficulty: 'Hard', boss: 'Mirage Demon', color: '#D97706', emoji: '🌵' },
  { id: 8, name: 'Crystal Lake', difficulty: 'Very Hard', boss: null, color: '#06B6D4', emoji: '🌊' },
  { id: 9, name: 'Frozen Tundra', difficulty: 'Very Hard', boss: 'Ice Colossus', color: '#3B82F6', emoji: '❄️' },
  { id: 10, name: 'UMBRA\'S DARK CASTLE', difficulty: 'Legendary', boss: 'UMBRA THE CHROMATIC SHADOW', color: '#1E1B4B', emoji: '🏰' },
];

export default function CampaignMap({ progress, onSelectLevel, onBack, onUpgrades }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const highestUnlocked = progress.highestLevelUnlocked || 1;

  const getLevelStatus = (levelId) => {
    // All levels unlocked
    if (levelId < highestUnlocked) return 'completed';
    return 'available';
  };

  const handleLevelClick = (level) => {
    const status = getLevelStatus(level.id);
    if (status === 'locked') return;
    setSelectedLevel(level);
  };

  const handleStartLevel = () => {
    if (selectedLevel) {
      onSelectLevel(selectedLevel.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-4 md:p-8"
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          
          <Button
            onClick={onUpgrades}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Star className="w-5 h-5 mr-2" /> Champion Upgrades
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            CAMPAIGN MAP
          </h1>
          <p className="text-slate-400">
            Progress: Level {highestUnlocked} / {CAMPAIGN_LEVELS.length}
          </p>
          
          {/* Progress bar */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(highestUnlocked / CAMPAIGN_LEVELS.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Path */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {CAMPAIGN_LEVELS.slice(0, -1).map((level, i) => {
              const next = CAMPAIGN_LEVELS[i + 1];
              const status = getLevelStatus(level.id);
              return (
                <motion.line
                  key={i}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: status === 'completed' ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  x1={`${((i % 5) * 20 + 10)}%`}
                  y1={`${(Math.floor(i / 5) * 50 + 25)}%`}
                  x2={`${(((i + 1) % 5) * 20 + 10)}%`}
                  y2={`${(Math.floor((i + 1) / 5) * 50 + 25)}%`}
                  stroke={status === 'completed' ? level.color : '#334155'}
                  strokeWidth="3"
                  strokeDasharray={status === 'completed' ? '0' : '5,5'}
                />
              );
            })}
          </svg>

          {/* Level nodes */}
          <div className="grid grid-cols-5 gap-4 md:gap-8 relative" style={{ zIndex: 1 }}>
            {CAMPAIGN_LEVELS.map((level, index) => {
              const status = getLevelStatus(level.id);
              const isCompleted = status === 'completed';
              const isAvailable = status === 'available';
              const isLocked = status === 'locked';
              const isBoss = !!level.boss;

              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {/* Level node */}
                  <motion.button
                    onClick={() => handleLevelClick(level)}
                    disabled={isLocked}
                    whileHover={!isLocked ? { scale: 1.1 } : {}}
                    whileTap={!isLocked ? { scale: 0.95 } : {}}
                    className={`
                      relative w-16 h-16 md:w-20 md:h-20 rounded-full
                      flex items-center justify-center
                      transition-all duration-300
                      ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      ${selectedLevel?.id === level.id ? 'ring-4 ring-white' : ''}
                    `}
                    style={{
                      background: isLocked 
                        ? 'linear-gradient(135deg, #1e293b, #0f172a)' 
                        : `linear-gradient(135deg, ${level.color}, ${level.color}aa)`,
                      boxShadow: isLocked 
                        ? 'none' 
                        : `0 0 20px ${level.color}50`,
                    }}
                  >
                    {/* Boss indicator */}
                    {isBoss && (
                      <div 
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ background: level.color }}
                      >
                        {level.id === 10 ? <Crown className="w-4 h-4 text-white" /> : <Skull className="w-3 h-3 text-white" />}
                      </div>
                    )}

                    {/* Status icon */}
                    {isCompleted && (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    )}
                    {isAvailable && !isCompleted && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-2xl md:text-3xl"
                      >
                        {level.emoji}
                      </motion.div>
                    )}
                    {isLocked && (
                      <Lock className="w-6 h-6 text-slate-600" />
                    )}

                    {/* Level number */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 flex items-center justify-center text-xs font-bold text-white"
                      style={{ borderColor: level.color }}
                    >
                      {level.id}
                    </div>
                  </motion.button>

                  {/* Level name */}
                  <p className="text-xs text-center mt-2 text-slate-400 font-medium">
                    {level.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Level details panel */}
      <AnimatePresence>
        {selectedLevel && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-8"
          >
            <div 
              className="max-w-2xl mx-auto p-6 rounded-2xl backdrop-blur-xl border-2"
              style={{
                background: `${selectedLevel.color}20`,
                borderColor: selectedLevel.color,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">
                    Level {selectedLevel.id}: {selectedLevel.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span 
                      className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{ 
                        background: `${selectedLevel.color}30`,
                        color: selectedLevel.color 
                      }}
                    >
                      {selectedLevel.difficulty}
                    </span>
                    {selectedLevel.boss && (
                      <span className="flex items-center gap-1 text-sm text-slate-300">
                        <Skull className="w-4 h-4" />
                        Boss: {selectedLevel.boss}
                      </span>
                    )}
                  </div>
                </div>

                {getLevelStatus(selectedLevel.id) === 'completed' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/50">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-bold">Completed</span>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg bg-slate-900/50">
                  <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                  <p className="text-xs text-slate-400">Reward</p>
                  <p className="text-sm font-bold text-white">
                    {selectedLevel.id * 10} Upgrade Points
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-900/50">
                  <Star className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                  <p className="text-xs text-slate-400">Starting Coins</p>
                  <p className="text-sm font-bold text-white">
                    {100 + (selectedLevel.id - 1) * 10}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-900/50">
                  <Skull className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                  <p className="text-xs text-slate-400">Umbra Power</p>
                  <p className="text-sm font-bold text-white">
                    {selectedLevel.id <= 3 ? 'Low' : selectedLevel.id <= 7 ? 'Medium' : 'High'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedLevel(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartLevel}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                  disabled={getLevelStatus(selectedLevel.id) === 'locked'}
                >
                  {getLevelStatus(selectedLevel.id) === 'completed' ? 'Replay Level' : 'Start Level'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}