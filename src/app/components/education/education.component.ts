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

interface EducationEntry {
  period: string;
  title: string;
  subtitle: string;
  description: string;
}

@Component({
  selector: 'app-education',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './education.component.html',
  styles: [
    `
      .edu-card {
        will-change: transform, opacity;
      }

      @media (prefers-reduced-motion: reduce) {
        .edu-card {
          opacity: 1 !important;
          transform: none !important;
        }
      }
    `,
  ],
})
export class EducationComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private scrollTriggers: ScrollTrigger[] = [];

  @ViewChildren('eduCard', { read: ElementRef })
  private cardRefs?: QueryList<ElementRef<HTMLElement>>;

  protected readonly education = signal<EducationEntry[]>([
    {
      period: '2022 — Present',
      title: 'Thakur College of Engineering & Technology',
      subtitle: 'B.E. — Information Technology',
      description: 'Mumbai University | Expected Graduation: 2026',
    },
    {
      period: '2020 — 2022',
      title: 'Yashodham Junior College',
      subtitle: 'Higher Secondary Education',
      description: '',
    },
    {
      period: '2013 — 2020',
      title: 'St. Thomas High School',
      subtitle: 'Primary & Secondary Education',
      description: '',
    },
  ]);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    gsap.registerPlugin(ScrollTrigger);

    setTimeout(() => {
      this.setupCardAnimations();
      ScrollTrigger.refresh();
    }, 100);

    this.destroyRef.onDestroy(() => {
      this.scrollTriggers.forEach((st) => st.kill());
    });
  }

  private setupCardAnimations(): void {
    const cards = this.cardRefs?.toArray() ?? [];
    if (cards.length === 0) return;

    cards.forEach((cardRef, i) => {
      const el = cardRef.nativeElement;

      // Set initial state
      gsap.set(el, { autoAlpha: 0, y: 30 });

      // Build animation
      const tl = gsap.timeline({ paused: true });

      tl.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        delay: i * 0.12,
        ease: 'power3.out',
      });

      // ScrollTrigger
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
      });

      this.scrollTriggers.push(st);
    });
  }
}
