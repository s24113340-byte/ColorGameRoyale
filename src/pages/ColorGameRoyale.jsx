import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ChampionSelect from '@/components/game/ChampionSelect';
import CampaignMap from '@/components/game/CampaignMap';
import ChampionUpgrades from '@/components/game/ChampionUpgrades';
import GameBoard from '@/components/game/GameBoard';
import GameHUD from '@/components/game/GameHUD';
import UmbraOverlay from '@/components/game/UmbraOverlay';
import UmbraAIIndicator from '@/components/game/UmbraAIIndicator';
import UmbraDragon from '@/components/game/UmbraDragon';
import ChampionDisplay from '@/components/game/ChampionDisplay';
import EndingCinematic from '@/components/game/EndingCinematic';
import BlackHoleTransition from '@/components/game/BlackHoleTransition';
import ModeSelect from '@/components/game/ModeSelect';
import PVPMode from '@/components/game/PVPMode';
import PauseMenu from '@/components/game/PauseMenu';
import InGameTutorial from '@/components/game/InGameTutorial';
import TimeAttackInstructions from '@/components/game/TimeAttackInstructions';
import TimeAttackLeaderboard from '@/components/game/TimeAttackLeaderboard';
import GameFeedback from '@/components/game/GameFeedback';
import ArcadeAudioManager, { getArcadeSoundEngine } from '@/components/game/ArcadeAudioManager';
import { ScanlineOverlay, CRTEffect, ScreenFlash } from '@/components/game/ArcadeEffects';

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
      coins: 500,
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

const updateCampaignProgress = (currentSave, levelCompleted, scoreEarned, coinsRemaining, isVictory) => {
  const newSave = { ...currentSave };
  if (levelCompleted >= newSave.campaignProgress.highestLevelUnlocked) {
    newSave.campaignProgress.highestLevelUnlocked = levelCompleted + 1;
  }
  if (!newSave.campaignProgress.completedLevels.includes(levelCompleted)) {
    newSave.campaignProgress.completedLevels.push(levelCompleted);
  }
  
  // Calculate coin rewards based on level difficulty
  let coinReward = 0;
  if (isVictory) {
    // Victory rewards increase with level difficulty
    if (levelCompleted <= 3) coinReward = levelCompleted * 50; // Easy levels: 50-150
    else if (levelCompleted <= 5) coinReward = levelCompleted * 75; // Normal levels: 225-375
    else if (levelCompleted <= 7) coinReward = levelCompleted * 100; // Hard levels: 600-700
    else if (levelCompleted <= 9) coinReward = levelCompleted * 125; // Very hard: 1000-1125
    else coinReward = 2000; // Umbra victory: 2000
  } else {
    // Defeat consolation
    coinReward = 100;
  }
  
  // Update coins: keep remaining coins + reward
  newSave.campaignProgress.coins = coinsRemaining + coinReward;
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
  phase: 'title', // title, mode-select, campaign-map, upgrades, champion-select, time-attack-instructions, playing, black-hole, ending
  gameMode: null, // normal, time-attack, pvp
  champion: null,
  selectedLevel: null,
  score: 0,
  coins: 300,
  hasInsertedCoin: false,
  timer: 60,
  bonusTime: 0,
  streak: 0,
  bets: {},
  umbraBets: {},
  droppedBalls: [],
  isDropping: false,
  canSkipResults: false,
  resultsTimer: null,
  shadowMeter: 100,
  championHP: 100,
  elementalBalance: { fire: 25, water: 25, nature: 25, light: 25 },
  umbraActive: false,
  umbraAbility: null,
  umbraRageMode: false,
  umbraFinalBoss: false,
  poisonedSquares: [],
  frozen: false,
  round: 1,
  screenShake: false,
  maxRounds: 10,
  factionBuffActive: null,
  payoutMultiplier: 1,
  ending: null,
  isPaused: false,
  musicOn: true,
  soundOn: true,
  showTutorial: false,
  tutorialCompleted: false,
  showLeaderboard: false,
  playerName: '',
  feedbackMessage: null,
  feedbackType: 'default',
  lastBetTime: Date.now(),
  umbraLowHPShown: false,
  };

export default function ColorGameRoyale() {
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [saveData, setSaveData] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [flashColor, setFlashColor] = useState('#ffffff');
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const idleTimerRef = useRef(null);
  const soundEngineRef = useRef(null);

  // Load save data on mount
  useEffect(() => {
    const loaded = loadGame();
    if (loaded) {
      setSaveData(loaded);
    } else {
      setSaveData(getDefaultSaveData());
    }

    // Initialize sound engine
    soundEngineRef.current = getArcadeSoundEngine();
  }, []);

  const playSound = useCallback((type) => {
    if (soundEngineRef.current && gameState.soundOn) {
      soundEngineRef.current.playSound(type);
    }
  }, [gameState.soundOn]);

  const triggerFlash = useCallback((color = '#ffffff') => {
    setFlashColor(color);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState.phase === 'playing' && !gameState.frozen && !gameState.isDropping && !gameState.isPaused && !gameState.showTutorial) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newTimer = prev.timer - 1;
          if (newTimer <= 0) {
            const ending = determineEnding(prev);
            return { ...prev, phase: ending === 'chaos' ? 'black-hole' : 'ending', ending };
          }
          return { ...prev, timer: newTimer };
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState.phase, gameState.frozen, gameState.isDropping, gameState.isPaused, gameState.showTutorial]);

  const determineEnding = async (state) => {
    // Win conditions based on level
    let isVictory = false;
    if (state.gameMode === 'normal' && state.selectedLevel) {
      // Levels 1-5: Win when Umbra HP <= 10
      if (state.selectedLevel >= 1 && state.selectedLevel <= 5) {
        isVictory = state.shadowMeter <= 10;
      }
      // Levels 6-10: Win when Umbra HP = 0
      else if (state.selectedLevel >= 6 && state.selectedLevel <= 10) {
        isVictory = state.shadowMeter <= 0;
      }
    } else {
      // Other modes: Win if shadow meter is depleted OR score is high enough
      isVictory = state.shadowMeter <= 0 || state.score >= 500;
    }

    // Save time attack score to leaderboard
    if (state.gameMode === 'time-attack') {
      try {
        const user = await base44.auth.me();
        await base44.entities.TimeAttackScore.create({
          player_name: user.full_name || user.email,
          score: state.score,
          coins: state.coins,
          time_survived: 30 - state.timer,
        });
      } catch (error) {
        console.error('Failed to save time attack score:', error);
      }
    }

    if (isVictory) {
      // Levels 1-9: Generic victory ending
      if (state.gameMode === 'normal' && state.selectedLevel < 10) {
        return 'victory';
      }
      // Level 10: Elemental ending based on dominant element
      const dominant = Object.entries(state.elementalBalance)
        .sort((a, b) => b[1] - a[1])[0][0];
      return dominant;
    }

    // Defeat: 'fallen' for levels 1-9, 'chaos' for level 10
    if (state.gameMode === 'normal' && state.selectedLevel < 10) {
      return 'fallen';
    }

    return 'chaos';
  };

  const selectChampion = (champion) => {
    const championWithUpgrades = getChampionWithUpgrades(champion);
    const isLevel1 = gameState.selectedLevel === 1;
    const shouldShowTutorial = isLevel1;
    
    setGameState(prev => ({
      ...prev,
      champion: championWithUpgrades,
      phase: 'playing',
      coins: 300,
      showTutorial: shouldShowTutorial,
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
      phase: mode === 'pvp' ? 'pvp' : mode === 'normal' ? 'campaign-map' : 'time-attack-instructions',
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
      coins: saveData?.campaignProgress?.coins || 500, // Use saved coins
    }));
  };

  const handleSaveProgress = () => {
    if (saveData) {
      saveGame(saveData);
    }
  };

  const handleUpgrade = (stat, cost) => {
    if (!gameState.champion || !saveData) return;
    
    // Deduct coins for upgrade
    if (saveData.campaignProgress.coins < cost) return;
    
    const newSave = applyUpgrade(saveData, gameState.champion.id, stat, cost);
    newSave.campaignProgress.coins -= cost;
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

  const showFeedback = (message, type = 'default') => {
    setGameState(prev => ({ 
      ...prev, 
      feedbackMessage: message,
      feedbackType: type,
    }));
  };

  const clearFeedback = () => {
    setGameState(prev => ({ ...prev, feedbackMessage: null }));
  };

  // Idle timer for betting
  useEffect(() => {
    if (gameState.phase === 'playing' && !gameState.isDropping && Object.keys(gameState.bets).length === 0) {
      idleTimerRef.current = setTimeout(() => {
        showFeedback('si batman nalay bahala', 'idle');
      }, 5500);
    }
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [gameState.phase, gameState.isDropping, gameState.bets]);

  // Check Umbra low HP (campaign only) - random appearance
  useEffect(() => {
    if (
      gameState.gameMode === 'normal' && 
      gameState.shadowMeter <= 25 && 
      gameState.shadowMeter > 0 &&
      !gameState.isDropping &&
      Math.random() < 0.3 // 30% chance to show
    ) {
      showFeedback('Gamay na lang! Jiayou!', 'umbra-low');
    }
  }, [gameState.shadowMeter, gameState.gameMode, gameState.isDropping]);

  const placeBet = (colorId, amount) => {
    if (gameState.coins < amount || gameState.frozen || gameState.isDropping) return;
    playSound('bet');
    
    // Reset idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    setGameState(prev => ({
      ...prev,
      coins: prev.coins - amount,
      bets: {
        ...prev.bets,
        [colorId]: (prev.bets[colorId] || 0) + amount,
      },
      lastBetTime: Date.now(),
    }));
  };

  const dropBalls = async () => {
    if (Object.keys(gameState.bets).length === 0 || gameState.isDropping) return;
    
    // Umbra makes his bets (in Campaign mode)
    if (gameState.gameMode === 'normal') {
      const umbraBets = {};
      const numBets = Math.floor(Math.random() * 3) + 1; // 1-3 colors
      const availableColors = [...COLORS];
      
      for (let i = 0; i < numBets; i++) {
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        umbraBets[randomColor.id] = Math.floor(Math.random() * 30) + 10; // 10-40 bet
      }
      
      setGameState(prev => ({ ...prev, umbraBets }));
    }
    
    playSound('drop');
    setGameState(prev => ({ ...prev, isDropping: true, canSkipResults: false }));

    // Simulate 3 ball drops with landing on grid squares
    const results = [];
    for (let i = 0; i < 3; i++) {
      // Pick a random square on the grid (0-35)
      const landedSquare = Math.floor(Math.random() * 36);
      
      // Get the color of the tile the ball lands on
      const colorIndex = landedSquare % COLORS.length;
      const finalColor = COLORS[colorIndex];
      
      results.push(finalColor);
      
      // Show ball landing on grid square with matching color
      setGameState(prev => ({
        ...prev,
        droppedBalls: [...prev.droppedBalls, { 
          color: finalColor, 
          landedSquare,
          id: Date.now() + i 
        }],
      }));
      
      await new Promise(r => setTimeout(r, 800));
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
      const results = gameState.droppedBalls.map(b => b.color || b);
      setGameState(prev => ({ ...prev, canSkipResults: false, resultsTimer: null }));
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
      if (r && r.id) {
        colorCounts[r.id] = (colorCounts[r.id] || 0) + 1;
      }
    });

    // Streak bonuses
    const streakCoinBonus = gameState.streak >= 3 ? Math.floor(gameState.streak * 5) : 0;
    const streakDamageBonus = gameState.streak >= 5 ? gameState.streak * 2 : 0;

    // Check player bets
    let hadMatch = false;
    Object.entries(gameState.bets).forEach(([colorId, betAmount]) => {
      const matches = colorCounts[colorId] || 0;
      if (matches > 0) {
        hadMatch = true;
        const payoutRates = { 1: 1, 2: 2, 3: 3 };
        const payout = betAmount * payoutRates[matches] * multiplier;
        totalWin += payout;
        pointsEarned += matches === 3 ? 30 : 10 * matches;
        newStreak++;

        // Time bonus based on matches
        if (matches === 3) {
          bonusTimeEarned += 10; // Jackpot: +10 seconds
          shadowDamage = 25 + streakDamageBonus;
          showFeedback('paldo', 'jackpot');
          triggerScreenShake();
          triggerFlash('#fbbf24');
          playSound('jackpot');
        } else if (matches === 2) {
          bonusTimeEarned += 5; // Combo: +5 seconds
          shadowDamage = 15 + streakDamageBonus;
        } else {
          bonusTimeEarned += 2; // Match: +2 seconds
          shadowDamage = 5 + streakDamageBonus;
        }

        // Streak coin bonus
        totalWin += streakCoinBonus;

        // Faction buff activation on jackpot
        if (matches === 3) {
          const color = COLORS.find(c => c.id === colorId);
          factionBuff = color.faction;
          multiplier = 3;
          newBalance[color.faction] = Math.min(100, newBalance[color.faction] + 10);
          playSound('jackpot');
        } else if (matches > 0) {
          playSound('win');
        }
      } else {
        newStreak = 0;
      }
    });

    // Negative feedback if no matches
    if (!hadMatch && Object.keys(gameState.bets).length > 0) {
      const negativeMessages = ['kasayang!', 'bawi lang', 'ok ra na'];
      const randomNegative = negativeMessages[Math.floor(Math.random() * negativeMessages.length)];
      showFeedback(randomNegative, 'negative');
    }

    // Streak feedback
    if (newStreak === 2) {
      showFeedback('wow galing!', 'streak');
    } else if (newStreak >= 3 && newStreak <= 4) {
      showFeedback('lodicakes', 'streak');
    }

    // Check Umbra's bets (Campaign mode)
    if (gameState.gameMode === 'normal' && gameState.umbraBets) {
      Object.entries(gameState.umbraBets).forEach(([colorId, betAmount]) => {
        const matches = colorCounts[colorId] || 0;
        if (matches > 0) {
          // Umbra regains shadow meter if he wins
          shadowDamage -= matches * 8;
        }
      });
    }

    // Umbra SOPHISTICATED AI interference
    let umbraAbility = null;
    let poisoned = [];
    let frozen = false;
    let isRageMode = false;
    let isFinalBoss = false;

    if (gameState.gameMode === 'normal') {
      const shadowPercent = gameState.shadowMeter;
      const champion = gameState.champion;
      
      // RAGE MODE: Shadow Meter below 30%
      isRageMode = shadowPercent <= 30;
      
      // FINAL BOSS MODE: Time running low
      isFinalBoss = gameState.timer <= 20;
      
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
        triggerScreenShake();
        triggerFlash('#9333ea');
        
        // Execute ability with Rage Mode power boost
        const ragePower = isRageMode ? 1.5 : 1;
        
        if (umbraAbility === 'score-drain') {
          // Drain 5% of champion HP to restore Umbra's HP
          const hpDrain = 5;
          playSound('damage');
          setGameState(prev => ({
            ...prev,
            championHP: Math.max(0, prev.championHP - hpDrain),
            shadowMeter: Math.min(100, prev.shadowMeter + hpDrain),
          }));
        } else if (umbraAbility === 'freeze') {
          frozen = true;
          playSound('freeze');
          setTimeout(() => {
            setGameState(prev => ({ ...prev, frozen: false }));
          }, 3000);
        } else if (umbraAbility === 'poison') {
          playSound('poison');
          const poisonCount = Math.floor(Math.random() * 2) + 2; // 2-3 tiles
          for (let i = 0; i < poisonCount; i++) {
            poisoned.push(COLORS[Math.floor(Math.random() * COLORS.length)].id);
          }
          // Poison damages HP immediately
          const poisonDamage = poisonCount * 3; // 3% per poisoned tile
          setGameState(prev => ({
            ...prev,
            championHP: Math.max(0, prev.championHP - poisonDamage),
          }));
          // Clear poison after 8 seconds
          setTimeout(() => {
            setGameState(prev => ({ ...prev, poisonedSquares: [] }));
          }, 8000);
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

        // Check for poison damage - if ball lands on poisoned tile user bet on
        let poisonDamage = 0;
        results.forEach(r => {
          if (r && r.id && gameState.poisonedSquares.includes(r.id) && gameState.bets[r.id]) {
            poisonDamage += 8; // 8% HP per poisoned hit
          }
        });

    setGameState(prev => {
      const newShadow = Math.max(0, prev.shadowMeter - shadowDamage);
      const newScore = prev.score + pointsEarned;
      const newTimer = Math.max(0, prev.timer + bonusTimeEarned);
      const newHP = Math.max(0, prev.championHP - poisonDamage);
      const newCoins = prev.coins + totalWin;

      // Check for ending conditions based on level
      let isVictory = false;
      if (prev.gameMode === 'normal' && prev.selectedLevel) {
        // Levels 1-5: Win when Umbra HP <= 10
        if (prev.selectedLevel >= 1 && prev.selectedLevel <= 5) {
          isVictory = newShadow <= 10;
        }
        // Levels 6-10: Win when Umbra HP = 0
        else if (prev.selectedLevel >= 6 && prev.selectedLevel <= 10) {
          isVictory = newShadow <= 0;
        }
      } else {
        // Other modes: Win by depleting shadow
        isVictory = newShadow <= 0;
      }
      const isDefeat = newHP <= 0 || (prev.gameMode === 'normal' && newTimer <= 0) || newCoins <= 0;
      const isGameOver = isVictory || isDefeat;

      if (isGameOver) {
        // Determine ending synchronously
        let ending;
        if (isVictory) {
          // Get dominant element for victory
          const dominant = Object.entries(newBalance)
            .sort((a, b) => b[1] - a[1])[0][0];
          ending = dominant; // fire, water, nature, or light

          // Save progress asynchronously (don't block on this)
          determineEnding({ ...prev, shadowMeter: newShadow, score: newScore });
        } else {
          // Defeat endings
          ending = prev.gameMode === 'normal' && prev.selectedLevel < 10 ? 'fallen' : 'chaos';
        }

        // Show victory message before ending (only if actually won)
        if (isVictory) {
          showFeedback('Paldo!', 'victory');
          playSound('victory');
          triggerFlash('#10b981');
          setTimeout(() => {
            setGameState(p => ({
              ...p,
              phase: 'ending',
              ending,
            }));
          }, 2000);
          return {
            ...prev,
            score: newScore,
            timer: newTimer,
            championHP: newHP,
            coins: newCoins,
            ending,
          };
        }

        // Defeat - show black hole transition for all defeats
        playSound('defeat');
        triggerFlash('#ef4444');
        return {
          ...prev,
          score: newScore,
          timer: newTimer,
          championHP: newHP,
          coins: newCoins,
          phase: 'black-hole',
          ending,
        };
      }

      return {
        ...prev,
        score: newScore,
        coins: newCoins,
        timer: newTimer,
        championHP: newHP,
        streak: newStreak,
        bets: {},
        umbraBets: {},
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

  const handleEndingRestart = () => {
    // If in campaign mode, return to campaign map
    if (gameState.gameMode === 'normal') {
      setGameState({
        ...INITIAL_STATE,
        phase: 'campaign-map',
        gameMode: 'normal',
        hasInsertedCoin: true,
      });
    } else {
      resetGame();
    }
  };

  const handleNextLevel = () => {
    const nextLevel = gameState.selectedLevel + 1;
    setGameState({
      ...INITIAL_STATE,
      phase: 'champion-select',
      gameMode: 'normal',
      selectedLevel: nextLevel,
      hasInsertedCoin: true,
      coins: 300,
      timer: 60,
      maxRounds: 10,
    });
  };

  const handleBackToMap = () => {
    setGameState({
      ...INITIAL_STATE,
      phase: 'campaign-map',
      gameMode: 'normal',
      hasInsertedCoin: true,
    });
  };

  const startGame = () => {
    if (!gameState.hasInsertedCoin) return;
    setGameState(prev => ({ ...prev, phase: 'mode-select' }));
  };

  const togglePause = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleRetry = () => {
    const mode = gameState.gameMode;
    setGameState({
      ...INITIAL_STATE,
      phase: mode === 'time-attack' ? 'time-attack-instructions' : 'champion-select',
      gameMode: mode,
      hasInsertedCoin: true,
      timer: mode === 'time-attack' ? 30 : 60,
      maxRounds: mode === 'time-attack' ? 999 : 10,
      tutorialCompleted: gameState.tutorialCompleted,
    });
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    setGameState(prev => ({ ...prev, showTutorial: false, tutorialCompleted: true }));
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    setGameState(prev => ({ ...prev, showTutorial: false, tutorialCompleted: true }));
  };

  const handleEndGame = () => {
    resetGame();
  };

  const triggerScreenShake = () => {
    setGameState(prev => ({ ...prev, screenShake: true }));
    setTimeout(() => {
      setGameState(prev => ({ ...prev, screenShake: false }));
    }, 500);
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
            coins={saveData.campaignProgress.coins || 500}
            onUpgrade={handleUpgrade}
            onBack={() => setGameState(prev => ({ ...prev, phase: 'campaign-map' }))}
            onSave={handleSaveProgress}
          />
        )}

        {gameState.phase === 'time-attack-instructions' && (
          <TimeAttackInstructions
            onStart={() => setGameState(prev => ({ ...prev, phase: 'champion-select' }))}
            onBack={() => setGameState(prev => ({ ...prev, phase: 'mode-select' }))}
          />
        )}

        {gameState.phase === 'champion-select' && (
          <ChampionSelect 
            onSelect={selectChampion} 
            onBack={() => setGameState(prev => ({ 
              ...prev, 
              phase: prev.gameMode === 'normal' ? 'campaign-map' : prev.gameMode === 'time-attack' ? 'time-attack-instructions' : 'mode-select' 
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
            className="relative z-10 min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950"
          >
            {/* Arcade Audio */}
            <ArcadeAudioManager musicOn={gameState.musicOn} soundOn={gameState.soundOn} />

            {/* Arcade Visual Effects */}
            <ScanlineOverlay />
            <CRTEffect />
            {showFlash && <ScreenFlash color={flashColor} />}
            {/* Animated background particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => {
                const size = Math.random() * 4 + 1;
                const colors = ['#9333ea', '#ec4899', '#8b5cf6', '#a855f7', '#c084fc'];
                const color = colors[Math.floor(Math.random() * colors.length)];

                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{ 
                      width: size,
                      height: size,
                      background: color,
                      boxShadow: `0 0 ${size * 2}px ${color}`,
                    }}
                    initial={{
                      x: Math.random() * window.innerWidth,
                      y: Math.random() * window.innerHeight,
                      opacity: 0,
                    }}
                    animate={{
                      x: [null, Math.random() * window.innerWidth],
                      y: [null, Math.random() * -500],
                      opacity: [0, 0.6, 0],
                      scale: [1, 1.5, 0.5],
                    }}
                    transition={{
                      duration: 5 + Math.random() * 10,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </div>
            {/* Top right buttons */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
              {gameState.gameMode === 'time-attack' && (
                <button
                  onClick={() => setGameState(prev => ({ ...prev, showLeaderboard: true }))}
                  className="px-4 py-2 bg-slate-800/80 rounded-xl text-white font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  🏆 LEADERBOARD
                </button>
              )}
              <button
                onClick={togglePause}
                className="px-4 py-2 bg-slate-800/80 rounded-xl text-white font-bold hover:bg-slate-700 transition-colors"
              >
                ⏸️ PAUSE
              </button>
            </div>

            <GameHUD 
              gameState={gameState}
              colors={COLORS}
            />

            <motion.div
              animate={gameState.screenShake ? {
                x: [0, -10, 10, -10, 10, 0],
                y: [0, -5, 5, -5, 5, 0],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <GameBoard 
                gameState={gameState}
                colors={COLORS}
                onPlaceBet={placeBet}
                onDrop={dropBalls}
                onSkipResults={skipResults}
              />
            </motion.div>

            <UmbraOverlay 
              active={gameState.umbraActive}
              ability={gameState.umbraAbility}
              shadowMeter={gameState.shadowMeter}
              rageMode={gameState.umbraRageMode}
              finalBoss={gameState.umbraFinalBoss}
              enemyName={
                gameState.selectedLevel === 1 ? 'Goblin' :
                gameState.selectedLevel === 2 ? 'Fairies' :
                gameState.selectedLevel === 3 ? 'Knights' :
                gameState.selectedLevel === 4 ? 'Ogres' :
                gameState.selectedLevel === 5 ? 'Rukh' :
                gameState.selectedLevel === 6 ? 'Magi' :
                gameState.selectedLevel === 7 ? 'Fire Lizard' :
                gameState.selectedLevel === 8 ? 'Ice Guardian' :
                gameState.selectedLevel === 9 ? 'Ice Queen' : null
              }
            />

            <UmbraAIIndicator gameState={gameState} />

            {gameState.gameMode === 'normal' && (
              <UmbraDragon gameState={gameState} />
            )}

            <ChampionDisplay champion={gameState.champion} />

            <PauseMenu
              isOpen={gameState.isPaused}
              onResume={togglePause}
              onRetry={handleRetry}
              onEnd={handleEndGame}
              musicOn={gameState.musicOn}
              soundOn={gameState.soundOn}
              onToggleMusic={() => setGameState(prev => ({ ...prev, musicOn: !prev.musicOn }))}
              onToggleSound={() => setGameState(prev => ({ ...prev, soundOn: !prev.soundOn }))}
            />

            {/* In-game tutorial overlay */}
            {gameState.showTutorial && (
              <InGameTutorial
                onComplete={handleTutorialComplete}
                onSkip={handleTutorialSkip}
                enemyName={
                  gameState.selectedLevel === 1 ? 'Goblin' :
                  gameState.selectedLevel === 2 ? 'Little Fairies' :
                  gameState.selectedLevel === 3 ? 'Dark Knights' :
                  gameState.selectedLevel === 4 ? 'Ogres' :
                  gameState.selectedLevel === 5 ? 'Rukh' :
                  gameState.selectedLevel === 6 ? 'Mystical Magi' :
                  gameState.selectedLevel === 7 ? 'Giant Fire Lizard' :
                  gameState.selectedLevel === 8 ? 'Huge Ice Guardian' :
                  gameState.selectedLevel === 9 ? 'Ice Queen' :
                  'Umbra'
                }
              />
            )}

            {/* Time Attack Leaderboard */}
            <TimeAttackLeaderboard
              isOpen={gameState.showLeaderboard}
              onClose={() => setGameState(prev => ({ ...prev, showLeaderboard: false }))}
              currentScore={gameState.score}
            />

            {/* Game Feedback Messages */}
            <GameFeedback
              message={gameState.feedbackMessage}
              type={gameState.feedbackType}
              onComplete={clearFeedback}
            />
          </motion.div>
        )}

        {gameState.phase === 'black-hole' && (
          <BlackHoleTransition 
            onComplete={() => setGameState(prev => ({ ...prev, phase: 'ending' }))}
          />
        )}

        {gameState.phase === 'ending' && (
          <>
            <EndingCinematic 
              ending={gameState.ending}
              score={gameState.score}
              champion={gameState.champion}
              onRestart={handleEndingRestart}
              gameMode={gameState.gameMode}
              currentLevel={gameState.selectedLevel}
              onNextLevel={handleNextLevel}
              onBackToMap={handleBackToMap}
              coinsRemaining={gameState.coins}
              saveData={saveData}
              setSaveData={setSaveData}
            />
            {gameState.gameMode === 'time-attack' && (
              <TimeAttackLeaderboard
                isOpen={true}
                onClose={handleEndingRestart}
                currentScore={gameState.score}
              />
            )}
          </>
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