import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";

function FloatingParticles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 80;

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      sz[i] = Math.random() * 3 + 1;
    }
    return [pos, sz];
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.008) * 0.08;
    const posArr = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.25 + i) * 0.0015;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#6366f1" transparent opacity={0.3} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function FloatingOrbs() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <group ref={group}>
      {[
        { pos: [4, 2, -4] as [number, number, number], color: "#818cf8", scale: 0.8 },
        { pos: [-5, -1, -6] as [number, number, number], color: "#a78bfa", scale: 1.0 },
        { pos: [2, -4, -5] as [number, number, number], color: "#6366f1", scale: 0.5 },
        { pos: [-3, 4, -7] as [number, number, number], color: "#c084fc", scale: 0.7 },
      ].map((orb, i) => (
        <mesh key={i} position={orb.pos}>
          <sphereGeometry args={[orb.scale, 32, 32]} />
          <meshBasicMaterial color={orb.color} transparent opacity={0.05} />
        </mesh>
      ))}
    </group>
  );
}

/* Floating decorative UI "cards" that drift in the background */
function FloatingUIElement({
  className,
  style,
  delay = 0,
  duration = 20,
  rotateOffset = 0,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  rotateOffset?: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotateOffset }}
      animate={{
        opacity: [0, 1, 1],
        y: [0, -20, 0],
        x: [0, 12, 0],
        rotate: [rotateOffset, rotateOffset + 4, rotateOffset - 4, rotateOffset],
      }}
      transition={{
        opacity: { delay, duration: 2 },
        y: { delay, duration, repeat: Infinity, ease: "easeInOut" },
        x: { delay: delay + 2, duration: duration * 1.3, repeat: Infinity, ease: "easeInOut" },
        rotate: { delay, duration: duration * 0.7, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`absolute pointer-events-none select-none ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Gradient blobs */}
      <div className="absolute top-[-15%] right-[-5%] w-[800px] h-[800px] rounded-full bg-primary/[0.04] blur-[150px]" />
      <div className="absolute bottom-[-10%] left-[-8%] w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[120px]" />
      <div className="absolute top-[50%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/[0.025] blur-[100px]" />

      {/* Large decorative UI elements */}

      {/* Mock code editor card - top right */}
      <FloatingUIElement
        className="top-[8%] right-[4%] hidden md:block"
        delay={0.5}
        duration={22}
        rotateOffset={6}
      >
        <div className="w-[320px] rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-lg shadow-primary/[0.03] overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/30">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-intermediate/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-beginner/40" />
            <span className="ml-2 text-[10px] font-mono text-muted-foreground/40">App.tsx</span>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex gap-2">
              <div className="w-12 h-2.5 rounded bg-primary/10" />
              <div className="w-20 h-2.5 rounded bg-muted/40" />
            </div>
            <div className="flex gap-2 pl-4">
              <div className="w-16 h-2.5 rounded bg-primary/8" />
              <div className="w-24 h-2.5 rounded bg-muted/30" />
            </div>
            <div className="flex gap-2 pl-4">
              <div className="w-10 h-2.5 rounded bg-beginner/15" />
              <div className="w-28 h-2.5 rounded bg-muted/25" />
            </div>
            <div className="flex gap-2 pl-8">
              <div className="w-20 h-2.5 rounded bg-primary/6" />
            </div>
            <div className="flex gap-2 pl-4">
              <div className="w-8 h-2.5 rounded bg-muted/30" />
            </div>
            <div className="flex gap-2">
              <div className="w-6 h-2.5 rounded bg-primary/10" />
            </div>
          </div>
        </div>
      </FloatingUIElement>

      {/* Mock dashboard card - left side */}
      <FloatingUIElement
        className="top-[15%] left-[2%] hidden lg:block"
        delay={1.2}
        duration={25}
        rotateOffset={-12}
      >
        <div className="w-[280px] rounded-2xl border border-border/40 bg-card/35 backdrop-blur-sm shadow-lg shadow-primary/[0.03] overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-16 h-2.5 rounded bg-foreground/10" />
              <div className="w-8 h-5 rounded-full bg-beginner/15" />
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1.5 h-16 pt-2">
              {[40, 65, 45, 80, 55, 70, 90, 60].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/15"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <div className="w-12 h-2 rounded bg-muted/30" />
              <div className="w-8 h-2 rounded bg-muted/20" />
            </div>
          </div>
        </div>
      </FloatingUIElement>

      {/* Mock skill tags - bottom right */}
      <FloatingUIElement
        className="bottom-[18%] right-[6%] hidden md:block"
        delay={0.8}
        duration={18}
        rotateOffset={3}
      >
        <div className="w-[260px] rounded-2xl border border-border/40 bg-card/35 backdrop-blur-sm shadow-lg shadow-primary/[0.03] p-4 space-y-3">
          <div className="w-20 h-2.5 rounded bg-foreground/10" />
          <div className="flex flex-wrap gap-1.5">
            {["React", "Node.js", "SQL", "Auth", "API", "CSS"].map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-1 rounded-full border border-primary/15 bg-primary/5 text-primary/40 font-mono"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </FloatingUIElement>

      {/* Mock roadmap steps - bottom left */}
      <FloatingUIElement
        className="bottom-[12%] left-[3%] hidden lg:block"
        delay={1.5}
        duration={24}
        rotateOffset={-6}
      >
        <div className="w-[220px] rounded-2xl border border-border/40 bg-card/35 backdrop-blur-sm shadow-lg shadow-primary/[0.03] p-4 space-y-2.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                <span className="text-[9px] font-mono text-primary/40">{n}</span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-2 rounded bg-foreground/8 w-3/4" />
                <div className="h-1.5 rounded bg-muted/20 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </FloatingUIElement>

      {/* Mock terminal - mid right */}
      <FloatingUIElement
        className="top-[55%] right-[2%] hidden xl:block"
        delay={2}
        duration={20}
        rotateOffset={2}
      >
        <div className="w-[250px] rounded-2xl border border-border/40 bg-foreground/[0.02] backdrop-blur-sm shadow-lg shadow-primary/[0.03] overflow-hidden">
          <div className="px-3 py-2 border-b border-border/30 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
            <span className="text-[9px] font-mono text-muted-foreground/30">terminal</span>
          </div>
          <div className="p-3 space-y-1.5">
            <div className="flex gap-1.5">
              <span className="text-[9px] font-mono text-beginner/30">$</span>
              <div className="w-24 h-2 rounded bg-muted/20" />
            </div>
            <div className="flex gap-1.5">
              <span className="text-[9px] font-mono text-beginner/30">$</span>
              <div className="w-32 h-2 rounded bg-muted/15" />
            </div>
            <div className="flex gap-1.5">
              <span className="text-[9px] font-mono text-primary/25">✓</span>
              <div className="w-20 h-2 rounded bg-beginner/10" />
            </div>
          </div>
        </div>
      </FloatingUIElement>

      {/* Floating geometric accents */}
      <FloatingUIElement className="top-[30%] left-[12%] hidden md:block" delay={0.3} duration={16} rotateOffset={45}>
        <div className="w-16 h-16 rounded-2xl border border-primary/10 bg-primary/[0.02]" />
      </FloatingUIElement>

      <FloatingUIElement className="top-[70%] right-[15%] hidden md:block" delay={1} duration={19}>
        <div className="w-12 h-12 rounded-full border border-accent/10 bg-accent/[0.02]" />
      </FloatingUIElement>

      <FloatingUIElement className="top-[20%] left-[45%] hidden md:block" delay={2.5} duration={21} rotateOffset={12}>
        <div className="w-8 h-8 rounded-lg border border-primary/8 bg-primary/[0.015]" />
      </FloatingUIElement>

      {/* Three.js canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ position: "absolute", inset: 0 }}
        dpr={[1, 1.5]}
      >
        <FloatingParticles />
        <FloatingOrbs />
      </Canvas>
    </div>
  );
}
