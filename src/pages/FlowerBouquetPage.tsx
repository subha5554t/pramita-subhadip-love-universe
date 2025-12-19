import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Trash2, Heart, History, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import FloatingHearts from "@/components/FloatingHearts";
import GlassCard from "@/components/GlassCard";

interface FlowerType {
  id: string;
  emoji: string;
  name: string;
  meaning: string;
  color: string;
}

interface Bouquet {
  id: string;
  sender_id: string;
  sender_name: string;
  room_code: string;
  flowers: FlowerType[];
  message: string | null;
  created_at: string;
}

const FLOWER_TYPES: FlowerType[] = [
  { id: "rose", emoji: "🌹", name: "Rose", meaning: "Deep Love", color: "from-red-400 to-red-600" },
  { id: "tulip", emoji: "🌷", name: "Tulip", meaning: "Perfect Love", color: "from-pink-400 to-pink-600" },
  { id: "sunflower", emoji: "🌻", name: "Sunflower", meaning: "Adoration", color: "from-yellow-400 to-orange-500" },
  { id: "lily", emoji: "🌸", name: "Lily", meaning: "Purity & Care", color: "from-pink-300 to-purple-400" },
  { id: "daisy", emoji: "🌼", name: "Daisy", meaning: "Innocence", color: "from-white to-yellow-200" },
  { id: "hibiscus", emoji: "🌺", name: "Hibiscus", meaning: "Beauty", color: "from-rose-400 to-pink-500" },
  { id: "cherry", emoji: "🌸", name: "Cherry Blossom", meaning: "New Beginnings", color: "from-pink-200 to-pink-400" },
  { id: "bouquet", emoji: "💐", name: "Mixed Bouquet", meaning: "Celebration", color: "from-purple-400 to-pink-500" },
];

const FlowerBouquetPage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [selectedFlowers, setSelectedFlowers] = useState<FlowerType[]>([]);
  const [message, setMessage] = useState("");
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSentAnimation, setShowSentAnimation] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const joinRoom = () => {
    if (!inputCode.trim()) {
      toast({ title: "Enter a room code", variant: "destructive" });
      return;
    }
    setRoomCode(inputCode.toUpperCase());
    setHasJoined(true);
    toast({ title: "Joined! 💐", description: "Start building your bouquet!" });
  };

  const addFlower = (flower: FlowerType) => {
    if (selectedFlowers.length >= 12) {
      toast({ title: "Bouquet is full!", description: "Maximum 12 flowers 🌸" });
      return;
    }
    setSelectedFlowers([...selectedFlowers, flower]);
  };

  const removeFlower = (index: number) => {
    const newFlowers = [...selectedFlowers];
    newFlowers.splice(index, 1);
    setSelectedFlowers(newFlowers);
  };

  const sendBouquet = async () => {
    if (!user || selectedFlowers.length === 0) {
      toast({ title: "Add some flowers first! 🌷", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("bouquets").insert({
      sender_id: user.id,
      sender_name: "Your Love",
      room_code: roomCode,
      flowers: selectedFlowers as unknown as any,
      message: message || null
    });

    if (error) {
      toast({ title: "Error", description: "Failed to send bouquet", variant: "destructive" });
      return;
    }

    setShowSentAnimation(true);
    setTimeout(() => {
      setShowSentAnimation(false);
      setSelectedFlowers([]);
      setMessage("");
      toast({ title: "Bouquet Sent! 💕", description: "Your love received a beautiful surprise!" });
    }, 2500);
  };

  const fetchBouquets = async () => {
    if (!roomCode) return;
    
    const { data } = await supabase
      .from("bouquets")
      .select("*")
      .eq("room_code", roomCode)
      .order("created_at", { ascending: false });

    if (data) {
      const parsed = data.map(b => ({
        ...b,
        flowers: b.flowers as unknown as FlowerType[]
      }));
      setBouquets(parsed);
    }
  };

  useEffect(() => {
    if (hasJoined) {
      fetchBouquets();
    }
  }, [hasJoined, roomCode]);

  // Real-time updates for new bouquets
  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase
      .channel(`bouquets-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bouquets",
          filter: `room_code=eq.${roomCode}`
        },
        (payload) => {
          const newBouquet = {
            ...payload.new,
            flowers: payload.new.flowers as unknown as FlowerType[]
          } as Bouquet;
          setBouquets(prev => [newBouquet, ...prev]);
          if (payload.new.sender_id !== user?.id) {
            toast({ 
              title: "💐 New Bouquet Received!", 
              description: `${newBouquet.sender_name} sent you flowers!` 
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, user?.id]);

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden">
        <FloatingHearts />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-center mb-8"
          >
            <span className="text-gradient">Flower Bouquet</span> Builder
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="ml-2 inline-block"
            >
              💐
            </motion.span>
          </motion.h1>

          <div className="max-w-md mx-auto">
            <GlassCard>
              <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
                <Flower2 className="w-5 h-5 text-primary" />
                Enter Room Code
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Share this code with your partner to send each other beautiful bouquets!
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter room code..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="uppercase"
                />
                <Button onClick={joinRoom}>
                  Join 🌸
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden">
      <FloatingHearts />
      
      {/* Sent Animation */}
      <AnimatePresence>
        {showSentAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, y: 100 }}
              animate={{ scale: 1, y: -100 }}
              transition={{ type: "spring", damping: 10 }}
              className="text-center"
            >
              <div className="text-8xl mb-4">💐</div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-3xl font-serif text-gradient">Sending with Love!</h2>
                <div className="flex justify-center gap-2 mt-4">
                  {selectedFlowers.slice(0, 5).map((f, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="text-3xl"
                    >
                      {f.emoji}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
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
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
            <History className="w-4 h-4 mr-2" />
            {showHistory ? "Build" : "History"}
          </Button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-serif text-center mb-2"
        >
          <span className="text-gradient">Flower Bouquet</span> Builder 💐
        </motion.h1>
        <p className="text-center text-muted-foreground mb-8">Room: {roomCode}</p>

        {!showHistory ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Flower Selection */}
            <GlassCard>
              <h2 className="text-lg font-serif mb-4">Choose Your Flowers</h2>
              <div className="grid grid-cols-4 gap-3">
                {FLOWER_TYPES.map((flower) => (
                  <motion.button
                    key={flower.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addFlower(flower)}
                    className="flex flex-col items-center p-3 rounded-xl bg-card/50 hover:bg-card/80 transition-all"
                  >
                    <span className="text-3xl mb-1">{flower.emoji}</span>
                    <span className="text-xs font-medium">{flower.name}</span>
                    <span className="text-xs text-muted-foreground">{flower.meaning}</span>
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            {/* Bouquet Preview */}
            <GlassCard>
              <h2 className="text-lg font-serif mb-4 flex items-center justify-between">
                Your Bouquet ({selectedFlowers.length}/12)
                {selectedFlowers.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFlowers([])}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </h2>
              <div className="min-h-32 bg-gradient-to-br from-primary/10 to-lavender/10 rounded-xl p-4 flex items-center justify-center flex-wrap gap-2">
                <AnimatePresence>
                  {selectedFlowers.length === 0 ? (
                    <p className="text-muted-foreground">Tap flowers above to add them here</p>
                  ) : (
                    selectedFlowers.map((flower, index) => (
                      <motion.button
                        key={index}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => removeFlower(index)}
                        className="text-3xl cursor-pointer hover:opacity-70"
                        title="Click to remove"
                      >
                        {flower.emoji}
                      </motion.button>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>

            {/* Message */}
            <GlassCard>
              <h2 className="text-lg font-serif mb-4">Add a Love Note (Optional)</h2>
              <Textarea
                placeholder="Write something sweet..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-20"
              />
            </GlassCard>

            {/* Send Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={sendBouquet} 
                className="w-full" 
                size="lg"
                disabled={selectedFlowers.length === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Bouquet 💕
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <GlassCard>
              <h2 className="text-lg font-serif mb-4">Bouquet History</h2>
              {bouquets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bouquets yet. Send one! 💐</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {bouquets.map((bouquet) => (
                    <motion.div
                      key={bouquet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-card/50 border border-border/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-serif">{bouquet.sender_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bouquet.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {bouquet.flowers.map((f, i) => (
                          <span key={i} className="text-2xl">{f.emoji}</span>
                        ))}
                      </div>
                      {bouquet.message && (
                        <p className="text-sm italic text-muted-foreground">"{bouquet.message}"</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowerBouquetPage;
