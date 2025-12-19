import { motion } from "framer-motion";
import { ReactNode, MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const GlassCard = ({
  children,
  className = "",
  hover = true,
  delay = 0,
  onClick,
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      onClick={onClick}
      className={cn(
        "glass-card rounded-2xl p-6 transition-all duration-300",
        hover && "hover:shadow-glow cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
