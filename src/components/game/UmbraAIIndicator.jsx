import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, TrendingUp } from 'lucide-react';

export default function UmbraAIIndicator({ gameState }) {
  if (!gameState.champion || gameState.gameMode !== 'normal') return null;

  const { champion, score, streak, shadowMeter, elementalBalance, selectedLevel } = gameState;
  
  // Get enemy name based on level
  const enemyName = selectedLevel === 1 ? 'Goblin' :
                    selectedLevel === 2 ? 'Fairies' :
                    selectedLevel === 3 ? 'Knights' :
                    selectedLevel === 4 ? 'Ogres' :
                    selectedLevel === 5 ? 'Rukh' :
                    selectedLevel === 6 ? 'Magi' :
                    selectedLevel === 7 ? 'Fire Lizard' :
                    selectedLevel === 8 ? 'Ice Guardian' :
                    selectedLevel === 9 ? 'Ice Queen' : 'Umbra';
  
  // Determine Umbra's likely next move based on AI logic
  const getUmbraStrategy = () => {
    const shadowPercent = shadowMeter;
    const isRage = shadowPercent <= 30;
    const isFinal = gameState.timer <= 20;
    
    if (isFinal) {
      return {
        title: `${enemyName.toUpperCase()} FINAL PHASE`,
        threat: 'MAXIMUM',
        color: '#DC2626',
        icon: Zap,
        predictions: ['Shadow Surge', 'Elemental Drain', 'Corruption'],
      };
    }
    
    if (isRage) {
      return {
        title: `${enemyName.toUpperCase()} RAGE MODE`,
        threat: 'CRITICAL',
        color: '#EF4444',
        icon: TrendingUp,
        predictions: ['Frequent attacks', 'Stronger abilities', 'Multiple poisons'],
      };
    }
    
    const predictions = [];
    
    // AI adaptation predictions
    if (champion.stats.speed > 70 || streak >= 3) {
      predictions.push('Freeze likely (fast player)');
    }
    
    if (score > 200) {
      predictions.push('Score Drain (high score)');
    }
    
    const dominant = Object.entries(elementalBalance).sort((a, b) => b[1] - a[1])[0];
    if (dominant[1] > 35) {
      predictions.push(`Poison (${dominant[0]} dominant)`);
    }
    
    if (predictions.length === 0) {
      predictions.push('Standard abilities');
    }
    
    return {
      title: `${enemyName.toUpperCase()} AI ADAPTING`,
      threat: shadowPercent > 60 ? 'MODERATE' : 'HIGH',
      color: shadowPercent > 60 ? '#A855F7' : '#F97316',
      icon: Brain,
      predictions,
    };
  };

  const strategy = getUmbraStrategy();
  const Icon = strategy.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-30 max-w-xs"
    >
      <div 
        className="p-3 rounded-xl backdrop-blur-xl border"
        style={{
          background: `${strategy.color}15`,
          borderColor: `${strategy.color}40`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4" style={{ color: strategy.color }} />
          <p className="text-xs font-bold text-white">{strategy.title}</p>
          <span 
            className="ml-auto text-xs font-black px-2 py-0.5 rounded"
            style={{ 
              background: strategy.color,
              color: 'white',
            }}
          >
            {strategy.threat}
          </span>
        </div>
        
        <div className="space-y-1">
          {strategy.predictions.map((pred, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-1.5"
            >
              <Target className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <p className="text-xs text-slate-300">{pred}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}