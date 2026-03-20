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
        will-change: transform, opacity, filter;
      }

      .edu-accent-line {
        transform-origin: left center;
        will-change: transform, opacity;
      }

      .edu-cap-icon {
        will-change: transform, opacity;
      }

      .edu-text-reveal {
        clip-path: inset(0 100% 0 0);
        will-change: clip-path;
      }

      @media (prefers-reduced-motion: reduce) {
        .edu-card {
          opacity: 1 !important;
          transform: none !important;
          filter: none !important;
        }

        .edu-accent-line,
        .edu-cap-icon {
          opacity: 1 !important;
          transform: none !important;
        }

        .edu-text-reveal {
          clip-path: none !important;
        }
      }
    `,
  ],
})
export class EducationComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private scrollTriggers: ScrollTrigger[] = [];
  private timelines: gsap.core.Timeline[] = [];

  @ViewChild('educationGrid') private educationGridRef?: ElementRef<HTMLDivElement>;

  @ViewChildren('eduCard', { read: ElementRef })
  private cardRefs?: QueryList<ElementRef<HTMLElement>>;

  protected readonly education = signal<EducationEntry[]>([
    {
      period: '2013 — 2020',
      title: 'St. Thomas High School',
      subtitle: 'Primary & Secondary Education',
      description: '',
    },
    {
      period: '2020 — 2022',
      title: 'Yashodham Junior College',
      subtitle: 'Higher Secondary Education',
      description: '',
    },
    {
      period: '2022 — Present',
      title: 'Thakur College of Engineering & Technology',
      subtitle: 'B.E. — Information Technology',
      description: 'Mumbai University | Expected Graduation: 2026',
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
      this.timelines.forEach((timeline) => timeline.kill());
      this.scrollTriggers.forEach((st) => st.kill());
    });
  }

  private setupCardAnimations(): void {
    const cards = this.cardRefs?.toArray() ?? [];
    if (cards.length === 0) return;

    const cardElements = cards.map((cardRef) => cardRef.nativeElement);
    const accentLines = cardElements
      .map((element) => element.querySelector('.edu-accent-line'))
      .filter((element): element is HTMLElement => element instanceof HTMLElement);
    const capIcons = cardElements
      .map((element) => element.querySelector('.edu-cap-icon'))
      .filter((element): element is HTMLElement => element instanceof HTMLElement);
    const textGroups = cardElements.map((element) =>
      Array.from(element.querySelectorAll('.edu-text-reveal')).filter(
        (text): text is HTMLElement => text instanceof HTMLElement,
      ),
    );
    const allTextReveals = textGroups.flat();

    gsap.set(cardElements, {
      autoAlpha: 0,
      y: 72,
      scale: 0.92,
      filter: 'blur(8px)',
    });

    gsap.set(accentLines, { scaleX: 0, autoAlpha: 0.45 });
    gsap.set(capIcons, { autoAlpha: 0.35, rotate: -10, y: 8 });
    gsap.set(allTextReveals, { clipPath: 'inset(0 100% 0 0)' });

    const grid = this.educationGridRef?.nativeElement;
    if (!grid) return;

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: grid,
        start: 'top 95%',
        end: 'top 50%',
        scrub: 0.45,
      },
    });

    const cardRevealDuration = 1.3;
    const cardRevealStagger = 0.22;
    const textRevealDelayAfterCard = 0.06;

    timeline.to(
      cardElements,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: cardRevealDuration,
        stagger: { each: cardRevealStagger, from: 'start' },
      },
      0,
    );

    timeline.to(
      accentLines,
      {
        scaleX: 1,
        autoAlpha: 1,
        duration: 0.95,
        ease: 'power2.out',
        stagger: 0.2,
      },
      0.2,
    );

    timeline.to(
      capIcons,
      {
        autoAlpha: 1,
        rotate: 0,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.18,
      },
      0.25,
    );

    textGroups.forEach((cardTexts, index) => {
      if (cardTexts.length === 0) {
        return;
      }

      timeline.to(
        cardTexts,
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.7,
          ease: 'power2.inOut',
          stagger: 0.08,
        },
        index * cardRevealStagger + cardRevealDuration + textRevealDelayAfterCard,
      );
    });

    this.timelines.push(timeline);

    const timelineTrigger = timeline.scrollTrigger;
    if (timelineTrigger) {
      this.scrollTriggers.push(timelineTrigger);
    }
  }
}
