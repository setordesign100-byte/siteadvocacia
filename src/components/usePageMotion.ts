import { useEffect } from 'react';

export function usePageMotion() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const running = new Set<Animation>();
    // Content is visible by default; animation is a progressive enhancement.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (preference.matches || typeof entry.target.animate !== 'function') return;
        const delay = Number((entry.target as HTMLElement).dataset.revealDelay || 0);
        const animation = entry.target.animate([
          { opacity: 0, transform: 'translateY(22px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 650, delay, easing: 'cubic-bezier(.2,.65,.25,1)' });
        running.add(animation);
        animation.finished.then(() => running.delete(animation)).catch(() => running.delete(animation));
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
    const progress = document.querySelector<HTMLElement>('.reading-progress');
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const value = total > 0 ? Math.max(0, Math.min(1, window.scrollY / total)) : 0;
      progress?.style.setProperty('transform', `scaleX(${value})`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };
    const onPreference = () => { if (preference.matches) running.forEach(animation => animation.cancel()); };
    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    preference.addEventListener('change', onPreference);
    return () => {
      observer.disconnect();
      running.forEach(animation => animation.cancel());
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      preference.removeEventListener('change', onPreference);
    };
  }, []);
}
