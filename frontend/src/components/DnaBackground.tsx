import { useEffect, useRef } from "react";

export default function DnaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track resizing
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse coordinates relative to screen center
    const handleMouseMove = (e: MouseEvent) => {
      const scaleX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const scaleY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      mouseRef.current.targetX = scaleX * 0.45; // Amplified deflection and rotation
      mouseRef.current.targetY = scaleY * 0.45;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Particles/Nodes config
    const pointsCount = 68; // Increased density for elongation
    const helixRadius = Math.min(width, height) * 0.05 + 32; // Narrower and more elegant
    const focalLength = 350;
    let phaseAngle = 0;

    // Background floating data nodes
    interface FieldNode {
      x: number;
      y: number;
      z: number;
      size: number;
      speedY: number;
      opacity: number;
      jitterFreq: number;
    }
    const bgNodesList: FieldNode[] = Array.from({ length: 60 }, () => ({
      x: (Math.random() - 0.5) * width * 1.6,
      y: (Math.random() - 0.5) * height * 1.6,
      z: Math.random() * 600 - 300,
      size: Math.random() * 2.0 + 0.5,
      speedY: Math.random() * 0.25 + 0.05,
      opacity: Math.random() * 0.4 + 0.1,
      jitterFreq: Math.random() * 0.02,
    }));

    interface HelixConfig {
      id: string;
      pointsCount: number;
      scaleFactor: number;
      normalizedX: number; // static percentage offset horizontally (-0.45 to +0.45)
      normalizedY: number; // static percentage offset vertically (-0.35 to +0.35)
      opacityMultiplier: number;
      colorA: string;
      colorA_glow: string;
      colorB: string;
      colorB_glow: string;
      gradColorFrom: string;
      gradColorMid: string;
      gradColorTo: string;
      pulseGlow: string;
      radiusScale: number;
      angleMultiplier: number;
      phaseShift: number;
      rotationMultiplier: number;
      zOffset: number;
      ySpanScale: number; // percentage of height of screen
      hasPulses: boolean;
      glowBlur: number;
    }

    const compiledHelicesList: HelixConfig[] = [];

    // Helix 0: Primary center piece (always beautifully active near the center)
    compiledHelicesList.push({
      id: "primary-center",
      pointsCount: 70,
      scaleFactor: 1.0,
      normalizedX: 0.05,
      normalizedY: -0.05,
      opacityMultiplier: 1.0,
      colorA: "rgb(6, 182, 212)",
      colorA_glow: "rgb(6, 182, 212)",
      colorB: "rgb(168, 85, 247)",
      colorB_glow: "rgb(168, 85, 247)",
      gradColorFrom: "rgba(6, 182, 212, 0.40)",
      gradColorMid: "rgba(99, 102, 241, 0.20)",
      gradColorTo: "rgba(168, 85, 247, 0.40)",
      pulseGlow: "rgb(129, 140, 248)",
      radiusScale: 1.0,
      angleMultiplier: 5.6,
      phaseShift: 0,
      rotationMultiplier: 1.0,
      zOffset: 0,
      ySpanScale: 0.65,
      hasPulses: true,
      glowBlur: 10,
    });

    const themes = [
      { // Cyan / Indigo
        colorA: "rgb(6, 182, 212)", colorA_glow: "rgb(8, 145, 178)",
        colorB: "rgb(99, 102, 241)", colorB_glow: "rgb(67, 56, 202)",
        gradColorFrom: "rgba(6, 182, 212, 0.15)", gradColorMid: "rgba(99, 102, 241, 0.10)", gradColorTo: "rgba(99, 102, 241, 0.15)",
        pulseGlow: "rgba(129, 140, 248, 0.4)"
      },
      { // Purple / Pink
        colorA: "rgb(168, 85, 247)", colorA_glow: "rgb(147, 51, 234)",
        colorB: "rgb(236, 72, 153)", colorB_glow: "rgb(219, 39, 119)",
        gradColorFrom: "rgba(168, 85, 247, 0.12)", gradColorMid: "rgba(236, 72, 153, 0.06)", gradColorTo: "rgba(236, 72, 153, 0.12)",
        pulseGlow: "rgba(236, 72, 153, 0.3)"
      },
      { // Emerald / Teal
        colorA: "rgb(52, 211, 153)", colorA_glow: "rgb(16, 185, 129)",
        colorB: "rgb(6, 182, 212)", colorB_glow: "rgb(8, 145, 178)",
        gradColorFrom: "rgba(52, 211, 153, 0.14)", gradColorMid: "rgba(6, 182, 212, 0.05)", gradColorTo: "rgba(6, 182, 212, 0.14)",
        pulseGlow: "rgba(52, 211, 153, 0.3)"
      },
      { // Indigo / Blue
        colorA: "rgb(129, 140, 248)", colorA_glow: "rgb(79, 70, 229)",
        colorB: "rgb(59, 130, 246)", colorB_glow: "rgb(37, 99, 235)",
        gradColorFrom: "rgba(129, 140, 248, 0.15)", gradColorMid: "rgba(59, 130, 246, 0.08)", gradColorTo: "rgba(59, 130, 246, 0.15)",
        pulseGlow: "rgba(129, 140, 248, 0.3)"
      }
    ];

    // Generate 8 more separate DNA strands in random positions
    for (let index = 1; index <= 8; index++) {
      const theme = themes[(index - 1) % themes.length];
      const scale = Math.random() * 0.42 + 0.32; // scales from 0.32 to 0.74
      const zOffset = Math.random() * 190 + 70; // deeper screen coordinates (depth sorting)
      const rotationMultiplier = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.50 + 0.35); // speed and vector axis directions
      const opacity = Math.random() * 0.11 + 0.07; // elegant high-contrast transparency
      
      // Fully randomized coordinates across screen bounds
      let normX = (Math.random() * 0.92 - 0.46); // random range from -0.46 to +0.46
      let normY = (Math.random() * 0.72 - 0.36); // random range from -0.36 to +0.36

      compiledHelicesList.push({
        id: `random-bg-${index}`,
        pointsCount: Math.round(Math.random() * 15 + 35), // 35 to 50 points based on random bounds
        scaleFactor: scale,
        normalizedX: normX,
        normalizedY: normY,
        opacityMultiplier: opacity,
        colorA: theme.colorA,
        colorA_glow: theme.colorA_glow,
        colorB: theme.colorB,
        colorB_glow: theme.colorB_glow,
        gradColorFrom: theme.gradColorFrom,
        gradColorMid: theme.gradColorMid,
        gradColorTo: theme.gradColorTo,
        pulseGlow: theme.pulseGlow,
        radiusScale: scale * 1.1,
        angleMultiplier: Math.random() * 2.2 + 3.2, // 3.2 to 5.4 twist configuration limits
        phaseShift: Math.random() * Math.PI * 2,
        rotationMultiplier: rotationMultiplier,
        zOffset: zOffset,
        ySpanScale: scale * 0.65, // vertical spans mapped to height proportion
        hasPulses: Math.random() > 0.65, // elegant pulse nodes
        glowBlur: Math.random() > 0.5 ? 2 : 0, 
      });
    }

    // Principal rendering loop
    const renderLoop = () => {
      // Background gradient cleanup
      ctx.fillStyle = "rgba(4, 6, 15, 0.96)";
      ctx.fillRect(0, 0, width, height);

      // Interpolate mouse movement with elegant easing/damping
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const centerX = width * 0.5;
      const centerY = height * 0.5;

      // Base rotation angles
      phaseAngle += 0.005; // Slightly faster natural rotation

      // Draw background drift entities
      bgNodesList.forEach((node) => {
        // Apply vertical drift
        node.y += node.speedY;
        if (node.y > height * 0.8) {
          node.y = -height * 0.8;
          node.x = (Math.random() - 0.5) * width * 1.6;
        }

        // Apply mouse tilt and drift offsets
        const jitter = Math.sin(phaseAngle * 5 * node.jitterFreq) * 3;
        const tiltedX = node.x - mouse.x * node.z * 0.8 + jitter;
        const tiltedY = node.y - mouse.y * node.z * 0.8;

        // Perspective scale factor
        const scale = focalLength / (focalLength + node.z);
        const screenX = centerX + tiltedX * scale;
        const screenY = centerY + tiltedY * scale;

        if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, node.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 211, 238, ${node.opacity * scale})`;
          ctx.fill();
        }
      });

      // DNA Helix math model elements
      interface RenderableObject {
        type: "point" | "rung";
        z: number; // For Painter's Algorithm depth sort
        draw: () => void;
      }

      const elements: RenderableObject[] = [];

      compiledHelicesList.forEach((h) => {
        const hRad = helixRadius * h.radiusScale;
        const xOffset = h.normalizedX * width;
        const yOffset = h.normalizedY * height;
        const ySpan = height * h.ySpanScale;
        
        for (let i = 0; i < h.pointsCount; i++) {
          const pct = (i / (h.pointsCount - 1)) * 2 - 1; // -1 to 1
          const yBase = pct * ySpan + yOffset;

          // Randomized Twist Waves math equations with speed variance
          const randomizedJitter = Math.sin(pct * Math.PI * 3 + phaseAngle * 1.5 * h.rotationMultiplier) * 0.12;
          const helixAngle = pct * Math.PI * h.angleMultiplier + phaseAngle * h.rotationMultiplier + h.phaseShift + randomizedJitter;

          // Base coordinates for double helix strands
          const xA = Math.cos(helixAngle) * hRad;
          const zA = Math.sin(helixAngle) * hRad;

          const xB = Math.cos(helixAngle + Math.PI) * hRad;
          const zB = Math.sin(helixAngle + Math.PI) * hRad;

          // Apply tilt transformation matrices (Y/X rotation based on mouse orientation)
          const cosY = Math.cos(mouse.x * 1.3);
          const sinY = Math.sin(mouse.x * 1.3);
          const cosX = Math.cos(mouse.y * 1.3);
          const sinX = Math.sin(mouse.y * 1.3);

          // 3D rotations with slight structural noise
          const structuralNoise = Math.sin(i * 0.8) * 2.5 * h.scaleFactor;

          // Strand A transformations
          const rxA1 = (xA + structuralNoise) * cosY - zA * sinY;
          const rzA1 = (xA + structuralNoise) * sinY + zA * cosY;
          const ryA  = yBase * cosX - rzA1 * sinX;
          const rxA  = rxA1;
          const rzA  = yBase * sinX + rzA1 * cosX + h.zOffset;

          // Strand B transformations
          const rxB1 = (xB - structuralNoise) * cosY - zB * sinY;
          const rzB1 = (xB - structuralNoise) * sinY + zB * cosY;
          const ryB  = yBase * cosX - rzB1 * sinX;
          const rxB  = rxB1;
          const rzB  = yBase * sinX + rzB1 * cosX + h.zOffset;

          // Z-indices calculated for depth sorting
          const zMid = (rzA + rzB) / 2;

          // Screen translations and parallax offsets
          const interactiveShiftX = mouse.x * 140 * h.scaleFactor + xOffset;
          const interactiveShiftY = mouse.y * 70 * h.scaleFactor;

          // Perspective scaling
          const scaleA = focalLength / (focalLength + rzA);
          const posXA = (centerX + interactiveShiftX) + rxA * scaleA;
          const posYA = (centerY + interactiveShiftY) + ryA * scaleA;

          const scaleB = focalLength / (focalLength + rzB);
          const posXB = (centerX + interactiveShiftX) + rxB * scaleB;
          const posYB = (centerY + interactiveShiftY) + ryB * scaleB;

          // Register Node A
          elements.push({
            type: "point",
            z: rzA,
            draw: () => {
              ctx.beginPath();
              const size = (5 * scaleA * h.scaleFactor) * (1 - rzA / 600);
              ctx.arc(posXA, posYA, Math.max(0.3, size), 0, Math.PI * 2);
              
              ctx.fillStyle = h.colorA;
              if (h.glowBlur > 0) {
                ctx.shadowColor = h.colorA_glow;
                ctx.shadowBlur = (h.glowBlur + scaleA * 5) * h.opacityMultiplier;
              }
              ctx.globalAlpha = h.opacityMultiplier;
              ctx.fill();
              
              // Core accent highlight (for primary layers only)
              if (h.scaleFactor > 0.45) {
                ctx.beginPath();
                ctx.arc(posXA, posYA, 1.4 * scaleA * h.scaleFactor, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.globalAlpha = h.opacityMultiplier * 0.9;
                ctx.fill();
              }
              
              ctx.shadowBlur = 0; // reset
              ctx.globalAlpha = 1.0;
            },
          });

          // Register Node B
          elements.push({
            type: "point",
            z: rzB,
            draw: () => {
              ctx.beginPath();
              const size = (5 * scaleB * h.scaleFactor) * (1 - rzB / 600);
              ctx.arc(posXB, posYB, Math.max(0.3, size), 0, Math.PI * 2);
              
              ctx.fillStyle = h.colorB;
              if (h.glowBlur > 0) {
                ctx.shadowColor = h.colorB_glow;
                ctx.shadowBlur = (h.glowBlur + scaleB * 5) * h.opacityMultiplier;
              }
              ctx.globalAlpha = h.opacityMultiplier;
              ctx.fill();
              
              // Core accent highlight
              if (h.scaleFactor > 0.45) {
                ctx.beginPath();
                ctx.arc(posXB, posYB, 1.4 * scaleB * h.scaleFactor, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.globalAlpha = h.opacityMultiplier * 0.9;
                ctx.fill();
              }
              
              ctx.shadowBlur = 0; // reset
              ctx.globalAlpha = 1.0;
            },
          });

          // Register connecting ladder rung
          elements.push({
            type: "rung",
            z: zMid,
            draw: () => {
              ctx.beginPath();
              ctx.moveTo(posXA, posYA);
              ctx.lineTo(posXB, posYB);
              
              // Linear gradient map connections
              const grad = ctx.createLinearGradient(posXA, posYA, posXB, posYB);
              grad.addColorStop(0, h.gradColorFrom);
              grad.addColorStop(0.5, h.gradColorMid);
              grad.addColorStop(1, h.gradColorTo);
              
              ctx.strokeStyle = grad;
              ctx.lineWidth = 1.0 * ((scaleA + scaleB) / 2) * h.scaleFactor;
              ctx.globalAlpha = h.opacityMultiplier;
              ctx.stroke();
              ctx.globalAlpha = 1.0;

              // Sliding pathway pulses (exclusive to forward or designated layers)
              if (h.hasPulses) {
                const rungPulseRatio = (Math.sin(phaseAngle * 2.4 + i * 0.4) + 1) / 2; // 0 to 1
                const pulseX = posXA + (posXB - posXA) * rungPulseRatio;
                const pulseY = posYA + (posYB - posYA) * rungPulseRatio;
                ctx.beginPath();
                ctx.arc(pulseX, pulseY, 2.2 * ((scaleA + scaleB) / 2) * h.scaleFactor, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.shadowColor = h.pulseGlow;
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;
              }
            },
          });
        }
      });

      // Depth sorting items based on camera depth coordinate Z (descending so back items are drawn first)
      elements.sort((a, b) => b.z - a.z);

      // Fire individual ordered draws
      elements.forEach((elem) => elem.draw());

      // Trigger standard FPS loop
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Clean listeners on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none w-full h-full block">
      <div className="helix-pattern opacity-30" />
      <canvas
        id="dna-glowing-canvas"
        ref={canvasRef}
        className="w-full h-full block"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
