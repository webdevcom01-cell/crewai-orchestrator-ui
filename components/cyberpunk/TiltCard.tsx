import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltMax?: number;
  scaleOnHover?: number;
  transitionSpeed?: string;
  enableIdle?: boolean;
  showCorners?: boolean;
  glowOnHover?: boolean;
}

const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  tiltMax = 15,
  scaleOnHover = 1.02,
  transitionSpeed = '0.1s',
  enableIdle = true,
  showCorners = true,
  glowOnHover = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [transform, setTransform] = useState('');
  const idleAnimationRef = useRef<number | undefined>(undefined);
  const idleTimeRef = useRef(0);

  // Idle floating animation
  useEffect(() => {
    if (!enableIdle) return;

    const animateIdle = () => {
      if (isHovering) {
        idleAnimationRef.current = requestAnimationFrame(animateIdle);
        return;
      }

      idleTimeRef.current += 0.015;
      const floatY = Math.sin(idleTimeRef.current) * 8;
      const floatRotateX = Math.cos(idleTimeRef.current * 0.7) * 2;
      const floatRotateY = Math.sin(idleTimeRef.current * 0.5) * 2;

      setTransform(
        `translateY(${floatY}px) rotateX(${floatRotateX}deg) rotateY(${floatRotateY}deg)`
      );

      idleAnimationRef.current = requestAnimationFrame(animateIdle);
    };

    const timeoutId = setTimeout(() => {
      animateIdle();
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      if (idleAnimationRef.current) {
        cancelAnimationFrame(idleAnimationRef.current);
      }
    };
  }, [enableIdle, isHovering]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTransform('rotateX(0deg) rotateY(0deg) scale(1)');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovering) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateY = (mouseX / (rect.width / 2)) * tiltMax;
    const rotateX = -(mouseY / (rect.height / 2)) * tiltMax;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scaleOnHover})`
    );
  };

  return (
    <div className="tilt-card-wrapper" style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        className={`tilt-card ${className}`}
        style={{
          transform,
          transition: isHovering
            ? `transform ${transitionSpeed} ease-out`
            : 'transform 0.5s ease-out',
          boxShadow: isHovering && glowOnHover
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(34, 197, 220, 0.2)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {showCorners && (
          <>
            <div className="card-corner top-right" />
            <div className="card-corner bottom-left" />
          </>
        )}
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
