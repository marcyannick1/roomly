import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function MatchAnimation({ show, onComplete }) {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (show) {
      // Créer 15 cœurs avec des positions aléatoires
      const newHearts = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 1,
      }));
      setHearts(newHearts);

      // Nettoyer après l'animation
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          {/* Overlay avec fond légèrement coloré */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-red-500/20"
          />

          {/* Texte "C'est un match !" */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border-4 border-[#fec629]"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: 3, duration: 0.5 }}
            >
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
                C'est un match ! 💕
              </h2>
            </motion.div>
            <p className="text-gray-600 text-center mt-4">
              Vous pouvez maintenant discuter ensemble
            </p>
          </motion.div>

          {/* Cœurs animés */}
          {hearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{
                x: `${heart.x}vw`,
                y: '100vh',
                opacity: 0,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                y: '-20vh',
                opacity: [0, 1, 1, 0],
                scale: [0, heart.scale, heart.scale, 0],
                rotate: heart.rotation,
              }}
              transition={{
                duration: heart.duration,
                delay: heart.delay,
                ease: "easeOut",
              }}
              className="absolute"
            >
              <Heart
                className="text-red-500 fill-red-500"
                size={40 + heart.scale * 20}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
