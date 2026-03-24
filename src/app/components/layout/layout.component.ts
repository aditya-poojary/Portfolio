import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AboutMeComponent } from '../about-me/about-me.component';
import { ExperienceComponent } from '../experience/experience.component';
import { PersonalProjectsComponent } from '../personal-projects/personal-projects.component';

@Component({
  selector: 'app-layout',
  imports: [AboutMeComponent, ExperienceComponent, PersonalProjectsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full min-h-dvh">
      <app-about-me />
      <app-experience />
      <app-personal-projects />
    </div>
  `,
})
export class LayoutComponent {}
