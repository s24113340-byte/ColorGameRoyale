import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Shield, Snowflake, Skull, Trophy, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PauseMenu from './PauseMenu';

const INTERFERENCE_ATTACKS = {
  freeze: { name: 'Freeze Turn', icon: Snowflake, cost: 30, color: '#3B82F6' },
  drain: { name: 'Score Drain', icon: Skull, cost: 50, color: '#A855F7' },
};

export default function PVPMode({ onBack, colors }) {
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, playing, ended
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [players, setPlayers] = useState({
    1: { score: 0, coins: 100, integrity: 100, bets: {}, frozen: false, streak: 0 },
    2: { score: 0, coins: 100, integrity: 100, bets: {}, frozen: false, streak: 0 },
  });
  const [droppedBalls, setDroppedBalls] = useState([]);
  const [isDropping, setIsDropping] = useState(false);
  const [turn, setTurn] = useState(1);
  const [maxTurns] = useState(10);
  const [betAmount] = useState(10);
  const [winner, setWinner] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
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
    setGamePhase('playing');
  };

  const placeBet = (colorId) => {
    if (players[currentPlayer].frozen || isDropping) return;
    if (players[currentPlayer].coins < betAmount) return;

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

  const dropBalls = async () => {
    if (Object.keys(players[currentPlayer].bets).length === 0 || isDropping) return;
    
    playSound('drop');
    setIsDropping(true);
    setDroppedBalls([]);

    const results = [];
    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 600));
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      results.push(randomColor);
      setDroppedBalls(prev => [...prev, randomColor]);
    }

    setTimeout(() => calculateResults(results), 500);
  };

  const calculateResults = (results) => {
    const colorCounts = {};
    results.forEach(r => {
      colorCounts[r.id] = (colorCounts[r.id] || 0) + 1;
    });

    let totalWin = 0;
    let pointsEarned = 0;
    let newStreak = players[currentPlayer].streak;

    Object.entries(players[currentPlayer].bets).forEach(([colorId, betAmount]) => {
      const matches = colorCounts[colorId] || 0;
      if (matches > 0) {
        const payoutRates = { 1: 1, 2: 2, 3: 3 };
        totalWin += betAmount * payoutRates[matches];
        pointsEarned += matches === 3 ? 30 : 10 * matches;
        newStreak++;
        playSound('win');
      } else {
        newStreak = 0;
      }
    });

    setPlayers(prev => ({
      ...prev,
      [currentPlayer]: {
        ...prev[currentPlayer],
        score: prev[currentPlayer].score + pointsEarned,
        coins: prev[currentPlayer].coins + totalWin,
        streak: newStreak,
        bets: {},
        frozen: false,
      },
    }));

    // Next turn
    setTimeout(() => {
      setDroppedBalls([]);
      setIsDropping(false);
      
      if (currentPlayer === 2) {
        if (turn >= maxTurns) {
          endGame();
        } else {
          setTurn(t => t + 1);
          setCurrentPlayer(1);
        }
      } else {
        setCurrentPlayer(2);
      }
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
    setIsDropping(false);
    setTurn(1);
    setCurrentPlayer(1);
    setWinner(null);
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
            PLAYER {currentPlayer}'S TURN
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

      {/* Ball drop display */}
      <div className="flex justify-center gap-4 mb-6 h-16">
        {droppedBalls.map((ball, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: ball.hex }}
          >
            {ball.emoji}
          </motion.div>
        ))}
      </div>

      {/* Color grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {colors.map(color => (
          <button
            key={color.id}
            onClick={() => placeBet(color.id)}
            disabled={players[currentPlayer].frozen || isDropping}
            className="relative p-4 rounded-xl transition-all"
            style={{
              background: `${color.hex}20`,
              border: `2px solid ${color.hex}`,
            }}
          >
            <div 
              className="w-12 h-12 mx-auto rounded-lg mb-2 flex items-center justify-center text-2xl"
              style={{ background: color.hex }}
            >
              {color.emoji}
            </div>
            <p className="text-white font-bold text-sm">{color.name}</p>
            {players[currentPlayer].bets[color.id] > 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold">
                {players[currentPlayer].bets[color.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <Button
          onClick={dropBalls}
          disabled={Object.keys(players[currentPlayer].bets).length === 0 || isDropping}
          className="bg-green-600 hover:bg-green-700"
        >
          <Play className="w-4 h-4 mr-2" /> Drop Balls
        </Button>

        {Object.entries(INTERFERENCE_ATTACKS).map(([key, attack]) => (
          <Button
            key={key}
            onClick={() => useInterference(key)}
            disabled={players[currentPlayer].coins < attack.cost || isDropping}
            variant="outline"
            className="border-purple-500 text-purple-400"
          >
            <attack.icon className="w-4 h-4 mr-2" />
            {attack.name} ({attack.cost})
          </Button>
        ))}
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
    </motion.div>
  );
}