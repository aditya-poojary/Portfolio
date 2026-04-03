import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SplashService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly splashDoneSubject = new BehaviorSubject<boolean>(false);

  readonly splashDone$ = this.splashDoneSubject.asObservable();

  constructor() {
    this.splashDoneSubject.next(!isPlatformBrowser(this.platformId));
  }

  shouldRunSplash(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  resetSplash(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.splashDoneSubject.next(false);
  }

  completeSplash(): void {
    this.splashDoneSubject.next(true);
  }
}
