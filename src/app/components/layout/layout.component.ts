import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AboutMeComponent } from '../about-me/about-me.component';

@Component({
  selector: 'app-layout',
  imports: [AboutMeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="w-full min-h-dvh"><app-about-me /></div>`,
})
export class LayoutComponent {}
