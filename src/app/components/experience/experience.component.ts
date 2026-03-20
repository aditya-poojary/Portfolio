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
        Grid layout:
        - 3 equal columns, each ~30rem (480px)
        - First stripe spans columns 1-2
        - Two Cortex cards fill columns 1-2, one Gogo card fills column 3
        - Cards match their stripe widths exactly
      */
      .experience-stripes-row,
      .experience-cards-row {
        display: grid;
        grid-template-columns: repeat(3, 30rem);
        gap: 1.25rem;
      }

      /* First company stripe spans 2 columns */
      .company-stripe-primary {
        grid-column: 1 / span 2;
      }

      /* Project cards: image + content fill */
      .project-card-image {
        height: 14rem;
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

        .project-card-image {
          height: 12rem;
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

  protected readonly experiences = signal<ExperienceEntry[]>([
    {
      company: 'Cortex Dynamics',
      startDate: 'Dec 2024',
      endDate: 'Mar 2025',
      projects: [
        {
          title: 'Project 01 — Details to be added',
          description:
            'Core contribution delivered during tenure at Cortex Dynamics. Final project description will be added in your next prompt.',
          techStack: ['Angular', 'TypeScript', 'Node.js'],
          githubUrl: 'https://github.com/aditya-poojary',
          imageUrl: 'assets/images/profile.webp',
          imageAlt: 'Project visual placeholder for Cortex Dynamics project one',
        },
        {
          title: 'Project 02 — Details to be added',
          description:
            'Secondary product track executed for Cortex Dynamics. Final project description and stack details will be updated next.',
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
            'Primary solution built at Gogo Energy. Final project narrative, stack, and repository link will be updated in your next message.',
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

    if (!stage || !track || stripes.length === 0 || cards.length === 0) {
      return;
    }

    // Skip horizontal scroll on narrow viewports
    if (window.innerWidth < 1100) {
      return;
    }

    const stripeElements = stripes.map((ref) => ref.nativeElement);
    const cardElements = cards.map((ref) => ref.nativeElement);

    // Initial states
    gsap.set(stripeElements, { autoAlpha: 0.72, y: 22 });
    gsap.set(cardElements, {
      autoAlpha: 0,
      y: 64,
      filter: 'blur(10px)',
      rotateY: 6,
      transformPerspective: 1000,
    });

    // Master timeline: pin + horizontal scroll
    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: () => {
          const shift = Math.max(0, track.scrollWidth - stage.clientWidth);
          return `+=${Math.max(shift * 1.35 + window.innerHeight * 0.9, window.innerHeight * 2.4)}`;
        },
        scrub: 1.15,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Horizontal translation of the track
    masterTimeline.fromTo(
      track,
      { x: 0 },
      {
        x: () => {
          const shift = Math.max(0, track.scrollWidth - stage.clientWidth);
          return -shift;
        },
        ease: 'none',
        duration: 1,
      },
      0,
    );

    // Stripe reveal
    masterTimeline.to(
      stripeElements,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.22,
        ease: 'power2.out',
        stagger: 0.08,
      },
      0.04,
    );

    // Card reveal with blur + rotation unwind
    masterTimeline.to(
      cardElements,
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        rotateY: 0,
        duration: 0.3,
        ease: 'power3.out',
        stagger: 0.1,
      },
      0.1,
    );

    this.animations.push(masterTimeline);

    const trigger = masterTimeline.scrollTrigger;
    if (trigger) {
      this.scrollTriggers.push(trigger);
    }
  }
}
