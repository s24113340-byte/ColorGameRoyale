import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Shield, Snowflake, Skull, Trophy, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PauseMenu from './PauseMenu';
import PVPTutorial from './PVPTutorial';

const INTERFERENCE_ATTACKS = {
  freeze: { name: 'Freeze Turn', icon: Snowflake, cost: 30, color: '#3B82F6' },
  drain: { name: 'Score Drain', icon: Skull, cost: 50, color: '#A855F7' },
};

export default function PVPMode({ onBack, colors }) {
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, betting-p1, betting-p2, dropping, ended
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [players, setPlayers] = useState({
    1: { score: 0, coins: 100, integrity: 100, bets: {}, frozen: false, streak: 0 },
    2: { score: 0, coins: 100, integrity: 100, bets: {}, frozen: false, streak: 0 },
  });
  const [lockedColors, setLockedColors] = useState([]);
  const [droppedBalls, setDroppedBalls] = useState([]);
  const [ballsWithSquares, setBallsWithSquares] = useState([]);
  const [isDropping, setIsDropping] = useState(false);
  const [turn, setTurn] = useState(1);
  const [maxTurns] = useState(10);
  const [betAmount] = useState(10);
  const [winner, setWinner] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const audioRef = useRef(null);

  const playSound = useCallback((type) => {
    if (!audioRef.current) {
      audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'win' ? 880 : type === 'attack' ? 220 : 440;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const startGame = () => {
    const hasSeenTutorial = localStorage.getItem('pvpTutorialCompleted');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    setGamePhase('betting-p1');
    setCurrentPlayer(1);
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('pvpTutorialCompleted', 'true');
    setShowTutorial(false);
    setTutorialCompleted(true);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('pvpTutorialCompleted', 'true');
    setShowTutorial(false);
    setTutorialCompleted(true);
  };

  const placeBet = (colorId) => {
    if (players[currentPlayer].frozen || isDropping) return;
    if (players[currentPlayer].coins < betAmount) return;
    
    // Check if color is locked by opponent
    if (lockedColors.includes(colorId)) return;
    
    const currentBets = players[currentPlayer].bets;
    const betCount = Object.keys(currentBets).length;
    
    // Limit to 2 colors max
    if (betCount >= 2 && !currentBets[colorId]) return;

    playSound('bet');
    setPlayers(prev => ({
      ...prev,
      [currentPlayer]: {
        ...prev[currentPlayer],
        coins: prev[currentPlayer].coins - betAmount,
        bets: {
          ...prev[currentPlayer].bets,
          [colorId]: (prev[currentPlayer].bets[colorId] || 0) + betAmount,
        },
      },
    }));
  };
  
  const confirmBets = () => {
    const currentBets = Object.keys(players[currentPlayer].bets);
    if (currentBets.length === 0) return;
    
    // Lock the colors chosen by current player
    setLockedColors(currentBets);
    
    if (gamePhase === 'betting-p1') {
      setGamePhase('betting-p2');
      setCurrentPlayer(2);
    } else if (gamePhase === 'betting-p2') {
      setGamePhase('dropping');
    }
  };

  const dropBalls = async () => {
    if (gamePhase !== 'dropping' || isDropping) return;
    
    playSound('drop');
    setIsDropping(true);
    setDroppedBalls([]);
    setBallsWithSquares([]);

    const results = [];
    const ballsData = [];
    
    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 800));
      
      // Pick a random square on the grid (0-35)
      const landedSquare = Math.floor(Math.random() * 36);
      
      // Get the color of the tile the ball lands on
      const colorIndex = landedSquare % colors.length;
      const finalColor = colors[colorIndex];
      
      results.push(finalColor);
      ballsData.push({ color: finalColor, landedSquare, id: Date.now() + i });
      
      setBallsWithSquares(prev => [...prev, { color: finalColor, landedSquare, id: Date.now() + i }]);
      setDroppedBalls(prev => [...prev, finalColor]);
    }

    setTimeout(() => calculateResults(results), 1000);
  };

  const calculateResults = (results) => {
    const colorCounts = {};
    results.forEach(r => {
      colorCounts[r.id] = (colorCounts[r.id] || 0) + 1;
    });

    // Calculate results for both players
    const p1Results = { totalWin: 0, pointsEarned: 0 };
    const p2Results = { totalWin: 0, pointsEarned: 0 };

    Object.entries(players[1].bets).forEach(([colorId, betAmount]) => {
      const matches = colorCounts[colorId] || 0;
      if (matches > 0) {
        const payoutRates = { 1: 1, 2: 2, 3: 3 };
        p1Results.totalWin += betAmount * payoutRates[matches];
        p1Results.pointsEarned += matches === 3 ? 30 : 10 * matches;
        playSound('win');
      }
    });

    Object.entries(players[2].bets).forEach(([colorId, betAmount]) => {
      const matches = colorCounts[colorId] || 0;
      if (matches > 0) {
        const payoutRates = { 1: 1, 2: 2, 3: 3 };
        p2Results.totalWin += betAmount * payoutRates[matches];
        p2Results.pointsEarned += matches === 3 ? 30 : 10 * matches;
        playSound('win');
      }
    });

    setPlayers(prev => {
      const newP1 = {
        ...prev[1],
        score: prev[1].score + p1Results.pointsEarned,
        coins: prev[1].coins + p1Results.totalWin,
        bets: {},
        frozen: false,
      };
      
      const newP2 = {
        ...prev[2],
        score: prev[2].score + p2Results.pointsEarned,
        coins: prev[2].coins + p2Results.totalWin,
        bets: {},
        frozen: false,
      };

      // Check for coin-based win condition or max turns
      if (newP1.coins <= 0 || newP2.coins <= 0 || turn >= maxTurns) {
        setTimeout(() => {
          if (newP1.coins <= 0 && newP2.coins <= 0) {
            setWinner(newP1.score > newP2.score ? 1 : newP2.score > newP1.score ? 2 : 0);
          } else if (newP1.coins <= 0) {
            setWinner(2);
          } else if (newP2.coins <= 0) {
            setWinner(1);
          } else {
            // Max turns reached
            setWinner(newP1.score > newP2.score ? 1 : newP2.score > newP1.score ? 2 : 0);
          }
          setGamePhase('ended');
        }, 1500);
      }

      return {
        1: newP1,
        2: newP2,
      };
    });

    // Next turn - winner of round goes first
    setTimeout(() => {
      setDroppedBalls([]);
      setBallsWithSquares([]);
      setIsDropping(false);
      setLockedColors([]);
      
      // Check if game should end
      const p1 = players[1];
      const p2 = players[2];
      
      if (p1.coins <= 0 || p2.coins <= 0 || turn >= maxTurns) {
        return;
      }
      
      setTurn(t => t + 1);
      
      // Winner of round (higher points this round) goes first
      const nextFirst = p1Results.pointsEarned > p2Results.pointsEarned ? 1 : 2;
      setCurrentPlayer(nextFirst);
      setGamePhase('betting-p1');
    }, 1500);
  };

  const useInterference = (attackType) => {
    const attack = INTERFERENCE_ATTACKS[attackType];
    const opponent = currentPlayer === 1 ? 2 : 1;
    
    if (players[currentPlayer].coins < attack.cost) return;
    
    playSound('attack');
    
    setPlayers(prev => {
      const newState = { ...prev };
      newState[currentPlayer] = {
        ...newState[currentPlayer],
        coins: newState[currentPlayer].coins - attack.cost,
      };
      
      if (attackType === 'freeze') {
        newState[opponent] = { ...newState[opponent], frozen: true };
      } else if (attackType === 'drain') {
        const drainAmount = Math.min(50, newState[opponent].score);
        newState[opponent] = { 
          ...newState[opponent], 
          score: newState[opponent].score - drainAmount,
          integrity: Math.max(0, newState[opponent].integrity - 10),
        };
        newState[currentPlayer] = {
          ...newState[currentPlayer],
          score: newState[currentPlayer].score + drainAmount,
        };
      }
      
      return newState;
    });
  };

  const endGame = () => {
    const p1 = players[1];
    const p2 = players[2];
    
    if (p1.score > p2.score) {
      setWinner(1);
    } else if (p2.score > p1.score) {
      setWinner(2);
    } else {
      setWinner(0); // Tie
    }
    setGamePhase('ended');
  };

  const resetGame = () => {
    setPlayers({
      1: { score: 0, coins: 100, integrity: 100, bets: {}, frozen: false, streak: 0 },
      2: { score: 0, coins: 100, integrity: 100, bets: {}, frozen: false, streak: 0 },
    });
    setDroppedBalls([]);
    setBallsWithSquares([]);
    setIsDropping(false);
    setTurn(1);
    setCurrentPlayer(1);
    setWinner(null);
    setLockedColors([]);
    setGamePhase('waiting');
  };

  if (gamePhase === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-4"
      >
        <button
          onClick={onBack}
          className="fixed top-4 left-4 p-3 bg-slate-800/80 rounded-xl text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">PVP BATTLE</h1>
        <p className="text-slate-400 mb-8 text-center max-w-md">
          Two players compete for the highest score! Use Interference Attacks to sabotage your opponent!
        </p>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="text-center p-6 rounded-xl bg-blue-500/20 border border-blue-500/50">
            <div className="text-6xl mb-2">🔵</div>
            <p className="text-blue-400 font-bold">PLAYER 1</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-red-500/20 border border-red-500/50">
            <div className="text-6xl mb-2">🔴</div>
            <p className="text-red-400 font-bold">PLAYER 2</p>
          </div>
        </div>

        <Button
          onClick={startGame}
          className="px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold"
        >
          <Play className="w-6 h-6 mr-2" /> START BATTLE
        </Button>
      </motion.div>
    );
  }

  if (gamePhase === 'ended') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-4"
      >
        <Trophy className="w-20 h-20 text-yellow-400 mb-4" />
        <h1 className="text-4xl font-black text-white mb-2">
          {winner === 0 ? "IT'S A TIE!" : `PLAYER ${winner} WINS!`}
        </h1>
        
        <div className="grid grid-cols-2 gap-8 my-8">
          <div className={`text-center p-6 rounded-xl ${winner === 1 ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-slate-800/50'}`}>
            <p className="text-blue-400 font-bold mb-2">PLAYER 1</p>
            <p className="text-3xl font-black text-white">{players[1].score}</p>
          </div>
          <div className={`text-center p-6 rounded-xl ${winner === 2 ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-slate-800/50'}`}>
            <p className="text-red-400 font-bold mb-2">PLAYER 2</p>
            <p className="text-3xl font-black text-white">{players[2].score}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={resetGame} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" /> Play Again
          </Button>
          <Button onClick={onBack}>Back to Menu</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 bg-slate-800/80 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <button
          onClick={() => setIsPaused(true)}
          className="px-4 py-2 bg-slate-800/80 rounded-xl text-white font-bold hover:bg-slate-700 transition-colors"
        >
          ⏸️ PAUSE
        </button>
        <div className="text-center">
          <p className="text-slate-400 text-sm">Turn {turn} / {maxTurns}</p>
          <p className={`font-bold text-lg ${currentPlayer === 1 ? 'text-blue-400' : 'text-red-400'}`}>
            {gamePhase === 'betting-p1' ? 'PLAYER 1 CHOOSING' : gamePhase === 'betting-p2' ? 'PLAYER 2 CHOOSING' : 'DROPPING BALLS'}
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Player scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[1, 2].map(player => (
          <div 
            key={player}
            className={`p-4 rounded-xl ${
              currentPlayer === player 
                ? player === 1 ? 'bg-blue-500/20 border-2 border-blue-500' : 'bg-red-500/20 border-2 border-red-500'
                : 'bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold ${player === 1 ? 'text-blue-400' : 'text-red-400'}`}>
                P{player}
              </span>
              {players[player].frozen && <Snowflake className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-2xl font-black text-white">{players[player].score}</p>
            <p className="text-yellow-400 text-sm">{players[player].coins} coins</p>
            
            {/* Integrity meter */}
            <div className="mt-2">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                  style={{ width: `${players[player].integrity}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Board with Perimeter Betting */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="relative mx-auto">
          {/* Board container with betting panels on all sides */}
          <div 
            className="relative p-6 rounded-3xl shadow-2xl"
            style={{
              backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ea648f1673c86a0d24/3757eed38_unnamed__5_-removebg-preview.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            {/* Top betting panels */}
            <div className="grid grid-cols-4 gap-3 mb-4 px-3">
              {colors.filter(c => c && c.id).map((color) => {
                const p1Bet = players[1].bets[color.id] || 0;
                const p2Bet = players[2].bets[color.id] || 0;
                const isLocked = lockedColors.includes(color.id);
                return (
                  <div
                    key={`top-${color.id}`}
                    className={`p-4 rounded-xl font-bold text-sm relative backdrop-blur-sm ${isLocked ? 'opacity-50' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})`,
                      boxShadow: (p1Bet > 0 || p2Bet > 0) ? '0 0 15px rgba(255, 215, 0, 0.8)' : `0 4px 10px ${color.hex}40`,
                    }}
                  >
                    <div className="text-white text-shadow-lg flex items-center justify-center gap-2 font-black tracking-wider">
                      {color.emoji} {color.name.toUpperCase()}
                    </div>
                    {p1Bet > 0 && (
                      <div className="text-blue-200 text-xs mt-1 font-bold flex items-center justify-center gap-1">
                        P1: 💰{p1Bet}
                      </div>
                    )}
                    {p2Bet > 0 && (
                      <div className="text-red-200 text-xs mt-1 font-bold flex items-center justify-center gap-1">
                        P2: 💰{p2Bet}
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute top-1 right-1 text-xs">🔒</div>
                    )}
                  </div>
                );
                })}
            </div>

            {/* Main grid with side betting panels */}
            <div className="flex gap-4 px-3">
              {/* Left betting panels */}
              <div className="flex flex-col gap-3">
                {colors.filter(c => c && c.id).map((color) => {
                  const p1Bet = players[1].bets[color.id] || 0;
                  const p2Bet = players[2].bets[color.id] || 0;
                  const isLocked = lockedColors.includes(color.id);
                  const isBettingPhase = gamePhase === 'betting-p1' || gamePhase === 'betting-p2';
                  const isMyTurn = (gamePhase === 'betting-p1' && currentPlayer === 1) || (gamePhase === 'betting-p2' && currentPlayer === 2);
                  const canBet = isBettingPhase && isMyTurn && !isDropping && !isLocked;
                  return (
                    <button 
                      key={`left-${color.id}`}
                      onClick={() => canBet && placeBet(color.id)}
                      disabled={!canBet}
                      className={`w-20 h-28 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center backdrop-blur-sm ${!canBet ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                      style={{
                        background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})`,
                        boxShadow: (p1Bet > 0 || p2Bet > 0) ? '0 0 20px rgba(255, 215, 0, 0.8)' : `0 4px 10px ${color.hex}40`,
                      }}
                    >
                      <div className="text-white text-shadow-lg text-3xl mb-1">
                        {color.emoji}
                      </div>
                      {p1Bet > 0 && (
                        <div className="text-blue-200 text-xs font-bold">P1:{p1Bet}</div>
                      )}
                      {p2Bet > 0 && (
                        <div className="text-red-200 text-xs font-bold">P2:{p2Bet}</div>
                      )}
                      {isLocked && (
                        <div className="text-xs">🔒</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Center 6x6 Grid */}
              <div className="relative bg-gradient-to-br from-cyan-100/20 to-white/30 backdrop-blur-md p-4 rounded-2xl flex-1 border-2 border-white/50">
                <div className="grid grid-cols-6 gap-2 relative">
                  {[...Array(36)].map((_, i) => {
                    const colorIndex = i % colors.length;
                    const gridColor = colors[colorIndex];
                    if (!gridColor || !gridColor.hex) return null;

                    // Check if any ball landed on this square
                    const ballOnSquare = ballsWithSquares.find(ball => ball.landedSquare === i);

                    return (
                      <div 
                        key={i}
                        className="aspect-square rounded-lg shadow-lg relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${gridColor.hex}, ${gridColor.hex}dd)`,
                          border: `3px solid white`,
                          boxShadow: `0 2px 8px ${gridColor.hex}40, inset 0 0 20px ${gridColor.hex}20`,
                        }}
                      >
                        {/* Ball landing animation */}
                        <AnimatePresence>
                          {ballOnSquare && (
                            <motion.div
                              initial={{ scale: 0, rotate: 0 }}
                              animate={{ scale: 1, rotate: 360 }}
                              exit={{ scale: 0 }}
                              transition={{ type: "spring", duration: 0.5 }}
                              className="absolute inset-0 flex items-center justify-center z-10"
                            >
                              {/* White glowy ring */}
                              <div 
                                className="absolute w-16 h-16 rounded-full animate-pulse"
                                style={{
                                  background: 'radial-gradient(circle, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.6), transparent)',
                                  boxShadow: '0 0 40px rgba(255, 255, 255, 1), 0 0 60px rgba(255, 255, 255, 0.8), 0 0 80px rgba(255, 255, 255, 0.5)',
                                }}
                              />
                              {/* Colored ball */}
                              <div 
                                className="w-10 h-10 rounded-full shadow-2xl relative z-10"
                                style={{
                                  background: `radial-gradient(circle at 30% 30%, ${gridColor.hex}dd, ${gridColor.hex}66)`,
                                  boxShadow: `0 0 20px ${gridColor.hex}, inset 0 0 10px rgba(255, 255, 255, 0.4)`,
                                  filter: 'brightness(0.7)',
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Futuristic Wireframe Hopper in Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="relative w-48 h-48">
                    {/* Top glowing ring */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8">
                      <div 
                        className="absolute inset-0 rounded-[50%] border-2 backdrop-blur-sm"
                        style={{
                          borderColor: 'rgba(255, 255, 255, 0.8)',
                          background: 'linear-gradient(135deg, rgba(255, 59, 59, 0.15), rgba(59, 130, 246, 0.15), rgba(251, 191, 36, 0.15))',
                          boxShadow: `
                            0 0 20px rgba(255, 255, 255, 0.8),
                            0 0 40px rgba(255, 59, 59, 0.3),
                            0 0 40px rgba(59, 130, 246, 0.3),
                            0 0 40px rgba(251, 191, 36, 0.3),
                            inset 0 0 20px rgba(255, 255, 255, 0.2)
                          `,
                        }}
                      />
                    </div>

                    {/* Bottom glowing ring */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-6">
                      <div 
                        className="absolute inset-0 rounded-[50%] border-2 backdrop-blur-sm"
                        style={{
                          borderColor: 'rgba(255, 255, 255, 0.8)',
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15), rgba(251, 191, 36, 0.15))',
                          boxShadow: `
                            0 0 20px rgba(255, 255, 255, 0.8),
                            0 0 40px rgba(59, 130, 246, 0.3),
                            0 0 40px rgba(16, 185, 129, 0.3),
                            0 0 40px rgba(251, 191, 36, 0.3),
                            inset 0 0 20px rgba(255, 255, 255, 0.2)
                          `,
                        }}
                      />
                    </div>

                    {/* Vertical spindles */}
                    {[...Array(8)].map((_, i) => {
                      const angle = (i * 360) / 8;
                      const topRadius = 62;
                      const topX = Math.cos((angle * Math.PI) / 180) * topRadius;
                      const topY = Math.sin((angle * Math.PI) / 180) * 16;

                      return (
                        <div
                          key={i}
                          className="absolute left-1/2 top-8 origin-top"
                          style={{
                            width: '1px',
                            height: '128px',
                            background: `linear-gradient(180deg, 
                              rgba(255, 255, 255, 0.6), 
                              rgba(255, 59, 59, 0.3),
                              rgba(59, 130, 246, 0.3),
                              rgba(251, 191, 36, 0.3),
                              rgba(255, 255, 255, 0.6)
                            )`,
                            transform: `translateX(${topX}px) translateY(${topY}px)`,
                            boxShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
                          }}
                        />
                      );
                    })}

                    {/* Spinning balls before drop */}
                    <AnimatePresence>
                      {!isDropping && Object.keys(players[currentPlayer].bets).length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="absolute"
                              animate={{
                                rotate: 360,
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                                delay: i * 0.33,
                              }}
                              style={{
                                transformOrigin: '0 0',
                              }}
                            >
                              <motion.div
                                className="w-8 h-8 rounded-full"
                                animate={{
                                  x: Math.cos((i * 120 * Math.PI) / 180) * 30,
                                  y: Math.sin((i * 120 * Math.PI) / 180) * 30,
                                }}
                                style={{
                                  background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0)',
                                  boxShadow: `
                                    0 0 20px rgba(255, 255, 255, 0.8),
                                    0 0 40px rgba(255, 255, 255, 0.5),
                                    inset 0 0 10px rgba(255, 255, 255, 0.5)
                                  `,
                                }}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Right betting panels */}
              <div className="flex flex-col gap-3">
                {colors.filter(c => c && c.id).map((color) => {
                  const p1Bet = players[1].bets[color.id] || 0;
                  const p2Bet = players[2].bets[color.id] || 0;
                  const isLocked = lockedColors.includes(color.id);
                  const isBettingPhase = gamePhase === 'betting-p1' || gamePhase === 'betting-p2';
                  const isMyTurn = (gamePhase === 'betting-p1' && currentPlayer === 1) || (gamePhase === 'betting-p2' && currentPlayer === 2);
                  const canBet = isBettingPhase && isMyTurn && !isDropping && !isLocked;
                  return (
                    <button 
                      key={`right-${color.id}`}
                      onClick={() => canBet && placeBet(color.id)}
                      disabled={!canBet}
                      className={`w-20 h-28 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center backdrop-blur-sm ${!canBet ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                      style={{
                        background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})`,
                        boxShadow: (p1Bet > 0 || p2Bet > 0) ? '0 0 20px rgba(255, 215, 0, 0.8)' : `0 4px 10px ${color.hex}40`,
                      }}
                    >
                      <div className="text-white text-shadow-lg text-3xl mb-1">
                        {color.emoji}
                      </div>
                      {p1Bet > 0 && (
                        <div className="text-blue-200 text-xs font-bold">P1:{p1Bet}</div>
                      )}
                      {p2Bet > 0 && (
                        <div className="text-red-200 text-xs font-bold">P2:{p2Bet}</div>
                      )}
                      {isLocked && (
                        <div className="text-xs">🔒</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom betting panels */}
            <div className="grid grid-cols-4 gap-3 mt-4 px-3">
              {colors.filter(c => c && c.id).map((color) => {
                const p1Bet = players[1].bets[color.id] || 0;
                const p2Bet = players[2].bets[color.id] || 0;
                const isLocked = lockedColors.includes(color.id);
                const isBettingPhase = gamePhase === 'betting-p1' || gamePhase === 'betting-p2';
                const isMyTurn = (gamePhase === 'betting-p1' && currentPlayer === 1) || (gamePhase === 'betting-p2' && currentPlayer === 2);
                const canBet = isBettingPhase && isMyTurn && !isDropping && !isLocked;
                return (
                  <button 
                    key={`bottom-${color.id}`}
                    onClick={() => canBet && placeBet(color.id)}
                    disabled={!canBet}
                    className={`p-4 rounded-xl font-bold text-sm transition-all backdrop-blur-sm ${!canBet ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                    style={{
                      background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})`,
                      boxShadow: (p1Bet > 0 || p2Bet > 0) ? '0 0 20px rgba(255, 215, 0, 0.8)' : `0 4px 10px ${color.hex}40`,
                    }}
                  >
                    <div className="text-white text-shadow-lg flex items-center justify-center gap-2 font-black tracking-wider">
                      {color.emoji} {color.name.toUpperCase()}
                    </div>
                    {p1Bet > 0 && (
                      <div className="text-blue-200 text-xs mt-1 font-bold">P1: 💰{p1Bet}</div>
                    )}
                    {p2Bet > 0 && (
                      <div className="text-red-200 text-xs mt-1 font-bold">P2: 💰{p2Bet}</div>
                    )}
                    {isLocked && (
                      <div className="text-xs">🔒</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {gamePhase.startsWith('betting') && (
          <Button
            onClick={confirmBets}
            disabled={Object.keys(players[currentPlayer].bets).length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Zap className="w-4 h-4 mr-2" /> Confirm Bets ({Object.keys(players[currentPlayer].bets).length}/2)
          </Button>
        )}

        {gamePhase === 'dropping' && (
          <Button
            onClick={dropBalls}
            disabled={isDropping}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" /> Drop Balls
          </Button>
        )}
      </div>

      <PauseMenu
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onRetry={resetGame}
        onEnd={onBack}
        musicOn={musicOn}
        soundOn={soundOn}
        onToggleMusic={() => setMusicOn(!musicOn)}
        onToggleSound={() => setSoundOn(!soundOn)}
      />

      {/* PVP Tutorial overlay */}
      {showTutorial && (
        <PVPTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </motion.div>
  );
}