import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Gamepad2, Star } from 'lucide-react';

const JoinAnimation = ({ show, onComplete }) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationComplete={() => setTimeout(onComplete, 2000)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        <div className="text-center">
          {/* Confetti Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -100, 
                  x: Math.random() * window.innerWidth,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  rotate: 360,
                  opacity: 0
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
                className="absolute"
              >
                {i % 3 === 0 ? (
                  <Star className="w-6 h-6 text-yellow-400" />
                ) : i % 3 === 1 ? (
                  <Sparkles className="w-6 h-6 text-pink-400" />
                ) : (
                  <div className={`w-4 h-4 ${['bg-yellow-400', 'bg-pink-400', 'bg-green-400', 'bg-blue-400'][i % 4]}`} />
                )}
              </motion.div>
            ))}
          </div>

          {/* Main Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(250, 204, 21, 0.4)",
                  "0 0 0 40px rgba(250, 204, 21, 0)",
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto"
            >
              <Gamepad2 className="w-16 h-16 text-black" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold font-['Chakra_Petch'] mt-8 mb-2"
          >
            <span className="text-yellow-400">ENTRY</span> CONFIRMED!
          </motion.h2>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-zinc-400 text-lg"
          >
            Good luck in the tournament!
          </motion.p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="mt-6 flex items-center justify-center gap-2 text-green-400"
          >
            <Trophy className="w-6 h-6" />
            <span className="font-bold">May the best player win!</span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JoinAnimation;
