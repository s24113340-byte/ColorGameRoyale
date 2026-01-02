import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sword, Sparkles, Shield, Wand2, ArrowLeft, Star } from 'lucide-react';

const CHAMPIONS = [
  {
    id: 'ren',
    name: 'REN',
    title: 'The Disciplined Scholar',
    class: 'Warrior',
    description: 'A master of elemental combat, Ren channels the power of Fire and Earth with unwavering focus.',
    faction: 'fire',
    stats: { power: 85, defense: 90, speed: 60, magic: 40 },
    abilities: ['Shield Wall', 'Flame Strike', 'Iron Will'],
    colors: {
      primary: '#FF3B3B',
      secondary: '#F97316',
      glow: 'rgba(255, 59, 59, 0.5)',
    },
    sprite: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/78ffb30f4_renred-removebg-preview.png',
  },
  {
    id: 'rei',
    name: 'REI',
    title: 'The Visionary Artist',
    class: 'Elf Mage',
    description: 'A wielder of arcane arts, Rei bends Water and Light to paint reality itself.',
    faction: 'water',
    stats: { power: 50, defense: 55, speed: 80, magic: 95 },
    abilities: ['Prism Burst', 'Tide Surge', 'Ethereal Step'],
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      glow: 'rgba(59, 130, 246, 0.5)',
    },
    sprite: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/2ee233f82_Rei-removebg-preview.png',
  },
];

export default function ChampionSelect({ onSelect, onBack, championUpgrades = {} }) {
  const [hoveredChampion, setHoveredChampion] = useState(null);
  const [selectedChampion, setSelectedChampion] = useState(null);

  const getUpgradedChampion = (champion) => {
    const upgrades = championUpgrades[champion.id] || {};
    const upgradedStats = { ...champion.stats };
    
    Object.entries(upgrades).forEach(([stat, level]) => {
      upgradedStats[stat] = (upgradedStats[stat] || 0) + level * 5;
    });
    
    return {
      ...champion,
      stats: upgradedStats,
      upgrades,
    };
  };

  const handleSelect = (champion) => {
    setSelectedChampion(champion.id);
    setTimeout(() => onSelect(champion), 800);
  };

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
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-wider">
          CHOOSE YOUR CHAMPION
        </h2>
        <p className="text-purple-300 mt-2">Select a hero to defend the Chromatic Kingdom</p>
      </motion.div>

      {/* Champions grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mt-8">
        {CHAMPIONS.map((champion, index) => {
          const upgradedChampion = getUpgradedChampion(champion);
          const hasUpgrades = Object.values(upgradedChampion.upgrades || {}).some(v => v > 0);
          return (
          <motion.div
            key={champion.id}
            initial={{ x: index === 0 ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            onMouseEnter={() => setHoveredChampion(upgradedChampion.id)}
            onMouseLeave={() => setHoveredChampion(null)}
            onClick={() => handleSelect(upgradedChampion)}
            className={`
              relative cursor-pointer rounded-2xl overflow-hidden
              transition-all duration-300
              ${selectedChampion === champion.id ? 'scale-105 ring-4' : 'hover:scale-[1.02]'}
            `}
            style={{
              background: `linear-gradient(135deg, ${upgradedChampion.colors.primary}20, ${upgradedChampion.colors.secondary}20)`,
              ringColor: upgradedChampion.colors.primary,
            }}
            >
            {/* Upgraded indicator */}
            {hasUpgrades && (
              <div className="absolute top-4 left-4 px-2 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
                <span className="text-yellow-400 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" /> UPGRADED
                </span>
              </div>
            )}
            {/* Glow effect */}
            <div 
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at center, ${champion.colors.glow}, transparent 70%)`,
              }}
            />

            <div className="relative p-6 md:p-8">
              {/* Champion sprite - fixed height container for alignment */}
              <motion.div 
                className={`text-center flex justify-center h-96 items-end ${champion.id === 'ren' ? 'mb-0' : 'mb-4'}`}
                animate={hoveredChampion === champion.id ? { 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {champion.sprite.startsWith('http') ? (
                  <motion.img 
                    src={champion.sprite} 
                    alt={champion.name}
                    className={`object-contain ${champion.id === 'ren' ? 'w-[386px] h-[386px] md:w-[483px] md:h-[483px] -mb-16 -ml-[5%]' : 'w-[255px] h-[255px] md:w-[298px] md:h-[298px]'}`}
                    style={{ imageRendering: 'pixelated' }}
                    whileHover={{ scale: 1.15, y: -12 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  />
                ) : (
                  <motion.span 
                    className="text-8xl md:text-9xl inline-block"
                    whileHover={{ scale: 1.15, y: -12 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {champion.sprite}
                  </motion.span>
                )}
              </motion.div>

              {/* Name & Title */}
              <div className="text-center mb-6 mt-2">
                <h3 
                  className="text-3xl md:text-4xl font-black tracking-wider"
                  style={{ color: champion.colors.primary }}
                >
                  {champion.name}
                </h3>
                <p className="text-slate-300 text-sm mt-1">{champion.title}</p>
                <div 
                  className="inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full text-sm font-bold"
                  style={{ 
                    background: `${champion.colors.primary}30`,
                    color: champion.colors.primary 
                  }}
                >
                  {champion.class === 'Warrior' ? <Sword className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                  {champion.class}
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm text-center leading-relaxed px-4 mb-6">
                {champion.description}
              </p>

              {/* Select indicator */}
              {selectedChampion === champion.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: champion.colors.primary }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              )}
            </div>
          </motion.div>
          );
        })}
      </div>

      {/* Faction info */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-2xl mx-auto mt-8 p-4 rounded-xl bg-slate-900/50 border border-purple-500/20"
      >
        <p className="text-center text-sm text-slate-400">
          <span className="text-purple-400 font-bold">Faction Bonus:</span> Your champion's element grants
          augmented rewards when matching colors align with their power.
        </p>
      </motion.div>
    </motion.div>
  );
}