import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cursor-follower',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #dot class="cursor-dot"></div>
    <div #blob class="cursor-blob"></div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
    }

    .cursor-dot,
    .cursor-blob {
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      transform: translate(-50%, -50%);
      will-change: transform, opacity;
    }

    .cursor-dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background: rgba(232, 232, 232, 0.96);
      box-shadow: 0 0 10px rgba(212, 212, 212, 0.45);
    }

    .cursor-blob {
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      background: radial-gradient(circle, rgba(212, 212, 212, 0.36) 0%, rgba(150, 150, 150, 0.2) 60%, rgba(90, 90, 90, 0.08) 100%);
      border: 1px solid rgba(192, 192, 192, 0.35);
      opacity: 0.38;
      box-shadow: 0 0 32px rgba(192, 192, 192, 0.26);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
  `,
})
export class CursorFollowerComponent implements OnInit, OnDestroy {
  @ViewChild('dot', { static: true }) dotRef!: ElementRef<HTMLDivElement>;
  @ViewChild('blob', { static: true }) blobRef!: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);

  private frameId: number | null = null;
  private isEnabled = false;
  private isHoveringInteractive = false;
  private mouseX = 0;
  private mouseY = 0;
  private blobX = 0;
  private blobY = 0;

  private readonly handleMouseMove = (event: MouseEvent): void => {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    this.dotRef.nativeElement.style.left = `${this.mouseX}px`;
    this.dotRef.nativeElement.style.top = `${this.mouseY}px`;
  };

  private readonly handleMouseOver = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const interactive = target.closest(
      'a, button, [role="button"], input[type="button"], input[type="submit"], .card, [class*="card"]',
    );
    this.isHoveringInteractive = Boolean(interactive);
  };

  private readonly handleDocumentMouseLeave = (): void => {
    this.dotRef.nativeElement.style.opacity = '0';
    this.blobRef.nativeElement.style.opacity = '0';
  };

  private readonly handleDocumentMouseEnter = (): void => {
    this.dotRef.nativeElement.style.opacity = '1';
    this.blobRef.nativeElement.style.opacity = this.isHoveringInteractive ? '0.26' : '0.38';
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarsePointer) return;

    this.isEnabled = true;
    document.body.classList.add('custom-cursor-enabled');

    this.dotRef.nativeElement.style.opacity = '1';
    this.blobRef.nativeElement.style.opacity = '0.38';

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    this.mouseX = centerX;
    this.mouseY = centerY;
    this.blobX = centerX;
    this.blobY = centerY;

    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    document.addEventListener('mouseover', this.handleMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', this.handleDocumentMouseLeave);
    document.documentElement.addEventListener('mouseenter', this.handleDocumentMouseEnter);

    this.frameId = window.requestAnimationFrame(this.animateBlob);
  }

  ngOnDestroy(): void {
    if (!this.isEnabled) return;

    window.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseover', this.handleMouseOver);
    document.documentElement.removeEventListener('mouseleave', this.handleDocumentMouseLeave);
    document.documentElement.removeEventListener('mouseenter', this.handleDocumentMouseEnter);
    document.body.classList.remove('custom-cursor-enabled');

    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private readonly animateBlob = (): void => {
    this.blobX += (this.mouseX - this.blobX) * 0.1;
    this.blobY += (this.mouseY - this.blobY) * 0.1;

    const scale = this.isHoveringInteractive ? 1.5 : 1;
    const opacity = this.isHoveringInteractive ? 0.26 : 0.38;

    this.blobRef.nativeElement.style.opacity = `${opacity}`;
    this.blobRef.nativeElement.style.left = `${this.blobX}px`;
    this.blobRef.nativeElement.style.top = `${this.blobY}px`;
    this.blobRef.nativeElement.style.transform = `translate(-50%, -50%) scale(${scale})`;

    this.frameId = window.requestAnimationFrame(this.animateBlob);
  };
}
