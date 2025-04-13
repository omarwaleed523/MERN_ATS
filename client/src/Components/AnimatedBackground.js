import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    
    // Set canvas dimensions to match window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Function to get CSS variable to maintain DaisyUI theme compatibility
    const getThemeColor = (cssVar, opacity = 1) => {
      // Get CSS variable from document root (including fallback if missing)
      const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar) || '#6366f1';
      // If the color is in hex format, convert to RGB for opacity
      if (color.trim().startsWith('#')) {
        const hex = color.trim().replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      // Handle rgb format
      if (color.trim().startsWith('rgb')) {
        return color.trim().replace(')', `, ${opacity})`).replace('rgb', 'rgba');
      }
      return color.trim();
    };
    
    // Use theming colors from DaisyUI
    const primaryColor = getThemeColor('--p', 0.8);
    const secondaryColor = getThemeColor('--s', 0.5);
    const accentColor = getThemeColor('--a', 0.6);
    
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        
        // Use theme colors for particles
        const colorChoice = Math.random();
        if (colorChoice < 0.5) {
          this.color = primaryColor;
        } else if (colorChoice < 0.8) {
          this.color = secondaryColor;
        } else {
          this.color = accentColor;
        }
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.size > 0.2) this.size -= 0.1;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const init = () => {
      particles = [];
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 10000);
      for (let i = 0; i < numberOfParticles; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    };
    
    const connect = () => {
      const maxDistance = 150;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = 0.2 - (distance / maxDistance) * 0.2;
            ctx.strokeStyle = getThemeColor('--p', opacity);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        
        // Remove particles that are too small
        if (particle.size <= 0.2) {
          particles.splice(index, 1);
        }
      });
      
      // Add new particles to replace the ones that have been removed
      while (particles.length < Math.floor((canvas.width * canvas.height) / 10000)) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
      
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    init();
    animate();
    
    // Mouse interaction
    const mouse = {
      x: undefined,
      y: undefined,
    };
    
    canvas.addEventListener('mousemove', (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
      
      // Add particles at mouse position
      for (let i = 0; i < 2; i++) {
        particles.push(new Particle(mouse.x, mouse.y));
      }
    });
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10" 
      aria-hidden="true"
    />
  );
};

export default AnimatedBackground;