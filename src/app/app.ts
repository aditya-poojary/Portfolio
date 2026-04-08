import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CursorFollowerComponent } from './components/utilities/cursor-follower.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { SplashService } from './services/splash.service';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CursorFollowerComponent, SplashScreenComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly splashService = inject(SplashService);
  private smoother: ScrollSmoother | null = null;

  protected readonly title = signal('Portfolio');
  protected readonly splashDone = signal(false);

  ngOnInit(): void {
    this.splashService.splashDone$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((done) => {
      this.splashDone.set(done);
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Suppress GSAP warnings in production
    if (typeof window !== 'undefined' && !(window as any).ngDevMode) {
      gsap.config({ nullTargetWarn: false, trialWarn: false });
    }

    this.smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: prefersReducedMotion ? 0 : 1.35,
      smoothTouch: 0.2,
      effects: true,
      normalizeScroll: true,
    });

    this.destroyRef.onDestroy(() => {
      this.smoother?.kill();
      this.smoother = null;
    });
  }
}
