import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, Users, Loader2, Play, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GameBoard from './GameBoard';

export default function PVPMultiplayer({ onBack, colors }) {
  const [view, setView] = useState('menu'); // menu, create, join, lobby, playing, ended
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Poll room data when in lobby or playing
  const { data: room } = useQuery({
    queryKey: ['gameRoom', currentRoom?.id],
    queryFn: async () => {
      const rooms = await base44.entities.GameRoom.filter({ id: currentRoom.id });
      return rooms[0];
    },
    enabled: !!currentRoom && (view === 'lobby' || view === 'playing'),
    refetchInterval: 2000, // Poll every 2 seconds
  });

  useEffect(() => {
    if (room) {
      setCurrentRoom(room);
      
      // Update view based on room status
      if (room.status === 'active' && view === 'lobby') {
        setView('playing');
      } else if (room.status === 'finished' && view === 'playing') {
        setView('ended');
      }
    }
  }, [room]);

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newRoom = await base44.entities.GameRoom.create({
        room_code: code,
        host_player: user.email,
        guest_player: null,
        status: 'waiting',
        game_state: {
          host: { score: 0, coins: 100, bets: {} },
          guest: { score: 0, coins: 100, bets: {} },
          droppedBalls: [],
          isDropping: false,
          currentTurn: 'host',
          round: 1,
        },
        host_score: 0,
        guest_score: 0,
        current_turn: 'host',
        round: 1,
        max_rounds: 5,
      });
      return newRoom;
    },
    onSuccess: (newRoom) => {
      setCurrentRoom(newRoom);
      setRoomCode(newRoom.room_code);
      setView('lobby');
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (code) => {
      const rooms = await base44.entities.GameRoom.filter({ room_code: code.toUpperCase() });
      if (rooms.length === 0) throw new Error('Room not found');
      
      const foundRoom = rooms[0];
      if (foundRoom.guest_player) throw new Error('Room is full');
      
      const updatedRoom = await base44.entities.GameRoom.update(foundRoom.id, {
        guest_player: user.email,
        status: 'active',
      });
      return updatedRoom;
    },
    onSuccess: (joinedRoom) => {
      setCurrentRoom(joinedRoom);
      setView('lobby');
    },
  });

  const updateGameStateMutation = useMutation({
    mutationFn: async (updates) => {
      return await base44.entities.GameRoom.update(currentRoom.id, updates);
    },
    onSuccess: (updatedRoom) => {
      queryClient.invalidateQueries(['gameRoom', currentRoom.id]);
    },
  });

  const handleCreateRoom = () => {
    createRoomMutation.mutate();
  };

  const handleJoinRoom = () => {
    if (roomCode.trim().length === 6) {
      joinRoomMutation.mutate(roomCode);
    }
  };

  const handlePlaceBet = (colorId, amount) => {
    if (!currentRoom || !user) return;
    
    const isHost = user.email === currentRoom.host_player;
    const playerKey = isHost ? 'host' : 'guest';
    
    if (currentRoom.current_turn !== playerKey) return;
    
    const gameState = currentRoom.game_state || {};
    const playerState = gameState[playerKey] || { score: 0, coins: 100, bets: {} };
    
    if (playerState.coins < amount) return;
    
    const newBets = { ...playerState.bets };
    newBets[colorId] = (newBets[colorId] || 0) + amount;
    
    updateGameStateMutation.mutate({
      game_state: {
        ...gameState,
        [playerKey]: {
          ...playerState,
          coins: playerState.coins - amount,
          bets: newBets,
        },
      },
    });
  };

  const handleDrop = async () => {
    if (!currentRoom || !user) return;
    
    const isHost = user.email === currentRoom.host_player;
    const playerKey = isHost ? 'host' : 'guest';
    
    const gameState = currentRoom.game_state || {};
    const playerState = gameState[playerKey] || { bets: {} };
    
    if (Object.keys(playerState.bets).length === 0) return;
    
    // Update to dropping state
    await updateGameStateMutation.mutateAsync({
      game_state: {
        ...gameState,
        isDropping: true,
        droppedBalls: [],
      },
    });
    
    // Simulate ball drops
    const results = [];
    for (let i = 0; i < 3; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const landedSquare = Math.floor(Math.random() * 36);
      results.push({ color: randomColor, landedSquare, id: Date.now() + i });
      
      await updateGameStateMutation.mutateAsync({
        game_state: {
          ...gameState,
          droppedBalls: [...(gameState.droppedBalls || []), { color: randomColor, landedSquare, id: Date.now() + i }],
        },
      });
      
      await new Promise(r => setTimeout(r, 800));
    }
    
    // Calculate results
    const colorCounts = {};
    results.forEach(r => {
      colorCounts[r.color.id] = (colorCounts[r.color.id] || 0) + 1;
    });
    
    let totalWin = 0;
    let pointsEarned = 0;
    
    Object.entries(playerState.bets).forEach(([colorId, betAmount]) => {
      const matches = colorCounts[colorId] || 0;
      if (matches > 0) {
        const payoutRates = { 1: 1, 2: 2, 3: 3 };
        totalWin += betAmount * payoutRates[matches];
        pointsEarned += matches === 3 ? 30 : 10 * matches;
      }
    });
    
    // Update scores and switch turns
    const nextTurn = playerKey === 'host' ? 'guest' : 'host';
    const nextRound = nextTurn === 'host' ? currentRoom.round + 1 : currentRoom.round;
    const isGameOver = nextRound > currentRoom.max_rounds;
    
    const updates = {
      game_state: {
        ...gameState,
        [playerKey]: {
          ...playerState,
          score: playerState.score + pointsEarned,
          coins: playerState.coins + totalWin,
          bets: {},
        },
        droppedBalls: [],
        isDropping: false,
      },
      current_turn: nextTurn,
      round: nextRound,
      [`${playerKey}_score`]: playerState.score + pointsEarned,
    };
    
    if (isGameOver) {
      updates.status = 'finished';
    }
    
    await updateGameStateMutation.mutateAsync(updates);
  };

  const handlePlayAgain = () => {
    setCurrentRoom(null);
    setRoomCode('');
    setView('menu');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(currentRoom.room_code);
  };

  if (view === 'menu') {
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

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">ONLINE BATTLE</h1>
        <p className="text-slate-400 mb-8 text-center max-w-md">
          Create or join a room to challenge players online!
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Button
            onClick={handleCreateRoom}
            disabled={createRoomMutation.isPending}
            className="py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold"
          >
            {createRoomMutation.isPending ? (
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            ) : (
              <Users className="w-6 h-6 mr-2" />
            )}
            Create Room
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-950 text-slate-500">OR</span>
            </div>
          </div>

          <Input
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="text-center text-xl font-bold tracking-wider"
          />

          <Button
            onClick={handleJoinRoom}
            disabled={joinRoomMutation.isPending || roomCode.length !== 6}
            variant="outline"
            className="py-6 text-xl font-bold"
          >
            {joinRoomMutation.isPending ? (
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            ) : (
              <Play className="w-6 h-6 mr-2" />
            )}
            Join Room
          </Button>

          {joinRoomMutation.isError && (
            <p className="text-red-400 text-sm text-center">
              {joinRoomMutation.error.message}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  if (view === 'lobby') {
    const isHost = user?.email === currentRoom?.host_player;
    const hasGuest = !!currentRoom?.guest_player;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-4"
      >
        <button
          onClick={handlePlayAgain}
          className="fixed top-4 left-4 p-3 bg-slate-800/80 rounded-xl text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="text-4xl font-black text-white mb-4">GAME LOBBY</h1>

        <div className="mb-6 p-6 rounded-xl bg-slate-800/50 border border-purple-500/30">
          <p className="text-slate-400 text-sm mb-2 text-center">Room Code</p>
          <div className="flex items-center gap-3">
            <p className="text-4xl font-black text-white tracking-wider">{currentRoom?.room_code}</p>
            <Button
              onClick={copyRoomCode}
              variant="ghost"
              size="icon"
            >
              <Copy className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-xl ${isHost ? 'bg-blue-500/20 border-2 border-blue-500' : 'bg-slate-800/50'}`}>
            <div className="text-6xl mb-2 text-center">🔵</div>
            <p className="text-blue-400 font-bold text-center">HOST</p>
            <p className="text-slate-400 text-xs text-center mt-1">{currentRoom?.host_player}</p>
          </div>
          <div className={`p-6 rounded-xl ${!isHost && hasGuest ? 'bg-red-500/20 border-2 border-red-500' : 'bg-slate-800/50'}`}>
            <div className="text-6xl mb-2 text-center">{hasGuest ? '🔴' : '⏳'}</div>
            <p className={`${hasGuest ? 'text-red-400' : 'text-slate-500'} font-bold text-center`}>
              {hasGuest ? 'GUEST' : 'WAITING...'}
            </p>
            {hasGuest && (
              <p className="text-slate-400 text-xs text-center mt-1">{currentRoom?.guest_player}</p>
            )}
          </div>
        </div>

        {!hasGuest && (
          <p className="text-slate-400 text-center">
            Waiting for another player to join...
          </p>
        )}
      </motion.div>
    );
  }

  if (view === 'playing') {
    const isHost = user?.email === currentRoom?.host_player;
    const playerKey = isHost ? 'host' : 'guest';
    const isMyTurn = currentRoom?.current_turn === playerKey;
    const gameState = currentRoom?.game_state || {};
    const myState = gameState[playerKey] || { score: 0, coins: 100, bets: {} };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen"
      >
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              onClick={handlePlayAgain}
              className="p-2 bg-slate-800/80 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            
            <div className="text-center">
              <p className="text-slate-400 text-sm">Round {currentRoom?.round} / {currentRoom?.max_rounds}</p>
              <p className={`font-bold ${isMyTurn ? 'text-green-400' : 'text-slate-500'}`}>
                {isMyTurn ? 'YOUR TURN' : "OPPONENT'S TURN"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className={`text-center px-3 py-2 rounded-lg ${isHost ? 'bg-blue-500/20' : 'bg-slate-800/50'}`}>
                <p className="text-blue-400 text-xs">YOU</p>
                <p className="text-white font-bold">{gameState.host?.score || 0}</p>
              </div>
              <div className={`text-center px-3 py-2 rounded-lg ${!isHost ? 'bg-red-500/20' : 'bg-slate-800/50'}`}>
                <p className="text-red-400 text-xs">OPP</p>
                <p className="text-white font-bold">{gameState.guest?.score || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-28">
          <GameBoard
            gameState={{
              ...myState,
              droppedBalls: gameState.droppedBalls || [],
              isDropping: gameState.isDropping || false,
              frozen: !isMyTurn,
            }}
            colors={colors}
            onPlaceBet={handlePlaceBet}
            onDrop={handleDrop}
            onSkipResults={() => {}}
          />
        </div>
      </motion.div>
    );
  }

  if (view === 'ended') {
    const isHost = user?.email === currentRoom?.host_player;
    const hostScore = currentRoom?.host_score || 0;
    const guestScore = currentRoom?.guest_score || 0;
    const iWon = (isHost && hostScore > guestScore) || (!isHost && guestScore > hostScore);
    const isTie = hostScore === guestScore;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-4"
      >
        <Trophy className="w-20 h-20 text-yellow-400 mb-4" />
        <h1 className="text-4xl font-black text-white mb-2">
          {isTie ? "IT'S A TIE!" : iWon ? 'YOU WIN!' : 'YOU LOSE!'}
        </h1>

        <div className="grid grid-cols-2 gap-8 my-8">
          <div className={`text-center p-6 rounded-xl ${isHost && hostScore > guestScore ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-slate-800/50'}`}>
            <p className="text-blue-400 font-bold mb-2">HOST</p>
            <p className="text-3xl font-black text-white">{hostScore}</p>
          </div>
          <div className={`text-center p-6 rounded-xl ${!isHost && guestScore > hostScore ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-slate-800/50'}`}>
            <p className="text-red-400 font-bold mb-2">GUEST</p>
            <p className="text-3xl font-black text-white">{guestScore}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handlePlayAgain} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" /> Back to Menu
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
}