import { memo } from "react";

const PARTICLES = [
  { text: "z", size: 8, delay: "0s" },
  { text: "z", size: 10, delay: "0.8s" },
  { text: "Z", size: 13, delay: "1.6s" },
] as const;

const ZZZ_PARTICLE_OFFSET_PX = 6;

export const ZzzParticles = memo(function ZzzParticles() {
  return (
    <div className="absolute top-0 right-0 pointer-events-none" aria-hidden>
      {PARTICLES.map((particle, index) => (
        <span
          key={particle.delay}
          className="absolute pixel-zzz-float text-hive-accent"
          style={{
            fontSize: particle.size,
            fontWeight: 700,
            animationDelay: particle.delay,
            left: index * ZZZ_PARTICLE_OFFSET_PX,
            opacity: 0,
            textShadow: "0 0 4px rgba(167,139,250,0.4)",
          }}
        >
          {particle.text}
        </span>
      ))}
    </div>
  );
});
