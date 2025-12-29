import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Clock, Users, ArrowLeft, Shield, Zap, Trophy, Globe } from 'lucide-react';

const MODES = [
  {
    id: 'normal',
    name: 'CAMPAIGN',
    subtitle: 'Normal Mode',
    description: 'Battle Umbra through 10 rounds. Track the Elemental Balance and determine the fate of the Chromatic Kingdom.',
    icon: Swords,
    color: '#8B5CF6',
    features: ['10 Rounds', 'Umbra Boss', 'Multiple Endings', 'Full Story'],
  },
  {
    id: 'time-attack',
    name: 'TIME ATTACK',
    subtitle: 'Arcade Mode',
    description: 'Race against time for the highest score. Bonus Time is crucial - every correct match extends your run!',
    icon: Clock,
    color: '#F59E0B',
    features: ['30 Second Start', 'Endless Rounds', 'Bonus Time', 'High Score'],
  },
  {
    id: 'pvp',
    name: 'LOCAL BATTLE',
    subtitle: 'Same Device',
    description: 'Compete head-to-head on the same device! Use Interference Attacks and drain your opponent\'s Integrity.',
    icon: Users,
    color: '#EF4444',
    features: ['2 Players', 'Local Play', 'Interference Attacks', 'Turn-Based'],
  },
  {
    id: 'online',
    name: 'ONLINE BATTLE',
    subtitle: 'Player vs Player',
    description: 'Challenge players online with room codes! Create or join a room for real-time competitive battles.',
    icon: Globe,
    color: '#10B981',
    features: ['Online Play', 'Room Codes', 'Real-Time', 'Global Competition'],
  },
];

export default function ModeSelect({ onSelectMode, onBack, hasCampaignSave }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8"
    >
      {/* Back button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={onBack}
        className="fixed top-4 left-4 z-50 p-3 bg-slate-800/80 rounded-xl text-slate-300 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </motion.button>

      {/* Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-wider">
          SELECT MODE
        </h2>
        <p className="text-purple-300 mt-2">Choose your path through the Chromatic Kingdom</p>
      </motion.div>

      {/* Mode cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MODES.map((mode, index) => (
          <motion.button
            key={mode.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMode(mode.id)}
            className="relative group rounded-2xl overflow-hidden text-left"
            style={{
              background: `linear-gradient(180deg, ${mode.color}15, ${mode.color}05)`,
            }}
          >
            {/* Hover glow */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at center, ${mode.color}30, transparent 70%)`,
              }}
            />

            {/* Border */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-30 group-hover:opacity-60 transition-opacity"
              style={{ border: `1px solid ${mode.color}` }}
            />

            <div className="relative p-6">
              {/* Icon */}
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${mode.color}20` }}
              >
                <mode.icon className="w-8 h-8" style={{ color: mode.color }} />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black text-white mb-1">{mode.name}</h3>
              <p className="text-sm font-medium mb-4" style={{ color: mode.color }}>
                {mode.subtitle}
              </p>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {mode.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {mode.features.map((feature) => (
                  <span 
                    key={feature}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/50 text-slate-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Save indicator for campaign */}
              {mode.id === 'normal' && hasCampaignSave && (
                <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/50">
                  <span className="text-green-400 text-xs font-bold">💾 SAVE</span>
                </div>
              )}

              {/* Play arrow */}
              <motion.div
                className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: mode.color }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-3xl mx-auto mt-12 p-6 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h4 className="font-bold text-white mb-1">Master All Modes</h4>
            <p className="text-sm text-slate-400">
              Each mode offers unique challenges. Complete Campaign to unlock all endings, 
              dominate Time Attack for high scores, or prove your skill in PVP battles!
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}