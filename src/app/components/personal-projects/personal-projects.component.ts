import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface PersonalProject {
  title: string;
  description: string;
  features: string[];
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  imageUrl: string;
  imageAlt: string;
}

@Component({
  selector: 'app-personal-projects',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './personal-projects.component.html',
  styles: [
    `
      .project-card {
        will-change: transform, opacity;
      }

      /* ─── Flip Card Container ─────────────────────────────────── */
      .flip-card {
        background-color: transparent;
        height: 280px;
        perspective: 1000px;
        border-radius: 24px 24px 0 0;
      }

      /* ─── Inner card that actually rotates ───────────────────── */
      .flip-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        text-align: center;
        transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }

      /* ─── Hover on container triggers inner rotation ─────────── */
      .flip-card:hover .flip-card-inner {
        transform: rotateY(180deg);
      }

      /* ─── Front and Back faces ───────────────────────────────── */
      .flip-card-front,
      .flip-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        border-radius: 24px 24px 0 0;
        overflow: hidden;
      }

      .flip-card-front {
        background: linear-gradient(
          135deg,
          var(--color-bg-elevated) 0%,
          var(--color-bg-secondary) 100%
        );
      }

      .flip-card-back {
        transform: rotateY(180deg);
        overflow: hidden;
      }

      /* ─── Card Content (Lower Part) ──────────────────────────── */
      .card-content {
        background: var(--color-bg-secondary);
        border-radius: 0 0 24px 24px;
        padding: 1.25rem 1.5rem;
        border-top: 1px solid var(--color-border-default);
      }

      /* ─── Tech Stack Tags ────────────────────────────────────── */
      .tech-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius-full);
        border: 1px solid var(--color-border-accent);
        color: var(--color-accent-teal-light);
        background: linear-gradient(
          135deg,
          rgba(0, 77, 97, 0.2) 0%,
          rgba(130, 38, 89, 0.1) 100%
        );
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.02em;
        transition: var(--transition-base);
      }

      .tech-tag:hover {
        transform: translateY(-2px) scale(1.04);
        background: linear-gradient(
          135deg,
          rgba(0, 77, 97, 0.35) 0%,
          rgba(130, 38, 89, 0.2) 100%
        );
        border-color: var(--color-accent-teal-light);
        box-shadow:
          0 8px 20px rgba(0, 77, 97, 0.25),
          0 0 0 1px rgba(163, 48, 112, 0.15);
      }

      /* ─── Link Buttons ───────────────────────────────────────── */
      .link-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-accent);
        color: var(--color-accent-teal-light);
        background: linear-gradient(
          135deg,
          rgba(0, 77, 97, 0.18) 0%,
          rgba(130, 38, 89, 0.12) 100%
        );
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        transition: var(--transition-base);
      }

      .link-btn:hover {
        color: var(--color-text-primary);
        border-color: var(--color-accent-ruby-light);
        transform: translateY(-2px);
        box-shadow:
          0 8px 20px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(163, 48, 112, 0.2);
        background: linear-gradient(
          135deg,
          rgba(0, 77, 97, 0.28) 0%,
          rgba(130, 38, 89, 0.18) 100%
        );
      }

      /* ─── Feature Items ──────────────────────────────────────── */
      .feature-item {
        position: relative;
        padding-left: 1.25rem;
        font-size: 0.88rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        text-align: left;
      }

      .feature-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.55em;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--color-accent-teal-light) 0%,
          var(--color-accent-ruby) 100%
        );
        box-shadow: 0 0 8px rgba(0, 110, 138, 0.4);
      }

      /* ─── Light Effect Overlay ───────────────────────────────── */
      .light-effect {
        position: absolute;
        top: 0;
        left: 50%;
        width: 120%;
        height: 60%;
        background: radial-gradient(
          50% 100%,
          rgba(0, 110, 138, 0.12) 0%,
          transparent 100%
        );
        filter: blur(20px);
        opacity: 0.7;
        transform: translateX(-50%) rotate(45deg);
        pointer-events: none;
      }

      /* ─── Feature Card Styling ───────────────────────────────── */
      .feature-card {
        background: linear-gradient(
          145deg,
          var(--color-bg-elevated) 0%,
          var(--color-bg-secondary) 50%,
          rgba(0, 77, 97, 0.08) 100%
        );
        border: 1px solid var(--color-border-light);
        position: relative;
        overflow: hidden;
      }

      .feature-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          var(--color-accent-teal),
          var(--color-accent-ruby),
          transparent
        );
        opacity: 0.6;
      }

      /* ─── Responsive ─────────────────────────────────────────── */
      @media (max-width: 768px) {
        .flip-card {
          height: 240px;
        }

        .project-card {
          max-width: 100%;
        }
      }

      /* ─── Reduced Motion ─────────────────────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .flip-card-inner {
          transition: none;
        }

        .flip-card:hover .flip-card-inner {
          transform: none;
        }

        .project-card {
          opacity: 1 !important;
          transform: none !important;
        }
      }
    `,
  ],
})
export class PersonalProjectsComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly scrollTriggers: ScrollTrigger[] = [];
  private readonly animations: gsap.core.Animation[] = [];
  private readonly techTagHoverCleanups: Array<() => void> = [];

  @ViewChildren('projectCard', { read: ElementRef })
  private cardRefs?: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('techTag', { read: ElementRef })
  private techTagRefs?: QueryList<ElementRef<HTMLElement>>;

  protected readonly projects = signal<PersonalProject[]>([
    {
      title: 'PlacePicker',
      description:
        'Discover nearby tourist hotspots with geolocation-based sorting and personal collections.',
      features: [
        'Geolocation-based place sorting by distance',
        'Personal collection with optimistic updates',
        'Cloudinary CDN for optimized images',
        'Custom useFetch hook for data management',
        'Modal dialogs with timed progress indicators',
      ],
      techStack: ['React', 'Vite', 'Node.js', 'Express', 'Cloudinary'],
      githubUrl: 'https://github.com/aditya-poojary/Tourist-Hotspot-Finder',
      liveUrl: 'https://tourist-hotspot-finder-final.vercel.app/',
      imageUrl: 'assets/images/tourist.webp',
      imageAlt: 'PlacePicker - Tourist Hotspot Finder application',
    },
    {
      title: 'Momentum',
      description:
        'Full-featured project management app with visual progress tracking and calendar scheduling.',
      features: [
        'Project CRUD with trash/restore functionality',
        'Visual progress charts using Recharts',
        'Weekly calendar planner & scheduling',
        'Firebase Auth with protected routes',
        'User-specific Firestore data collections',
      ],
      techStack: ['React', 'Vite', 'Tailwind CSS', 'Firebase', 'Redux', 'Recharts'],
      githubUrl: 'https://github.com/aditya-poojary/Momentum',
      liveUrl: 'https://momentum-b275f.web.app/',
      imageUrl: 'assets/images/momentum.webp',
      imageAlt: 'Momentum - Project Management application',
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
      this.animations.forEach((a) => a.kill());
      this.scrollTriggers.forEach((t) => t.kill());
      this.techTagHoverCleanups.forEach((cleanup) => cleanup());
      this.techTagHoverCleanups.length = 0;
    });
  }

  private setupAnimations(): void {
    const cards = this.cardRefs?.toArray() ?? [];
    if (cards.length === 0) return;

    const cardEls = cards.map((r) => r.nativeElement);

    gsap.set(cardEls, { autoAlpha: 0, y: 60, scale: 0.95 });

    const entranceTl = gsap.timeline({ paused: true });

    entranceTl.to(cardEls, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.18,
    });

    this.animations.push(entranceTl);

    const entranceSt = ScrollTrigger.create({
      trigger: cardEls[0]?.parentElement,
      start: 'top 80%',
      onEnter: () => entranceTl.play(),
      onLeaveBack: () => entranceTl.reverse(),
    });
    this.scrollTriggers.push(entranceSt);

    this.setupTechTagHoverEffects();
  }

  private setupTechTagHoverEffects(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const techTags = this.techTagRefs?.toArray().map((ref) => ref.nativeElement) ?? [];
    if (techTags.length === 0) return;

    techTags.forEach((tag) => {
      const computed = window.getComputedStyle(tag);
      const baseColor = computed.color;
      const baseBorderColor = computed.borderColor;
      const baseBackgroundColor = computed.backgroundColor;

      const onMouseEnter = () => {
        gsap.to(tag, {
          y: -3,
          scale: 1.06,
          duration: 0.25,
          ease: 'power2.out',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-accent-teal-light)',
          backgroundColor: 'rgba(0, 77, 97, 0.38)',
          boxShadow:
            '0 10px 24px rgba(0, 110, 138, 0.28), 0 0 0 1px rgba(163, 48, 112, 0.18)',
        });
      };

      const onMouseLeave = () => {
        gsap.to(tag, {
          y: 0,
          scale: 1,
          duration: 0.28,
          ease: 'power2.out',
          color: baseColor,
          borderColor: baseBorderColor,
          backgroundColor: baseBackgroundColor,
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        });
      };

      tag.addEventListener('mouseenter', onMouseEnter);
      tag.addEventListener('mouseleave', onMouseLeave);

      this.techTagHoverCleanups.push(() => {
        tag.removeEventListener('mouseenter', onMouseEnter);
        tag.removeEventListener('mouseleave', onMouseLeave);
        gsap.killTweensOf(tag);
      });
    });
  }
}
