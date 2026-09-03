import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }

// ── Reusable animation presets ──────────────────────────────────────

export function fadeUp(
  target: gsap.TweenTarget,
  options: gsap.TweenVars = {}
) {
  return gsap.fromTo(
    target,
    { opacity: 0, y: 60 },
    { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', ...options }
  )
}

export function fadeIn(
  target: gsap.TweenTarget,
  options: gsap.TweenVars = {}
) {
  return gsap.fromTo(
    target,
    { opacity: 0 },
    { opacity: 1, duration: 0.8, ease: 'power2.out', ...options }
  )
}

export function staggerUp(
  targets: gsap.TweenTarget,
  stagger = 0.1,
  options: gsap.TweenVars = {}
) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 48 },
    { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger, ...options }
  )
}

export function scaleIn(
  target: gsap.TweenTarget,
  options: gsap.TweenVars = {}
) {
  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.92 },
    { opacity: 1, scale: 1, duration: 0.65, ease: 'power2.out', ...options }
  )
}

// ── ScrollTrigger section reveal factory ────────────────────────────

export function scrollReveal(
  trigger: Element,
  targets: gsap.TweenTarget,
  options: { stagger?: number; delay?: number } = {}
) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 56 },
    {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      stagger: options.stagger ?? 0,
      delay: options.delay ?? 0,
      scrollTrigger: {
        trigger,
        start: 'top 82%',
        once: true,
      },
    }
  )
}

// ── Cleanup helper ───────────────────────────────────────────────────

export function killScrollTriggers(triggers: ScrollTrigger[]) {
  triggers.forEach((st) => st.kill())
}
