import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart,
  Camera,
  Gamepad2,
  MessageCircleHeart,
  BookHeart,
  Mail,
  Sparkles,
  Calendar,
  HeartHandshake,
  LogOut,
  MessageCircle,
  Clock,
} from "lucide-react";
import FloatingHearts from "@/components/FloatingHearts";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const RELATIONSHIP_START = new Date("2025-09-17");

const romanticQuotes = [
  "Love is composed of a single soul inhabiting two bodies.",
  "You are my sun, my moon, and all my stars.",
  "In a sea of people, my eyes will always search for you.",
  "You're the missing piece I didn't know I needed.",
  "With you, every moment is a beautiful memory.",
  "You make my heart skip a beat every single day.",
  "Together is a wonderful place to be.",
  "You are my today and all of my tomorrows.",
];

const Dashboard = () => {
  const [daysTogether, setDaysTogether] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [currentQuote, setCurrentQuote] = useState(romanticQuotes[0]);
  const [heartbeatScale, setHeartbeatScale] = useState(1);
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Goodbye! 💕",
      description: "See you soon, love!",
    });
  };

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diffTime = now.getTime() - RELATIONSHIP_START.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setDaysTogether(Math.max(0, diffDays));

      // Calculate countdown to next anniversary
      const nextAnniversary = new Date(RELATIONSHIP_START);
      nextAnniversary.setFullYear(now.getFullYear());
      if (nextAnniversary < now) {
        nextAnniversary.setFullYear(now.getFullYear() + 1);
      }
      
      const timeDiff = nextAnniversary.getTime() - now.getTime();
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      setHeartbeatScale(1.15);
      setTimeout(() => setHeartbeatScale(1), 150);
      setTimeout(() => setHeartbeatScale(1.15), 300);
      setTimeout(() => setHeartbeatScale(1), 450);
    }, 1500);
    return () => clearInterval(heartbeat);
  }, []);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote(romanticQuotes[Math.floor(Math.random() * romanticQuotes.length)]);
    }, 10000);
    return () => clearInterval(quoteInterval);
  }, []);

  const navigationCards = [
    { title: "Memory Vault", description: "Our precious moments together", icon: Camera, to: "/memories", color: "from-rose to-coral" },
    { title: "Love Chat", description: "Chat in real-time", icon: MessageCircle, to: "/chat", color: "from-primary to-lavender" },
    { title: "Romantic Games", description: "Play and have fun together", icon: Gamepad2, to: "/games", color: "from-lavender to-primary" },
    { title: "Tic-Tac-Toe", description: "Play together in real-time", icon: Heart, to: "/tictactoe", color: "from-rose to-primary" },
    { title: "Flower Bouquet", description: "Send virtual flowers", icon: Sparkles, to: "/bouquet", color: "from-pink-400 to-rose" },
    { title: "Love Wishlist", description: "Shared dreams & wishes", icon: Heart, to: "/wishlist", color: "from-peach-dark to-coral" },
    { title: "Sweet Messages", description: "Words that make you smile", icon: MessageCircleHeart, to: "/messages", color: "from-coral to-lavender" },
    { title: "Our Story", description: "The journey of our love", icon: BookHeart, to: "/story", color: "from-primary to-lavender" },
    { title: "Love Letters", description: "Private notes from the heart", icon: Mail, to: "/letters", color: "from-coral to-peach-dark" },
    { title: "Emotional Support", description: "Always here for you", icon: HeartHandshake, to: "/support", color: "from-lavender to-rose" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden">
      <FloatingHearts />

      {/* Ambient effects */}
      <motion.div 
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lavender/10 rounded-full blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, delay: 2.5 }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-4"
        >
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Welcome{" "}
            <span className="text-gradient">Pramita</span>
            <motion.span 
              className="mx-2 inline-block"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ❤️
            </motion.span>
            <span className="text-gradient">Subhadip</span>
          </motion.h1>
          <p className="text-muted-foreground text-lg">
            Your love story continues...
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Days Together */}
          <GlassCard className="text-center" delay={0.1}>
            <div className="flex justify-center mb-4">
              <motion.div
                style={{ scale: heartbeatScale }}
                transition={{ duration: 0.15 }}
              >
                <Heart className="w-12 h-12 text-primary fill-primary" />
              </motion.div>
            </div>
            <motion.h3 
              className="text-4xl md:text-5xl font-serif text-gradient mb-2"
              key={daysTogether}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              {daysTogether}
            </motion.h3>
            <p className="text-muted-foreground">Days Together</p>
            <p className="text-sm text-muted-foreground mt-2">
              Since September 17, 2025
            </p>
          </GlassCard>

          {/* Anniversary Countdown */}
          <GlassCard className="text-center" delay={0.2}>
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Calendar className="w-12 h-12 text-lavender" />
              </motion.div>
            </div>
            <div className="flex justify-center gap-2 mb-2">
              <div className="text-center">
                <motion.p 
                  className="text-2xl md:text-3xl font-serif text-gradient"
                  key={countdown.days}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {countdown.days}
                </motion.p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <span className="text-2xl text-muted-foreground">:</span>
              <div className="text-center">
                <motion.p 
                  className="text-2xl md:text-3xl font-serif text-gradient"
                  key={countdown.hours}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {countdown.hours.toString().padStart(2, '0')}
                </motion.p>
                <p className="text-xs text-muted-foreground">hrs</p>
              </div>
              <span className="text-2xl text-muted-foreground">:</span>
              <div className="text-center">
                <motion.p 
                  className="text-2xl md:text-3xl font-serif text-gradient"
                  key={countdown.minutes}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {countdown.minutes.toString().padStart(2, '0')}
                </motion.p>
                <p className="text-xs text-muted-foreground">min</p>
              </div>
              <span className="text-2xl text-muted-foreground">:</span>
              <div className="text-center">
                <motion.p 
                  className="text-2xl md:text-3xl font-serif text-gradient"
                  key={countdown.seconds}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {countdown.seconds.toString().padStart(2, '0')}
                </motion.p>
                <p className="text-xs text-muted-foreground">sec</p>
              </div>
            </div>
            <p className="text-muted-foreground">Until Anniversary</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Clock className="w-4 h-4 text-primary" />
              <p className="text-sm text-primary">
                Can't wait! 🎉
              </p>
            </div>
          </GlassCard>

          {/* Daily Quote */}
          <GlassCard className="text-center" delay={0.3}>
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12 text-peach-dark" />
              </motion.div>
            </div>
            <motion.p 
              key={currentQuote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg font-serif italic text-foreground/80 leading-relaxed"
            >
              "{currentQuote}"
            </motion.p>
            <p className="text-sm text-muted-foreground mt-4">
              Today's Love Quote
            </p>
          </GlassCard>
        </div>

        {/* Navigation Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-serif text-center mb-8">
            Explore Our Universe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {navigationCards.map((card, index) => (
              <Link key={card.to} to={card.to}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card rounded-2xl p-6 h-full cursor-pointer group"
                >
                  <motion.div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <card.icon className="w-7 h-7 text-primary-foreground" />
                  </motion.div>
                  <h3 className="text-xl font-serif mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {card.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Back to Love Gate */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <Link
            to="/"
            className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-4 h-4" />
            </motion.div>
            Back to Love Gate
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;