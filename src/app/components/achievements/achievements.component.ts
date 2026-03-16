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
      /* ─── Timeline track (faint background rail) ───────────── */

      .timeline-track {
        width: 2px;
        background: linear-gradient(
          to bottom,
          rgba(130, 38, 89, 0.15),
          rgba(0, 110, 138, 0.1),
          transparent
        );
        border-radius: 999px;
      }

      /* ─── Timeline fill (animated draw line) ───────────────── */

      .timeline-line-fill {
        width: 2px;
        border-radius: 999px;
        transform-origin: top;
        transform: scaleY(0);
        will-change: transform;
      }

      /* ─── Timeline dot (node marker) ───────────────────────── */

      .timeline-dot {
        transition: box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1),
          border-color 0.5s cubic-bezier(0.22, 1, 0.36, 1),
          background 0.5s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .timeline-dot.dot-active {
        border-color: var(--color-accent-teal-light) !important;
        background: var(--color-accent-teal) !important;
        box-shadow: 0 0 8px rgba(0, 110, 138, 0.5),
          0 0 20px rgba(0, 110, 138, 0.2) !important;
      }

      /* ─── Card accent bar (top glow line) ──────────────────── */

      .timeline-card {
        position: relative;
        overflow: hidden;
      }

      .timeline-card::before {
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
        opacity: 0;
        transition: opacity 0.5s ease;
      }

      .timeline-card.card-revealed::before {
        opacity: 1;
      }

      /* ─── Text reveal (clip-path wipe) ─────────────────────── */

      .text-reveal {
        clip-path: inset(0 100% 0 0);
      }

      /* ─── Reduced motion ───────────────────────────────────── */

      @media (prefers-reduced-motion: reduce) {
        .timeline-line-fill {
          transform: scaleY(1) !important;
        }

        .text-reveal {
          clip-path: none !important;
        }
      }
    `,
  ],
})
export class AchievementsComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private scrollTriggers: ScrollTrigger[] = [];
  private timelines: gsap.core.Timeline[] = [];

  @ViewChild('timelineContainer') private timelineContainerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('timelineLineFill') private timelineLineFillRef?: ElementRef<HTMLDivElement>;
  @ViewChildren('timelineItem', { read: ElementRef })
  private timelineItemRefs?: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('timelineDot', { read: ElementRef })
  private timelineDotRefs?: QueryList<ElementRef<HTMLElement>>;

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
    if (!isPlatformBrowser(this.platformId)) return;

    gsap.registerPlugin(ScrollTrigger);

    // Wait for Angular hydration + paint to stabilize
    setTimeout(() => {
      this.initAnimations();
    }, 100);

    this.destroyRef.onDestroy(() => {
      this.timelines.forEach((tl) => tl.kill());
      this.scrollTriggers.forEach((st) => st.kill());
    });
  }

  private initAnimations(): void {
    // Set initial states via GSAP (reliable across SSR hydration)
    const items = this.timelineItemRefs?.toArray() ?? [];
    items.forEach((ref) => {
      const el = ref.nativeElement;
      gsap.set(el, { autoAlpha: 0, y: 40 });

      const bullets = el.querySelectorAll('.bullet-item');
      const tags = el.querySelectorAll('.tag-item');
      const texts = el.querySelectorAll('.text-reveal');

      gsap.set(bullets, { autoAlpha: 0, x: -16 });
      gsap.set(tags, { autoAlpha: 0, scale: 0.8 });
      gsap.set(texts, { clipPath: 'inset(0 100% 0 0)' });
    });

    this.setupTimelineProgress();
    this.setupTimelineItemReveal();
    ScrollTrigger.refresh();
  }

  // ═══════════════════════════════════════════════════════════════
  //  Timeline line "drawing" + dot activation
  // ═══════════════════════════════════════════════════════════════
  private setupTimelineProgress(): void {
    const container = this.timelineContainerRef?.nativeElement;
    const lineFill = this.timelineLineFillRef?.nativeElement;
    if (!container || !lineFill) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top 80%',
      end: 'bottom 25%',
      scrub: 0.5,
      animation: gsap.fromTo(lineFill, { scaleY: 0 }, { scaleY: 1, ease: 'none' }),
      onUpdate: (self) => this.updateDotActivation(self.progress),
    });

    this.scrollTriggers.push(st);
  }

  private updateDotActivation(progress: number): void {
    const dots = this.timelineDotRefs?.toArray() ?? [];
    const items = this.timelineItemRefs?.toArray() ?? [];
    const container = this.timelineContainerRef?.nativeElement;
    if (!container || dots.length === 0) return;

    const containerHeight = container.scrollHeight;
    const lineDrawnHeight = progress * containerHeight;

    dots.forEach((dotRef, i) => {
      const itemEl = items[i]?.nativeElement;
      if (!itemEl) return;

      const dotOffset = itemEl.offsetTop - container.offsetTop;
      if (lineDrawnHeight >= dotOffset) {
        dotRef.nativeElement.classList.add('dot-active');
      } else {
        dotRef.nativeElement.classList.remove('dot-active');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  Timeline item reveal — card + text wipe + bullets + tags
  // ═══════════════════════════════════════════════════════════════
  private setupTimelineItemReveal(): void {
    const items = this.timelineItemRefs?.toArray() ?? [];
    if (items.length === 0) return;

    items.forEach((itemRef) => {
      const el = itemRef.nativeElement;
      const card = el.querySelector('.timeline-card') as HTMLElement | null;
      const textReveals = el.querySelectorAll('.text-reveal');
      const bullets = el.querySelectorAll('.bullet-item');
      const tags = el.querySelectorAll('.tag-item');

      // Build a per-card timeline
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

      // 1. Card entrance (fade + slide up)
      tl.to(el, { autoAlpha: 1, y: 0, duration: 0.7 }, 0);

      // 2. Top accent bar glow
      if (card) {
        tl.add(() => card.classList.add('card-revealed'), 0.35);
      }

      // 3. Text reveal wipe (left -> right)
      if (textReveals.length > 0) {
        tl.to(
          textReveals,
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.6,
            ease: 'power2.inOut',
            stagger: 0.1,
          },
          0.2,
        );
      }

      // 4. Bullet items stagger
      if (bullets.length > 0) {
        tl.to(
          bullets,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.4,
            ease: 'power2.out',
            stagger: 0.07,
          },
          0.5,
        );
      }

      // 5. Tag pills pop-in
      if (tags.length > 0) {
        tl.to(
          tags,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.3,
            ease: 'back.out(2)',
            stagger: 0.05,
          },
          0.65,
        );
      }

      this.timelines.push(tl);

      // ScrollTrigger for this item
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => tl.play(),
        onLeaveBack: () => {
          tl.reverse();
          card?.classList.remove('card-revealed');
        },
      });

      this.scrollTriggers.push(st);
    });
  }
}
