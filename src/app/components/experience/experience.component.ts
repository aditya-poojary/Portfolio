import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ExperienceProject {
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  imageUrl: string;
  imageAlt: string;
}

interface ExperienceEntry {
  company: string;
  startDate: string;
  endDate: string;
  projects: ExperienceProject[];
}

@Component({
  selector: 'app-experience',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience.component.html',
  styles: [
    `
      .company-stripe {
        will-change: transform, opacity;
      }

      .project-card {
        will-change: transform, opacity;
      }

      .experience-stage {
        overflow: hidden;
      }

      .experience-track {
        width: max-content;
      }

      .experience-stripes-row,
      .experience-cards-row {
        display: grid;
        grid-template-columns: repeat(3, 58rem);
        gap: 1.25rem;
      }

      .company-stripe-primary {
        grid-column: 1 / span 2;
      }

      .project-card {
        height: 34rem;
        position: relative;
      }

      .project-card-image-wrap {
        clip-path: inset(8% 8% 8% 8%);
        transition: clip-path 0s;
      }

      .project-card-image-wrap.image-revealed {
        clip-path: inset(0% 0% 0% 0%);
      }

      .date-label {
        position: relative;
        overflow: hidden;
      }

      .date-label::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(
          90deg,
          var(--color-accent-teal),
          var(--color-accent-ruby),
          transparent
        );
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .date-label.date-revealed::after {
        transform: scaleX(1);
      }

      .typing-cursor::after {
        content: '▊';
        animation: blink 0.8s step-end infinite;
        color: var(--color-accent-teal-light);
        margin-left: 2px;
        font-size: 0.8em;
      }

      @keyframes blink {
        50% {
          opacity: 0;
        }
      }

      .project-title {
        text-shadow: 0 0 0 transparent;
        transition: text-shadow 0.6s ease;
      }

      .project-title.title-glowing {
        text-shadow:
          0 0 20px rgba(0, 110, 138, 0.3),
          0 0 40px rgba(0, 110, 138, 0.1);
      }

      .live-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.72rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(0, 110, 138, 0.28);
        color: var(--color-accent-teal-light);
        background: linear-gradient(135deg, rgba(0, 77, 97, 0.16), rgba(130, 38, 89, 0.1));
        transition:
          color 220ms ease,
          border-color 220ms ease,
          transform 220ms ease,
          box-shadow 220ms ease;
      }

      .live-link:hover {
        color: var(--color-text-primary);
        border-color: rgba(163, 48, 112, 0.36);
        transform: translateY(-1px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.28);
      }

      @media (max-width: 1100px) {
        .experience-track {
          width: 100%;
        }

        .experience-stripes-row,
        .experience-cards-row {
          grid-template-columns: 1fr;
        }

        .company-stripe-primary {
          grid-column: auto;
        }

        .project-card {
          height: 28rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .company-stripe,
        .project-card {
          opacity: 1 !important;
          transform: none !important;
        }
      }
    `,
  ],
})
export class ExperienceComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly scrollTriggers: ScrollTrigger[] = [];
  private readonly animations: gsap.core.Animation[] = [];
  private readonly seedTexts = new WeakMap<HTMLElement, string>();
  private readonly typedElements = new WeakSet<HTMLElement>();
  private readonly activeIntervals = new Set<number>();

  @ViewChild('horizontalStage') private horizontalStageRef?: ElementRef<HTMLElement>;
  @ViewChild('horizontalTrack') private horizontalTrackRef?: ElementRef<HTMLElement>;

  @ViewChildren('companyStripe', { read: ElementRef })
  private stripeRefs?: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('projectCard', { read: ElementRef })
  private cardRefs?: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('dateLabel', { read: ElementRef })
  private dateLabelRefs?: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('companyName', { read: ElementRef })
  private companyNameRefs?: QueryList<ElementRef<HTMLElement>>;

  protected readonly experiences = signal<ExperienceEntry[]>([
    {
      company: 'Cortex Dynamics',
      startDate: 'Dec 2024',
      endDate: 'Mar 2025',
      projects: [
        {
          title: 'Cortex Dynamics — Portfolio Platform',
          description:
            'Enterprise SaaS platform delivering AI-powered business solutions with real-time data management, intuitive dashboard, and modern responsive design across devices.',
          techStack: ['React', 'Firebase', 'Tailwind CSS', 'Vite'],
          githubUrl: 'https://github.com/kavin-cmd/Updated_CortexDynamics',
          liveUrl: 'https://www.cortexdynamics.in/',
          imageUrl: 'assets/images/cortexdynamics.webp',
          imageAlt: 'Cortex Dynamics portfolio page — enterprise SaaS dashboard',
        },
        {
          title: 'Spotify Web Player — Custom SDK',
          description:
            'Custom Spotify Web Player with real-time playback, drag-to-seek progress, and seamless track navigation. Integrated Spotify Web Playback SDK with OAuth 2.0 auth, device management, and dynamic UI updates for smooth multi-device playback.',
          techStack: ['Next.js', 'TypeScript', 'Shadcn', 'Spotify SDK'],
          githubUrl: 'https://github.com/kavin-cmd/MeloDash',
          imageUrl: 'assets/images/melodash.webp',
          imageAlt: 'Spotify Web Player — custom SDK integration with real-time playback',
        },
      ],
    },
    {
      company: 'Gogo Energy',
      startDate: 'Mar 2025',
      endDate: 'Jun 2025',
      projects: [
        {
          title: 'GoGo Energy — Company Portfolio',
          description:
            'Modern portfolio website built with Next.js 15 and TypeScript, featuring advanced SEO with Open Graph, Twitter Cards, and JSON-LD structured data. Animated UI powered by Framer Motion with Material-UI and Tailwind CSS.',
          techStack: ['Next.js', 'TypeScript', 'Framer Motion', 'MUI'],
          githubUrl: 'https://github.com/aditya-poojary/Gogo',
          liveUrl: 'https://gogoenergy.in/',
          imageUrl: 'assets/images/gogoenergy.webp',
          imageAlt: 'GoGo Energy company portfolio website',
        },
      ],
    },
  ]);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    gsap.registerPlugin(ScrollTrigger);

    setTimeout(() => {
      this.setupAnimations();
      ScrollTrigger.refresh();
    }, 100);

    this.destroyRef.onDestroy(() => {
      this.activeIntervals.forEach((id) => window.clearInterval(id));
      this.activeIntervals.clear();
      this.animations.forEach((a) => a.kill());
      this.scrollTriggers.forEach((t) => t.kill());
    });
  }

  private setupAnimations(): void {
    const stage = this.horizontalStageRef?.nativeElement;
    const track = this.horizontalTrackRef?.nativeElement;
    const stripes = this.stripeRefs?.toArray() ?? [];
    const cards = this.cardRefs?.toArray() ?? [];
    const dateLabels = this.dateLabelRefs?.toArray() ?? [];
    const companyNames = this.companyNameRefs?.toArray() ?? [];

    if (!stage || !track || stripes.length === 0 || cards.length === 0) return;
    if (window.innerWidth < 1100) return;

    const stripeEls = stripes.map((r) => r.nativeElement);
    const cardEls = cards.map((r) => r.nativeElement);
    const dateEls = dateLabels.map((r) => r.nativeElement);
    const nameEls = companyNames.map((r) => r.nativeElement);

    const getShift = () => Math.max(0, track.scrollWidth - stage.clientWidth);

    // ─── Store seed text for ALL typable elements ───
    const descEls = cardEls
      .map((c) => c.querySelector('.project-description'))
      .filter((d): d is HTMLElement => d instanceof HTMLElement);

    [...descEls, ...nameEls, ...dateEls].forEach((el) => {
      this.seedTexts.set(el, el.textContent?.trim() ?? '');
    });

    // Clear description text (they'll type on view)
    descEls.forEach((d) => (d.textContent = ''));

    // ═══════════════════════════════════════════════════════
    //  ENTRANCE ANIMATION
    // ═══════════════════════════════════════════════════════
    const entranceTl = gsap.timeline({ paused: true });

    gsap.set(stripeEls, { autoAlpha: 0, y: 20 });
    gsap.set(cardEls, { autoAlpha: 0, y: 40 });
    gsap.set(dateEls, { autoAlpha: 0, x: 20, scale: 0.9 });

    // Stripes fade in
    entranceTl.to(stripeEls, {
      autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1,
    }, 0);

    // Date labels pop in
    entranceTl.to(dateEls, {
      autoAlpha: 1, x: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.12,
      onComplete: () => {
        dateEls.forEach((el) => el.classList.add('date-revealed'));
        gsap.fromTo(dateEls,
          { boxShadow: '0 0 0 rgba(0, 110, 138, 0)' },
          {
            boxShadow: '0 0 18px rgba(0, 110, 138, 0.28)',
            duration: 0.45, ease: 'sine.out', yoyo: true, repeat: 1, stagger: 0.1,
          },
        );
      },
    }, 0.2);

    // Cards fade in
    entranceTl.to(cardEls, {
      autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12,
    }, 0.15);

    // Image clip-path reveal
    cardEls.forEach((card, i) => {
      const wrap = card.querySelector('.project-card-image-wrap');
      if (wrap) {
        entranceTl.to(wrap, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut',
        }, 0.3 + i * 0.12);
      }
    });

    // Title clip-path wipe
    cardEls.forEach((card, i) => {
      const title = card.querySelector('.project-title');
      if (title) {
        gsap.set(title, { clipPath: 'inset(0 100% 0 0)' });
        entranceTl.to(title, {
          clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power2.inOut',
          onComplete: () => title.classList.add('title-glowing'),
        }, 0.4 + i * 0.15);
      }
    });

    // ── CORTEX: type company name, date, and first card desc on entrance ──
    // (Cortex stripe is visible immediately — no horizontal scroll needed)
    if (nameEls[0]) {
      entranceTl.add(() => this.typeText(nameEls[0], 30), 0.35);
    }
    if (dateEls[0]) {
      entranceTl.add(() => this.typeText(dateEls[0], 35), 0.55);
    }
    if (descEls[0]) {
      entranceTl.add(() => this.typeText(descEls[0], 16), 0.65);
    }

    this.animations.push(entranceTl);

    const entranceSt = ScrollTrigger.create({
      trigger: stage, start: 'top 80%',
      onEnter: () => entranceTl.play(),
      onLeaveBack: () => entranceTl.reverse(),
    });
    this.scrollTriggers.push(entranceSt);

    // ═══════════════════════════════════════════════════════
    //  HORIZONTAL SCROLL (scrub + dwell zones)
    // ═══════════════════════════════════════════════════════
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: stage, start: 'top 8%',
        end: () => {
          const shift = getShift();
          return `+=${Math.max(shift * 1.6 + window.innerHeight * 1.1, window.innerHeight * 2.8)}`;
        },
        scrub: 1.15, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });

    scrollTl.to(track, { x: 0, duration: 0.12, ease: 'none' }, 0);
    scrollTl.to(track, { x: () => -getShift(), duration: 0.76, ease: 'none' }, 0.12);
    scrollTl.to(track, { x: () => -getShift(), duration: 0.12, ease: 'none' }, 0.88);

    this.animations.push(scrollTl);
    const trigger = scrollTl.scrollTrigger;
    if (trigger) this.scrollTriggers.push(trigger);

    // ═══════════════════════════════════════════════════════
    //  PER-ELEMENT ON-VIEW TYPING (containerAnimation)
    //  — Only triggers when the element scrolls into view
    // ═══════════════════════════════════════════════════════

    // Card 2 description (Spotify — scrolls into view)
    if (descEls[1]) {
      this.scrollTriggers.push(ScrollTrigger.create({
        trigger: cardEls[1], containerAnimation: scrollTl,
        start: 'left 75%',
        onEnter: () => this.typeText(descEls[1], 16),
      }));
    }

    // Card 3 description (GoGo — scrolls into view)
    if (descEls[2]) {
      this.scrollTriggers.push(ScrollTrigger.create({
        trigger: cardEls[2], containerAnimation: scrollTl,
        start: 'left 75%',
        onEnter: () => this.typeText(descEls[2], 16),
      }));
    }

    // Gogo company name (second stripe — scrolls into view)
    if (nameEls[1]) {
      this.scrollTriggers.push(ScrollTrigger.create({
        trigger: stripeEls[1], containerAnimation: scrollTl,
        start: 'left 75%',
        onEnter: () => this.typeText(nameEls[1], 30),
      }));
    }

    // Gogo date label (second stripe — scrolls into view)
    if (dateEls[1]) {
      this.scrollTriggers.push(ScrollTrigger.create({
        trigger: stripeEls[1], containerAnimation: scrollTl,
        start: 'left 70%',
        onEnter: () => this.typeText(dateEls[1], 35),
      }));
    }
  }

  /** Types text char-by-char. Only runs once per element. */
  private typeText(el: HTMLElement, ms = 16): void {
    if (this.typedElements.has(el)) return;

    const seed = this.seedTexts.get(el) ?? '';
    if (!seed) return;

    this.typedElements.add(el);
    el.textContent = '';
    el.classList.add('typing-cursor');

    let i = 0;
    const id = window.setInterval(() => {
      if (i < seed.length) {
        el.textContent = seed.slice(0, ++i);
        return;
      }
      window.clearInterval(id);
      this.activeIntervals.delete(id);
      el.classList.remove('typing-cursor');
    }, ms);

    this.activeIntervals.add(id);
  }
}
