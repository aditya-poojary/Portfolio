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

interface AchievementEntry {
  period: string;
  title: string;
  subtitle: string;
  description: string;
  bullets?: string[];
  tags?: string[];
}

@Component({
  selector: 'app-achievements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './achievements.component.html',
  styles: [
    `
      .timeline-line {
        background: rgba(255, 255, 255, 0.08);
      }

      .timeline-line-fill {
        height: 100%;
        transform-origin: top;
        transform: scaleY(0);
        will-change: transform;
      }

      .timeline-item {
        opacity: 0;
        transform: translate3d(0, 30px, 0);
      }

      @media (prefers-reduced-motion: reduce) {
        .timeline-line-fill {
          transform: scaleY(1) !important;
        }

        .timeline-item {
          opacity: 1 !important;
          transform: none !important;
        }
      }
    `,
  ],
})
export class AchievementsComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('timelineContainer') private timelineContainerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('timelineLineFill') private timelineLineFillRef?: ElementRef<HTMLDivElement>;
  @ViewChildren('timelineItem', { read: ElementRef })
  private timelineItemRefs?: QueryList<ElementRef<HTMLElement>>;

  protected readonly achievements = signal<AchievementEntry[]>([
    {
      period: 'Feb 2025',
      title: 'Global Hyperloop Competition',
      subtitle: 'IIT Madras — Propulsion Engineer',
      description:
        'Represented the team at the Global Hyperloop Competition hosted by the Indian Institute of Technology, Madras. Competed against 15 national teams in an on-site event.',
      bullets: [
        'Awarded Best Embedded System among 15 national teams',
        'Special Mention for Pod Demonstration — Top 3 teams',
        'Special Mention for Research Blueprint — Top 10 teams',
        'Presented team innovations to jury and a technically proficient audience',
      ],
      tags: ['Embedded Systems', 'Hyperloop', 'IIT-M', 'On-Site'],
    },
    {
      period: 'Jul 2025',
      title: "Mind's Eye Competition",
      subtitle: 'Winner — TCET',
      description:
        "Secured first place in the Mind's Eye competition held at Thakur College of Engineering & Technology, demonstrating creative problem-solving and technical acumen.",
      tags: ['Winner', 'TCET'],
    },
    {
      period: 'Dec 2025',
      title: 'Hacktimus Hackathon',
      subtitle: 'Finalist',
      description:
        'Advanced to the finals of the Hacktimus Hackathon, competing against top teams with an innovative solution built under time constraints.',
      tags: ['Hackathon', 'Finalist'],
    },
  ]);

  protected readonly dsaStats = signal({
    streak: '520+',
    problemsSolved: '720+',
    contestRating: '1510',
    platforms: 'LeetCode, TCET & 10x Hackathons',
  });

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    this.setupTimelineProgress();
    this.setupTimelineItemReveal();
  }

  // ─── Timeline line "drawing" animation ────────────────────────
  private setupTimelineProgress(): void {
    const container = this.timelineContainerRef?.nativeElement;
    const lineFill = this.timelineLineFillRef?.nativeElement;
    if (!container || !lineFill) return;

    gsap.fromTo(
      lineFill,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          end: 'bottom 20%',
          scrub: 0.6,
        },
      },
    );

    this.destroyRef.onDestroy(() => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.killTweensOf(lineFill);
    });
  }

  // ─── Timeline item fade-in / slide-up ─────────────────────────
  private setupTimelineItemReveal(): void {
    const items = this.timelineItemRefs?.toArray() ?? [];
    if (items.length === 0) return;

    const elements = items.map((ref) => ref.nativeElement);

    elements.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          delay: i * 0.08,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            end: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    this.destroyRef.onDestroy(() => {
      elements.forEach((el) => gsap.killTweensOf(el));
    });
  }
}
