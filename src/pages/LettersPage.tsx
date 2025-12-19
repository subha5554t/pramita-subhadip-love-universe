import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Heart, Send, Inbox, X, Edit2, Trash2, Loader2, Sparkles, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import FloatingHearts from "@/components/FloatingHearts";
import GlassCard from "@/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Letter {
  id: string;
  user_id: string;
  from_name: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  room_code: string;
}

const LettersPage = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [newLetter, setNewLetter] = useState({
    from: "",
    subject: "",
    content: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Room code state
  const [roomCode, setRoomCode] = useState("");
  const [tempRoomCode, setTempRoomCode] = useState("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  useEffect(() => {
    if (hasJoinedRoom && roomCode) {
      fetchLetters();
    }
  }, [hasJoinedRoom, roomCode]);

  const joinRoom = () => {
    if (!tempRoomCode.trim()) {
      toast({
        title: "Enter a code",
        description: "Please enter your private letter code.",
        variant: "destructive",
      });
      return;
    }
    setRoomCode(tempRoomCode.trim().toLowerCase());
    setHasJoinedRoom(true);
  };

  const leaveRoom = () => {
    setRoomCode("");
    setTempRoomCode("");
    setHasJoinedRoom(false);
    setLetters([]);
  };

  const fetchLetters = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("letters")
      .select("*")
      .eq("room_code", roomCode)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading letters",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLetters((data as unknown as Letter[]) || []);
    }
    setIsLoading(false);
  };

  const sendLetter = async () => {
    if (!newLetter.subject || !newLetter.content) {
      toast({
        title: "Please fill in the letter",
        description: "Add a subject and your heartfelt message!",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please login to send letters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("letters").insert({
        user_id: user.id,
        from_name: newLetter.from || "Your Love",
        subject: newLetter.subject,
        content: newLetter.content,
        room_code: roomCode,
      });

      if (error) throw error;

      await fetchLetters();
      setNewLetter({ from: "", subject: "", content: "" });
      setIsWriting(false);
      toast({
        title: "Letter sent with love! 💌",
        description: "Your heartfelt words have been delivered.",
      });
    } catch (error: any) {
      toast({
        title: "Error sending letter",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLetter = async () => {
    if (!editingLetter || !newLetter.subject || !newLetter.content) {
      toast({
        title: "Please fill in the letter",
        description: "Add a subject and your heartfelt message!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("letters")
        .update({
          from_name: newLetter.from || "Your Love",
          subject: newLetter.subject,
          content: newLetter.content,
        })
        .eq("id", editingLetter.id);

      if (error) throw error;

      await fetchLetters();
      closeEditModal();
      toast({
        title: "Letter updated! 💕",
        description: "Your letter has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating letter",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteLetter = async (id: string) => {
    try {
      const { error } = await supabase.from("letters").delete().eq("id", id);
      if (error) throw error;

      await fetchLetters();
      setSelectedLetter(null);
      toast({
        title: "Letter deleted 💔",
        description: "The letter has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting letter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openLetter = async (letter: Letter) => {
    setSelectedLetter(letter);
    if (!letter.read) {
      await supabase.from("letters").update({ read: true }).eq("id", letter.id);
      setLetters(letters.map((l) => (l.id === letter.id ? { ...l, read: true } : l)));
    }
  };

  const openEditModal = (letter: Letter) => {
    setEditingLetter(letter);
    setNewLetter({
      from: letter.from_name,
      subject: letter.subject,
      content: letter.content,
    });
    setIsEditing(true);
    setSelectedLetter(null);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditingLetter(null);
    setNewLetter({ from: "", subject: "", content: "" });
  };

  const LetterForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">From</label>
        <Input
          placeholder="Your signature (e.g., 'Forever Yours')"
          value={newLetter.from}
          onChange={(e) => setNewLetter({ ...newLetter, from: e.target.value })}
          className="bg-background/50"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Subject</label>
        <Input
          placeholder="Give your letter a title..."
          value={newLetter.subject}
          onChange={(e) => setNewLetter({ ...newLetter, subject: e.target.value })}
          className="bg-background/50"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Your Message</label>
        <Textarea
          placeholder="Pour your heart out..."
          value={newLetter.content}
          onChange={(e) => setNewLetter({ ...newLetter, content: e.target.value })}
          className="bg-background/50 min-h-[200px]"
        />
      </div>

      <div className="flex gap-4">
        <Button 
          variant="ghost" 
          className="flex-1" 
          onClick={isEdit ? closeEditModal : () => setIsWriting(false)}
        >
          Cancel
        </Button>
        <Button 
          variant="love" 
          className="flex-1" 
          onClick={isEdit ? updateLetter : sendLetter}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {isEdit ? "Update Letter" : "Send with Love"}
        </Button>
      </div>
    </div>
  );

  // Room code entry screen
  if (!hasJoinedRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden flex items-center justify-center">
        <FloatingHearts />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <GlassCard className="p-8 max-w-md w-full mx-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Lock className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-serif mb-2">Love Letters</h1>
            <p className="text-muted-foreground mb-6">
              Enter your private code to access shared letters
            </p>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter letter code..."
                value={tempRoomCode}
                onChange={(e) => setTempRoomCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                className="text-center text-lg"
              />
              <Button variant="love" className="w-full" onClick={joinRoom}>
                <LogIn className="w-4 h-4 mr-2" />
                Enter Mailbox
              </Button>
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden">
      <FloatingHearts />

      {/* Ambient sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Sparkles className="w-4 h-4 text-primary/30" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button variant="ghost" size="sm" onClick={leaveRoom}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave
          </Button>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-serif flex items-center gap-2 justify-center">
              <Mail className="w-8 h-8 text-primary" />
              Love Letters
            </h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> {roomCode}
            </p>
          </div>
          <Button variant="romantic" onClick={() => setIsWriting(true)}>
            <Send className="w-4 h-4 mr-2" />
            Write
          </Button>
        </motion.div>

        {/* Write Letter Modal */}
        <AnimatePresence>
          {isWriting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsWriting(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-card rounded-2xl p-6 max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-serif mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-primary fill-primary" />
                  Write a Love Letter
                </h2>
                <LetterForm />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Letter Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeEditModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-card rounded-2xl p-6 max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-serif mb-6 flex items-center gap-2">
                  <Edit2 className="w-6 h-6 text-primary" />
                  Edit Letter
                </h2>
                <LetterForm isEdit />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Letter View Modal */}
        <AnimatePresence>
          {selectedLetter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedLetter(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.9, opacity: 0, rotateY: 90 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-cream rounded-2xl p-8 max-w-lg w-full shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundImage: "linear-gradient(135deg, hsl(40, 50%, 96%) 0%, hsl(350, 60%, 97%) 100%)",
                }}
              >
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(selectedLetter)}
                    >
                      <Edit2 className="w-5 h-5 text-primary" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLetter(selectedLetter.id)}
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </Button>
                  </motion.div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedLetter(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Envelope opening effect */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <Heart className="w-12 h-12 text-primary fill-primary mx-auto" />
                  </motion.div>
                </div>

                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-serif mb-4 text-center"
                >
                  {selectedLetter.subject}
                </motion.h2>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-muted-foreground mb-4 text-center"
                >
                  {new Date(selectedLetter.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="font-serif text-lg leading-relaxed whitespace-pre-wrap mb-8"
                >
                  {selectedLetter.content}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-right font-serif italic text-primary"
                >
                  — {selectedLetter.from_name}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mt-8"
                >
                  <Button variant="ghost" onClick={() => setSelectedLetter(null)}>
                    Close 💕
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          /* Letters Inbox */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-6">
              <Inbox className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif">Inbox</h2>
              <span className="text-sm text-muted-foreground">
                ({letters.filter((l) => !l.read).length} unread)
              </span>
            </div>

            <div className="space-y-4">
              {letters.map((letter, index) => (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, scale: 1.01 }}
                >
                  <GlassCard
                    className={`cursor-pointer group relative ${!letter.read ? "border-l-4 border-l-primary" : ""}`}
                    onClick={() => openLetter(letter)}
                  >
                    {/* Quick Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-background/80 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(letter);
                          }}
                        >
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-background/80 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLetter(letter.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </motion.div>
                    </div>

                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-coral flex items-center justify-center flex-shrink-0"
                        whileHover={{ rotate: 15 }}
                      >
                        <Mail className="w-5 h-5 text-primary-foreground" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-lg truncate">{letter.subject}</h3>
                          {!letter.read && (
                            <motion.span 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" 
                            />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{letter.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          From: {letter.from_name} • {new Date(letter.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {letters.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Mail className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                </motion.div>
                <p className="text-xl text-muted-foreground">
                  No letters yet. Write your first love letter!
                </p>
                <Button variant="romantic" className="mt-4" onClick={() => setIsWriting(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Write Letter
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LettersPage;