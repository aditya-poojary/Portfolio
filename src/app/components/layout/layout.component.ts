import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AboutMeComponent } from '../about-me/about-me.component';
import { ExperienceComponent } from '../experience/experience.component';
import { PersonalProjectsComponent } from '../personal-projects/personal-projects.component';
import { EducationComponent } from '../education/education.component';
import { AchievementsComponent } from '../achievements/achievements.component';

@Component({
  selector: 'app-layout',
  imports: [
    AboutMeComponent,
    ExperienceComponent,
    PersonalProjectsComponent,
    EducationComponent,
    AchievementsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full min-h-dvh">
      <app-about-me />
      <app-experience />
      <app-personal-projects />
      <app-education />
      <app-achievements />
    </div>
  `,
})
export class LayoutComponent {}
