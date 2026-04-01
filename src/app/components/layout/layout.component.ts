import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AboutMeComponent } from '../about-me/about-me.component';
import { ExperienceComponent } from '../experience/experience.component';
import { PersonalProjectsComponent } from '../personal-projects/personal-projects.component';
import { TechStackComponent } from '../tech-stack/tech-stack.component';
import { ContributionsUnifiedComponent } from '../contributions-unified/contributions-unified.component';
import { EducationComponent } from '../education/education.component';
import { AchievementsComponent } from '../achievements/achievements.component';
import { GetInTouchComponent } from '../get-in-touch/get-in-touch.component';

@Component({
  selector: 'app-layout',
  imports: [
    AboutMeComponent,
    ExperienceComponent,
    PersonalProjectsComponent,
    TechStackComponent,
    ContributionsUnifiedComponent,
    EducationComponent,
    AchievementsComponent,
    GetInTouchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full min-h-dvh">
      <app-about-me />
      <app-experience />
      <app-personal-projects />
      <app-tech-stack />
      <app-contributions-unified />
      <app-education />
      <app-achievements />
      <app-get-in-touch />
    </div>
  `,
})
export class LayoutComponent {}
