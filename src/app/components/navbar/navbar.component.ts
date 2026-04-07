import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type SectionId =
  | 'about'
  | 'experience'
  | 'projects'
  | 'tech'
  | 'problem-solving'
  | 'education'
  | 'achievements'
  | 'contact';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      #navbar
      class="fixed left-0 top-0 z-[1000] w-full navbar-bg"
      [class.navbar-scrolled]="isScrolled()"
    >
      <div
        class="mx-auto flex h-[58px] md:h-[62px] lg:h-[64px] max-w-[1280px] items-center px-4 lg:pl-2 lg:pr-8"
      >
        <button
          class="brand-logo shrink-0"
          (click)="scrollToSection('about')"
          aria-label="Go to top"
        >
          <img src="assets/images/logo.png" alt="Aditya logo" class="brand-logo-image" />
        </button>
        <nav class="hidden items-center gap-6 lg:flex lg:ml-auto lg:mr-auto">
          <button
            class="nav-link"
            [class.nav-link-active]="activeSection() === 'about'"
            (click)="scrollToSection('about')"
          >
            About
          </button>
          <button
            class="nav-link"
            [class.nav-link-active]="activeSection() === 'experience'"
            (click)="scrollToSection('experience')"
          >
            Experience
          </button>
          <button
            class="nav-link"
            [class.nav-link-active]="activeSection() === 'projects'"
            (click)="scrollToSection('projects')"
          >
            Projects
          </button>
          <button
            class="nav-link"
            [class.nav-link-active]="activeSection() === 'tech'"
            (click)="scrollToSection('tech')"
          >
            Tech Stack
          </button>
          <button
            class="nav-link"
            [class.nav-link-active]="activeSection() === 'problem-solving'"
            (click)="scrollToSection('problem-solving')"
          >
            Contributions
          </button>
          <button
            class="nav-link"
            [class.nav-link-active]="activeSection() === 'education'"
            (click)="scrollToSection('education')"
          >
            Education
          </button>
          <button
            class="nav-link"
            [class.nav-link-active]="activeSection() === 'achievements'"
            (click)="scrollToSection('achievements')"
          >
            Achievements
          </button>
        </nav>

        <button class="ml-auto nav-cta hidden lg:inline-flex" (click)="scrollToSection('contact')">
          Get in Touch
        </button>

        <button
          class="ml-auto flex h-9 w-9 items-center justify-center lg:hidden"
          aria-label="Toggle menu"
          (click)="toggleMenu()"
        >
          <div class="relative h-4 w-6">
            <span
              class="hamburger-line absolute left-0 top-0 h-px w-full"
              [class.top-1/2]="isMobileMenuOpen()"
              [class.rotate-45]="isMobileMenuOpen()"
            ></span>
            <span
              class="hamburger-line absolute left-0 top-1/2 h-px w-full"
              [class.opacity-0]="isMobileMenuOpen()"
            ></span>
            <span
              class="hamburger-line absolute left-0 top-full h-px w-full"
              [class.top-1/2]="isMobileMenuOpen()"
              [class.-rotate-45]="isMobileMenuOpen()"
            ></span>
          </div>
        </button>
      </div>

      <div
        #mobileMenu
        class="mobile-menu absolute inset-x-0 top-full z-40 lg:hidden"
        [class.mobile-menu-open]="mobileMenuVisible()"
      >
        <nav class="mx-4 mb-4 flex flex-col gap-1 rounded-2xl p-4 mobile-menu-inner">
          <button class="mobile-link" (click)="scrollToSection('about'); closeMenu()">About</button>
          <button class="mobile-link" (click)="scrollToSection('experience'); closeMenu()">
            Experience
          </button>
          <button class="mobile-link" (click)="scrollToSection('projects'); closeMenu()">
            Projects
          </button>
          <button class="mobile-link" (click)="scrollToSection('tech'); closeMenu()">
            Tech Stack
          </button>
          <button class="mobile-link" (click)="scrollToSection('problem-solving'); closeMenu()">
            Contributions
          </button>
          <button class="mobile-link" (click)="scrollToSection('education'); closeMenu()">
            Education
          </button>
          <button class="mobile-link" (click)="scrollToSection('achievements'); closeMenu()">
            Achievements
          </button>
          <button class="mobile-link-cta" (click)="scrollToSection('contact'); closeMenu()">
            Get in Touch
          </button>
        </nav>
      </div>
    </header>
  `,
  styles: `
    :host {
      font-family:
        Inter,
        system-ui,
        -apple-system,
        Segoe UI,
        Roboto,
        Helvetica,
        Arial,
        sans-serif;
      letter-spacing: 0.02em;
    }

    .navbar-bg {
      background: linear-gradient(135deg, rgba(8, 8, 8, 0.93), rgba(20, 20, 20, 0.88));
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(192, 192, 192, 0.2);
      transition:
        background 0.25s ease,
        border-color 0.25s ease,
        box-shadow 0.25s ease;
    }

    .navbar-scrolled {
      background: linear-gradient(135deg, rgba(4, 4, 4, 0.96), rgba(15, 15, 15, 0.92));
      border-bottom-color: rgba(192, 192, 192, 0.28);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }

    .nav-link {
      position: relative;
      color: rgba(192, 192, 192, 0.82);
      font-size: 0.84rem;
      font-weight: 500;
      transition: color 0.25s ease;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -6px;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, rgba(165, 165, 165, 0.85), rgba(235, 235, 235, 0.95));
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.25s ease;
    }

    .nav-link:hover {
      color: rgba(235, 235, 235, 0.95);
    }

    .nav-link:hover::after {
      transform: scaleX(1);
    }

    .nav-link-active {
      color: #f3f3f3;
    }

    .nav-link-active::after {
      transform: scaleX(1);
    }

    .nav-cta {
      align-items: center;
      border-radius: 9999px;
      background: linear-gradient(145deg, rgba(32, 32, 32, 0.95), rgba(10, 10, 10, 0.92));
      border: 1px solid rgba(192, 192, 192, 0.45);
      color: rgba(235, 235, 235, 0.95);
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.5rem 1rem;
      text-transform: uppercase;
      transition:
        transform 0.2s ease,
        filter 0.2s ease,
        border-color 0.2s ease;
    }

    .nav-cta:hover {
      border-color: rgba(236, 236, 236, 0.75);
      filter: brightness(1.07);
      transform: translateY(-1px);
    }

    .hamburger-line {
      background: rgba(214, 214, 214, 0.92);
      transition: all 0.25s ease;
    }

    .mobile-menu-inner {
      background: linear-gradient(145deg, rgba(8, 8, 8, 0.94), rgba(20, 20, 20, 0.9));
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(192, 192, 192, 0.2);
    }

    .mobile-menu {
      opacity: 0;
      pointer-events: none;
      transform: translateY(-8px);
      transition:
        opacity 0.22s ease,
        transform 0.22s ease;
      visibility: hidden;
    }

    .mobile-menu-open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
      visibility: visible;
    }

    .mobile-link,
    .mobile-link-cta {
      border-radius: 0.65rem;
      font-size: 0.86rem;
      font-weight: 500;
      padding: 0.58rem 0.82rem;
      text-align: left;
      transition: all 0.2s ease;
    }

    .mobile-link {
      color: rgba(205, 205, 205, 0.9);
    }

    .mobile-link:hover {
      background: rgba(192, 192, 192, 0.12);
      color: rgba(242, 242, 242, 0.96);
    }

    .mobile-link-cta {
      background: linear-gradient(135deg, rgba(210, 210, 210, 0.94), rgba(155, 155, 155, 0.88));
      color: #101010;
      font-weight: 700;
      margin-top: 0.25rem;
      text-align: center;
    }

    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 0;
      border: none;
      background: transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition:
        transform 0.2s ease,
        filter 0.2s ease;
    }

    .brand-logo:hover {
      transform: translateY(-1px);
      filter: drop-shadow(0 0 10px rgba(192, 192, 192, 0.35));
    }

    .brand-logo-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0;
    }

    @media (max-width: 768px) {
      .brand-logo {
        width: 38px;
        height: 38px;
      }
    }
  `,
})
export class NavbarComponent implements AfterViewInit {
  @ViewChild('navbar') navbar!: ElementRef<HTMLElement>;
  @ViewChild('mobileMenu') mobileMenu!: ElementRef<HTMLElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sectionIds: SectionId[] = [
    'about',
    'experience',
    'projects',
    'tech',
    'problem-solving',
    'education',
    'achievements',
    'contact',
  ];

  protected readonly activeSection = signal<SectionId>('about');
  protected readonly isScrolled = signal(false);
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly mobileMenuVisible = signal(false);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const onScroll = () => this.isScrolled.set(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));

    // Use ScrollTrigger for active section detection (works with ScrollSmoother)
    const triggers: ScrollTrigger[] = [];
    this.sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (!section) return;
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) this.activeSection.set(id);
        },
      });
      triggers.push(trigger);
    });

    this.destroyRef.onDestroy(() => triggers.forEach((t) => t.kill()));
  }

  protected scrollToSection(id: SectionId): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const section = document.getElementById(id);
    if (!section) return;

    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTo(section, true, 'top top');
    } else {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.activeSection.set(id);
  }

  protected toggleMenu(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const open = !this.isMobileMenuOpen();
    this.isMobileMenuOpen.set(open);
    this.mobileMenuVisible.set(open);
  }

  protected closeMenu(): void {
    if (!this.isMobileMenuOpen()) return;
    this.toggleMenu();
  }
}
