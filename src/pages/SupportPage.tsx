import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, HeartHandshake, Heart, Cloud, Smile, Hand, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingHearts from "@/components/FloatingHearts";
import GlassCard from "@/components/GlassCard";
import { useState } from "react";

const supportMessages = {
  low: [
    "It's okay to feel low sometimes. Remember, I'm always here for you. 💕",
    "This feeling is temporary. You are stronger than you know. I believe in you. 🌟",
    "Take a deep breath. Close your eyes. Feel my love surrounding you. 💗",
    "Even on your darkest days, you shine so bright to me. You matter. 💖",
  ],
  hug: [
    "*Wrapping you in the warmest virtual hug* You are so loved! 🤗💕",
    "Imagine my arms around you right now. Feel the warmth and comfort. 💗",
    "Sending you the biggest, tightest, most loving hug! Never let go! 🫂",
    "Consider yourself hugged, squeezed, and loved endlessly! 💕",
  ],
  reassurance: [
    "You are amazing, beautiful, and worthy of all the love in the world. 💖",
    "I choose you every single day. You are my person, always. 💕",
    "No matter what happens, we face it together. You're not alone. 🌈",
    "My love for you is unconditional and infinite. Nothing can change that. 💗",
  ],
};

const SupportPage = () => {
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [isBreathing, setIsBreathing] = useState(false);

  const showSupport = (type: "low" | "hug" | "reassurance") => {
    const messages = supportMessages[type];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCurrentMessage(randomMessage);
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setTimeout(() => setIsBreathing(false), 12000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-light/50 via-background to-rose-light/50 relative overflow-hidden">
      <FloatingHearts />

      {/* Calming ambient effects */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-lavender/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-rose-light/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

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
          <h1 className="text-3xl md:text-4xl font-serif text-center flex items-center gap-2">
            <HeartHandshake className="w-8 h-8 text-lavender" />
            Emotional Support
          </h1>
          <div className="w-20" />
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <p className="text-xl text-muted-foreground">
            This is your safe space. Whatever you're feeling, I'm here for you. 💕
          </p>
        </motion.div>

        {/* Message Display */}
        {currentMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-8 max-w-2xl mx-auto mb-12 text-center"
          >
            <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-4 animate-pulse" />
            <p className="text-2xl font-serif leading-relaxed">{currentMessage}</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setCurrentMessage(null)}
            >
              Thank you 💕
            </Button>
          </motion.div>
        )}

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard
              className="text-center cursor-pointer h-full"
              onClick={() => showSupport("low")}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender to-primary flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-serif mb-2">I'm Feeling Low</h3>
              <p className="text-sm text-muted-foreground">
                Get comforting words when you need them most
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard
              className="text-center cursor-pointer h-full"
              onClick={() => showSupport("hug")}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-peach-dark to-coral flex items-center justify-center mx-auto mb-4">
                <Hand className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-serif mb-2">I Need a Hug</h3>
              <p className="text-sm text-muted-foreground">
                Receive virtual warmth and comfort
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard
              className="text-center cursor-pointer h-full"
              onClick={() => showSupport("reassurance")}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-lavender flex items-center justify-center mx-auto mb-4">
                <Smile className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-serif mb-2">I Need Reassurance</h3>
              <p className="text-sm text-muted-foreground">
                Remember how loved and valued you are
              </p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Breathing Exercise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-md mx-auto"
        >
          <GlassCard className="text-center">
            <Wind className="w-8 h-8 text-lavender mx-auto mb-4" />
            <h3 className="text-xl font-serif mb-4">Calming Breath</h3>
            
            {isBreathing ? (
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1.5, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    times: [0, 0.25, 0.75, 1],
                  }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-lavender/50 to-rose-light/50 mx-auto flex items-center justify-center"
                >
                  <motion.p
                    animate={{
                      opacity: [1, 1, 0, 0, 1, 1, 0, 0, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      times: [0, 0.2, 0.25, 0.45, 0.5, 0.7, 0.75, 0.95, 1],
                    }}
                    className="font-medium text-foreground"
                  >
                    <motion.span
                      key="breathe"
                      animate={{
                        opacity: [1, 1, 0, 0, 0, 0, 1, 1],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        times: [0, 0.2, 0.25, 0.45, 0.5, 0.7, 0.75, 1],
                      }}
                    >
                      Breathe In...
                    </motion.span>
                  </motion.p>
                </motion.div>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">
                  Take a moment to center yourself with a calming breathing exercise
                </p>
                <Button variant="romantic" onClick={startBreathing}>
                  Start Breathing Exercise
                </Button>
              </>
            )}
          </GlassCard>
        </motion.div>

        {/* Footer message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-muted-foreground mt-12"
        >
          Remember: You are never alone. I love you. 💕
        </motion.p>
      </div>
    </div>
  );
};

export default SupportPage;
