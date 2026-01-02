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

      {/* Campaign Path - Horizontal Scrolling */}
      <div className="overflow-x-auto pb-8">
        <div className="min-w-max px-8">
          <div className="relative h-[400px] w-[2000px]">
            {/* Winding Path SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="30%" stopColor="#84CC16" />
                  <stop offset="60%" stopColor="#F59E0B" />
                  <stop offset="80%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#1E1B4B" />
                </linearGradient>
              </defs>
              
              {/* Winding path through levels */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
                d="M 100 200 Q 200 150, 300 180 Q 400 210, 500 180 Q 600 150, 700 200 Q 800 250, 900 220 Q 1000 190, 1100 200 Q 1200 210, 1300 180 Q 1400 150, 1500 180 Q 1600 210, 1700 200 Q 1800 190, 1900 200"
                stroke="url(#pathGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                opacity="0.3"
              />
            </svg>

            {/* Level nodes on path */}
            <div className="relative h-full" style={{ zIndex: 1 }}>
              {CAMPAIGN_LEVELS.map((level, index) => {
                const status = getLevelStatus(level.id);
                const isCompleted = status === 'completed';
                const isAvailable = status === 'available';
                const isLocked = status === 'locked';
                const isBoss = !!level.boss;
                
                // Calculate position along winding path
                const positions = [
                  { x: 100, y: 200 },
                  { x: 300, y: 180 },
                  { x: 500, y: 180 },
                  { x: 700, y: 200 },
                  { x: 900, y: 220 },
                  { x: 1100, y: 200 },
                  { x: 1300, y: 180 },
                  { x: 1500, y: 180 },
                  { x: 1700, y: 200 },
                  { x: 1900, y: 200 },
                ];

                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, scale: 0, y: -50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.15, type: "spring" }}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${positions[index].x - 40}px`,
                      top: `${positions[index].y - 40}px`,
                    }}
                  >
                    {/* Biome decoration above level */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      className="text-4xl mb-2"
                    >
                      {level.emoji}
                    </motion.div>

                    {/* Level node */}
                    <motion.button
                      onClick={() => handleLevelClick(level)}
                      disabled={isLocked}
                      whileHover={!isLocked ? { scale: 1.15, rotate: [0, -5, 5, 0] } : {}}
                      whileTap={!isLocked ? { scale: 0.95 } : {}}
                      className={`
                        relative w-20 h-20 rounded-full
                        flex items-center justify-center
                        transition-all duration-300 border-4 border-white
                        ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                        ${selectedLevel?.id === level.id ? 'ring-4 ring-yellow-400' : ''}
                      `}
                      style={{
                        background: isLocked 
                          ? 'linear-gradient(135deg, #1e293b, #0f172a)' 
                          : `linear-gradient(135deg, ${level.color}, ${level.color}aa)`,
                        boxShadow: isLocked 
                          ? 'none' 
                          : `0 0 30px ${level.color}80, inset 0 0 20px rgba(255,255,255,0.3)`,
                      }}
                    >
                      {/* Boss crown indicator */}
                      {isBoss && (
                        <motion.div 
                          animate={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: level.color }}
                        >
                          {level.id === 10 ? <Crown className="w-5 h-5 text-white" /> : <Skull className="w-4 h-4 text-white" />}
                        </motion.div>
                      )}

                      {/* Level number badge */}
                      <div 
                        className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center text-sm font-black shadow-lg"
                        style={{ borderColor: level.color, color: level.color }}
                      >
                        {level.id}
                      </div>

                      {/* Status */}
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <CheckCircle2 className="w-10 h-10 text-white" />
                        </motion.div>
                      )}
                      {isAvailable && !isCompleted && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-3xl"
                        >
                          ⚔️
                        </motion.div>
                      )}
                      {isLocked && (
                        <Lock className="w-8 h-8 text-slate-600" />
                      )}
                    </motion.button>

                    {/* Level name below */}
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.15 + 0.3 }}
                      className="text-xs text-center mt-2 font-bold text-white px-2 py-1 rounded-lg"
                      style={{ 
                        background: `${level.color}40`,
                        maxWidth: '100px'
                      }}
                    >
                      {level.name}
                    </motion.p>

                    {/* Completion stars */}
                    {isCompleted && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.15 + 0.5 }}
                        className="flex gap-1 mt-1"
                      >
                        {[...Array(3)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
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