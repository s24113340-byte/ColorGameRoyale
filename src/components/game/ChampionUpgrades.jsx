import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Shield, Zap, Star, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UPGRADES = {
  power: {
    name: 'Power',
    icon: Zap,
    color: '#EF4444',
    description: 'Increase score multiplier',
    maxLevel: 10,
    cost: (level) => level * 15,
  },
  defense: {
    name: 'Defense',
    icon: Shield,
    color: '#3B82F6',
    description: 'Reduce Umbra attack effectiveness',
    maxLevel: 10,
    cost: (level) => level * 15,
  },
  speed: {
    name: 'Speed',
    icon: TrendingUp,
    color: '#10B981',
    description: 'Gain more bonus time on streaks',
    maxLevel: 10,
    cost: (level) => level * 15,
  },
  magic: {
    name: 'Magic',
    icon: Star,
    color: '#F59E0B',
    description: 'Stronger faction buffs',
    maxLevel: 10,
    cost: (level) => level * 15,
  },
};

export default function ChampionUpgrades({ champion, upgrades, upgradePoints, onUpgrade, onBack, onSave }) {
  const [selectedStat, setSelectedStat] = useState(null);

  const getStatValue = (stat) => {
    const baseValue = champion.stats[stat];
    const upgradeLevel = upgrades[stat] || 0;
    return baseValue + upgradeLevel * 5;
  };

  const canUpgrade = (stat) => {
    const currentLevel = upgrades[stat] || 0;
    const upgrade = UPGRADES[stat];
    if (currentLevel >= upgrade.maxLevel) return false;
    if (upgradePoints < upgrade.cost(currentLevel + 1)) return false;
    return true;
  };

  const handleUpgrade = (stat) => {
    if (canUpgrade(stat)) {
      const upgrade = UPGRADES[stat];
      const currentLevel = upgrades[stat] || 0;
      onUpgrade(stat, upgrade.cost(currentLevel + 1));
      onSave();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Map
          </Button>

          {/* Upgrade points */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50">
            <Star className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-xs text-yellow-300">Upgrade Points</p>
              <p className="text-2xl font-black text-yellow-400">{upgradePoints}</p>
            </div>
          </div>
        </div>

        {/* Champion info */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 p-6 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${champion.colors.primary}20, ${champion.colors.secondary}20)`,
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{champion.sprite}</div>
            <div>
              <h1 className="text-3xl font-black text-white">{champion.name}</h1>
              <p className="text-slate-400">{champion.title}</p>
              <p 
                className="text-sm font-bold mt-1"
                style={{ color: champion.colors.primary }}
              >
                {champion.class}
              </p>
            </div>
          </div>

          {/* Total stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(champion.stats).map(([stat, baseValue]) => {
              const currentValue = getStatValue(stat);
              const upgradeLevel = upgrades[stat] || 0;
              return (
                <div 
                  key={stat}
                  className="p-3 rounded-lg bg-slate-900/50"
                >
                  <p className="text-xs text-slate-400 uppercase">{stat}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-white">{currentValue}</p>
                    {upgradeLevel > 0 && (
                      <span className="text-sm text-green-400 font-bold">
                        (+{upgradeLevel * 5})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Upgrade grid */}
        <div>
          <h2 className="text-2xl font-black text-white mb-4">STAT UPGRADES</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(UPGRADES).map(([stat, upgrade]) => {
              const currentLevel = upgrades[stat] || 0;
              const Icon = upgrade.icon;
              const isMaxed = currentLevel >= upgrade.maxLevel;
              const canUpgradeThis = canUpgrade(stat);

              return (
                <motion.div
                  key={stat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all
                    ${selectedStat === stat ? 'ring-2 ring-white' : ''}
                  `}
                  style={{
                    background: `${upgrade.color}15`,
                    borderColor: `${upgrade.color}40`,
                  }}
                >
                  {/* Maxed badge */}
                  {isMaxed && (
                    <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-black flex items-center gap-1">
                      <Check className="w-3 h-3" /> MAX
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `${upgrade.color}30` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: upgrade.color }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">{upgrade.name}</h3>
                        <p className="text-xs text-slate-400">{upgrade.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Level progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Level</span>
                      <span className="font-bold text-white">
                        {currentLevel} / {upgrade.maxLevel}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentLevel / upgrade.maxLevel) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: upgrade.color }}
                      />
                    </div>
                  </div>

                  {/* Upgrade button */}
                  <Button
                    onClick={() => handleUpgrade(stat)}
                    disabled={!canUpgradeThis}
                    className="w-full"
                    style={{
                      background: canUpgradeThis ? upgrade.color : '#334155',
                      opacity: canUpgradeThis ? 1 : 0.5,
                    }}
                  >
                    {isMaxed ? (
                      <>
                        <Check className="w-4 h-4 mr-2" /> Maxed Out
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Upgrade ({upgrade.cost(currentLevel + 1)} pts)
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Info panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 rounded-xl bg-purple-900/20 border border-purple-500/30"
        >
          <p className="text-sm text-purple-300 text-center">
            💡 Earn upgrade points by completing campaign levels. Upgrades are permanent and carry over between sessions!
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}