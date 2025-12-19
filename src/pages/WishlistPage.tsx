import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Heart, Gift, MapPin, Sparkles, Star, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import FloatingHearts from "@/components/FloatingHearts";
import GlassCard from "@/components/GlassCard";

interface WishlistItem {
  id: string;
  room_code: string;
  user_id: string;
  created_by_name: string;
  title: string;
  category: string;
  note: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: "Gift", label: "Gift", icon: "🎁", color: "from-rose to-coral" },
  { value: "Date", label: "Date", icon: "💕", color: "from-primary to-lavender" },
  { value: "Dream", label: "Dream", icon: "✨", color: "from-lavender to-purple-400" },
  { value: "Travel", label: "Travel", icon: "🌍", color: "from-blue-400 to-cyan-400" },
  { value: "Surprise", label: "Surprise", icon: "🎉", color: "from-peach-dark to-coral" },
];

const CELEBRATION_MESSAGES = [
  "Wish unlocked! ❤️",
  "Dreams do come true! 💕",
  "Another beautiful moment! 🌸",
  "Love conquers all! 💖",
  "Together we did it! ✨",
];

const WishlistPage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [newItem, setNewItem] = useState({ title: "", category: "Gift", note: "" });
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const joinRoom = () => {
    if (!inputCode.trim()) {
      toast({ title: "Enter a room code", variant: "destructive" });
      return;
    }
    setRoomCode(inputCode.toUpperCase());
    setHasJoined(true);
    toast({ title: "Joined! ✨", description: "Start adding your wishes!" });
  };

  const fetchItems = async () => {
    if (!roomCode) return;
    
    const { data } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("room_code", roomCode)
      .order("completed", { ascending: true })
      .order("created_at", { ascending: false });

    if (data) {
      setItems(data);
    }
  };

  const addItem = async () => {
    if (!user || !newItem.title.trim()) {
      toast({ title: "Enter a title", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("wishlist_items").insert({
      room_code: roomCode,
      user_id: user.id,
      created_by_name: "Love",
      title: newItem.title,
      category: newItem.category,
      note: newItem.note || null
    });

    if (error) {
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
      return;
    }

    setNewItem({ title: "", category: "Gift", note: "" });
    setShowAddForm(false);
    toast({ title: "Added! ✨", description: "Your wish is on the list!" });
    fetchItems();
  };

  const toggleComplete = async (item: WishlistItem) => {
    const newCompleted = !item.completed;
    
    const { error } = await supabase
      .from("wishlist_items")
      .update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null
      })
      .eq("id", item.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update item", variant: "destructive" });
      return;
    }

    if (newCompleted) {
      setCelebrationMessage(CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);
    }

    fetchItems();
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
      return;
    }

    toast({ title: "Removed 💔" });
    fetchItems();
  };

  useEffect(() => {
    if (hasJoined) {
      fetchItems();
    }
  }, [hasJoined, roomCode]);

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.icon || "📝";
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.color || "from-gray-400 to-gray-600";
  };

  const filteredItems = items.filter(item => 
    filterCategory === "all" || item.category === filterCategory
  );

  const pendingItems = filteredItems.filter(i => !i.completed);
  const completedItems = filteredItems.filter(i => i.completed);

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
            <span className="text-gradient">Love</span> Wishlist
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="ml-2 inline-block"
            >
              ✨
            </motion.span>
          </motion.h1>

          <div className="max-w-md mx-auto">
            <GlassCard>
              <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-peach-dark" />
                Enter Room Code
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Share wishes, dreams, and plans with your love!
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter room code..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="uppercase"
                />
                <Button onClick={joinRoom}>
                  Join ✨
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
      
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-serif text-gradient">{celebrationMessage}</h2>
              {["✨", "💕", "🌸", "💖", "⭐"].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-3xl"
                  initial={{ 
                    x: Math.random() * 300 - 150,
                    y: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    y: -200,
                    opacity: 0,
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.1,
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
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Wish
          </Button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-serif text-center mb-2"
        >
          <span className="text-gradient">Love</span> Wishlist ✨
        </motion.h1>
        <p className="text-center text-muted-foreground mb-8">Room: {roomCode}</p>

        {/* Filter */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <Button
              variant={filterCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory("all")}
            >
              All
            </Button>
            {CATEGORIES.map(cat => (
              <Button
                key={cat.value}
                variant={filterCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory(cat.value)}
              >
                {cat.icon} {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Add Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <GlassCard>
                  <h2 className="text-xl font-serif mb-4">Add a Wish ✨</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Title</label>
                      <Input
                        placeholder="What do you wish for?"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                      <Select 
                        value={newItem.category} 
                        onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.icon} {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Note (Optional)</label>
                      <Textarea
                        placeholder="Any details?"
                        value={newItem.note}
                        onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                      <Button className="flex-1" onClick={addItem}>
                        Add Wish ✨
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wishlist Items */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Pending */}
          {pendingItems.length > 0 && (
            <div>
              <h2 className="text-lg font-serif mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-peach-dark" />
                Wishes ({pendingItems.length})
              </h2>
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <GlassCard className="!p-4">
                      <div className="flex items-start gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleComplete(item)}
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${getCategoryColor(item.category)} flex items-center justify-center text-white shrink-0`}
                        >
                          {getCategoryIcon(item.category)}
                        </motion.button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{item.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>by {item.created_by_name}</span>
                          </div>
                          {item.note && (
                            <p className="text-sm text-muted-foreground mt-2 italic">"{item.note}"</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ×
                        </Button>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedItems.length > 0 && (
            <div>
              <h2 className="text-lg font-serif mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Completed ({completedItems.length})
              </h2>
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                  >
                    <GlassCard className="!p-4 opacity-70">
                      <div className="flex items-start gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleComplete(item)}
                          className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-through">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed {item.completed_at && new Date(item.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
              >
                ✨
              </motion.div>
              <p className="text-muted-foreground">No wishes yet. Add your first one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
