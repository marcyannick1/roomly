import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function ContentCard({ view, title, count, children }) {
  return (
    <motion.div
      key={view}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fec629] via-[#212220] to-[#fec629]" />

        <motion.h2
          className="text-4xl font-bold text-[#212220] mb-8 flex items-center gap-3"
          style={{ fontFamily: 'Outfit' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-[#fec629]" />
          </motion.div>
          {title}
          {count !== undefined && (
            <span className="text-2xl text-gray-500 font-normal">
              ({count})
            </span>
          )}
        </motion.h2>
        {children}
      </div>
    </motion.div>
  );
}
