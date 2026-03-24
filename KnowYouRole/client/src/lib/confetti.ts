import confetti from 'canvas-confetti';

export function celebrateAchievement(type: 'badge' | 'milestone' | 'premium' | 'streak' = 'badge') {
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  switch (type) {
    case 'badge':
      confetti({
        ...defaults,
        particleCount: 50,
        spread: 60,
        colors: ['#f59e0b', '#10b981', '#6366f1'],
      });
      break;
      
    case 'milestone':
      const duration = 2000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#8b5cf6', '#a855f7'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#8b5cf6', '#a855f7'],
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      break;
      
    case 'premium':
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#10b981', '#059669'],
        shapes: ['star', 'circle'],
        scalar: 1.2,
      });
      break;
      
    case 'streak':
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#ef4444', '#f97316', '#eab308'],
        startVelocity: 25,
        gravity: 1.2,
      });
      break;
  }
}

export function fireConfettiEmoji(emoji: string = '🎉') {
  const scalar = 2;
  const shape = confetti.shapeFromText({ text: emoji, scalar });

  confetti({
    shapes: [shape],
    scalar,
    particleCount: 20,
    spread: 50,
    origin: { y: 0.7 },
  });
}

export function celebrateCompletion() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
