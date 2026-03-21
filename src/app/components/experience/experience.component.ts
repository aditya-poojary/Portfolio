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

      /* Image reveal clip */
      .project-card-image-wrap {
        clip-path: inset(8% 8% 8% 8%);
        transition: clip-path 0s;
      }

      .project-card-image-wrap.image-revealed {
        clip-path: inset(0% 0% 0% 0%);
      }

      /* Date label animation */
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

      /* Typing cursor blink */
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

      /* Project title glow */
      .project-title {
        text-shadow: 0 0 0 transparent;
        transition: text-shadow 0.6s ease;
      }

      .project-title.title-glowing {
        text-shadow:
          0 0 20px rgba(0, 110, 138, 0.3),
          0 0 40px rgba(0, 110, 138, 0.1);
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

  @ViewChild('horizontalStage') private horizontalStageRef?: ElementRef<HTMLElement>;
  @ViewChild('horizontalTrack') private horizontalTrackRef?: ElementRef<HTMLElement>;

  @ViewChildren('companyStripe', { read: ElementRef })
  private stripeRefs?: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('projectCard', { read: ElementRef })
  private cardRefs?: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('dateLabel', { read: ElementRef })
  private dateLabelRefs?: QueryList<ElementRef<HTMLElement>>;

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
          githubUrl: 'https://github.com/aditya-poojary',
          imageUrl: 'assets/images/cortexdynamics.webp',
          imageAlt: 'Cortex Dynamics portfolio page — enterprise SaaS dashboard',
        },
        {
          title: 'Spotify Web Player — Custom SDK',
          description:
            'Custom Spotify Web Player with real-time playback, drag-to-seek progress, and seamless track navigation. Integrated Spotify Web Playback SDK with OAuth 2.0 auth, device management, and dynamic UI updates for smooth multi-device playback.',
          techStack: ['React', 'TypeScript', 'Next.js', 'Spotify SDK'],
          githubUrl: 'https://github.com/aditya-poojary',
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
          techStack: ['Next.js 15', 'TypeScript', 'Framer Motion', 'MUI'],
          githubUrl: 'https://github.com/aditya-poojary',
          imageUrl: 'assets/images/gogoenergy.webp',
          imageAlt: 'GoGo Energy company portfolio website',
        },
      ],
    },
  ]);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    setTimeout(() => {
      this.setupAnimations();
      ScrollTrigger.refresh();
    }, 100);

    this.destroyRef.onDestroy(() => {
      this.animations.forEach((animation) => animation.kill());
      this.scrollTriggers.forEach((trigger) => trigger.kill());
    });
  }

  private setupAnimations(): void {
    const stage = this.horizontalStageRef?.nativeElement;
    const track = this.horizontalTrackRef?.nativeElement;
    const stripes = this.stripeRefs?.toArray() ?? [];
    const cards = this.cardRefs?.toArray() ?? [];
    const dateLabels = this.dateLabelRefs?.toArray() ?? [];

    if (!stage || !track || stripes.length === 0 || cards.length === 0) {
      return;
    }

    if (window.innerWidth < 1100) {
      return;
    }

    const stripeElements = stripes.map((ref) => ref.nativeElement);
    const cardElements = cards.map((ref) => ref.nativeElement);
    const dateLabelElements = dateLabels.map((ref) => ref.nativeElement);

    const getShift = () => Math.max(0, track.scrollWidth - stage.clientWidth);

    // ═══════════════════════════════════════════════════════
    //  ENTRANCE ANIMATION (plays once when section enters)
    // ═══════════════════════════════════════════════════════
    const entranceTl = gsap.timeline({ paused: true });

    gsap.set(stripeElements, { autoAlpha: 0, y: 20 });
    gsap.set(cardElements, { autoAlpha: 0, y: 40 });
    gsap.set(dateLabelElements, { autoAlpha: 0, x: 20, scale: 0.9 });

    // Stripes
    entranceTl.to(
      stripeElements,
      { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 },
      0,
    );

    // Date labels — pop in with back ease + gradient underline
    entranceTl.to(
      dateLabelElements,
      {
        autoAlpha: 1,
        x: 0,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.5)',
        stagger: 0.12,
        onComplete: () => {
          dateLabelElements.forEach((el) => el.classList.add('date-revealed'));
        },
      },
      0.2,
    );

    // Cards fade in
    entranceTl.to(
      cardElements,
      { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12 },
      0.15,
    );

    // Image reveal on each card (clip-path expansion)
    cardElements.forEach((card, i) => {
      const imgWrap = card.querySelector('.project-card-image-wrap');
      if (imgWrap) {
        entranceTl.to(
          imgWrap,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.8,
            ease: 'power3.inOut',
          },
          0.3 + i * 0.12,
        );
      }
    });

    // Title animations (clip-path wipe + glow)
    cardElements.forEach((card, i) => {
      const title = card.querySelector('.project-title');
      if (title) {
        gsap.set(title, { clipPath: 'inset(0 100% 0 0)' });
        entranceTl.to(
          title,
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.7,
            ease: 'power2.inOut',
            onComplete: () => title.classList.add('title-glowing'),
          },
          0.4 + i * 0.15,
        );
      }
    });

    // Typing effect on the first card's description
    const firstCardDesc = cardElements[0]?.querySelector('.project-description');
    if (firstCardDesc) {
      const fullText = firstCardDesc.textContent?.trim() ?? '';
      firstCardDesc.textContent = '';
      firstCardDesc.classList.add('typing-cursor');

      entranceTl.add(() => {
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex < fullText.length) {
            firstCardDesc.textContent = fullText.slice(0, charIndex + 1);
            charIndex++;
          } else {
            clearInterval(typeInterval);
            firstCardDesc.classList.remove('typing-cursor');
          }
        }, 18);
      }, 0.5);
    }

    this.animations.push(entranceTl);

    const entranceSt = ScrollTrigger.create({
      trigger: stage,
      start: 'top 80%',
      onEnter: () => entranceTl.play(),
      onLeaveBack: () => entranceTl.reverse(),
    });
    this.scrollTriggers.push(entranceSt);

    // ═══════════════════════════════════════════════════════
    //  HORIZONTAL SCROLL (scrub-based with dwell zones)
    // ═══════════════════════════════════════════════════════
    // Reduced breathing room: top 8%
    // Dwell zones: 12% pause at start, 12% pause at end
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top 8%',
        end: () => {
          const shift = getShift();
          return `+=${Math.max(shift * 1.6 + window.innerHeight * 1.1, window.innerHeight * 2.8)}`;
        },
        scrub: 1.15,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Dwell at start (0 → 0.12): nothing moves — user has time to see the content
    scrollTl.to(track, { x: 0, duration: 0.12, ease: 'none' }, 0);

    // Horizontal movement (0.12 → 0.88)
    scrollTl.to(
      track,
      {
        x: () => -getShift(),
        duration: 0.76,
        ease: 'none',
      },
      0.12,
    );

    // Dwell at end (0.88 → 1): nothing moves — user sees the last cards
    scrollTl.to(track, { x: () => -getShift(), duration: 0.12, ease: 'none' }, 0.88);

    this.animations.push(scrollTl);

    const trigger = scrollTl.scrollTrigger;
    if (trigger) {
      this.scrollTriggers.push(trigger);
    }
  }
}
