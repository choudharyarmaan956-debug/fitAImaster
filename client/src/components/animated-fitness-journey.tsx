import React from 'react';

export default function AnimatedFitnessJourney() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 feature-gradient-purple opacity-20 animate-gradient-shift"></div>
      
      {/* Animated SVG Journey Paths */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 800"
      >
        {/* Main Journey Path */}
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--svg-path-start)" />
            <stop offset="50%" stopColor="var(--svg-path-middle)" />
            <stop offset="100%" stopColor="var(--svg-path-end)" />
          </linearGradient>
          
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--svg-glow-start)" />
            <stop offset="50%" stopColor="var(--svg-glow-middle)" />
            <stop offset="100%" stopColor="var(--svg-glow-end)" />
          </linearGradient>
        </defs>

        {/* Background Journey Paths */}
        <path
          d="M-100,700 Q200,600 400,500 T800,300 Q1000,200 1300,100"
          stroke="url(#pathGradient)"
          strokeWidth="3"
          fill="none"
          opacity="0.4"
          className="animate-pulse"
        />
        
        <path
          d="M-50,750 Q300,650 500,550 T900,350 Q1100,250 1350,150"
          stroke="url(#pathGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />

        {/* Main Glowing Journey Path */}
        <path
          d="M-50,600 Q250,500 450,400 T850,200 Q1050,100 1250,50"
          stroke="url(#glowGradient)"
          strokeWidth="4"
          fill="none"
          opacity="0.7"
          className="drop-shadow-lg"
        >
          <animate
            attributeName="stroke-dasharray"
            values="0,1000;1000,1000;1000,0"
            dur="8s"
            repeatCount="indefinite"
          />
        </path>

        {/* Animated Journey Dots */}
        {/* Fast Moving Dots */}
        <circle r="4" fill="var(--svg-glow-start)" className="drop-shadow-md">
          <animateMotion
            dur="12s"
            repeatCount="indefinite"
            path="M-50,600 Q250,500 450,400 T850,200 Q1050,100 1250,50"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>

        <circle r="3" fill="var(--svg-glow-middle)" className="drop-shadow-md">
          <animateMotion
            dur="15s"
            repeatCount="indefinite"
            path="M-50,600 Q250,500 450,400 T850,200 Q1050,100 1250,50"
            begin="2s"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="15s"
            repeatCount="indefinite"
            begin="2s"
          />
        </circle>

        <circle r="5" fill="var(--svg-glow-end)" className="drop-shadow-md">
          <animateMotion
            dur="10s"
            repeatCount="indefinite"
            path="M-50,600 Q250,500 450,400 T850,200 Q1050,100 1250,50"
            begin="4s"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="10s"
            repeatCount="indefinite"
            begin="4s"
          />
        </circle>

        {/* Slower Moving Dots */}
        <circle r="3" fill="var(--svg-path-start)" className="drop-shadow-sm">
          <animateMotion
            dur="20s"
            repeatCount="indefinite"
            path="M-100,700 Q200,600 400,500 T800,300 Q1000,200 1300,100"
            begin="1s"
          />
          <animate
            attributeName="opacity"
            values="0;0.8;0.8;0"
            dur="20s"
            repeatCount="indefinite"
            begin="1s"
          />
        </circle>

        <circle r="2" fill="rgba(219, 39, 119, 0.6)" className="drop-shadow-sm">
          <animateMotion
            dur="18s"
            repeatCount="indefinite"
            path="M-50,750 Q300,650 500,550 T900,350 Q1100,250 1350,150"
            begin="3s"
          />
          <animate
            attributeName="opacity"
            values="0;0.7;0.7;0"
            dur="18s"
            repeatCount="indefinite"
            begin="3s"
          />
        </circle>

        {/* Milestone Markers */}
        <circle cx="450" cy="400" r="8" fill="rgba(147, 51, 234, 0.4)" className="animate-pulse">
          <animate
            attributeName="r"
            values="8;12;8"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="850" cy="200" r="8" fill="rgba(219, 39, 119, 0.4)" className="animate-pulse">
          <animate
            attributeName="r"
            values="8;12;8"
            dur="3s"
            repeatCount="indefinite"
            begin="1s"
          />
        </circle>

        {/* Particle Trails */}
        <g opacity="0.6">
          <circle r="1" fill="rgba(147, 51, 234, 0.8)">
            <animateMotion
              dur="8s"
              repeatCount="indefinite"
              path="M-50,600 Q250,500 450,400 T850,200 Q1050,100 1250,50"
              begin="0.5s"
            />
          </circle>
          <circle r="1" fill="rgba(219, 39, 119, 0.8)">
            <animateMotion
              dur="8s"
              repeatCount="indefinite"
              path="M-50,600 Q250,500 450,400 T850,200 Q1050,100 1250,50"
              begin="1s"
            />
          </circle>
          <circle r="1" fill="rgba(245, 158, 11, 0.8)">
            <animateMotion
              dur="8s"
              repeatCount="indefinite"
              path="M-50,600 Q250,500 450,400 T850,200 Q1050,100 1250,50"
              begin="1.5s"
            />
          </circle>
        </g>
      </svg>

      {/* Floating Energy Particles */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          {/* Energy particles that float upward */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            />
          ))}
          
          {[...Array(8)].map((_, i) => (
            <div
              key={`pink-${i}`}
              className="absolute w-1 h-1 bg-pink-400 rounded-full opacity-40 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${6 + Math.random() * 3}s`,
              }}
            />
          ))}

          {[...Array(6)].map((_, i) => (
            <div
              key={`amber-${i}`}
              className="absolute w-3 h-3 bg-amber-400 rounded-full opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}