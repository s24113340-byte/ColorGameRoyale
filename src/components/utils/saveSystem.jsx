// Save/Load system for Color Game Royale campaign progress

const SAVE_KEY = 'colorGameRoyale_save';

export const saveGame = (saveData) => {
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

export const loadGame = () => {
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

export const deleteSave = () => {
  try {
    localStorage.removeItem(SAVE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
};

export const hasSaveData = () => {
  return localStorage.getItem(SAVE_KEY) !== null;
};

export const getDefaultSaveData = () => {
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

export const updateCampaignProgress = (currentSave, levelCompleted, scoreEarned, championId) => {
  const newSave = { ...currentSave };
  
  // Update highest level
  if (levelCompleted >= newSave.campaignProgress.highestLevelUnlocked) {
    newSave.campaignProgress.highestLevelUnlocked = levelCompleted + 1;
  }
  
  // Add to completed levels if not already there
  if (!newSave.campaignProgress.completedLevels.includes(levelCompleted)) {
    newSave.campaignProgress.completedLevels.push(levelCompleted);
  }
  
  // Award upgrade points (10 points per level)
  newSave.campaignProgress.upgradePoints += levelCompleted * 10;
  
  // Update total score
  newSave.campaignProgress.totalScore += scoreEarned;
  
  return newSave;
};

export const applyUpgrade = (currentSave, championId, stat, cost) => {
  const newSave = { ...currentSave };
  
  // Deduct points
  newSave.campaignProgress.upgradePoints -= cost;
  
  // Apply upgrade
  if (!newSave.championUpgrades[championId]) {
    newSave.championUpgrades[championId] = { power: 0, defense: 0, speed: 0, magic: 0 };
  }
  
  newSave.championUpgrades[championId][stat] = (newSave.championUpgrades[championId][stat] || 0) + 1;
  
  return newSave;
};