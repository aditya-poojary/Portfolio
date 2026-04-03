import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { SplashService } from '../../services/splash.service';

interface SplashLetter {
  char: string;
  visible: boolean;
  activeCursor: boolean;
}

@Component({
  selector: 'app-splash-screen',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.css',
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  private readonly splashService = inject(SplashService);
  private readonly revealDelay = 150;
  private readonly cursorDuration = 300;

  protected readonly isVisible = signal(true);
  protected readonly isHiding = signal(false);
  protected readonly isPulse = signal(false);
  protected readonly letters = signal<SplashLetter[]>([]);

  private readonly baseName = ['A', 'D', 'I', 'T', 'Y', 'A'];
  private readonly timeouts: number[] = [];

  ngOnInit(): void {
    if (!this.splashService.shouldRunSplash()) {
      this.isVisible.set(false);
      this.splashService.completeSplash();
      return;
    }

    this.splashService.resetSplash();
    this.letters.set(this.baseName.map((char) => ({ char, visible: false, activeCursor: false })));
    this.runLetterReveal(0);
  }

  ngOnDestroy(): void {
    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  }

  private runLetterReveal(index: number): void {
    const currentLetters = this.letters();
    if (index >= currentLetters.length) {
      this.runHoldAndExit();
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

  private runHoldAndExit(): void {
    this.letters.set(
      this.letters().map((item, i, arr) => ({ ...item, activeCursor: i === arr.length - 1 })),
    );
    this.isPulse.set(true);

    const holdTimeout = window.setTimeout(() => {
      this.isPulse.set(false);
      this.isHiding.set(true);
      this.splashService.completeSplash();
    }, 600);
    this.timeouts.push(holdTimeout);

    const completeTimeout = window.setTimeout(() => {
      this.isVisible.set(false);
    }, 1200);
    this.timeouts.push(completeTimeout);
  }
}
