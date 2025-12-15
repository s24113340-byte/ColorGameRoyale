import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChampionSelect from '@/components/game/ChampionSelect';
import CampaignMap from '@/components/game/CampaignMap';
import ChampionUpgrades from '@/components/game/ChampionUpgrades';
import GameBoard from '@/components/game/GameBoard';
import GameHUD from '@/components/game/GameHUD';
import UmbraOverlay from '@/components/game/UmbraOverlay';
import UmbraAIIndicator from '@/components/game/UmbraAIIndicator';
import EndingCinematic from '@/components/game/EndingCinematic';
import ModeSelect from '@/components/game/ModeSelect';
import PVPMode from '@/components/game/PVPMode';

// Save/Load system
const SAVE_KEY = 'colorGameRoyale_save';

const saveGame = (saveData) => {
  try {
    const dataToSave = {
      ...saveData,
      lastSaved: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

const loadGame = () => {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return null;
    const parsed = JSON.parse(savedData);
    return parsed;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

const getDefaultSaveData = () => {
  return {
    campaignProgress: {
      highestLevelUnlocked: 1,
      completedLevels: [],
      upgradePoints: 0,
      totalScore: 0,
    },
    championUpgrades: {
      ren: { power: 0, defense: 0, speed: 0, magic: 0 },
      rei: { power: 0, defense: 0, speed: 0, magic: 0 },
    },
    settings: {
      soundEnabled: true,
      musicEnabled: true,
    },
  };
};

const updateCampaignProgress = (currentSave, levelCompleted, scoreEarned) => {
  const newSave = { ...currentSave };
  if (levelCompleted >= newSave.campaignProgress.highestLevelUnlocked) {
    newSave.campaignProgress.highestLevelUnlocked = levelCompleted + 1;
  }
  if (!newSave.campaignProgress.completedLevels.includes(levelCompleted)) {
    newSave.campaignProgress.completedLevels.push(levelCompleted);
  }
  newSave.campaignProgress.upgradePoints += levelCompleted * 10;
  newSave.campaignProgress.totalScore += scoreEarned;
  return newSave;
};

const applyUpgrade = (currentSave, championId, stat, cost) => {
  const newSave = { ...currentSave };
  newSave.campaignProgress.upgradePoints -= cost;
  if (!newSave.championUpgrades[championId]) {
    newSave.championUpgrades[championId] = { power: 0, defense: 0, speed: 0, magic: 0 };
  }
  newSave.championUpgrades[championId][stat] = (newSave.championUpgrades[championId][stat] || 0) + 1;
  return newSave;
};

const COLORS = [
  { id: 'red', name: 'Fire', hex: '#FF3B3B', faction: 'fire', emoji: '🔥' },
  { id: 'blue', name: 'Water', hex: '#3B82F6', faction: 'water', emoji: '💧' },
  { id: 'green', name: 'Nature', hex: '#10B981', faction: 'nature', emoji: '🌿' },
  { id: 'yellow', name: 'Light', hex: '#FBBF24', faction: 'light', emoji: '✨' },
];

const INITIAL_STATE = {
  phase: 'title', // title, mode-select, campaign-map, upgrades, champion-select, playing, ending
  gameMode: null, // normal, time-attack, pvp
  champion: null,
  selectedLevel: null,
  score: 0,
  coins: 500,
  hasInsertedCoin: false,
  timer: 60,
  bonusTime: 0,
  streak: 0,
  bets: {},
  droppedBalls: [],
  isDropping: false,
  canSkipResults: false,
  resultsTimer: null,
  shadowMeter: 100,
  elementalBalance: { fire: 25, water: 25, nature: 25, light: 25 },
  umbraActive: false,
  umbraAbility: null,
  umbraRageMode: false,
  umbraFinalBoss: false,
  poisonedSquares: [],
  frozen: false,
  round: 1,
  maxRounds: 10,
  factionBuffActive: null,
  payoutMultiplier: 1,
  ending: null,
};

export default function ColorGameRoyale() {
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [saveData, setSaveData] = useState(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Load save data on mount
  useEffect(() => {
    const loaded = loadGame();
    if (loaded) {
      setSaveData(loaded);
    } else {
      setSaveData(getDefaultSaveData());
    }
  }, []);

  const playSound = useCallback((type) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const sounds = {
      bet: { freq: 440, duration: 0.1 },
      drop: { freq: 220, duration: 0.3 },
      win: { freq: 880, duration: 0.5 },
      jackpot: { freq: 1200, duration: 0.8 },
      umbra: { freq: 110, duration: 0.6 },
    };
    
    const s = sounds[type] || sounds.bet;
    osc.frequency.value = s.freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + s.duration);
    osc.start();
    osc.stop(ctx.currentTime + s.duration);
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState.phase === 'playing' && !gameState.frozen && !gameState.isDropping) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newTimer = prev.timer - 1;
          if (newTimer <= 0) {
            return { ...prev, phase: 'ending', ending: determineEnding(prev) };
          }
          return { ...prev, timer: newTimer };
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState.phase, gameState.frozen, gameState.isDropping]);

  const determineEnding = (state) => {
    const isVictory = state.shadowMeter <= 0;
    
    // Save campaign progress for Normal mode
    if (state.gameMode === 'normal' && saveData && state.selectedLevel) {
      const newSave = updateCampaignProgress(
        saveData,
        state.selectedLevel,
        state.score,
        state.champion?.id
      );
      setSaveData(newSave);
      saveGame(newSave);
    }
    
    if (isVictory) {
      const dominant = Object.entries(state.elementalBalance)
        .sort((a, b) => b[1] - a[1])[0][0];
      return dominant;
    }
    return 'chaos';
  };

  const selectChampion = (champion) => {
    const championWithUpgrades = getChampionWithUpgrades(champion);
    setGameState(prev => ({
      ...prev,
      champion: championWithUpgrades,
      phase: 'playing',
      coins: 500,
    }));
  };

  const insertCoin = () => {
    playSound('bet');
    setGameState(prev => ({
      ...prev,
      hasInsertedCoin: true,
    }));
  };

  const selectMode = (mode) => {
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      phase: mode === 'pvp' ? 'pvp' : mode === 'normal' ? 'campaign-map' : 'champion-select',
      timer: mode === 'time-attack' ? 30 : 60,
      maxRounds: mode === 'time-attack' ? 999 : 10,
    }));
  };

  const selectCampaignLevel = (levelId) => {
    setGameState(prev => ({
      ...prev,
      selectedLevel: levelId,
      phase: 'champion-select',
      maxRounds: 10, // Campaign has 10 rounds per level
      coins: 500, // Starting coins
    }));
  };

  const handleSaveProgress = () => {
    if (saveData) {
      saveGame(saveData);
    }
  };

  const handleUpgrade = (stat, cost) => {
    if (!gameState.champion || !saveData) return;
    
    const newSave = applyUpgrade(saveData, gameState.champion.id, stat, cost);
    setSaveData(newSave);
    saveGame(newSave);
  };

  const getChampionWithUpgrades = (champion) => {
    if (!champion || !saveData) return champion;
    
    const upgrades = saveData.championUpgrades[champion.id] || {};
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

  const placeBet = (colorId, amount) => {
    if (gameState.coins < amount || gameState.frozen || gameState.isDropping) return;
    playSound('bet');
    
    setGameState(prev => ({
      ...prev,
      coins: prev.coins - amount,
      bets: {
        ...prev.bets,
        [colorId]: (prev.bets[colorId] || 0) + amount,
      },
    }));
  };

  const dropBalls = async () => {
    if (Object.keys(gameState.bets).length === 0 || gameState.isDropping) return;
    
    playSound('drop');
    setGameState(prev => ({ ...prev, isDropping: true, canSkipResults: false }));

    // Simulate 3 ball drops with bouncing animation
    const results = [];
    for (let i = 0; i < 3; i++) {
      // Final landing color (weighted towards player's bets for easier gameplay)
      const finalColor = Math.random() < 0.6 && Object.keys(gameState.bets).length > 0
        ? COLORS.find(c => c.id === Object.keys(gameState.bets)[Math.floor(Math.random() * Object.keys(gameState.bets).length)])
        : COLORS[Math.floor(Math.random() * COLORS.length)];
      
      results.push(finalColor);
      
      // Show ball with bouncing animation
      setGameState(prev => ({
        ...prev,
        droppedBalls: [...prev.droppedBalls, { 
          color: finalColor, 
          bouncing: true,
          id: Date.now() + i 
        }],
      }));
      
      await new Promise(r => setTimeout(r, 1200));
    }

    // Show final results for 1.5 seconds (can be skipped)
    const resultsTimer = setTimeout(() => {
      setGameState(prev => ({ ...prev, canSkipResults: false, resultsTimer: null }));
      calculateResults(results);
    }, 1500);
    
    // Enable skip and store timer ID
    setGameState(prev => ({ ...prev, canSkipResults: true, resultsTimer }));
  };

  const skipResults = () => {
    if (gameState.canSkipResults && gameState.resultsTimer) {
      clearTimeout(gameState.resultsTimer);
      setGameState(prev => ({ ...prev, canSkipResults: false, resultsTimer: null }));
      const results = gameState.droppedBalls.map(b => b.color);
      calculateResults(results);
    }
  };

  const calculateResults = (results) => {
    let totalWin = 0;
    let pointsEarned = 0;
    let bonusTimeEarned = 0;
    let newStreak = gameState.streak;
    let factionBuff = null;
    let multiplier = 1;
    let shadowDamage = 0;
    const newBalance = { ...gameState.elementalBalance };

    // Count matches per color
    const colorCounts = {};
    results.forEach(r => {
      colorCounts[r.id] = (colorCounts[r.id] || 0) + 1;
    });

    // Check each bet
    Object.entries(gameState.bets).forEach(([colorId, betAmount]) => {
      const matches = colorCounts[colorId] || 0;
      if (matches > 0) {
        const payoutRates = { 1: 1, 2: 2, 3: 3 };
        const payout = betAmount * payoutRates[matches] * multiplier;
        totalWin += payout;
        pointsEarned += matches === 3 ? 30 : 10 * matches;
        newStreak++;

        // Faction buff activation on streak or jackpot
        if (matches === 3 || newStreak >= 3) {
          const color = COLORS.find(c => c.id === colorId);
          factionBuff = color.faction;
          multiplier = 3;
          shadowDamage = 20;
          bonusTimeEarned = matches === 3 ? 15 : 5;
          newBalance[color.faction] = Math.min(100, newBalance[color.faction] + 10);
          playSound('jackpot');
        } else {
          playSound('win');
        }
      } else {
        newStreak = 0;
      }
    });

    // Umbra SOPHISTICATED AI interference
    let umbraAbility = null;
    let poisoned = [];
    let frozen = false;
    let isRageMode = false;
    let isFinalBoss = false;
    
    if (gameState.gameMode === 'normal' && gameState.round > 2) {
      const shadowPercent = gameState.shadowMeter;
      const champion = gameState.champion;
      
      // RAGE MODE: Shadow Meter below 30%
      isRageMode = shadowPercent <= 30;
      
      // FINAL BOSS MODE: Last 2 rounds
      isFinalBoss = gameState.round >= gameState.maxRounds - 1;
      
      // Base attack chance (reduced for easier gameplay)
      let attackChance = 0.15;
      
      // Rage Mode increases frequency (but not too much)
      if (isRageMode) {
        attackChance = 0.35;
      }
      
      // Final Boss attacks more frequently
      if (isFinalBoss) {
        attackChance = 0.6;
      }
      
      if (Math.random() < attackChance) {
        // AI ADAPTATION: Choose ability based on player behavior
        const abilities = [];
        
        // Against high-speed champions (Rei) or high streak - use Freeze
        if ((champion?.stats?.speed > 70 || gameState.streak >= 3) && !frozen) {
          abilities.push('freeze', 'freeze'); // Higher weight
        }
        
        // Against high-scoring players - use Score Drain
        if (gameState.score > 200 && totalWin > 30) {
          abilities.push('score-drain', 'score-drain', 'score-drain'); // Higher weight
        }
        
        // Against faction-focused players - use Poison
        const dominantFaction = Object.entries(newBalance).sort((a, b) => b[1] - a[1])[0];
        if (dominantFaction[1] > 35) {
          abilities.push('poison', 'poison');
        }
        
        // Default abilities
        abilities.push('score-drain', 'freeze', 'poison');
        
        // FINAL BOSS MECHANICS: Special abilities
        if (isFinalBoss) {
          abilities.push('shadow-surge', 'elemental-drain', 'corruption');
        }
        
        umbraAbility = abilities[Math.floor(Math.random() * abilities.length)];
        playSound('umbra');
        
        // Execute ability with Rage Mode power boost
        const ragePower = isRageMode ? 1.5 : 1;
        
        if (umbraAbility === 'score-drain') {
          const drainPercent = isRageMode ? 0.7 : 0.5;
          totalWin = Math.floor(totalWin * (1 - drainPercent));
          pointsEarned = Math.floor(pointsEarned * (1 - drainPercent));
        } else if (umbraAbility === 'freeze') {
          frozen = true;
          const freezeDuration = isRageMode ? 5000 : 3000;
          setTimeout(() => {
            setGameState(prev => ({ ...prev, frozen: false }));
          }, freezeDuration);
        } else if (umbraAbility === 'poison') {
          const poisonCount = isRageMode ? 2 : 1;
          for (let i = 0; i < poisonCount; i++) {
            poisoned.push(COLORS[Math.floor(Math.random() * COLORS.length)].id);
          }
        } else if (umbraAbility === 'shadow-surge') {
          // FINAL BOSS: Massive score drain + time penalty
          totalWin = Math.floor(totalWin * 0.3);
          pointsEarned = Math.floor(pointsEarned * 0.3);
          bonusTimeEarned -= 10;
        } else if (umbraAbility === 'elemental-drain') {
          // FINAL BOSS: Drains all elemental balance
          Object.keys(newBalance).forEach(key => {
            newBalance[key] = Math.max(15, newBalance[key] - 15);
          });
        } else if (umbraAbility === 'corruption') {
          // FINAL BOSS: All squares poisoned briefly
          poisoned = COLORS.map(c => c.id);
          setTimeout(() => {
            setGameState(prev => ({ ...prev, poisonedSquares: [] }));
          }, 2000);
        }
      }
    }

    setGameState(prev => {
      const newShadow = Math.max(0, prev.shadowMeter - shadowDamage);
      const newRound = prev.round + 1;
      
      // Check for ending conditions
      if (newShadow <= 0 || (prev.gameMode === 'normal' && newRound > prev.maxRounds)) {
        return {
          ...prev,
          phase: 'ending',
          ending: newShadow <= 0 ? determineEnding({ ...prev, shadowMeter: 0 }) : 'chaos',
        };
      }

      return {
        ...prev,
        score: prev.score + pointsEarned,
        coins: prev.coins + totalWin,
        timer: Math.max(0, prev.timer + bonusTimeEarned),
        streak: newStreak,
        bets: {},
        droppedBalls: [],
        isDropping: false,
        canSkipResults: false,
        resultsTimer: null,
        shadowMeter: newShadow,
        elementalBalance: newBalance,
        factionBuffActive: factionBuff,
        payoutMultiplier: multiplier,
        umbraActive: !!umbraAbility,
        umbraAbility,
        umbraRageMode: isRageMode,
        umbraFinalBoss: isFinalBoss,
        poisonedSquares: poisoned,
        frozen,
        round: newRound,
      };
    });

    // Clear faction buff after delay
    if (factionBuff) {
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          factionBuffActive: null,
          payoutMultiplier: 1,
        }));
      }, 3000);
    }
    
    // Clear Umbra ability after 1 second
    if (umbraAbility) {
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          umbraActive: false,
          umbraAbility: null,
        }));
      }, 1000);
    }
  };

  const resetGame = () => {
    setGameState(INITIAL_STATE);
  };

  const startGame = () => {
    if (!gameState.hasInsertedCoin) return;
    setGameState(prev => ({ ...prev, phase: 'mode-select' }));
  };

  // Don't render until save data is loaded
  if (!saveData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsNTEsMjM0LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0.3 
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {gameState.phase === 'title' && (
          <TitleScreen onStart={startGame} onInsertCoin={insertCoin} hasInsertedCoin={gameState.hasInsertedCoin} />
        )}

        {gameState.phase === 'mode-select' && (
          <ModeSelect 
            onSelectMode={selectMode} 
            onBack={resetGame}
            hasCampaignSave={saveData.campaignProgress.highestLevelUnlocked > 1}
          />
        )}

        {gameState.phase === 'campaign-map' && (
          <CampaignMap 
            progress={saveData.campaignProgress}
            onSelectLevel={selectCampaignLevel}
            onBack={() => setGameState(prev => ({ ...prev, phase: 'mode-select' }))}
            onUpgrades={() => setGameState(prev => ({ ...prev, phase: 'upgrades' }))}
          />
        )}

        {gameState.phase === 'upgrades' && (
          <ChampionUpgrades
            champion={gameState.champion || { id: 'ren', name: 'REN', title: 'The Disciplined Scholar', class: 'Warrior', sprite: '⚔️', stats: { power: 85, defense: 90, speed: 60, magic: 40 }, colors: { primary: '#FF3B3B', secondary: '#F97316' } }}
            upgrades={saveData.championUpgrades[gameState.champion?.id || 'ren'] || {}}
            upgradePoints={saveData.campaignProgress.upgradePoints}
            onUpgrade={handleUpgrade}
            onBack={() => setGameState(prev => ({ ...prev, phase: 'campaign-map' }))}
            onSave={handleSaveProgress}
          />
        )}

        {gameState.phase === 'champion-select' && (
          <ChampionSelect 
            onSelect={selectChampion} 
            onBack={() => setGameState(prev => ({ 
              ...prev, 
              phase: prev.gameMode === 'normal' ? 'campaign-map' : 'mode-select' 
            }))}
            championUpgrades={saveData.championUpgrades}
          />
        )}

        {gameState.phase === 'pvp' && (
          <PVPMode onBack={resetGame} colors={COLORS} />
        )}

        {gameState.phase === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            <GameHUD 
              gameState={gameState}
              colors={COLORS}
            />
            
            <GameBoard 
              gameState={gameState}
              colors={COLORS}
              onPlaceBet={placeBet}
              onDrop={dropBalls}
              onSkipResults={skipResults}
            />

            <UmbraOverlay 
              active={gameState.umbraActive}
              ability={gameState.umbraAbility}
              shadowMeter={gameState.shadowMeter}
              rageMode={gameState.umbraRageMode}
              finalBoss={gameState.umbraFinalBoss}
            />

            <UmbraAIIndicator gameState={gameState} />
          </motion.div>
        )}

        {gameState.phase === 'ending' && (
          <EndingCinematic 
            ending={gameState.ending}
            score={gameState.score}
            champion={gameState.champion}
            onRestart={resetGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TitleScreen({ onStart, onInsertCoin, hasInsertedCoin }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4"
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
          COLOR GAME
        </h1>
        <h2 className="text-3xl md:text-5xl font-black text-white mt-2 tracking-widest">
          ROYALE
        </h2>
        <p className="text-purple-300 text-sm md:text-base mt-4 tracking-wider">
          ⚔️ THE CHROMATIC KINGDOM AWAITS ⚔️
        </p>
      </motion.div>

      {/* Floating orbs */}
      <div className="relative w-64 h-64 mb-8">
        {['#FF3B3B', '#3B82F6', '#10B981', '#FBBF24'].map((color, i) => (
          <motion.div
            key={color}
            className="absolute w-16 h-16 rounded-full blur-sm"
            style={{ 
              background: `radial-gradient(circle, ${color}, transparent)`,
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: Math.cos((i * Math.PI) / 2) * 80 - 32,
              y: Math.sin((i * Math.PI) / 2) * 80 - 32,
              scale: [1, 1.2, 1],
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity, delay: i * 0.5 },
            }}
          />
        ))}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-32 h-32 border-2 border-purple-500/30 rounded-full" />
        </motion.div>
      </div>

      {/* Insert Coin / Start button */}
      {!hasInsertedCoin ? (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          {/* Blinking INSERT COIN */}
          <motion.h2
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-3xl md:text-4xl font-black text-yellow-400 mb-6 tracking-widest"
            style={{
              textShadow: '0 0 20px rgba(250, 204, 21, 0.8)',
            }}
          >
            INSERT COIN
          </motion.h2>

          {/* Coin slot */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-40 h-24 bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg border-4 border-slate-600 flex items-center justify-center">
              <div className="w-20 h-5 bg-black rounded-full border-2 border-slate-500" />
            </div>
          </div>

          {/* Insert button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onInsertCoin}
            className="px-10 py-4 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-xl text-black text-xl font-black shadow-lg shadow-yellow-500/50 border-4 border-yellow-500"
          >
            <div className="flex items-center gap-3">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                🪙
              </motion.span>
              INSERT COIN
              <motion.span
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                🪙
              </motion.span>
            </div>
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white text-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
          >
            START GAME
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-green-400 text-sm font-bold"
          >
            ✓ COIN INSERTED - Press to Enter
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}