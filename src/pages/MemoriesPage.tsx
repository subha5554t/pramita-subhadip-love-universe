import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Heart, Plus, X, MapPin, Calendar, Tag, Upload, Loader2, Edit2, Trash2, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FloatingHearts from "@/components/FloatingHearts";
import GlassCard from "@/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Memory {
  id: string;
  title: string;
  memory_date: string;
  place: string | null;
  emotion: string;
  note: string | null;
  image_url: string | null;
  user_id: string;
  room_code: string;
}

const emotionTags = ["💕 Romantic", "😊 Happy", "🥰 Loving", "✨ Magical", "🌈 Beautiful", "💖 Special"];

const MemoriesPage = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [isEditingMemory, setIsEditingMemory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMemory, setNewMemory] = useState({
    title: "",
    date: "",
    place: "",
    emotion: emotionTags[0],
    note: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Room code state
  const [roomCode, setRoomCode] = useState("");
  const [tempRoomCode, setTempRoomCode] = useState("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  useEffect(() => {
    if (hasJoinedRoom && roomCode) {
      fetchMemories();
    }
  }, [hasJoinedRoom, roomCode]);

  const joinRoom = () => {
    if (!tempRoomCode.trim()) {
      toast({
        title: "Enter a code",
        description: "Please enter your private vault code.",
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
    setMemories([]);
  };

  const fetchMemories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("room_code", roomCode)
      .order("memory_date", { ascending: false });

    if (error) {
      toast({
        title: "Error loading memories",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMemories((data as unknown as Memory[]) || []);
    }
    setIsLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("memories")
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("memories").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleAddMemory = async () => {
    if (!newMemory.title || !newMemory.date) {
      toast({
        title: "Missing information",
        description: "Please add a title and date for your memory!",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please login to add memories.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const { error } = await supabase.from("memories").insert({
        user_id: user.id,
        title: newMemory.title,
        memory_date: newMemory.date,
        place: newMemory.place || null,
        emotion: newMemory.emotion,
        note: newMemory.note || null,
        image_url: imageUrl,
        room_code: roomCode,
      });

      if (error) throw error;

      await fetchMemories();
      closeAddModal();
      toast({
        title: "Memory saved! 💕",
        description: "Your precious moment has been added to the vault.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving memory",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMemory = async () => {
    if (!editingMemory || !newMemory.title || !newMemory.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = editingMemory.image_url;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const { error } = await supabase
        .from("memories")
        .update({
          title: newMemory.title,
          memory_date: newMemory.date,
          place: newMemory.place || null,
          emotion: newMemory.emotion,
          note: newMemory.note || null,
          image_url: imageUrl,
        })
        .eq("id", editingMemory.id);

      if (error) throw error;

      await fetchMemories();
      closeEditModal();
      toast({
        title: "Memory updated! 💕",
        description: "Your memory has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating memory",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      const { error } = await supabase.from("memories").delete().eq("id", id);
      if (error) throw error;
      
      await fetchMemories();
      setSelectedMemory(null);
      toast({
        title: "Memory deleted 💔",
        description: "The memory has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting memory",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditModal = (memory: Memory) => {
    setEditingMemory(memory);
    setNewMemory({
      title: memory.title,
      date: memory.memory_date,
      place: memory.place || "",
      emotion: memory.emotion,
      note: memory.note || "",
    });
    setImagePreview(memory.image_url);
    setIsEditingMemory(true);
    setSelectedMemory(null);
  };

  const closeAddModal = () => {
    setIsAddingMemory(false);
    setSelectedImage(null);
    setImagePreview(null);
    setNewMemory({ title: "", date: "", place: "", emotion: emotionTags[0], note: "" });
  };

  const closeEditModal = () => {
    setIsEditingMemory(false);
    setEditingMemory(null);
    setSelectedImage(null);
    setImagePreview(null);
    setNewMemory({ title: "", date: "", place: "", emotion: emotionTags[0], note: "" });
  };

  const MemoryForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      {/* Image Upload */}
      <div>
        <label className="text-sm font-medium mb-1 block">Photo</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        {imagePreview ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-background/30"
          >
            <Upload className="w-8 h-8 text-primary/50" />
            <span className="text-sm text-muted-foreground">
              Click to upload a photo
            </span>
          </motion.button>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Title</label>
        <Input
          placeholder="Give your memory a name..."
          value={newMemory.title}
          onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
          className="bg-background/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Date</label>
          <Input
            type="date"
            value={newMemory.date}
            onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
            className="bg-background/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Place</label>
          <Input
            placeholder="Where was it?"
            value={newMemory.place}
            onChange={(e) => setNewMemory({ ...newMemory, place: e.target.value })}
            className="bg-background/50"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Emotion</label>
        <div className="flex flex-wrap gap-2">
          {emotionTags.map((emotion) => (
            <motion.button
              key={emotion}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNewMemory({ ...newMemory, emotion })}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                newMemory.emotion === emotion
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-background/50 hover:bg-background"
              }`}
            >
              {emotion}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Note</label>
        <Textarea
          placeholder="What made this moment special?"
          value={newMemory.note}
          onChange={(e) => setNewMemory({ ...newMemory, note: e.target.value })}
          className="bg-background/50"
          rows={3}
        />
      </div>

      <Button 
        variant="love" 
        className="w-full" 
        onClick={isEdit ? handleEditMemory : handleAddMemory}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Heart className="w-4 h-4 mr-2" />
        )}
        {isEdit ? "Update Memory" : "Save Memory"}
      </Button>
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
            <h1 className="text-2xl md:text-3xl font-serif mb-2">Memory Vault</h1>
            <p className="text-muted-foreground mb-6">
              Enter your private code to access shared memories
            </p>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter vault code..."
                value={tempRoomCode}
                onChange={(e) => setTempRoomCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                className="text-center text-lg"
              />
              <Button variant="love" className="w-full" onClick={joinRoom}>
                <LogIn className="w-4 h-4 mr-2" />
                Enter Vault
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
              <Camera className="w-8 h-8 text-primary" />
              Memory Vault
            </h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> {roomCode}
            </p>
          </div>
          <Button variant="romantic" onClick={() => setIsAddingMemory(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </motion.div>

        {/* Add Memory Modal */}
        <AnimatePresence>
          {isAddingMemory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeAddModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif">Add New Memory 💕</h2>
                  <Button variant="ghost" size="icon" onClick={closeAddModal}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <MemoryForm />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Memory Modal */}
        <AnimatePresence>
          {isEditingMemory && (
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
                className="glass-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif">Edit Memory ✏️</h2>
                  <Button variant="ghost" size="icon" onClick={closeEditModal}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <MemoryForm isEdit />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memory Detail Modal */}
        <AnimatePresence>
          {selectedMemory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMemory(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, rotateY: -15 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.9, opacity: 0, rotateY: 15 }}
                transition={{ type: "spring", damping: 20 }}
                className="glass-card rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(selectedMemory)}
                    >
                      <Edit2 className="w-5 h-5 text-primary" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMemory(selectedMemory.id)}
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </Button>
                  </motion.div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMemory(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {selectedMemory.image_url && (
                  <motion.img
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    src={selectedMemory.image_url}
                    alt={selectedMemory.title}
                    className="w-full h-64 object-cover rounded-xl mb-6"
                  />
                )}

                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-serif mb-4"
                >
                  {selectedMemory.title}
                </motion.h2>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4"
                >
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedMemory.memory_date).toLocaleDateString()}
                  </span>
                  {selectedMemory.place && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedMemory.place}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {selectedMemory.emotion}
                  </span>
                </motion.div>

                {selectedMemory.note && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg leading-relaxed"
                  >
                    {selectedMemory.note}
                  </motion.p>
                )}

                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="mt-6 flex justify-center"
                >
                  <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
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
          <>
            {/* Memories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <GlassCard
                    className="cursor-pointer group relative"
                    onClick={() => setSelectedMemory(memory)}
                  >
                    {/* Quick Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-background/80 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(memory);
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
                            handleDeleteMemory(memory.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </motion.div>
                    </div>

                    {memory.image_url ? (
                      <img
                        src={memory.image_url}
                        alt={memory.title}
                        className="aspect-video object-cover rounded-xl mb-4 transition-transform group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-rose-light to-lavender-light rounded-xl mb-4 flex items-center justify-center">
                        <Heart className="w-12 h-12 text-primary/50 fill-primary/30" />
                      </div>
                    )}
                    <h3 className="text-xl font-serif mb-2">{memory.title}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(memory.memory_date).toLocaleDateString()}
                      </span>
                      {memory.place && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {memory.place}
                        </span>
                      )}
                    </div>
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {memory.emotion}
                    </span>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {memories.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Camera className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                </motion.div>
                <p className="text-xl text-muted-foreground">
                  No memories yet. Start capturing your precious moments!
                </p>
                <Button variant="romantic" className="mt-4" onClick={() => setIsAddingMemory(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Memory
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemoriesPage;