import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function setupScrollAnimations(selector = '.scroll-reveal') {
  const elements = gsap.utils.toArray(selector);

  elements.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  return () => ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
