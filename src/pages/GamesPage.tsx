import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart,
  ArrowLeft,
  Gamepad2,
  Smile,
  MousePointer2,
  HandHeart,
  Sparkles,
  Brain,
  Shuffle,
  Gift,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import FloatingHearts from "@/components/FloatingHearts";
import { useToast } from "@/hooks/use-toast";

const loveMessages = [
  "You are the most amazing person in my life! 💕",
  "Every moment with you is magical! ✨",
  "You make my heart skip a beat! 💓",
  "I fall in love with you more every day! 🥰",
  "You're my favorite person in the whole world! 💖",
  "My love for you grows stronger each day! 💗",
  "You complete me in every way! 💞",
  "Being with you feels like a beautiful dream! 🌸",
];

// Do You Love Me Game Component
const DoYouLoveMeGame = () => {
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [showLove, setShowLove] = useState(false);
  const [loveMessage, setLoveMessage] = useState("");
  const [yesScale, setYesScale] = useState(1);

  const handleNoHover = () => {
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    setNoButtonPosition({ x, y });
    setYesScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleYesClick = () => {
    setLoveMessage(loveMessages[Math.floor(Math.random() * loveMessages.length)]);
    setShowLove(true);
    setTimeout(() => {
      setShowLove(false);
      setYesScale(1);
    }, 3000);
  };

  return (
    <GlassCard className="text-center relative overflow-hidden">
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ background: showLove ? "radial-gradient(circle, hsl(340 82% 65% / 0.2), transparent)" : "transparent" }}
      />
      <h3 className="text-2xl font-serif mb-6">Do You Love Me? 💕</h3>
      
      <AnimatePresence>
        {showLove && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-xl rounded-2xl z-10"
          >
            <div className="text-center p-8">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <Heart className="w-20 h-20 text-primary fill-primary mx-auto mb-4" />
              </motion.div>
              <p className="text-2xl font-serif text-gradient">{loveMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center gap-8 items-center min-h-[100px] relative">
        <motion.div animate={{ scale: yesScale }} transition={{ type: "spring" }}>
          <Button variant="love" size="lg" onClick={handleYesClick}>
            YES ❤️
          </Button>
        </motion.div>
        
        <motion.div
          animate={noButtonPosition}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onMouseEnter={handleNoHover}
          onTouchStart={handleNoHover}
        >
          <Button
            variant="outline"
            size="lg"
            className="opacity-50 pointer-events-none"
            disabled
          >
            NO ❌
          </Button>
        </motion.div>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        (Hint: The answer is always YES! 💗)
      </p>
    </GlassCard>
  );
};

// Love Counter Game Component
const LoveCounterGame = () => {
  const [count, setCount] = useState(0);
  const dailyLimit = 100;
  const { toast } = useToast();

  const handleClick = () => {
    if (count < dailyLimit) {
      setCount((prev) => prev + 1);
    } else {
      toast({
        title: "Daily limit reached! 💕",
        description: "Come back tomorrow to show more love!",
      });
    }
  };

  return (
    <GlassCard className="text-center">
      <h3 className="text-2xl font-serif mb-4">Love Counter 💕</h3>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-coral flex items-center justify-center mx-auto mb-4 shadow-glow relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        <Heart className="w-16 h-16 text-primary-foreground fill-primary-foreground" />
      </motion.button>
      <motion.p
        key={count}
        initial={{ scale: 1.5, color: "hsl(340, 82%, 65%)" }}
        animate={{ scale: 1, color: "hsl(350, 30%, 20%)" }}
        className="text-4xl font-serif mb-2"
      >
        {count}
      </motion.p>
      <p className="text-muted-foreground">Today's Love Points</p>
      <div className="mt-4 bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-coral"
          initial={{ width: 0 }}
          animate={{ width: `${(count / dailyLimit) * 100}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {count}/{dailyLimit} daily limit
      </p>
    </GlassCard>
  );
};

// Click the Love Game
const ClickTheLoveGame = () => {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    let spawner: NodeJS.Timeout;
    if (isPlaying) {
      spawner = setInterval(() => {
        const id = Date.now();
        const x = Math.random() * 80 + 10;
        const y = Math.random() * 60 + 20;
        const size = Math.random() * 20 + 20;
        setHearts((prev) => [...prev, { id, x, y, size }]);
        setTimeout(() => {
          setHearts((prev) => prev.filter((h) => h.id !== id));
        }, 2000);
      }, 500);
    }
    return () => clearInterval(spawner);
  }, [isPlaying]);

  const catchHeart = (id: number) => {
    setScore((prev) => prev + 1);
    setHearts((prev) => prev.filter((h) => h.id !== id));
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setHearts([]);
    setIsPlaying(true);
  };

  return (
    <GlassCard>
      <h3 className="text-2xl font-serif mb-4 text-center">Click the Hearts! 💕</h3>
      <div className="relative h-64 bg-gradient-to-br from-rose-light/30 to-lavender-light/30 rounded-xl overflow-hidden">
        <AnimatePresence>
          {hearts.map((heart) => (
            <motion.button
              key={heart.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.2 }}
              onClick={() => catchHeart(heart.id)}
              className="absolute cursor-pointer"
              style={{ left: `${heart.x}%`, top: `${heart.y}%` }}
            >
              <Heart className="text-primary fill-primary" style={{ width: heart.size, height: heart.size }} />
            </motion.button>
          ))}
        </AnimatePresence>
        
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="text-center">
              {timeLeft === 0 && <p className="text-2xl font-serif mb-2">Final Score: {score}</p>}
              <Button variant="love" onClick={startGame}>
                {timeLeft === 0 ? "Play Again!" : "Start Game!"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        <p className="text-lg font-serif">Score: <span className="text-gradient">{score}</span></p>
        <p className="text-lg font-serif">Time: <span className="text-gradient">{timeLeft}s</span></p>
      </div>
    </GlassCard>
  );
};

// Virtual Hugs Game
const VirtualHugsGame = () => {
  const [hugging, setHugging] = useState(false);
  const [hugCount, setHugCount] = useState(0);
  const { toast } = useToast();

  const sendHug = () => {
    setHugging(true);
    setHugCount(prev => prev + 1);
    toast({
      title: "Virtual Hug Sent! 🤗",
      description: "Your love felt the warmth of your embrace!",
    });
    setTimeout(() => setHugging(false), 2000);
  };

  return (
    <GlassCard className="text-center">
      <h3 className="text-2xl font-serif mb-4">Virtual Hugs 🤗</h3>
      <motion.div
        animate={hugging ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="text-8xl mb-4"
      >
        🫂
      </motion.div>
      <p className="text-lg mb-4">Hugs sent: <span className="text-gradient font-bold">{hugCount}</span></p>
      <Button variant="love" size="lg" onClick={sendHug} disabled={hugging}>
        {hugging ? "Hugging..." : "Send a Hug!"}
      </Button>
      <p className="text-sm text-muted-foreground mt-4">
        Share warm virtual hugs with your love
      </p>
    </GlassCard>
  );
};

// Love Quiz Game
const LoveQuizGame = () => {
  const questions = [
    { q: "What's your partner's favorite color?", options: ["Pink", "Blue", "Purple", "Red"] },
    { q: "What's your partner's dream vacation?", options: ["Beach", "Mountains", "City", "Adventure"] },
    { q: "What makes your partner happiest?", options: ["Quality time", "Surprises", "Cuddles", "Good food"] },
    { q: "Your partner's love language is?", options: ["Words", "Touch", "Gifts", "Acts of service"] },
  ];
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const answer = (opt: string) => {
    setAnswers([...answers, opt]);
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setAnswers([]);
    setShowResult(false);
  };

  return (
    <GlassCard className="text-center">
      <h3 className="text-2xl font-serif mb-4">Love Quiz 💕</h3>
      
      {showResult ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Sparkles className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <p className="text-xl font-serif mb-2">You know your partner so well!</p>
          <p className="text-muted-foreground mb-4">True love never forgets the little things 💖</p>
          <Button variant="romantic" onClick={restart}>Play Again</Button>
        </motion.div>
      ) : (
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-sm text-muted-foreground mb-2">Question {currentQ + 1}/{questions.length}</p>
          <p className="text-lg font-serif mb-6">{questions[currentQ].q}</p>
          <div className="grid grid-cols-2 gap-3">
            {questions[currentQ].options.map((opt) => (
              <motion.div key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="w-full" onClick={() => answer(opt)}>
                  {opt}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
};

// Love Wheel Game
const LoveWheelGame = () => {
  const rewards = [
    "A sweet kiss 💋",
    "A warm hug 🤗",
    "Movie night 🎬",
    "Cook together 👨‍🍳",
    "Love letter ✉️",
    "Massage time 💆",
    "Dance together 💃",
    "Stargazing 🌟",
  ];
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const newRotation = rotation + 1440 + Math.random() * 360;
    setRotation(newRotation);
    
    setTimeout(() => {
      const index = Math.floor(Math.random() * rewards.length);
      setResult(rewards[index]);
      setSpinning(false);
    }, 3000);
  };

  return (
    <GlassCard className="text-center">
      <h3 className="text-2xl font-serif mb-4">Love Wheel 🎡</h3>
      
      <motion.div
        className="w-48 h-48 mx-auto mb-4 rounded-full bg-gradient-conic from-primary via-lavender via-peach-dark to-primary relative"
        animate={{ rotate: rotation }}
        transition={{ duration: 3, ease: "easeOut" }}
        style={{
          background: "conic-gradient(from 0deg, hsl(340, 82%, 65%), hsl(280, 60%, 75%), hsl(30, 100%, 85%), hsl(10, 80%, 70%), hsl(340, 82%, 65%))"
        }}
      >
        <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center">
          <Heart className="w-12 h-12 text-primary fill-primary" />
        </div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-primary" />
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4"
          >
            <p className="text-xl font-serif text-gradient">{result}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Button variant="love" onClick={spin} disabled={spinning}>
        {spinning ? "Spinning..." : "Spin for Love!"}
      </Button>
    </GlassCard>
  );
};

// Compliment Generator
const ComplimentGame = () => {
  const compliments = [
    "Your smile lights up my entire world! ✨",
    "You're the most beautiful person inside and out! 🌸",
    "My heart beats only for you! 💓",
    "You make every day worth living! 🌈",
    "I'm the luckiest person to have you! 🍀",
    "Your love is the greatest gift! 🎁",
    "You're my happily ever after! 👑",
    "Being with you is pure magic! ✨",
  ];
  const [compliment, setCompliment] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = () => {
    setIsGenerating(true);
    setCompliment(null);
    setTimeout(() => {
      setCompliment(compliments[Math.floor(Math.random() * compliments.length)]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <GlassCard className="text-center">
      <h3 className="text-2xl font-serif mb-4">Compliment Generator 💌</h3>
      
      <div className="min-h-[100px] flex items-center justify-center mb-4">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Heart className="w-12 h-12 text-primary" />
              </motion.div>
            </motion.div>
          ) : compliment ? (
            <motion.p
              key="compliment"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xl font-serif text-gradient"
            >
              {compliment}
            </motion.p>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground"
            >
              Click to generate a sweet compliment!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <Button variant="romantic" onClick={generate} disabled={isGenerating}>
        <Sparkles className="w-4 h-4 mr-2" />
        Generate Compliment
      </Button>
    </GlassCard>
  );
};

// Memory Match Game
const MemoryMatchGame = () => {
  const emojis = ["💕", "💖", "💗", "💓", "💞", "💝", "💘", "❤️"];
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const initGame = useCallback(() => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const flipCard = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const matched = [...cards];
          matched[first].matched = true;
          matched[second].matched = true;
          setCards(matched);
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          const unflipped = [...cards];
          unflipped[first].flipped = false;
          unflipped[second].flipped = false;
          setCards(unflipped);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const isWon = cards.every(c => c.matched);

  return (
    <GlassCard>
      <h3 className="text-2xl font-serif mb-4 text-center">Memory Match 🎴</h3>
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => flipCard(card.id)}
            className={`aspect-square rounded-lg flex items-center justify-center text-2xl ${
              card.flipped || card.matched
                ? "bg-gradient-to-br from-primary/20 to-lavender/20"
                : "bg-gradient-to-br from-primary to-coral"
            }`}
          >
            <AnimatePresence>
              {(card.flipped || card.matched) && (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                >
                  {card.emoji}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Moves: {moves}</p>
        {isWon && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-primary font-medium"
          >
            You won! 💕
          </motion.p>
        )}
        <Button variant="ghost" size="sm" onClick={initGame}>
          <Shuffle className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>
    </GlassCard>
  );
};

const games = [
  { id: "do-you-love-me", title: "Do You Love Me?", icon: Heart, component: DoYouLoveMeGame },
  { id: "love-counter", title: "Love Counter", icon: Smile, component: LoveCounterGame },
  { id: "click-love", title: "Click the Love", icon: MousePointer2, component: ClickTheLoveGame },
  { id: "virtual-hugs", title: "Virtual Hugs", icon: HandHeart, component: VirtualHugsGame },
  { id: "love-quiz", title: "Love Quiz", icon: Brain, component: LoveQuizGame },
  { id: "love-wheel", title: "Love Wheel", icon: Gift, component: LoveWheelGame },
  { id: "compliment", title: "Compliments", icon: Sparkles, component: ComplimentGame },
  { id: "memory-match", title: "Memory Match", icon: Zap, component: MemoryMatchGame },
];

const GamesPage = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const GameComponent = selectedGame
    ? games.find((g) => g.id === selectedGame)?.component
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden">
      <FloatingHearts />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-center">
            <Gamepad2 className="inline-block w-8 h-8 mr-2 text-primary" />
            Romantic Games
          </h1>
          <div className="w-20" />
        </motion.div>

        {!selectedGame ? (
          // Game Selection Grid
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedGame(game.id)}
                className="glass-card rounded-2xl p-4 md:p-6 cursor-pointer group text-center"
              >
                <motion.div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-primary to-coral flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:shadow-glow transition-shadow"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <game.icon className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
                </motion.div>
                <h3 className="text-sm md:text-lg font-serif group-hover:text-primary transition-colors">
                  {game.title}
                </h3>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // Selected Game
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              variant="ghost"
              onClick={() => setSelectedGame(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
            {GameComponent && <GameComponent />}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GamesPage;