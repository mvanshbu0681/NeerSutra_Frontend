import { gsap } from "gsap";

// Animation presets for the chatbot
export const chatbotAnimations = {
  // Sidebar animations
  sidebar: {
    slideIn: (element) => {
      return gsap.fromTo(
        element,
        { x: -300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
    },

    slideOut: (element) => {
      return gsap.to(element, {
        x: -300,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      });
    },

    historyItemsStagger: (elements) => {
      return gsap.fromTo(
        elements,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    },

    glowOnHover: (element) => {
      const tl = gsap.timeline({ paused: true });
      tl.to(element, {
        boxShadow:
          "0 0 30px rgba(0, 224, 255, 0.4), 0 0 60px rgba(0, 224, 255, 0.2)",
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
      });
      return tl;
    },
  },

  // Chat window animations
  chatWindow: {
    messageSlideIn: (element, fromRight = false) => {
      const startX = fromRight ? 50 : -50;
      return gsap.fromTo(
        element,
        { x: startX, opacity: 0, y: 20 },
        { x: 0, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    },

    autoScroll: (container) => {
      return gsap.to(container, {
        scrollTop: container.scrollHeight,
        duration: 0.5,
        ease: "power2.out",
      });
    },

    typingIndicator: (element) => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(element.children, {
        y: -5,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.inOut",
      });
      return tl;
    },
  },

  // Input animations
  input: {
    expandOnFocus: (element) => {
      return gsap.to(element, {
        scale: 1.02,
        boxShadow: "0 0 20px rgba(0, 224, 255, 0.3)",
        duration: 0.3,
        ease: "power2.out",
      });
    },

    contractOnBlur: (element) => {
      return gsap.to(element, {
        scale: 1,
        boxShadow: "0 0 0px rgba(0, 224, 255, 0)",
        duration: 0.3,
        ease: "power2.out",
      });
    },

    sendButtonPulse: (element) => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(element, {
        scale: 1.1,
        boxShadow: "0 0 20px rgba(0, 224, 255, 0.6)",
        duration: 0.8,
        ease: "power2.inOut",
      });
      return tl;
    },

    messageSubmit: (element) => {
      const tl = gsap.timeline();
      tl.fromTo(
        element,
        { scale: 1, y: 0 },
        { scale: 0.9, y: -10, duration: 0.1, ease: "power2.in" }
      ).to(element, {
        scale: 1,
        y: 0,
        duration: 0.2,
        ease: "back.out(1.7)",
      });
      return tl;
    },
  },

  // Background effects
  background: {
    oceanWaves: (elements) => {
      const tl = gsap.timeline({ repeat: -1 });
      elements.forEach((element, index) => {
        tl.to(
          element,
          {
            y: "+=20",
            duration: 2 + index * 0.3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          },
          index * 0.2
        );
      });
      return tl;
    },

    floatingParticles: (elements) => {
      elements.forEach((element, index) => {
        gsap.to(element, {
          y: "random(-50, 50)",
          x: "random(-30, 30)",
          rotation: "random(-180, 180)",
          duration: "random(3, 6)",
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: index * 0.2,
        });
      });
    },
  },

  // Modal animations
  modal: {
    fadeScaleIn: (element) => {
      return gsap.fromTo(
        element,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    },

    fadeScaleOut: (element) => {
      return gsap.to(element, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    },

    staggerContent: (elements) => {
      return gsap.fromTo(
        elements,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    },
  },

  // Loading animations
  loading: {
    argoFloatBounce: (element) => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(element, {
        y: -20,
        duration: 1,
        ease: "power2.out",
      }).to(element, {
        y: 0,
        duration: 1,
        ease: "bounce.out",
      });
      return tl;
    },

    rippleEffect: (element) => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.fromTo(
        element,
        { scale: 0, opacity: 1 },
        { scale: 1.5, opacity: 0, duration: 2, ease: "power2.out" }
      );
      return tl;
    },
  },
};

// Utility functions
export const animationUtils = {
  killAll: (timeline) => {
    if (timeline) timeline.kill();
  },

  setInitialState: (element, props) => {
    gsap.set(element, props);
  },

  createMasterTimeline: () => {
    return gsap.timeline();
  },

  // Mobile optimization - reduced animations for performance
  isMobile: () => window.innerWidth <= 768,

  getMobileOptimizedDuration: (normalDuration) => {
    return animationUtils.isMobile() ? normalDuration * 0.7 : normalDuration;
  },
};

export default chatbotAnimations;
