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
        overflow: hidden;
      }

      /* ─── Inner card that actually rotates ───────────────────── */
      .flip-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }

      /* ─── Hover on container triggers inner rotation (pointer devices only) ─── */
      @media (hover: hover) {
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
      }

      /* ─── Click-to-flip on touch devices via .flipped class ─── */
      .flip-card-inner.flipped {
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

      /* Front: Image side */
      .flip-card-front {
        background: var(--color-bg-secondary);
      }

      /* Back: Features side with metallic silver/black gradient */
      .flip-card-back {
        transform: rotateY(180deg);
        background: linear-gradient(
          145deg,
          rgba(26, 26, 26, 0.98) 0%,
          rgba(42, 42, 42, 0.95) 40%,
          rgba(192, 192, 192, 0.08) 100%
        );
        border: 1px solid rgba(192, 192, 192, 0.12);
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1.75rem;
        overflow-y: auto;
      }

      /* Metallic shine effect on back */
      .flip-card-back::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--color-metallic-silver), transparent);
        opacity: 0.5;
      }

      /* ─── Card Content (Lower Part) - Matches Education Card ─── */
      .card-content {
        background: linear-gradient(135deg, rgba(34, 34, 34, 0.6), rgba(42, 42, 42, 0.3));
        backdrop-filter: blur(8px);
        border-radius: 0 0 24px 24px;
        padding: 1.25rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.04);
      }

      /* ─── Tech Stack Tags (Metallic Silver) ──────────────────── */
      .tech-tag {
        display: inline-flex;
        align-items: center;
        padding: 0.4rem 0.85rem;
        border-radius: var(--radius-full);
        border: 1px solid rgba(192, 192, 192, 0.25);
        color: var(--color-metallic-silver);
        background: linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(26, 26, 26, 0.6) 100%);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        transition: var(--transition-base);
      }

      .tech-tag:hover {
        transform: translateY(-2px) scale(1.05);
        background: linear-gradient(135deg, rgba(60, 60, 60, 0.9) 0%, rgba(42, 42, 42, 0.7) 100%);
        border-color: var(--color-metallic-silver);
        color: var(--color-text-primary);
        box-shadow:
          0 8px 20px rgba(0, 0, 0, 0.4),
          0 0 0 1px rgba(192, 192, 192, 0.15);
      }

      /* ─── Link Buttons (Metallic Silver) ─────────────────────── */
      .link-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 1.1rem;
        border-radius: var(--radius-md);
        border: 1px solid rgba(192, 192, 192, 0.3);
        color: var(--color-metallic-silver);
        background: linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(26, 26, 26, 0.6) 100%);
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        transition: var(--transition-base);
      }

      .link-btn:hover {
        color: var(--color-text-primary);
        border-color: var(--color-metallic-silver);
        transform: translateY(-2px);
        box-shadow:
          0 8px 24px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(192, 192, 192, 0.2);
        background: linear-gradient(135deg, rgba(60, 60, 60, 0.9) 0%, rgba(42, 42, 42, 0.7) 100%);
      }

      /* ─── Feature Items ──────────────────────────────────────── */
      .feature-item {
        position: relative;
        padding-left: 1.25rem;
        font-size: 0.9rem;
        color: var(--color-metallic-silver);
        line-height: 1.65;
        text-align: left;
      }

      .feature-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.6em;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--color-accent-teal-light) 0%,
          var(--color-accent-ruby-light) 100%
        );
        box-shadow: 0 0 10px rgba(0, 110, 138, 0.5);
      }

      /* ─── Responsive ─────────────────────────────────────────── */
      @media (max-width: 768px) {
        .flip-card {
          height: 240px;
        }

        .project-card {
          max-width: 100%;
        }

        .tech-stack-row {
          flex-wrap: wrap;
          overflow: hidden;
          max-height: 2.1rem;
        }

        .flip-card-back {
          padding: 1.25rem;
        }

        .flip-card-back .feature-item {
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .flip-card-back .space-y-2\.5 > * + * {
          margin-top: 0.4rem;
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

  /** Track which cards are flipped (for touch devices) */
  protected readonly flippedCards = signal<Set<number>>(new Set());

  /** Whether device supports hover (pointer device) */
  protected readonly isTouchDevice = signal(false);

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

    // Detect touch device
    this.isTouchDevice.set(!window.matchMedia('(hover: hover)').matches);

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

  /** Toggle flip state for a specific card (touch devices) */
  protected toggleFlip(index: number): void {
    const current = this.flippedCards();
    const next = new Set(current);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    this.flippedCards.set(next);
  }

  protected isFlipped(index: number): boolean {
    return this.flippedCards().has(index);
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
          borderColor: 'var(--color-metallic-silver)',
          backgroundColor: 'rgba(60, 60, 60, 0.9)',
          boxShadow: '0 10px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(192, 192, 192, 0.2)',
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
