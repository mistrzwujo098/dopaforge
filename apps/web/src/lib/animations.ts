// Framer Motion animation presets for DopaForge

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export const slideLeft = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const slideRight = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

export const popIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: { opacity: 0, scale: 0.8 }
};

export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 15
    }
  }
};

export const rotate = {
  animate: { 
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const shimmer = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const shake = {
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

export const wiggle = {
  animate: {
    rotate: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

// Stagger children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Card hover effects
export const cardHover = {
  whileHover: { 
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  whileTap: { 
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

// Button animations
export const buttonHover = {
  whileHover: { 
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  whileTap: { 
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

// Success animation
export const successAnimation = {
  initial: { opacity: 0, scale: 0 },
  animate: { 
    opacity: 1, 
    scale: [0, 1.2, 1],
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Task completion animation
export const taskComplete = {
  animate: {
    scale: [1, 1.1, 0],
    opacity: [1, 1, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

// Loading spinner
export const loadingSpinner = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Confetti burst
export const confettiBurst = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: [0, 1.5, 1],
    opacity: [0, 1, 0],
    transition: {
      duration: 1,
      ease: "easeOut"
    }
  }
};

// XP gain animation
export const xpGain = {
  initial: { y: 0, opacity: 1 },
  animate: { 
    y: -50,
    opacity: 0,
    transition: {
      duration: 1.5,
      ease: "easeOut"
    }
  }
};

// Level up animation
export const levelUp = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: [0, 1.2, 1],
    rotate: [0, 360],
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

// Notification slide
export const notificationSlide = {
  initial: { x: 300, opacity: 0 },
  animate: { 
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },
  exit: { 
    x: 300,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Custom hook for reduced motion
export const useReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
};