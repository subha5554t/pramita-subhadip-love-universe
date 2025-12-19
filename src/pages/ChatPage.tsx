import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Heart, Send, Trash2, Loader2, Sparkles, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FloatingHearts from "@/components/FloatingHearts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  user_id: string;
  sender_name: string;
  message: string;
  created_at: string;
  room_code?: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isInRoom, setIsInRoom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!isInRoom || !roomCode) return;

    fetchMessages();

    // Subscribe to real-time updates for this room
    const channel = supabase
      .channel(`chat_room_${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const deletedId = payload.old.id;
          setMessages((prev) => prev.filter((msg) => msg.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isInRoom, roomCode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const joinRoom = () => {
    if (!roomCode.trim()) {
      toast({
        title: "Enter room code",
        description: "Please enter a secret room code to join your love chat!",
        variant: "destructive",
      });
      return;
    }
    setIsInRoom(true);
  };

  const leaveRoom = () => {
    setIsInRoom(false);
    setMessages([]);
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_code", roomCode)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMessages((data as unknown as ChatMessage[]) || []);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast({
        title: "Empty message",
        description: "Please type something sweet!",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please login to send messages.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const { error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        sender_name: senderName || "Love",
        message: newMessage.trim(),
        room_code: roomCode,
      });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase.from("chat_messages").delete().eq("id", id);
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error deleting message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isInRoom) {
        joinRoom();
      } else {
        sendMessage();
      }
    }
  };

  const isOwnMessage = (msg: ChatMessage) => msg.user_id === user?.id;

  // Room code entry screen
  if (!isInRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden flex flex-col items-center justify-center">
        <FloatingHearts />

        {/* Ambient effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-lavender/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 container mx-auto px-4 py-8">
          <Link to="/dashboard" className="absolute top-4 left-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto glass-card p-8 rounded-3xl text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-6"
            >
              <div className="relative inline-block">
                <Lock className="w-16 h-16 text-primary mx-auto" />
                <Heart className="w-6 h-6 text-coral absolute -top-1 -right-1 animate-pulse" />
              </div>
            </motion.div>

            <h1 className="text-3xl font-serif mb-2">Love Chat</h1>
            <p className="text-muted-foreground mb-6">
              Enter a secret room code to chat with your partner. Share the same code to join the same room! 💕
            </p>

            <div className="space-y-4">
              <Input
                placeholder="Enter secret room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-background/50 text-center text-lg tracking-widest"
              />

              <Input
                placeholder="Your name (e.g., Pramita)"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="bg-background/50 text-center"
              />

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="love"
                  size="lg"
                  className="w-full"
                  onClick={joinRoom}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Love Chat
                </Button>
              </motion.div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              💡 Tip: Use something memorable like your anniversary date or a special word only you two know!
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden flex flex-col">
      <FloatingHearts />

      {/* Ambient effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-lavender/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 container mx-auto px-4 py-4 flex flex-col h-screen max-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 flex-shrink-0"
        >
          <Button variant="ghost" size="sm" onClick={leaveRoom}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave
          </Button>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-serif flex items-center gap-2 justify-center">
              <MessageCircle className="w-7 h-7 text-primary" />
              Love Chat
            </h1>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Room: {roomCode}
            </p>
          </div>
          <div className="w-16" />
        </motion.div>

        {/* Chat Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-y-auto glass-card rounded-2xl p-4 mb-4"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Heart className="w-16 h-16 text-primary/30 mb-4" />
              </motion.div>
              <p className="text-muted-foreground">
                Start your love conversation! 💕
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Share the room code "{roomCode}" with your partner to chat together!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${isOwnMessage(msg) ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[60%] group relative ${
                        isOwnMessage(msg)
                          ? "bg-gradient-to-br from-primary to-coral text-primary-foreground rounded-2xl rounded-br-sm"
                          : "bg-background/80 backdrop-blur-sm rounded-2xl rounded-bl-sm border border-primary/20"
                      } p-4`}
                    >
                      {/* Delete button for own messages */}
                      {isOwnMessage(msg) && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          whileHover={{ scale: 1.1 }}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteMessage(msg.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </motion.button>
                      )}

                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${
                          isOwnMessage(msg) ? "text-primary-foreground/80" : "text-primary"
                        }`}>
                          {msg.sender_name}
                        </span>
                        <Sparkles className={`w-3 h-3 ${
                          isOwnMessage(msg) ? "text-primary-foreground/60" : "text-primary/60"
                        }`} />
                      </div>
                      <p className="text-sm md:text-base leading-relaxed">
                        {msg.message}
                      </p>
                      <div className={`text-xs mt-2 ${
                        isOwnMessage(msg) ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </motion.div>

        {/* Message Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 flex-shrink-0"
        >
          <Input
            placeholder="Type something sweet..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-background/50 flex-1"
            disabled={isSending}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="love"
              onClick={sendMessage}
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <Heart className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatPage;
