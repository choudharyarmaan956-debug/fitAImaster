import { useState, useEffect } from 'react';

type Section = 'dashboard' | 'nutrition' | 'workouts' | 'alarms' | 'progress' | 'landing';
type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface BackgroundParticle {
  id: number;
  icon: string;
  x: number;
  y: number;
  delay: number;
}

// Section-specific particle emoji sets
const sectionParticles = {
  dashboard: ['💪', '🏃‍♀️', '🎯', '⚡', '🔥', '🌟', '💫', '✨', '🚀', '🏆', '💎', '⭐', '🎉', '🎊', '💥'],
  nutrition: ['🍎', '🥗', '🥑', '🍓', '🥕', '🥦', '🍗', '🐟', '🥤', '🍊', '🍌', '🥒', '🍅', '🥬', '🥜'],
  workouts: ['💪', '🏋️‍♀️', '🤸‍♂️', '🏃‍♀️', '⚡', '🔥', '🎯', '🏆', '🥊', '⭐', '💥', '🚀', '💎', '🌟', '✨'],
  alarms: ['⏰', '🌅', '⚡', '💤', '🔔', '⏱️', '🎯', '✨', '🌟', '💫', '🚀', '💪', '🔥', '🌞', '⭐'],
  progress: ['🏆', '📈', '⭐', '🎯', '🔥', '💎', '🚀', '🎉', '📊', '💪', '🌟', '✨', '💫', '🥇', '👑'],
  landing: ['💪', '🎯', '✨', '🚀', '🌟', '💎', '⚡', '🏆', '💫', '🔥', '⭐', '🎉', '💥', '🌈', '🎊']
};

export function useDynamicBackground(section: Section = 'dashboard') {
  const [currentTimeTheme, setCurrentTimeTheme] = useState<TimeOfDay>('morning');
  const [particles, setParticles] = useState<BackgroundParticle[]>([]);
  const [backgroundClasses, setBackgroundClasses] = useState('');

  // Get time-based theme
  const getTimeBasedTheme = (): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  };

  // Generate section-specific background classes
  const generateBackgroundClasses = (section: Section, timeTheme: TimeOfDay): string => {
    const baseClasses = 'relative min-h-screen overflow-hidden transition-all duration-1000 ease-in-out';
    
    // Section-specific time-based themes
    const sectionTimeClass = `${section}-${timeTheme}`;
    const waveClass = `${section}-wave`;
    
    return `${baseClasses} ${sectionTimeClass} ${waveClass}`;
  };

  // Generate particles for current section
  const generateParticles = (section: Section, count: number = 15): BackgroundParticle[] => {
    const sectionEmojis = sectionParticles[section] || sectionParticles.dashboard;
    
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      icon: sectionEmojis[Math.floor(Math.random() * sectionEmojis.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
  };

  // Get particle animation class based on section
  const getParticleAnimationClass = (section: Section): string => {
    switch (section) {
      case 'nutrition': return 'nutrition-particles';
      case 'workouts': return 'workout-particles';
      case 'alarms': return 'alarm-particles';
      case 'progress': return 'progress-particles';
      default: return 'float-animation';
    }
  };

  // Update background theme based on time
  useEffect(() => {
    const updateTheme = () => {
      const newTheme = getTimeBasedTheme();
      setCurrentTimeTheme(newTheme);
      setBackgroundClasses(generateBackgroundClasses(section, newTheme));
    };

    // Update immediately
    updateTheme();

    // Check every minute for time changes
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, [section]);

  // Generate new particles when section changes
  useEffect(() => {
    setParticles(generateParticles(section));
  }, [section]);

  // Get overlay gradient for additional depth
  const getOverlayGradient = (): string => {
    return 'absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent gradient-animation';
  };

  // Get section-specific transition effect
  const getSectionTransition = (): string => {
    return 'section-transition';
  };

  return {
    backgroundClasses,
    particles,
    particleAnimationClass: getParticleAnimationClass(section),
    overlayGradient: getOverlayGradient(),
    sectionTransition: getSectionTransition(),
    currentTimeTheme,
    
    // Utility functions
    getTimeBasedTheme,
    generateBackgroundClasses,
    generateParticles,
  };
}

// Export particle sets for components that need custom particle handling
export { sectionParticles };
export type { Section, TimeOfDay, BackgroundParticle };