import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AboutMeComponent } from '../about-me/about-me.component';
import { ExperienceComponent } from '../experience/experience.component';
import { EducationAchievementsComponent } from '../education-achievements/education-achievements.component';

@Component({
  selector: 'app-layout',
  imports: [AboutMeComponent, ExperienceComponent, EducationAchievementsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full min-h-dvh">
      <app-about-me />
      <app-experience />
      <app-education-achievements />
    </div>
  `,
})
export class LayoutComponent {}
