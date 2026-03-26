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
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface TechItem {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-tech-stack',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-24 px-6 max-md:px-4 max-md:py-16">
      <div class="container-custom">
        <!-- Section Heading -->
        <h2
          class="font-heading text-h2 font-semibold text-text-primary mb-12 flex items-center gap-3"
        >
          <span
            class="inline-flex items-center justify-center w-9 h-9 rounded-lg border"
            style="
              border-color: rgba(192, 192, 192, 0.3);
              background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(26, 26, 26, 0.6));
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-4.5 h-4.5"
              style="color: var(--color-metallic-silver)"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </span>
          Tech Stack
        </h2>

        <!-- Tech Grid -->
        <div class="flex flex-wrap justify-center gap-4 md:gap-6">
          @for (tech of techStack(); track tech.name) {
            <div
              #techCard
              class="tech-card py-3 px-5 rounded-xl flex items-center cursor-pointer md:w-48 w-40 border transition-all duration-300"
              style="
                background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(26, 26, 26, 0.6));
                border-color: rgba(192, 192, 192, 0.15);
              "
            >
              <img
                [src]="tech.icon"
                [alt]="tech.name + ' logo'"
                class="w-10 h-10 object-contain"
                loading="lazy"
              />
              <h4 class="text-sm ml-4 font-medium" style="color: var(--color-metallic-silver)">
                {{ tech.name }}
              </h4>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .tech-card {
        will-change: transform, box-shadow;
        transition:
          transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          border-color 0.3s ease;
      }

      .tech-card:hover {
        transform: scale(1.08) translateY(-4px);
        border-color: var(--color-metallic-silver) !important;
        box-shadow:
          0 12px 28px rgba(0, 0, 0, 0.4),
          0 0 0 1px rgba(192, 192, 192, 0.2);
      }

      .tech-card:hover h4 {
        color: var(--color-text-primary) !important;
      }

      @media (prefers-reduced-motion: reduce) {
        .tech-card {
          transition: none;
        }

        .tech-card:hover {
          transform: none;
        }
      }
    `,
  ],
})
export class TechStackComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scrollTriggers: ScrollTrigger[] = [];
  private readonly animations: gsap.core.Animation[] = [];

  @ViewChildren('techCard', { read: ElementRef })
  private cardRefs?: QueryList<ElementRef<HTMLElement>>;

  protected readonly techStack = signal<TechItem[]>([
    {
      name: 'HTML',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    },
    {
      name: 'CSS',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    },
    { name: 'JavaScript', icon: 'https://skillicons.dev/icons?i=js' },
    { name: 'TypeScript', icon: 'https://skillicons.dev/icons?i=ts' },
    { name: 'Angular', icon: 'https://skillicons.dev/icons?i=angular' },
    { name: 'React', icon: 'https://skillicons.dev/icons?i=react' },
    { name: 'Next.js', icon: 'https://skillicons.dev/icons?i=nextjs' },
    { name: 'Tailwind CSS', icon: 'https://skillicons.dev/icons?i=tailwind' },
    { name: 'Node.js', icon: 'https://skillicons.dev/icons?i=nodejs' },
    { name: 'Express', icon: 'https://skillicons.dev/icons?i=express' },
    { name: 'Firebase', icon: 'https://skillicons.dev/icons?i=firebase' },
    { name: 'MongoDB', icon: 'https://skillicons.dev/icons?i=mongodb' },
    { name: 'Java', icon: 'https://skillicons.dev/icons?i=java' },
    { name: 'Vite', icon: 'https://skillicons.dev/icons?i=vite' },
    { name: 'LaTeX', icon: 'https://skillicons.dev/icons?i=latex' },
    { name: 'Postman', icon: 'https://skillicons.dev/icons?i=postman' },
    { name: 'Git', icon: 'https://skillicons.dev/icons?i=git' },
    { name: 'VS Code', icon: 'https://skillicons.dev/icons?i=vscode' },
    {
      name: 'Notion',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/notion/notion-original.svg',
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
    });
  }

  private setupAnimations(): void {
    const cards = this.cardRefs?.toArray() ?? [];
    if (cards.length === 0) return;

    const cardEls = cards.map((r) => r.nativeElement);

    // Initial state - cards start below and invisible
    gsap.set(cardEls, { autoAlpha: 0, y: 60 });

    // Staggered entrance animation
    const entranceTl = gsap.timeline({ paused: true });

    entranceTl.to(cardEls, {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: {
        each: 0.05,
        from: 'start',
      },
    });

    this.animations.push(entranceTl);

    const entranceSt = ScrollTrigger.create({
      trigger: cardEls[0]?.parentElement,
      start: 'top 80%',
      onEnter: () => entranceTl.play(),
      onLeaveBack: () => entranceTl.reverse(),
    });
    this.scrollTriggers.push(entranceSt);
  }
}
