import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  ElementRef,
  viewChildren,
} from '@angular/core';

export interface DockItem {
  title: string;
  icon: string; // SVG path data
  href: string;
  viewBox?: string;
}

@Component({
  selector: 'app-floating-dock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      class="inline-flex items-end gap-1 px-3 py-2 rounded-[18px] border border-white/8"
      style="background: rgba(34, 34, 34, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;"
      (mouseleave)="onMouseLeave()"
    >
      @for (item of items(); track item.title) {
        <a
          [href]="item.href"
          [title]="item.title"
          target="_blank"
          rel="noopener noreferrer"
          (mouseenter)="onItemHover($index)"
          (mouseleave)="onMouseLeave()"
          [style.width.px]="getSize($index)"
          [style.height.px]="getSize($index)"
          class="dock-item"
          #dockItems
        >
          <svg
            [attr.viewBox]="item.viewBox ?? '0 0 24 24'"
            fill="currentColor"
            class="w-[55%] h-[55%] transition-[inherit]"
          >
            <path [attr.d]="item.icon" />
          </svg>
          <span class="dock-tooltip">
            {{ item.title }}
          </span>
        </a>
      }
    </div>
  `,
  styles: `
    .dock-item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      color: var(--color-text-muted);
      background: transparent;
      text-decoration: none;
      transition:
        transform 200ms cubic-bezier(0.32, 0.72, 0, 1),
        width 200ms cubic-bezier(0.32, 0.72, 0, 1),
        height 200ms cubic-bezier(0.32, 0.72, 0, 1),
        color 200ms ease,
        background 200ms ease;
      will-change: transform, width, height;
    }

    .dock-item:hover {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.06);
    }

    .dock-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) scale(0.8);
      padding: 4px 10px;
      font-family: var(--font-label);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: var(--color-text-primary);
      background: rgba(26, 26, 26, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition:
        opacity 150ms ease,
        transform 150ms ease;
    }

    .dock-item:hover .dock-tooltip {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
  `,
})
export class FloatingDockComponent {
  readonly items = input.required<DockItem[]>();

  private readonly hoveredIndex = signal(-1);
  private readonly BASE_SIZE = 40;
  private readonly HOVER_SIZE = 56;
  private readonly NEIGHBOR_SIZE = 48;

  readonly dockItemRefs = viewChildren<ElementRef>('dockItems');

  onItemHover(index: number): void {
    this.hoveredIndex.set(index);
  }

  onMouseLeave(): void {
    this.hoveredIndex.set(-1);
  }

  getScale(index: number): string {
    const hovered = this.hoveredIndex();
    if (hovered === -1) return 'scale(1)';
    return 'scale(1)';
  }

  getSize(index: number): number {
    const hovered = this.hoveredIndex();
    if (hovered === -1) return this.BASE_SIZE;

    const diff = Math.abs(index - hovered);
    if (diff === 0) return this.HOVER_SIZE;
    if (diff === 1) return this.NEIGHBOR_SIZE;
    return this.BASE_SIZE;
  }
}
