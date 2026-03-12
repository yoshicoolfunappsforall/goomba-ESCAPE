import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { HashLoader } from 'react-spinners';

export function LoadingScreen() {
  const { active, progress, errors, item, loaded, total } = useProgress();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
        >
          <HashLoader color="#ff0000" size={80} />
          
          <div className="mt-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold tracking-widest text-red-600 mb-2 font-mono">
              LOADING NIGHTMARE
            </h1>
            
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mt-4">
              <motion.div 
                className="h-full bg-red-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            
            <p className="mt-4 text-sm text-gray-400 font-mono">
              {Math.round(progress)}%
            </p>
            
            {item && (
              <p className="mt-2 text-xs text-gray-600 font-mono max-w-md text-center truncate">
                Loading: {item}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
