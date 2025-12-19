import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Flower2, Copy, Users, Trophy, RotateCcw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import FloatingHearts from "@/components/FloatingHearts";
import GlassCard from "@/components/GlassCard";

type GameStatus = "waiting" | "playing" | "finished";
type Player = "X" | "O";

interface Game {
  id: string;
  room_code: string;
  player_x_id: string;
  player_x_name: string;
  player_o_id: string | null;
  player_o_name: string | null;
  board_state: string[];
  current_turn: string;
  winner: string | null;
  status: string;
}

interface GameHistory {
  id: string;
  room_code: string;
  winner_name: string | null;
  result: string;
  player_x_name: string;
  player_o_name: string;
  played_at: string;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

const TicTacToePage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [playerRole, setPlayerRole] = useState<Player | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const checkWinner = (board: string[]): string | null => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (board.every(cell => cell !== "")) {
      return "draw";
    }
    return null;
  };

  const createGame = async () => {
    if (!user) return;
    
    const newRoomCode = generateRoomCode();
    const { data, error } = await supabase
      .from("tictactoe_games")
      .insert({
        room_code: newRoomCode,
        player_x_id: user.id,
        player_x_name: "Pramita",
        status: "waiting"
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create game", variant: "destructive" });
      return;
    }

    setRoomCode(newRoomCode);
    setGame(data);
    setPlayerRole("X");
    toast({ title: "Game Created! 💕", description: "Share the code with your love!" });
  };

  const joinGame = async () => {
    if (!user || !inputCode) return;

    const { data: existingGame, error: fetchError } = await supabase
      .from("tictactoe_games")
      .select("*")
      .eq("room_code", inputCode.toUpperCase())
      .single();

    if (fetchError || !existingGame) {
      toast({ title: "Game not found", description: "Check the room code", variant: "destructive" });
      return;
    }

    if (existingGame.player_o_id) {
      toast({ title: "Game is full", description: "This game already has two players", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from("tictactoe_games")
      .update({
        player_o_id: user.id,
        player_o_name: "Subhadip",
        status: "playing"
      })
      .eq("room_code", inputCode.toUpperCase())
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to join game", variant: "destructive" });
      return;
    }

    setRoomCode(inputCode.toUpperCase());
    setGame(data);
    setPlayerRole("O");
    toast({ title: "Joined! 💕", description: "Let the game begin!" });
  };

  const makeMove = async (index: number) => {
    if (!game || !user || !playerRole) return;
    if (game.board_state[index] !== "") return;
    if (game.current_turn !== playerRole) {
      toast({ title: "Wait for your turn! 💕" });
      return;
    }
    if (game.status !== "playing") return;

    const newBoard = [...game.board_state];
    newBoard[index] = playerRole;
    
    const winner = checkWinner(newBoard);
    const newStatus = winner ? "finished" : "playing";
    const nextTurn = playerRole === "X" ? "O" : "X";

    const { error } = await supabase
      .from("tictactoe_games")
      .update({
        board_state: newBoard,
        current_turn: nextTurn,
        winner: winner,
        status: newStatus
      })
      .eq("id", game.id);

    if (error) {
      toast({ title: "Error", description: "Failed to make move", variant: "destructive" });
    }

    if (winner) {
      // Save to history
      await supabase.from("tictactoe_history").insert({
        room_code: roomCode,
        winner_name: winner === "draw" ? null : (winner === "X" ? game.player_x_name : game.player_o_name),
        result: winner === "draw" ? "Draw" : `${winner === "X" ? game.player_x_name : game.player_o_name} Won`,
        player_x_name: game.player_x_name,
        player_o_name: game.player_o_name || "Unknown"
      });
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const restartGame = async () => {
    if (!game) return;
    
    const { error } = await supabase
      .from("tictactoe_games")
      .update({
        board_state: ["", "", "", "", "", "", "", "", ""],
        current_turn: "X",
        winner: null,
        status: "playing"
      })
      .eq("id", game.id);

    if (error) {
      toast({ title: "Error", description: "Failed to restart game", variant: "destructive" });
    }
  };

  const fetchHistory = async () => {
    if (!roomCode) return;
    
    const { data } = await supabase
      .from("tictactoe_history")
      .select("*")
      .eq("room_code", roomCode)
      .order("played_at", { ascending: false });

    if (data) {
      setHistory(data);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({ title: "Copied! 💕", description: "Share this code with your love!" });
  };

  // Real-time subscription
  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase
      .channel(`game-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tictactoe_games",
          filter: `room_code=eq.${roomCode}`
        },
        (payload) => {
          const newGame = payload.new as Game;
          setGame(newGame);
          if (newGame.winner && newGame.winner !== game?.winner) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, game?.winner]);

  useEffect(() => {
    if (showHistory && roomCode) {
      fetchHistory();
    }
  }, [showHistory, roomCode]);

  const renderCell = (index: number) => {
    const value = game?.board_state[index];
    return (
      <motion.button
        whileHover={{ scale: value ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => makeMove(index)}
        className="w-20 h-20 md:w-24 md:h-24 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 flex items-center justify-center text-4xl transition-all hover:bg-card/70"
        disabled={!!value || game?.status !== "playing" || game?.current_turn !== playerRole}
      >
        <AnimatePresence>
          {value === "X" && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-primary"
            >
              ❤️
            </motion.span>
          )}
          {value === "O" && (
            <motion.span
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-lavender"
            >
              🌸
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden">
      <FloatingHearts />
      
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-8xl mb-4"
              >
                {game?.winner === "draw" ? "🤝" : "🎉"}
              </motion.div>
              <h2 className="text-4xl font-serif text-gradient mb-2">
                {game?.winner === "draw" 
                  ? "It's a Draw!" 
                  : `${game?.winner === "X" ? game?.player_x_name : game?.player_o_name} Wins!`}
              </h2>
              <p className="text-muted-foreground">What a lovely game! 💕</p>
              {["❤️", "🌸", "💕", "🌹", "✨"].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-4xl"
                  initial={{ 
                    x: Math.random() * 400 - 200, 
                    y: Math.random() * 400 - 200,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: [0, -100, -200],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link to="/games">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>
          {roomCode && (
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif text-center mb-8"
        >
          <span className="text-gradient">Tic-Tac-Toe</span> Love Edition
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="ml-2"
          >
            💕
          </motion.span>
        </motion.h1>

        {!game ? (
          <div className="max-w-md mx-auto space-y-6">
            <GlassCard>
              <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Create New Game
              </h2>
              <Button onClick={createGame} className="w-full" size="lg">
                Create Game Room ❤️
              </Button>
            </GlassCard>

            <GlassCard>
              <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-lavender" />
                Join Existing Game
              </h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter room code..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="uppercase"
                />
                <Button onClick={joinGame} disabled={!inputCode}>
                  Join 🌸
                </Button>
              </div>
            </GlassCard>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            {/* Room Code Display */}
            <GlassCard className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Room Code</p>
                  <p className="text-2xl font-mono font-bold text-gradient">{roomCode}</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyRoomCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </GlassCard>

            {/* Players & Turn */}
            <GlassCard className="mb-6">
              <div className="flex justify-between items-center">
                <div className={`text-center ${game.current_turn === "X" ? "opacity-100" : "opacity-50"}`}>
                  <p className="text-2xl">❤️</p>
                  <p className="font-serif">{game.player_x_name}</p>
                  {playerRole === "X" && <p className="text-xs text-primary">(You)</p>}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {game.status === "waiting" ? "Waiting for player..." : 
                     game.status === "finished" ? "Game Over" :
                     `${game.current_turn === "X" ? game.player_x_name : game.player_o_name}'s Turn`}
                  </p>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-2xl mt-1"
                  >
                    {game.current_turn === "X" ? "❤️" : "🌸"}
                  </motion.div>
                </div>
                <div className={`text-center ${game.current_turn === "O" ? "opacity-100" : "opacity-50"}`}>
                  <p className="text-2xl">🌸</p>
                  <p className="font-serif">{game.player_o_name || "Waiting..."}</p>
                  {playerRole === "O" && <p className="text-xs text-lavender">(You)</p>}
                </div>
              </div>
            </GlassCard>

            {/* Game Board */}
            <div className="flex justify-center mb-6">
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => renderCell(index))}
              </div>
            </div>

            {/* Actions */}
            {game.status === "finished" && (
              <div className="flex justify-center gap-4">
                <Button onClick={restartGame} size="lg">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again 💕
                </Button>
              </div>
            )}

            {/* History Panel */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <GlassCard className="mt-6">
                    <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-peach-dark" />
                      Game History
                    </h3>
                    {history.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No games played yet</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {history.map((h) => (
                          <div key={h.id} className="flex justify-between items-center p-2 rounded-lg bg-card/30">
                            <div>
                              <p className="text-sm font-medium">{h.result}</p>
                              <p className="text-xs text-muted-foreground">
                                {h.player_x_name} vs {h.player_o_name}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(h.played_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicTacToePage;
