import { motion } from 'framer-motion';

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center max-w-md"
    >
      <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100">
        <motion.div
          className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Icon className="w-16 h-16 text-gray-400" />
        </motion.div>
        <h3 className="text-3xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
          {title}
        </h3>
        <p className="text-gray-600 text-lg">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
