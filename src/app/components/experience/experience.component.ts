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
        will-change: transform, opacity, filter;
      }

      .experience-stage {
        overflow: hidden;
      }

      .experience-track {
        width: max-content;
      }

      /*
        Layout: 3 columns of 58rem (928px) each.
        First stripe spans columns 1-2 (≈1876px).
      */
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

      /* Date label animation styles */
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

      /* Project card text typing cursor */
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
          filter: none !important;
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
          imageUrl: 'assets/images/245.webp',
          imageAlt: 'Cortex Dynamics portfolio page — enterprise SaaS dashboard',
        },
        {
          title: 'Project 02 — Details to be added',
          description:
            'Secondary product track executed for Cortex Dynamics. Project description and stack details will be updated.',
          techStack: ['GSAP', 'Tailwind CSS', 'Express'],
          githubUrl: 'https://github.com/aditya-poojary',
          imageUrl: 'assets/images/profile.webp',
          imageAlt: 'Project visual placeholder for Cortex Dynamics project two',
        },
      ],
    },
    {
      company: 'Gogo Energy',
      startDate: 'Mar 2025',
      endDate: 'Jun 2025',
      projects: [
        {
          title: 'Project 01 — Details to be added',
          description:
            'Primary solution built at Gogo Energy. Final project narrative, stack, and repository link will be updated.',
          techStack: ['Angular', 'PostgreSQL', 'REST APIs'],
          githubUrl: 'https://github.com/aditya-poojary',
          imageUrl: 'assets/images/profile.webp',
          imageAlt: 'Project visual placeholder for Gogo Energy project',
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

    // Skip horizontal scroll on narrow viewports
    if (window.innerWidth < 1100) {
      return;
    }

    const stripeElements = stripes.map((ref) => ref.nativeElement);
    const cardElements = cards.map((ref) => ref.nativeElement);
    const dateLabelElements = dateLabels.map((ref) => ref.nativeElement);

    // How far the track overflows the stage
    const getShift = () => Math.max(0, track.scrollWidth - stage.clientWidth);

    // ── Entrance animation (plays once when section enters viewport) ──
    const entranceTl = gsap.timeline({ paused: true });

    gsap.set(stripeElements, { autoAlpha: 0, y: 20 });
    gsap.set(cardElements, { autoAlpha: 0, y: 40 });
    gsap.set(dateLabelElements, { autoAlpha: 0, x: 20, scale: 0.9 });

    // 1. Stripes slide in
    entranceTl.to(stripeElements, {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.1,
    }, 0);

    // 2. Date labels animate in with a pop + glow underline
    entranceTl.to(dateLabelElements, {
      autoAlpha: 1,
      x: 0,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.5)',
      stagger: 0.12,
      onComplete: () => {
        dateLabelElements.forEach((el) => el.classList.add('date-revealed'));
      },
    }, 0.2);

    // 3. Cards fade in
    entranceTl.to(cardElements, {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.12,
    }, 0.15);

    // 4. First card — typing effect on description
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

    // Fire entrance when the stage enters the viewport
    const entranceSt = ScrollTrigger.create({
      trigger: stage,
      start: 'top 80%',
      onEnter: () => entranceTl.play(),
      onLeaveBack: () => entranceTl.reverse(),
    });
    this.scrollTriggers.push(entranceSt);

    // ── Horizontal scroll (scrub-based, only handles translateX) ──
    // start: 'top 15%' → pinning starts with breathing room above the heading
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top 15%',
        end: () => {
          const shift = getShift();
          return `+=${Math.max(shift * 1.5 + window.innerHeight, window.innerHeight * 2.5)}`;
        },
        scrub: 1.15,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    scrollTl.fromTo(
      track,
      { x: 0 },
      {
        x: () => -getShift(),
        ease: 'none',
        duration: 1,
      },
      0,
    );

    this.animations.push(scrollTl);

    const trigger = scrollTl.scrollTrigger;
    if (trigger) {
      this.scrollTriggers.push(trigger);
    }
  }
}
