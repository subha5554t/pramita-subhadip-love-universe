import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, BookHeart, Heart, Calendar, Star, Plus, X, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import FloatingHearts from "@/components/FloatingHearts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface StoryEvent {
  id: string;
  user_id: string;
  event_date: string;
  title: string;
  description: string;
  milestone: boolean;
}

const defaultEvents: Omit<StoryEvent, "id" | "user_id">[] = [
  {
    event_date: "September 17, 2025",
    title: "The Beginning",
    description: "Our beautiful journey started on this magical day. Two hearts found each other, and the universe aligned perfectly.",
    milestone: true,
  },
  {
    event_date: "September 20, 2025",
    title: "First Long Conversation",
    description: "We talked for hours, discovering how much we had in common. Time flew by, and we couldn't stop smiling.",
    milestone: false,
  },
];

const StoryPage = () => {
  const [storyEvents, setStoryEvents] = useState<StoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<StoryEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    date: "",
    title: "",
    description: "",
    milestone: false,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchStoryEvents();
  }, []);

  const fetchStoryEvents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("story_events")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error loading story",
        description: error.message,
        variant: "destructive",
      });
      setStoryEvents([]);
    } else {
      setStoryEvents(data || []);
    }
    setIsLoading(false);
  };

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields!",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please login to add events.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("story_events").insert({
        user_id: user.id,
        event_date: newEvent.date,
        title: newEvent.title,
        description: newEvent.description,
        milestone: newEvent.milestone,
      });

      if (error) throw error;

      await fetchStoryEvents();
      closeAddModal();
      toast({
        title: "Story event added! 💕",
        description: "A new chapter in your love story.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEvent = async () => {
    if (!editingEvent || !newEvent.title || !newEvent.date || !newEvent.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("story_events")
        .update({
          event_date: newEvent.date,
          title: newEvent.title,
          description: newEvent.description,
          milestone: newEvent.milestone,
        })
        .eq("id", editingEvent.id);

      if (error) throw error;

      await fetchStoryEvents();
      closeEditModal();
      toast({
        title: "Story updated! 💕",
        description: "Your story has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from("story_events").delete().eq("id", id);
      if (error) throw error;

      await fetchStoryEvents();
      toast({
        title: "Event removed 💔",
        description: "The story event has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditModal = (event: StoryEvent) => {
    setEditingEvent(event);
    setNewEvent({
      date: event.event_date,
      title: event.title,
      description: event.description,
      milestone: event.milestone,
    });
    setIsEditingEvent(true);
  };

  const closeAddModal = () => {
    setIsAddingEvent(false);
    setNewEvent({ date: "", title: "", description: "", milestone: false });
  };

  const closeEditModal = () => {
    setIsEditingEvent(false);
    setEditingEvent(null);
    setNewEvent({ date: "", title: "", description: "", milestone: false });
  };

  const EventForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Date</label>
        <Input
          placeholder="e.g., September 17, 2025"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          className="bg-background/50"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Title</label>
        <Input
          placeholder="Give this moment a title..."
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          className="bg-background/50"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Description</label>
        <Textarea
          placeholder="Describe this special moment..."
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          className="bg-background/50"
          rows={4}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={newEvent.milestone}
          onCheckedChange={(checked) => setNewEvent({ ...newEvent, milestone: checked })}
        />
        <label className="text-sm font-medium">Mark as milestone ⭐</label>
      </div>

      <div className="flex gap-4">
        <Button
          variant="ghost"
          className="flex-1"
          onClick={isEdit ? closeEditModal : closeAddModal}
        >
          Cancel
        </Button>
        <Button
          variant="love"
          className="flex-1"
          onClick={isEdit ? updateEvent : addEvent}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Heart className="w-4 h-4 mr-2" />
          )}
          {isEdit ? "Update" : "Add to Story"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-light/50 via-background to-lavender-light/50 relative overflow-hidden">
      <FloatingHearts />

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
            <BookHeart className="w-8 h-8 text-primary" />
            Our Story
          </h1>
          <Button variant="romantic" onClick={() => setIsAddingEvent(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </motion.div>

        {/* Add Event Modal */}
        <AnimatePresence>
          {isAddingEvent && (
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
                className="glass-card rounded-2xl p-6 max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif">Add Story Event 💕</h2>
                  <Button variant="ghost" size="icon" onClick={closeAddModal}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <EventForm />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Event Modal */}
        <AnimatePresence>
          {isEditingEvent && (
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif">Edit Story Event ✏️</h2>
                  <Button variant="ghost" size="icon" onClick={closeEditModal}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <EventForm isEdit />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xl text-muted-foreground font-serif italic">
            "Every love story is beautiful, but ours is my favorite."
          </p>
          <motion.div 
            className="mt-4 flex justify-center gap-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <Heart className="w-5 h-5 text-primary fill-primary" />
          </motion.div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          /* Timeline */
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute left-4 md:left-1/2 top-0 w-0.5 bg-gradient-to-b from-primary via-lavender to-peach-dark transform -translate-x-1/2" 
              />

              {storyEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BookHeart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-xl text-muted-foreground mb-4">
                    Start writing your love story!
                  </p>
                  <Button variant="romantic" onClick={() => setIsAddingEvent(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Chapter
                  </Button>
                </motion.div>
              ) : (
                <>
                  {storyEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.15 }}
                      className={`relative flex items-center mb-12 ${
                        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                    >
                      {/* Timeline dot */}
                      <motion.div 
                        className="absolute left-4 md:left-1/2 transform -translate-x-1/2 z-10"
                        whileHover={{ scale: 1.2 }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          event.milestone 
                            ? "bg-gradient-to-br from-primary to-coral shadow-glow" 
                            : "bg-lavender"
                        }`}>
                          {event.milestone ? (
                            <Star className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
                          ) : (
                            <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
                          )}
                        </div>
                      </motion.div>

                      {/* Content card */}
                      <div className={`ml-16 md:ml-0 md:w-5/12 ${
                        index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                      }`}>
                        <motion.div
                          whileHover={{ scale: 1.02, y: -5 }}
                          className="glass-card rounded-2xl p-6 relative group"
                        >
                          {/* Action Buttons */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="bg-background/80 h-8 w-8"
                                onClick={() => openEditModal(event)}
                              >
                                <Edit2 className="w-4 h-4 text-primary" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="bg-background/80 h-8 w-8"
                                onClick={() => deleteEvent(event.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </motion.div>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <Calendar className="w-4 h-4" />
                            {event.event_date}
                          </div>
                          <h3 className="text-xl font-serif mb-2 text-gradient">
                            {event.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {event.description}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}

                  {/* To be continued */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="relative text-center pt-8"
                  >
                    <motion.div 
                      className="absolute left-4 md:left-1/2 top-0 transform -translate-x-1/2"
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-coral flex items-center justify-center shadow-glow">
                        <span className="text-2xl">💕</span>
                      </div>
                    </motion.div>
                    <div className="ml-16 md:ml-0 md:pt-16">
                      <p className="text-2xl font-serif text-gradient">
                        To be continued...
                      </p>
                      <p className="text-muted-foreground mt-2">
                        Our story is still being written, one beautiful moment at a time
                      </p>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryPage;