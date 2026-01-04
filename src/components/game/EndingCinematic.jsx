import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Droplets, Leaf, Sun, Skull, RefreshCw, Star, Coins } from 'lucide-react';
import ArcadeAudioManager from '@/components/game/ArcadeAudioManager';

const ENDINGS = {
  victory: {
    title: 'VICTORY!',
    subtitle: 'Enemy Defeated',
    description: 'You have successfully defeated your foe! Your skill and determination have proven victorious. The road ahead grows more challenging, but with each victory, you grow stronger.',
    icon: Trophy,
    color: '#10B981',
    bgGradient: 'from-green-950 via-emerald-950 to-teal-950',
    emoji: '🏆',
  },
  fire: {
    title: 'THE FIRE ENDING',
    subtitle: 'Blaze of Glory',
    description: 'The flames of passion have consumed the shadow! The Chromatic Kingdom rises anew from the ashes, reborn in eternal fire. Ren\'s warrior spirit guides the realm into an age of strength and courage.',
    icon: Flame,
    color: '#FF3B3B',
    bgGradient: 'from-red-950 via-orange-950 to-yellow-950',
    emoji: '🔥',
  },
  water: {
    title: 'THE WATER ENDING',
    subtitle: 'Tidal Harmony',
    description: 'The cleansing waters have washed away the darkness! Rivers of light flow through the kingdom, bringing peace and tranquility. Rei\'s wisdom guides the realm into an age of harmony.',
    icon: Droplets,
    color: '#3B82F6',
    bgGradient: 'from-blue-950 via-cyan-950 to-teal-950',
    emoji: '🌊',
  },
  nature: {
    title: 'THE NATURE ENDING',
    subtitle: 'Eternal Growth',
    description: 'Life has triumphed over the void! Forests of crystal and gardens of light bloom across the kingdom. The natural order is restored, and balance returns to all things.',
    icon: Leaf,
    color: '#10B981',
    bgGradient: 'from-green-950 via-emerald-950 to-teal-950',
    emoji: '🌿',
  },
  light: {
    title: 'THE LIGHT ENDING',
    subtitle: 'Dawn Eternal',
    description: 'Pure radiance has banished the shadow forever! The kingdom basks in perpetual golden light, and hope shines in every heart. A new golden age begins.',
    icon: Sun,
    color: '#FBBF24',
    bgGradient: 'from-yellow-950 via-amber-950 to-orange-950',
    emoji: '✨',
  },
  chaos: {
    title: 'THE CHAOTIC ENDING',
    subtitle: 'Shadows Eternal',
    description: 'Umbra\'s darkness has consumed the Chromatic Kingdom... The colors fade to gray, and shadow reigns supreme. Perhaps another champion will rise to challenge the darkness...',
    icon: Skull,
    color: '#6B21A8',
    bgGradient: 'from-purple-950 via-slate-950 to-black',
    emoji: '💀',
  },
  fallen: {
    title: 'YOU HAVE FALLEN',
    subtitle: 'Defeat',
    description: 'The enemy has proven too strong... Your champion has fallen in battle. But do not despair - rise again and face the challenge with renewed determination!',
    icon: Skull,
    color: '#EF4444',
    bgGradient: 'from-purple-950 via-slate-950 to-black',
    emoji: '💀',
  },
};

export default function EndingCinematic({ ending, score, champion, onRestart, gameMode, currentLevel, onNextLevel, onBackToMap, coinsRemaining, saveData, setSaveData }) {
  const [phase, setPhase] = useState('intro');
  const endingData = ENDINGS[ending] || ENDINGS.chaos;
  const isVictory = ending !== 'chaos' && ending !== 'fallen';
  const isCampaignVictory = gameMode === 'normal' && isVictory;
  const isCampaignDefeat = gameMode === 'normal' && ending === 'fallen';
  
  // Calculate coin rewards based on level difficulty
  let coinReward = 0;
  if (isCampaignVictory) {
    if (currentLevel <= 3) coinReward = currentLevel * 50; // Easy: 50-150
    else if (currentLevel <= 5) coinReward = currentLevel * 75; // Normal: 225-375
    else if (currentLevel <= 7) coinReward = currentLevel * 100; // Hard: 600-700
    else if (currentLevel <= 9) coinReward = currentLevel * 125; // Very hard: 1000-1125
    else coinReward = 2000; // Umbra: 2000
  } else if (isCampaignDefeat) {
    coinReward = 100;
  }
  
  // Save progress when ending is shown
  useEffect(() => {
    if (gameMode === 'normal' && saveData && currentLevel) {
      const newSave = {
        ...saveData,
        campaignProgress: {
          ...saveData.campaignProgress,
          coins: coinsRemaining + coinReward,
          totalScore: saveData.campaignProgress.totalScore + score,
        }
      };
      
      // Unlock next level if victory
      if (isVictory && currentLevel >= newSave.campaignProgress.highestLevelUnlocked) {
        newSave.campaignProgress.highestLevelUnlocked = currentLevel + 1;
      }
      
      // Mark level as completed
      if (isVictory && !newSave.campaignProgress.completedLevels.includes(currentLevel)) {
        newSave.campaignProgress.completedLevels.push(currentLevel);
      }
      
      setSaveData(newSave);
      localStorage.setItem('colorGameRoyale_save', JSON.stringify(newSave));
    }
  }, []);
  
  const rewardCoins = coinReward;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('title'), 2000),
      setTimeout(() => setPhase('content'), 4000),
      setTimeout(() => setPhase('stats'), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen bg-gradient-to-b ${endingData.bgGradient} flex flex-col items-center justify-center px-4 py-8`}
    >
      {/* Victory BGM */}
      {isVictory && <ArcadeAudioManager musicOn={true} soundOn={false} theme="victory" />}
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ background: endingData.color }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * -500],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Intro phase */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl md:text-9xl mb-4"
            >
              {endingData.emoji}
            </motion.div>
            <p className="text-slate-400 text-lg tracking-widest">
              {isVictory ? 'VICTORY...' : 'DEFEAT...'}
            </p>
          </motion.div>
        )}

        {/* Title phase */}
        {phase === 'title' && (
          <motion.div
            key="title"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="mb-4"
            >
              <endingData.icon 
                className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4"
                style={{ color: endingData.color }}
              />
            </motion.div>
            <h1 
              className="text-4xl md:text-6xl font-black tracking-wider"
              style={{ 
                color: endingData.color,
                textShadow: `0 0 30px ${endingData.color}50`,
              }}
            >
              {endingData.title}
            </h1>
            <p className="text-2xl text-slate-300 mt-2 tracking-widest">
              {endingData.subtitle}
            </p>
          </motion.div>
        )}

        {/* Content phase */}
        {(phase === 'content' || phase === 'stats') && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl text-center"
          >
            {/* Icon and title */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-6"
            >
              <div 
                className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{ 
                  background: `${endingData.color}20`,
                  boxShadow: `0 0 50px ${endingData.color}30`,
                }}
              >
                <endingData.icon 
                  className="w-12 h-12"
                  style={{ color: endingData.color }}
                />
              </div>
            </motion.div>

            <h1 
              className="text-3xl md:text-5xl font-black mb-2"
              style={{ color: endingData.color }}
            >
              {endingData.title}
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              {endingData.subtitle}
            </p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-slate-300 leading-relaxed mb-12 px-4"
            >
              {endingData.description}
            </motion.p>

            {/* Stats - only show in stats phase */}
            {phase === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Champion info */}
                {champion && (
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {champion.id === 'ren' ? (
                      (ending === 'chaos' || ending === 'fallen') ? (
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/d7e7f976c_unnamed__2_-removebg-preview.png"
                          alt="Defeated Ren"
                          className="w-48 h-48 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/dff47c1de_win_red-removebg-preview.png"
                          alt="Victorious Ren"
                          className="w-48 h-48 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )
                    ) : champion.id === 'rei' ? (
                      (ending === 'chaos' || ending === 'fallen') ? (
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/fccff93f0_rei_defeat-removebg-preview.png"
                          alt="Defeated Rei"
                          className="w-64 h-64 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/a210ab79a_reiwin.png"
                          alt="Victorious Rei"
                          className="w-48 h-48 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )
                    ) : champion.sprite.startsWith('http') ? (
                      <img 
                        src={champion.sprite} 
                        alt={champion.name}
                        className="w-16 h-16 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <span className="text-4xl">{champion.sprite}</span>
                    )}
                    <div className="text-left">
                      <p className="text-slate-400 text-sm">Champion</p>
                      <p className="font-bold text-white text-xl">{champion.name}</p>
                    </div>
                  </div>
                )}

                {/* Score */}
                <div 
                  className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl"
                  style={{ background: `${endingData.color}20` }}
                >
                  <Trophy className="w-8 h-8" style={{ color: endingData.color }} />
                  <div className="text-left">
                    <p className="text-slate-400 text-sm">Final Score</p>
                    <p 
                      className="font-black text-4xl"
                      style={{ color: endingData.color }}
                    >
                      {score.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Coin summary - for campaign mode */}
                {(isCampaignVictory || isCampaignDefeat) && (
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl ${
                        isCampaignVictory 
                          ? 'bg-yellow-500/20 border-2 border-yellow-500/50' 
                          : 'bg-slate-700/20 border-2 border-slate-500/50'
                      }`}
                    >
                      <div className="text-5xl">💰</div>
                      <div className="text-left">
                        <p className={`text-sm font-bold ${isCampaignVictory ? 'text-yellow-400' : 'text-slate-400'}`}>
                          REWARD
                        </p>
                        <p className={`font-black text-4xl ${isCampaignVictory ? 'text-yellow-400' : 'text-slate-300'}`}>
                          +{rewardCoins} Coins
                        </p>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-center text-sm text-slate-400"
                    >
                      <p>Remaining: {coinsRemaining} + Reward: {rewardCoins}</p>
                      <p className="text-lg font-bold text-white mt-1">
                        Total: {coinsRemaining + rewardCoins} Coins
                      </p>
                    </motion.div>
                  </div>
                )}

                {/* Rating */}
                <div className="flex justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          i < Math.min(5, Math.floor(score / 100) + (isVictory ? 2 : 0))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="mt-8 flex flex-col gap-4 items-center">
                  {/* Campaign mode victory - show next level and back options */}
                  {gameMode === 'normal' && isVictory && currentLevel < 10 && (
                    <>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNextLevel}
                        className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 text-white"
                        style={{
                          background: `linear-gradient(135deg, ${endingData.color}, ${endingData.color}aa)`,
                          boxShadow: `0 10px 30px ${endingData.color}40`,
                        }}
                      >
                        PROCEED TO NEXT LEVEL
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBackToMap}
                        className="px-8 py-4 rounded-xl font-bold text-lg bg-slate-700/80 hover:bg-slate-600/80 text-white border-2 border-slate-500/50"
                      >
                        BACK TO CAMPAIGN MAP
                      </motion.button>
                    </>
                  )}
                  
                  {/* Campaign mode - back to map for defeat or last level */}
                  {gameMode === 'normal' && (!isVictory || currentLevel >= 10) && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onBackToMap}
                      className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${endingData.color}, ${endingData.color}aa)`,
                        boxShadow: `0 10px 30px ${endingData.color}40`,
                      }}
                    >
                      BACK TO CAMPAIGN MAP
                    </motion.button>
                  )}
                  
                  {/* Other modes - play again */}
                  {gameMode !== 'normal' && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onRestart}
                      className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3"
                      style={{
                        background: `linear-gradient(135deg, ${endingData.color}, ${endingData.color}aa)`,
                        boxShadow: `0 10px 30px ${endingData.color}40`,
                      }}
                    >
                      <RefreshCw className="w-5 h-5" />
                      PLAY AGAIN
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}