import { ReactNode } from 'react';
import { useDynamicBackground, Section } from '@/hooks/use-dynamic-background';

interface DynamicBackgroundWrapperProps {
  section: Section;
  children: ReactNode;
  className?: string;
}

export default function DynamicBackgroundWrapper({ 
  section, 
  children, 
  className = '' 
}: DynamicBackgroundWrapperProps) {
  const {
    backgroundClasses,
    particles,
    particleAnimationClass,
    overlayGradient,
    sectionTransition
  } = useDynamicBackground(section);

  return (
    <div className={`${backgroundClasses} ${sectionTransition} ${className}`}>
      {/* Dynamic Background Gradient with Wave Animation */}
      <div className="absolute inset-0">
        {/* Overlay for depth */}
        <div className={overlayGradient}></div>
      </div>

      {/* Section-Specific Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute text-2xl opacity-20 ${particleAnimationClass}`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
            }}
            data-testid={`particle-${section}-${particle.id}`}
          >
            {particle.icon}
          </div>
        ))}
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}