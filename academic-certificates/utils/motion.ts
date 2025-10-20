import { Motion } from '@/types/motion'

export function slideInFromLeft({ delay }: Motion) {
  return {
    offScreen: {
      x: -50,
      opacity: 0,
    },
    onScreen: {
      x: 0,
      opacity: 1,
      transition: {
        delay: delay,
        duration: 0.4,
      },
    },
  };
}

export function slideInFromRight({ delay }: Motion) {
  return {
    offScreen: {
      x: 50,
      opacity: 0,
    },
    onScreen: {
      x: 0,
      opacity: 1,
      transition: {
        delay: delay,
        duration: 0.4,
      },
    },
  };
}

export function slideInFromTop({ delay }: Motion) {
  return {
    offScreen: {
      y: -50,
      opacity: 0,
    },
    onScreen: {
      y: 0,
      opacity: 1,
      transition: {
        delay: delay,
        duration: 0.4,
      },
    },
  }
};

export function slideInFromBottom({ delay }: Motion) {
  return {
    offScreen: {
      y: 50,
      opacity: 0,
    },
    onScreen: {
      y: 0,
      opacity: 1,
      transition: {
        delay: delay,
        duration: 0.4,
      },
    },
  }
};

export function zoomIn({ delay }: Motion) {
  return {
    offScreen: {
      scale: 0.7,
      opacity: 0,
    },
    onScreen: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: delay,
        duration: 0.4,
      },
    },
  }
};

export function zoomOut({ delay }: Motion) {
  return {
    offScreen: {
      y: -50,
      opacity: 0,
    },
    onScreen: {
      y: 0,
      opacity: 1,
      transition: {
        delay: delay,
        duration: 0.4,
      },
    },
  }
};