import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingHearts from "@/components/FloatingHearts";
import romanticBg from "@/assets/romantic-bg.jpg";

const romanticQuotes = [
  "In your eyes, I found my home...",
  "Every love story is beautiful, but ours is my favorite.",
  "With you, forever doesn't seem long enough.",
  "You are my today and all of my tomorrows.",
  "I loved you yesterday, I love you still. I always have, I always will.",
];

const LoveGate = () => {
  const navigate = useNavigate();
  const [currentQuote, setCurrentQuote] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % romanticQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${romanticBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 1 }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />

      <FloatingHearts />

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lavender/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Main hearts logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.5 }}
          className="mb-8"
        >
          <div className="relative">
            <Heart
              className="w-24 h-24 md:w-32 md:h-32 text-primary fill-primary heartbeat"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-peach-dark" />
            </motion.div>
          </div>
        </motion.div>

        {/* Names */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif text-center mb-4"
        >
          <span className="text-gradient">Pramita</span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block mx-4 text-primary"
          >
            ❤️
          </motion.span>
          <span className="text-gradient">Subhadip</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-lg md:text-xl text-foreground/80 mb-12 text-center font-medium"
        >
          Our Private Love Universe
        </motion.p>

        {/* Rotating quotes */}
        <div className="h-20 flex items-center justify-center mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center px-4"
            >
              <p className="text-xl md:text-2xl font-serif italic text-foreground/90">
                "{romanticQuotes[currentQuote]}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enter button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="love"
                size="xl"
                onClick={handleEnter}
                className="group"
              >
                <Heart className="w-5 h-5 group-hover:animate-pulse" />
                Enter Our World
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date started */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 text-sm text-foreground/70 font-medium"
        >
          Together since September 17, 2025
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoveGate;
