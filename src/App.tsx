// ======= SHOOTER GAME FIXED – LEVEL WORKING PERFECTLY ======= //

import { useState, useEffect, useRef, useCallback } from 'react';
import { Target, Heart, Trophy } from 'lucide-react';

interface TargetImage {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  points: number;
}

const targetImages: TargetImage[] = [
  {
    id: "apple",
    name: "Apple",
    icon: () => (
      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-8 h-8" />
    ),
    color: "red",
    points: 10
  },
  {
    id: "google",
    name: "Google",
    icon: () => (
      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="w-8 h-8" />
    ),
    color: "yellow",
    points: 12
  },
  {
    id: "meta",
    name: "Meta",
    icon: () => (
      <img src="../images/meta.png" className="w-8 h-8" />
    ),
    color: "blue",
    points: 15
  },
  {
    id: "amazon",
    name: "Amazon",
    icon: () => (
      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" className="w-8 h-8" />
    ),
    color: "orange",
    points: 20
  },
  {
    id: "tesla",
    name: "Tesla",
    icon: () => (
      <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg" className="w-8 h-8" />
    ),
    color: "purple",
    points: 25
  },
  {
    id: "Netflix",
    name: "Netflix",
    icon: () => (
      <img src="../images/netflix.png" className="w-8 h-8" />
    ),
    color: "green",
    points: 18
  },
  {
    id: "Nvidia",
    name: "Nvidia",
    icon: () => (
      <img src="images/nvidia.png" className="w-8 h-8" />
    ),
    color: "pink",
    points: 22
  }
];

const getColorClasses = (colorName: string) => {
  const colors: Record<string, { gradient: string; border: string; bg: string }> = {
    red: {
      gradient: "from-red-500 via-rose-500 to-red-700",
      border: "border-red-300",
      bg: "bg-gradient-to-br from-red-500 to-red-700"
    },
    yellow: {
      gradient: "from-yellow-400 via-amber-500 to-yellow-600",
      border: "border-amber-300",
      bg: "bg-gradient-to-br from-yellow-400 to-yellow-600"
    },
    orange: {
      gradient: "from-orange-400 via-orange-500 to-red-500",
      border: "border-orange-300",
      bg: "bg-gradient-to-br from-orange-400 to-red-500"
    },
    purple: {
      gradient: "from-purple-400 via-fuchsia-500 to-purple-700",
      border: "border-fuchsia-300",
      bg: "bg-gradient-to-br from-purple-400 to-purple-700"
    },
    blue: {
      gradient: "from-blue-400 via-sky-500 to-indigo-600",
      border: "border-blue-300",
      bg: "bg-gradient-to-br from-blue-400 to-indigo-600"
    },
    green: {
      gradient: "from-green-400 via-emerald-500 to-green-700",
      border: "border-emerald-300",
      bg: "bg-gradient-to-br from-green-400 to-green-700"
    },
    pink: {
      gradient: "from-pink-400 via-rose-500 to-pink-700",
      border: "border-pink-300",
      bg: "bg-gradient-to-br from-pink-400 to-pink-700"
    },
  };
  return colors[colorName] || colors.red;
};

interface GameObject {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  imageType: string;
}

function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);

  const [objects, setObjects] = useState<GameObject[]>([]);
  const [level, setLevel] = useState(1);
  const [lastLevelScore, setLastLevelScore] = useState(0);  // <-- FIX LEVEL BUG

  const [rotationAngle, setRotationAngle] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const objectIdRef = useRef(0);
  const spawnIntervalRef = useRef<number>();
  const animationFrameRef = useRef<number>();

  // -----------------------------
  // SPAWN OBJECT — FASTER EACH LEVEL
  // -----------------------------
  const spawnObject = useCallback(() => {
    const randomImage = targetImages[Math.floor(Math.random() * targetImages.length)];

    const newObject: GameObject = {
      id: objectIdRef.current++,
      x: Math.random() * 80 + 10,
      y: 0,
      speed:  level * 0.4,   // <-- SPEED INCREASE FIXED
      size: 60,
      imageType: randomImage.id,
    };

    setObjects(prev => [...prev, newObject]);
  }, [level]);

  // -----------------------------
  // START GAME
  // -----------------------------
  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setScore(0);
    setLevel(1);
    setLastLevelScore(0);  // <-- FIX
    setObjects([]);
    objectIdRef.current = 0;
  };

  // -----------------------------
  // CLICK TARGET
  // -----------------------------
  const handleObjectClick = (id: number) => {
    const obj = objects.find(o => o.id === id);
    if (!obj) return;

    const targetImage = targetImages.find(img => img.id === obj.imageType);
    const points = targetImage?.points || 10;

    setObjects(prev => prev.filter(o => o.id !== id));
    setScore(prev => prev + points);
  };

  // -----------------------------
  // SPAWN LOOP — DYNAMIC INTERVAL
  // -----------------------------
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnInterval = Math.max(700 - level * 60, 250); // FASTER SPAWN
    spawnIntervalRef.current = window.setInterval(spawnObject, spawnInterval);

    return () => clearInterval(spawnIntervalRef.current);
  }, [gameState, level, spawnObject]);

  // -----------------------------
  // ANIMATION (FALLING)
  // -----------------------------
  useEffect(() => {
    if (gameState !== 'playing') return;

    const animate = () => {
      setObjects(prev => {
        const updated = prev.map(obj => ({ ...obj, y: obj.y + obj.speed }));

        // LOST OBJECTS
        const escaped = updated.filter(obj => obj.y > 100);
        if (escaped.length > 0) {
          setLives(current => {
            const newLives = current - escaped.length;
            if (newLives <= 0) {
              setGameState('gameover');
              return 0;
            }
            return newLives;
          });
        }

        return updated.filter(obj => obj.y <= 100);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState]);

  // -----------------------------
  // LEVEL UP — FIXED VERSION
  // -----------------------------
  useEffect(() => {
    if (gameState !== 'playing') return;

    const threshold = level * 100;

    if (score >= threshold && score >= lastLevelScore + 100) {
      setLevel(prev => prev + 1);
      setLastLevelScore(score);  // FIX BUG: prevents multi-level jump
    }
  }, [score, level, lastLevelScore, gameState]);

  // -----------------------------
  // GUN ROTATION
  // -----------------------------
  useEffect(() => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = gameAreaRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height - 40;

      const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
      setRotationAngle((angle * 180) / Math.PI);
    };

    gameAreaRef.current.addEventListener('mousemove', handleMouseMove);
    return () => gameAreaRef.current?.removeEventListener('mousemove', handleMouseMove);
  }, [gameState]);

  // -----------------------------
  // RENDER — MENU, GAME, GAMEOVER
  // -----------------------------

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-4xl w-full">
          <Target className="w-24 h-24 mx-auto text-red-500" />
          <h1 className="text-6xl font-bold text-white">Shooter Game</h1>
          <p className="text-xl text-gray-300">
            Éliminez les cibles avant qu'elles ne s'échappent!
          </p>

          <button
            onClick={startGame}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-lg transform transition hover:scale-105 shadow-lg"
          >
            Commencer
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/90 p-12 rounded-2xl shadow-2xl text-center space-y-6 max-w-md">
          <Trophy className="w-20 h-20 mx-auto text-yellow-500" />
          <h2 className="text-4xl font-bold text-white">Game Over!</h2>

          <p className="text-5xl font-bold text-white">{score} points</p>
          <p className="text-2xl font-bold text-blue-400">Niveau : {level}</p>

          <button
            onClick={startGame}
            className="w-full px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-lg shadow-lg"
          >
            Rejouer
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------
  // GAME SCREEN
  // -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6">
        
        {/* HUD */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-6">
            <div className="bg-slate-800/80 px-6 py-3 rounded-lg shadow-lg">
              <p className="text-gray-400 text-sm">Score</p>
              <p className="text-3xl font-bold text-white">{score}</p>
            </div>

            <div className="bg-slate-800/80 px-6 py-3 rounded-lg shadow-lg">
              <p className="text-gray-400 text-sm">Niveau</p>
              <p className="text-3xl font-bold text-blue-400">{level}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-10 h-10 ${
                  i < lives ? "text-red-500 fill-red-500" : "text-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* GAME ZONE */}
        <div
          ref={gameAreaRef}
          className="relative bg-slate-800/50 rounded-2xl shadow-2xl border-4 border-slate-700 overflow-hidden"
          style={{ height: "70vh" }}
        >
          {/* PLAYER */}
          <div
            className="absolute left-1/2 bottom-0 pointer-events-none z-10"
            style={{ transform: "translateX(-50%)" }}
          >
            <div className="relative flex flex-col items-center">
              <div className="w-12 h-16 bg-slate-700 rounded-t-lg border-2 border-slate-500" />

              <div
                className="absolute bottom-12 left-1/2"
                style={{
                  transform: `translateX(-50%) rotate(${rotationAngle}deg)`,
                  transformOrigin: "center center",
                }}
              >
                <div className="w-32 h-4 bg-slate-800 rounded-lg border-2 border-slate-600 shadow-lg" />
              </div>
            </div>
          </div>

          {/* TARGETS */}
          {objects.map((obj) => {
            const target = targetImages.find((t) => t.id === obj.imageType)!;
            const IconComponent = target.icon;
            const colors = getColorClasses(target.color);

            return (
              <button
                key={obj.id}
                onClick={() => handleObjectClick(obj.id)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition"
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  width: `${obj.size}px`,
                  height: `${obj.size}px`,
                }}
              >
                <div className="relative w-full h-full">
                  <div className={`absolute inset-0 ${colors.bg} rounded-full animate-ping opacity-50`} />
                  <div
                    className={`relative bg-gradient-to-br ${colors.gradient} rounded-full w-full h-full flex items-center justify-center shadow-lg border-2 ${colors.border}`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
