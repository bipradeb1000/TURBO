
import React, { useEffect, useRef } from 'react';
import { SystemStatus } from '../types';

interface CoreVisualizationProps { status: SystemStatus; }

const CoreVisualization: React.FC<CoreVisualizationProps> = ({ status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const particles: Particle[] = [];
    const pCount = 200; // Increased density

    class Particle {
      angle: number; 
      baseRadius: number; 
      radius: number; 
      size: number; 
      speed: number;
      color: string; 
      alpha: number; 
      oscillation: number;
      phase: number;
      wobble: number;

      constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.baseRadius = 130 + Math.random() * 80;
        this.radius = this.baseRadius;
        this.size = 0.5 + Math.random() * 2;
        this.speed = 0.0003 + Math.random() * 0.001;
        this.color = ['#fb7185', '#fda4af', '#ffffff', '#f43f5e', '#ec4899'][Math.floor(Math.random() * 5)];
        this.alpha = 0.1 + Math.random() * 0.5;
        this.oscillation = Math.random() * Math.PI * 2;
        this.phase = Math.random() * 5000;
        this.wobble = Math.random() * 0.02;
      }

      update(status: SystemStatus) {
        let targetRadius = this.baseRadius;
        let speedMult = 1;

        const now = Date.now();
        const breathe = Math.sin((now + this.phase) / 2000) * 20;
        const heartbeat = Math.pow(Math.sin(now / 1000), 20) * 12;
        
        if (status === 'SPEAKING') {
          targetRadius += (Math.sin(now / 100) * 60) + breathe + heartbeat;
          speedMult = 3.5;
        } else if (status === 'LISTENING') {
          targetRadius += (Math.sin(now / 500) * 25) + breathe + heartbeat;
          speedMult = 1.8;
        } else if (status === 'THINKING' || status === 'ONLINE') {
          speedMult = 6;
          targetRadius += Math.sin(this.oscillation) * 50;
          this.oscillation += 0.2;
        } else if (status === 'ERROR' || status === 'SECURITY_ALERT') {
          targetRadius = 150 + Math.sin(now / 50) * 20;
          speedMult = 10;
        } else {
          targetRadius += breathe + heartbeat;
          speedMult = 0.8;
        }

        this.radius += (targetRadius - this.radius) * 0.08;
        this.angle += (this.speed * speedMult) + (Math.sin(now / 1000) * this.wobble);
      }

      draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        const x = width / 2 + Math.cos(this.angle) * this.radius;
        const y = height / 2 + Math.sin(this.angle) * this.radius;
        
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        
        // Add subtle glow to certain particles
        if (this.size > 1.5) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < pCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();
      
      // Sentient Glow Background
      const scale = 1 + (Math.sin(time / 1500) * 0.08);
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 300 * scale
      );
      
      if (status === 'SECURITY_ALERT') {
        gradient.addColorStop(0, 'rgba(220, 38, 38, 0.2)');
        gradient.addColorStop(1, 'transparent');
      } else {
        gradient.addColorStop(0, 'rgba(244, 63, 94, 0.18)');
        gradient.addColorStop(0.5, 'rgba(244, 63, 94, 0.05)');
        gradient.addColorStop(1, 'transparent');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Neural Connections (Subtle Lines)
      if (status === 'THINKING' || status === 'SPEAKING') {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 20; i++) {
          const p1 = particles[i];
          const p2 = particles[i + 1];
          const x1 = canvas.width / 2 + Math.cos(p1.angle) * p1.radius;
          const y1 = canvas.height / 2 + Math.sin(p1.angle) * p1.radius;
          const x2 = canvas.width / 2 + Math.cos(p2.angle) * p2.radius;
          const y2 = canvas.height / 2 + Math.sin(p2.angle) * p2.radius;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.stroke();
      }

      particles.forEach(p => { 
        p.update(status); 
        p.draw(ctx, canvas.width, canvas.height); 
      });
      animationFrame = requestAnimationFrame(animate);
    };

    const resize = () => {
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener('resize', resize);
    resize(); 
    animate();
    return () => { 
      cancelAnimationFrame(animationFrame); 
      window.removeEventListener('resize', resize); 
    };
  }, [status]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full opacity-95 transition-opacity duration-1000" />
    </div>
  );
};

export default CoreVisualization;
