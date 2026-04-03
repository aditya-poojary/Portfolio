import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { SplashService } from '../../services/splash.service';

interface SplashLetter {
  char: string;
  visible: boolean;
  activeCursor: boolean;
}

@Component({
  selector: 'app-splash-screen',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.css',
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly splashService = inject(SplashService);

  // Timing configuration
  private readonly revealDelay = 150; // ms between letters
  private readonly cursorDuration = 300; // ms cursor blinks per letter
  private readonly totalDuration = 2000; // Fixed 2 second minimum duration
  private readonly fadeDuration = 600; // Fade out duration

  protected readonly isVisible = signal(true);
  protected readonly isHiding = signal(false);
  protected readonly isPulse = signal(false);
  protected readonly letters = signal<SplashLetter[]>([]);

  private readonly baseName = ['A', 'D', 'I', 'T', 'Y', 'A'];
  private readonly timeouts: number[] = [];
  private animationComplete = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isVisible.set(false);
      this.splashService.completeSplash();
      return;
    }

    // Initialize letters
    this.letters.set(this.baseName.map((char) => ({ char, visible: false, activeCursor: false })));

    // Start the letter reveal animation
    this.runLetterReveal(0);

    // Schedule fixed timing gate - splash completes at exactly 2 seconds
    // This ensures content never shows before 2 seconds regardless of caching
    this.scheduleFixedRevealGate();
  }

  ngOnDestroy(): void {
    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  }

  private scheduleFixedRevealGate(): void {
    // Start fading at (totalDuration - fadeDuration)
    const fadeStartTime = this.totalDuration - this.fadeDuration;

    const fadeTimeout = window.setTimeout(() => {
      this.isHiding.set(true);
    }, fadeStartTime);
    this.timeouts.push(fadeTimeout);

    // Complete splash and remove from DOM at exactly totalDuration
    const completeTimeout = window.setTimeout(() => {
      this.isVisible.set(false);
      this.splashService.completeSplash();
      this.removeCriticalCss();
    }, this.totalDuration);
    this.timeouts.push(completeTimeout);
  }

  private removeCriticalCss(): void {
    // Remove the critical CSS that was hiding the main content
    const criticalStyle = document.getElementById('splash-critical-css');
    if (criticalStyle) {
      criticalStyle.remove();
    }
  }

  private runLetterReveal(index: number): void {
    const currentLetters = this.letters();
    if (index >= currentLetters.length) {
      this.runHoldPhase();
      return;
    }

    this.letters.set(
      currentLetters.map((item, i) => {
        if (i !== index) return item;
        return { ...item, visible: true, activeCursor: true };
      }),
    );

    const cursorTimeout = window.setTimeout(() => {
      this.letters.set(
        this.letters().map((item, i) => {
          if (i !== index) return item;
          return { ...item, activeCursor: false };
        }),
      );
    }, this.cursorDuration);
    this.timeouts.push(cursorTimeout);

    const nextTimeout = window.setTimeout(() => this.runLetterReveal(index + 1), this.revealDelay);
    this.timeouts.push(nextTimeout);
  }

  private runHoldPhase(): void {
    // Keep cursor blinking on last letter
    this.letters.set(
      this.letters().map((item, i, arr) => ({ ...item, activeCursor: i === arr.length - 1 })),
    );
    this.isPulse.set(true);
    this.animationComplete = true;
  }
}
