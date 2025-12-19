import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingHearts from "@/components/FloatingHearts";

const sweetMessages = [
  "You are the sunshine that brightens my every day! ☀️",
  "My heart does a little dance whenever I think of you! 💃",
  "You make ordinary moments feel magical! ✨",
  "Being with you is my favorite adventure! 🌟",
  "You're not just my love, you're my best friend! 💕",
  "Every love story is beautiful, but ours is my favorite! 📖",
  "You had me at hello, and you still have me now! 💗",
  "Home is wherever I'm with you! 🏠",
  "You're the reason I believe in love! 💖",
  "I love you more than words can say! 💝",
  "You make my heart skip a beat every single day! 💓",
  "With you, I've found my forever! 💞",
  "You're the missing piece to my puzzle! 🧩",
  "In your arms is my favorite place to be! 🤗",
  "You're my today and all of my tomorrows! 🌈",
  "Loving you is the best decision I ever made! 💘",
  "You're the peanut butter to my jelly! 🥜",
  "My love for you is infinite! ♾️",
  "You're my happy place! 😊",
  "Every moment with you is a treasure! 💎",
];

const MessagesPage = () => {
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const getRandomMessage = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * sweetMessages.length);
      setCurrentMessage(sweetMessages[randomIndex]);
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden">
      <FloatingHearts />

      {/* Ambient effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lavender/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-center flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            Sweet Messages
          </h1>
          <div className="w-20" />
        </motion.div>

        {/* Message Card */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 md:p-12 max-w-2xl w-full text-center"
          >
            <AnimatePresence mode="wait">
              {currentMessage ? (
                <motion.div
                  key={currentMessage}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="min-h-[150px] flex items-center justify-center"
                >
                  <div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                      className="mb-6"
                    >
                      <Sparkles className="w-12 h-12 text-peach-dark mx-auto" />
                    </motion.div>
                    <p className="text-2xl md:text-3xl font-serif leading-relaxed text-foreground">
                      {currentMessage}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-h-[150px] flex items-center justify-center"
                >
                  <div>
                    <Heart className="w-16 h-16 text-primary/30 mx-auto mb-4 animate-pulse" />
                    <p className="text-xl text-muted-foreground">
                      Click the button to receive a sweet message!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Button
              variant="love"
              size="xl"
              onClick={getRandomMessage}
              disabled={isAnimating}
              className="group"
            >
              {isAnimating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className="w-5 h-5 group-hover:animate-pulse" />
              )}
              {currentMessage ? "Make Me Smile Again!" : "Make Me Smile!"}
              <Sparkles className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mt-8 text-center"
          >
            ✨ Every click brings a new dose of love ✨
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
