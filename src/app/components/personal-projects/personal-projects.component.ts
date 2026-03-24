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

      .flip-container {
        perspective: 1000px;
        height: 280px;
      }

      .flip-card {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .flip-card:hover {
        transform: rotateY(180deg);
      }

      .flip-card-front,
      .flip-card-back {
        position: absolute;
        inset: 0;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        border-radius: 24px 24px 0 0;
        overflow: hidden;
      }

      .flip-card-back {
        transform: rotateY(180deg);
        background: linear-gradient(
          135deg,
          rgba(0, 77, 97, 0.28),
          rgba(130, 38, 89, 0.18)
        );
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1.5rem;
      }

      .card-content {
        background: var(--color-bg-secondary);
        border-radius: 0 0 24px 24px;
        padding: 1.25rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }

      .tech-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.3rem 0.65rem;
        border-radius: 9999px;
        border: 1px solid rgba(0, 110, 138, 0.3);
        color: var(--color-accent-teal-light);
        background: rgba(0, 77, 97, 0.16);
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.02em;
        transition:
          transform 0.22s ease,
          background 0.22s ease,
          border-color 0.22s ease;
      }

      .tech-tag:hover {
        transform: translateY(-2px) scale(1.04);
        background: rgba(0, 77, 97, 0.32);
        border-color: rgba(0, 110, 138, 0.5);
      }

      .link-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0.85rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(0, 110, 138, 0.28);
        color: var(--color-accent-teal-light);
        background: linear-gradient(
          135deg,
          rgba(0, 77, 97, 0.16),
          rgba(130, 38, 89, 0.1)
        );
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        transition:
          color 220ms ease,
          border-color 220ms ease,
          transform 220ms ease,
          box-shadow 220ms ease;
      }

      .link-btn:hover {
        color: var(--color-text-primary);
        border-color: rgba(163, 48, 112, 0.36);
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.28);
      }

      .feature-item {
        position: relative;
        padding-left: 1rem;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }

      .feature-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.5em;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--color-accent-teal),
          var(--color-accent-ruby)
        );
      }

      .light-effect {
        position: absolute;
        top: 0;
        left: 50%;
        width: 120%;
        height: 60%;
        background: radial-gradient(
          50% 100%,
          rgba(222, 222, 222, 0.15) 0%,
          rgba(68, 68, 68, 0) 100%
        );
        filter: blur(15px);
        opacity: 0.5;
        transform: translateX(-50%) rotate(45deg);
        pointer-events: none;
      }

      @media (max-width: 768px) {
        .flip-container {
          height: 220px;
        }

        .project-card {
          max-width: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .flip-card {
          transition: none;
        }

        .flip-card:hover {
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
      title: 'Project One',
      description: 'A modern web application built with cutting-edge technologies.',
      features: [
        'Real-time data synchronization',
        'Responsive design across devices',
        'OAuth 2.0 authentication',
        'RESTful API integration',
      ],
      techStack: ['Angular', 'TypeScript', 'Tailwind CSS', 'Firebase'],
      githubUrl: 'https://github.com/aditya-poojary/project-one',
      liveUrl: 'https://project-one.example.com',
      imageUrl: 'assets/images/placeholder.webp',
      imageAlt: 'Project One screenshot',
    },
    {
      title: 'Project Two',
      description: 'Full-stack solution with modern architecture and seamless UX.',
      features: [
        'Server-side rendering for SEO',
        'Dynamic component loading',
        'Comprehensive test coverage',
        'CI/CD pipeline integration',
      ],
      techStack: ['Next.js', 'React', 'Node.js', 'PostgreSQL'],
      githubUrl: 'https://github.com/aditya-poojary/project-two',
      imageUrl: 'assets/images/placeholder.webp',
      imageAlt: 'Project Two screenshot',
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

    gsap.set(cardEls, { autoAlpha: 0, y: 50 });

    const entranceTl = gsap.timeline({ paused: true });

    entranceTl.to(cardEls, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.15,
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
          y: -2,
          scale: 1.04,
          duration: 0.22,
          ease: 'power2.out',
          color: 'var(--color-text-primary)',
          borderColor: 'rgba(0, 110, 138, 0.48)',
          backgroundColor: 'rgba(0, 77, 97, 0.34)',
          boxShadow:
            '0 8px 18px rgba(0, 110, 138, 0.22), 0 0 0 1px rgba(163, 48, 112, 0.16)',
        });
      };

      const onMouseLeave = () => {
        gsap.to(tag, {
          y: 0,
          scale: 1,
          duration: 0.24,
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
